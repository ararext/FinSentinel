from prisma.errors import UniqueViolationError

from app.db import db
from app.security import hash_password, verify_password, create_token
from app.csv_writer import append_csv
from app.ml import predict
from app.rag import explain


async def register_user(email, password):
    try:
        return await db.user.create(
            data={"email": email, "password": hash_password(password)}
        )
    except UniqueViolationError:
        # Signal to the caller that this email is already taken.
        return None

async def login_user(email, password):
    user = await db.user.find_unique(where={"email": email})
    if not user or not verify_password(password, user.password):
        return None
    return create_token(user.id)

async def handle_transaction(user_id, tx):
    # 1) Run per-transaction ML inference (no label features used).
    fraud, score = predict(tx)

    # 2) Generate a RAG-based explanation for the model decision.
    explanation = explain(tx, fraud, score)

    # 3) Persist the model decision into the CSV so that downstream
    #    consumers (Pathway, live dashboard) can see flagged rows.
    #    The ML model does not use `isFraud` / `isFlaggedFraud` as
    #    inputs, so annotating them post-prediction is safe.
    tx["isFraud"] = int(bool(fraud))
    tx["isFlaggedFraud"] = int(bool(fraud and score >= 0.65))

    await append_csv(tx)

    await db.predictionlog.create(
        data={
            "userId": user_id,
            "amount": tx["amount"],
            "isFraud": bool(fraud),
            "explanation": " | ".join(explanation)
        }
    )

    return {
        "fraud_prediction": fraud,
        "fraud_score": score,
        "explanation": explanation
    }
