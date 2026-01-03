import aiofiles
import asyncio
import os
from app.config import CSV_PATH


# Fixed column order matching the original dataset schema.
CSV_COLUMNS = [
    "step",
    "type",
    "amount",
    "nameOrig",
    "oldbalanceOrg",
    "newbalanceOrig",
    "nameDest",
    "oldbalanceDest",
    "newbalanceDest",
    "isFraud",
    "isFlaggedFraud",
]


_csv_lock = asyncio.Lock()


async def append_csv(row: dict):
    """Append a single transaction row to the CSV file.

    - The file is opened in append mode only (never overwritten).
    - A header with the canonical column order is written once if the
      file did not exist before.
    - Writes are guarded by an asyncio lock to avoid interleaved lines
      under concurrent requests.
    """

    # Resolve relative paths from the server project root.
    csv_path = CSV_PATH

    # Ensure all required columns exist in the row; default to empty string
    # for any missing optional values.
    values = [str(row.get(col, "")) for col in CSV_COLUMNS]

    async with _csv_lock:
        exists = os.path.exists(csv_path)

        # Use text append mode; aiofiles does not support newline="".
        async with aiofiles.open(csv_path, "a") as f:
            if not exists:
                await f.write(",".join(CSV_COLUMNS) + "\n")
            await f.write(",".join(values) + "\n")
