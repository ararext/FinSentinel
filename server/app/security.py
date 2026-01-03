from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from app.config import JWT_SECRET

pwd = CryptContext(schemes=["bcrypt"])

def hash_password(p: str):
    return pwd.hash(p)

def verify_password(p: str, h: str):
    return pwd.verify(p, h)

def create_token(user_id: str):
    payload = {"sub": user_id, "exp": datetime.utcnow() + timedelta(hours=24)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")
