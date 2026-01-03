import os
import uuid
from pinecone import Pinecone
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# ---------- Init ----------
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX"))

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

DOC_PATH = "documents"

# ---------- Embedding Helper ----------
def get_embedding(text: str) -> list[float]:
    response = client.embeddings.create(
        model="text-embedding-3-large",
        input=text
    )
    return response.data[0].embedding


# ---------- Ingest ----------
def ingest():
    vectors = []

    for file in os.listdir(DOC_PATH):
        file_path = os.path.join(DOC_PATH, file)

        if not file_path.endswith(".txt"):
            continue

        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()

        embedding = get_embedding(text)

        vectors.append((
            str(uuid.uuid4()),
            embedding,
            {
                "text": text,
                "source": file
            }
        ))

    index.upsert(vectors)

    print("✅ Pinecone ingestion completed using OpenAI embeddings")


if __name__ == "__main__":
    ingest()
