import os

import pathway as pw

from pipeline import build_pipeline
from schema import TransactionSchema


# Use the same CSV file as the FastAPI backend.
CSV_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "server",
    "data",
    "transactions.csv",
)


def main():
    transactions = pw.io.csv.read(
        CSV_PATH,
        schema=TransactionSchema,
        mode="streaming",  # Treat the CSV as an append-only stream.
    )

    build_pipeline(transactions)
    pw.run()

if __name__ == "__main__":
    main()
