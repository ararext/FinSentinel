from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
import csv
import os
from app.schemas import Register, Login, Transaction, PathwayResult
from app.services import register_user, login_user, handle_transaction
from app.deps import get_current_user
from app.db import db

router = APIRouter()

@router.post("/register")
async def register(data: Register):
    user = await register_user(data.email, data.password)
    if user is None:
        raise HTTPException(409, "Email already registered")
    return {"id": user.id}

@router.post("/login")
async def login(data: Login):
    token = await login_user(data.email, data.password)
    if not token:
        raise HTTPException(401, "Invalid credentials")
    return {"access_token": token}

@router.post("/transaction")
async def transaction(
    tx: Transaction,
    user_id: str = Depends(get_current_user)
):
    return await handle_transaction(user_id, tx.dict())


@router.post("/pathway-result")
async def pathway_result(
    payload: PathwayResult,
    user_id: str = Depends(get_current_user),
):
    """Receives live fraud decisions from Pathway.

    This endpoint is protected with the same JWT-based auth as
    `/transaction`. Pathway (or any caller) must include a valid
    Bearer token. The authenticated user id is stored in the
    PredictionLog; the optional `user_id` field in the payload is
    ignored for security reasons.
    """

    await db.predictionlog.create(
        data={
            "userId": user_id,
            "amount": payload.amount,
            "isFraud": bool(payload.isFraud),
            "explanation": " | ".join(payload.explanation),
        }
    )

    return {"status": "received"}


@router.get("/transactions/live")
async def live_transactions(limit: int = 50):
    """Return the latest transactions from the CSV for live streaming.

    This mirrors the CSV columns and adds a synthetic timestamp and
    status so the frontend dashboard can display a live table.
    """

    csv_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data",
        "transactions.csv",
    )

    rows: list[dict] = []
    with open(csv_path, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)

    if not rows:
        return []

    # Take the most recent rows, preserving order from newest to oldest.
    selected = rows[-limit:]

    now = datetime.utcnow().isoformat() + "Z"
    result = []
    for idx, row in enumerate(reversed(selected)):
        try:
            amount = float(row["amount"])
            old_org = float(row["oldbalanceOrg"])
            new_org = float(row["newbalanceOrig"])
            old_dest = float(row["oldbalanceDest"])
            new_dest = float(row["newbalanceDest"])
            is_fraud = int(row.get("isFraud", 0))
            is_flagged = int(row.get("isFlaggedFraud", 0))
        except (ValueError, KeyError):
            # Skip malformed rows.
            continue

        status = "flagged" if (is_fraud or is_flagged) else "processed"

        result.append(
            {
                "id": str(len(rows) - idx),
                "type": row["type"],
                "amount": amount,
                "nameOrig": row["nameOrig"],
                "oldBalanceOrig": old_org,
                "newBalanceOrig": new_org,
                "nameDest": row["nameDest"],
                "oldBalanceDest": old_dest,
                "newBalanceDest": new_dest,
                "timestamp": now,
                "status": status,
            }
        )

    return result