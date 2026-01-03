from pydantic import BaseModel, EmailStr


class Register(BaseModel):
    email: EmailStr
    password: str


class Login(Register):
    pass


class Transaction(BaseModel):
    step: int
    type: str
    amount: float
    # Optional account identifiers; if not provided, backend will
    # use placeholder values when writing to CSV.
    nameOrig: str = "C000000000"
    oldbalanceOrg: float
    newbalanceOrig: float
    nameDest: str = "M000000000"
    oldbalanceDest: float
    newbalanceDest: float
    # Labels stored in CSV for compatibility with the original dataset.
    # These are NOT used as model inputs during inference.
    isFraud: int = 0
    isFlaggedFraud: int = 0


class PathwayResult(BaseModel):
    # Optional user identifier sent by Pathway; the authenticated
    # user id from the token is what we persist.
    user_id: str | None = None
    amount: float
    isFraud: bool
    explanation: list[str]
