# dependencies.py
from fastapi import Request, HTTPException, Depends
from lib.jwt_utils import verify_jwt

def get_current_user_email(request: Request) -> str:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Access token missing")
    
    payload = verify_jwt(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    return payload["sub"]
