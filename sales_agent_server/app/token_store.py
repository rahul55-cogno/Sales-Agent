from database.session import SessionLocal
USER_TOKENS = {}
def set_refresh_token_for_email(email: str, token: str):
    print('TOken set',token,email)
    USER_TOKENS[email] = token

from database.session import SessionLocal
from database.models import User

def get_refresh_token_for_email(email: str) -> str | None:
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == email).first()
        print(user.refresh_token)
        if user:
            return user.refresh_token
        return None
