from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from app.config import JWT_SECRET

oauth2 = OAuth2PasswordBearer(tokenUrl="/login")

def get_current_user(token: str = Depends(oauth2)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload["sub"]
    except:
        raise HTTPException(401, "Invalid token")
