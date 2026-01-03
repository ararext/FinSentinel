from fastapi import APIRouter, Depends, HTTPException
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