import csv
import os
import uuid
from collections import Counter
from typing import List

from pinecone import Pinecone
from openai import OpenAI

from app.config import (
    CSV_PATH,
    OPENAI_API_KEY,
    PINECONE_API_KEY,
    PINECONE_ENV,
    PINECONE_INDEX,
)


# ---------- Vector store & LLM clients ----------

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(PINECONE_INDEX)

try:
    _INDEX_STATS = index.describe_index_stats()
    _INDEX_DIMENSION = _INDEX_STATS.get("dimension")
except Exception:
    _INDEX_STATS = {}
    _INDEX_DIMENSION = None

client = OpenAI(api_key=OPENAI_API_KEY)

EMBED_MODEL = "text-embedding-3-large"
CHAT_MODEL = "gpt-4.1-mini"


_BASE_DIR = os.path.dirname(os.path.dirname(__file__))
_PROMPT_TEMPLATE_PATH = os.path.join(
    _BASE_DIR,
    "rag_ingest",
    "documents",
    "rag_prompt.txt",
)

with open(_PROMPT_TEMPLATE_PATH, "r", encoding="utf-8") as f:
    _PROMPT_TEMPLATE = f.read()


def _get_embedding(text: str) -> List[float]:
    response = client.embeddings.create(model=EMBED_MODEL, input=text)
    embedding: List[float] = response.data[0].embedding

    # Ensure the embedding length matches the Pinecone index dimension to
    # avoid "vector dimension ... does not match" errors. If the index was
    # created with a different dimension than the current embedding model,
    # we truncate or zero‑pad the vector.
    if _INDEX_DIMENSION is not None and len(embedding) != _INDEX_DIMENSION:
        if len(embedding) > _INDEX_DIMENSION:
            embedding = embedding[:_INDEX_DIMENSION]
        else:
            # Pad with zeros up to the required dimension
            embedding = embedding + [0.0] * (_INDEX_DIMENSION - len(embedding))

    return embedding


def _retrieve_fraud_knowledge(query_text: str, top_k: int = 6) -> List[str]:
    """Retrieve fraud pattern and rule documents from Pinecone.

    The index is expected to contain:
    - Fraud pattern descriptions
    - Domain notes and rules
    - Optionally, past ML decision logs
    """

    embedding = _get_embedding(query_text)
    result = index.query(
        vector=embedding,
        top_k=top_k,
        include_metadata=True,
    )

    docs: List[str] = []
    for match in result.get("matches", []):  # type: ignore[union-attr]
        metadata = match.get("metadata") or {}
        text = metadata.get("text")
        if text:
            docs.append(text)

    return docs


def _analyze_historical_behavior(tx: dict) -> tuple[str, str]:
    """Summarize historical behavior and similar past cases from the CSV.

    - Historical behavior: typical amounts and transaction types for the
      same sender account (nameOrig).
    - Similar cases: how similar transactions (same type and similar
      amount bucket) behaved in the past and how often they were
      fraudulent.
    """

    csv_path = CSV_PATH
    if not csv_path or not os.path.exists(csv_path):
        return (
            "No historical transaction data available for this account.",
            "No similar past cases available from history.",
        )

    account_id = str(tx["nameOrig"])
    tx_type = str(tx["type"])
    amount = float(tx["amount"])

    account_count = 0
    account_total = 0.0
    account_type_counts: Counter[str] = Counter()

    similar_count = 0
    similar_fraud = 0

    # Define a simple amount bucket: within ±20% of current amount.
    def _is_similar_amount(other: float) -> bool:
        if amount <= 0:
            return False
        diff_ratio = abs(other - amount) / amount
        return diff_ratio <= 0.2

    try:
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    row_amount = float(row.get("amount", "0") or 0)
                except ValueError:
                    continue

                row_type = row.get("type", "")
                row_name_orig = row.get("nameOrig", "")

                if row_name_orig == account_id:
                    account_count += 1
                    account_total += row_amount
                    account_type_counts[row_type] += 1

                if row_type == tx_type and _is_similar_amount(row_amount):
                    similar_count += 1
                    try:
                        is_fraud_label = int(row.get("isFraud", "0") or 0)
                    except ValueError:
                        is_fraud_label = 0
                    if is_fraud_label == 1:
                        similar_fraud += 1
    except FileNotFoundError:
        return (
            "No historical transaction data available for this account.",
            "No similar past cases available from history.",
        )

    # Build user behavior summary
    if account_count == 0:
        behavior_summary = (
            f"No historical data found for sender account {account_id}."
        )
    else:
        avg_amount = account_total / account_count
        most_common_type = (
            max(account_type_counts, key=account_type_counts.get)
            if account_type_counts
            else "unknown"
        )
        rare_types = [
            t
            for t, c in account_type_counts.items()
            if c == 1 and t != most_common_type
        ]
        behavior_summary = (
            f"Sender account {account_id} has {account_count} historical "
            f"transactions with an average amount of {avg_amount:.2f}. "
            f"Most common type is {most_common_type}. "
        )
        if rare_types:
            behavior_summary += (
                f"Rarely used types for this account: {', '.join(rare_types)}."
            )

    # Build similar cases summary
    if similar_count == 0:
        similar_summary = (
            "No closely similar historical transactions found for this "
            "amount and type."
        )
    else:
        fraud_rate = similar_fraud / similar_count
        similar_summary = (
            f"Across {similar_count} historical {tx_type} transactions "
            f"with a similar amount, approximately {fraud_rate:.1%} "
            f"were labeled as fraudulent in past data."
        )

    return behavior_summary, similar_summary


def _index_decision_log(tx: dict, fraud: bool, score: float, explanation: str) -> None:
    """Store a compact ML decision log in Pinecone for future retrieval."""

    log_text = (
        f"Decision log - amount={tx['amount']}, type={tx['type']}, "
        f"sender={tx['nameOrig']}, receiver={tx['nameDest']}, "
        f"fraud_prediction={fraud}, fraud_score={score:.4f}. "
        f"Explanation: {explanation}"
    )

    embedding = _get_embedding(log_text)
    index.upsert(
        [
            (
                str(uuid.uuid4()),
                embedding,
                {"text": log_text, "source": "decision_log"},
            )
        ]
    )


def explain(tx: dict, fraud: bool, score: float) -> List[str]:
    """Generate a human-readable RAG explanation for a fraud decision.

    Flow per transaction:
    1. Build a semantic query from the transaction context and model
       output.
    2. Retrieve fraud patterns, rules, and prior decision logs from
       Pinecone.
    3. Analyze the CSV history for this sender and similar cases.
    4. Ask the LLM to explain WHY the transaction was or was not
       flagged, WHAT patterns were matched, and HOW it compares to
       historical behavior.
    """

    query_text = (
        f"Transaction amount {tx['amount']}, type {tx['type']}, "
        f"sender {tx['nameOrig']}, receiver {tx['nameDest']}, "
        f"fraud_prediction={fraud}, fraud_score={score:.4f}."
    )

    retrieved_docs = _retrieve_fraud_knowledge(query_text)
    behavior_summary, similar_cases_summary = _analyze_historical_behavior(tx)

    context_block = "\n\n".join(
        [
            *(retrieved_docs or []),
            "Historical user behavior: " + behavior_summary,
            "Similar past cases: " + similar_cases_summary,
        ]
    )

    prompt = _PROMPT_TEMPLATE.format(
        amount=tx["amount"],
        type=tx["type"],
        oldbalanceOrg=tx["oldbalanceOrg"],
        newbalanceOrig=tx["newbalanceOrig"],
        nameDest=tx["nameDest"],
        retrieved_documents=context_block,
        isFraud=fraud,
    )

    completion = client.chat.completions.create(
        model=CHAT_MODEL,
        temperature=0.2,
        messages=[
            {
                "role": "system",
                "content": "You are a senior fraud risk analyst at a digital bank.",
            },
            {"role": "user", "content": prompt},
        ],
    )

    explanation_text = completion.choices[0].message.content.strip()

    # Persist the full-text decision log for future RAG retrieval.
    _index_decision_log(tx, fraud, score, explanation_text)

    # Return a list of concise explanation bullets.
    lines = [
        line.strip().lstrip("-• ")
        for line in explanation_text.split("\n")
        if line.strip()
    ]
    return lines

