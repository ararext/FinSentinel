import os
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)
warnings.filterwarnings("ignore", category=UserWarning)
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
    print("Starting Pathway pipeline; watching transactions at:", CSV_PATH)

    transactions = pw.io.csv.read(
        CSV_PATH,
        schema=TransactionSchema,
        mode="streaming",  # Treat the CSV as an append-only stream.
    )

    build_pipeline(transactions)
    pw.run()

if __name__ == "__main__":
    main()
