from fastapi import FastAPI, Request,Depends
from fastapi.middleware.cors import CORSMiddleware
from agent import final_workflow
from fastapi.responses import RedirectResponse
from fastapi import HTTPException
import httpx
from google.oauth2 import id_token
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import RedirectResponse
import os
from google.auth.transport import requests as google_requests
from dotenv import load_dotenv  
from fastapi import Request
from database.session import SessionLocal
from database.models import User
from auth.google_oauth import oauth
from database.session import Base, engine
from lib.dependencies import get_current_user_email
from urllib.parse import urlencode
from lib.jwt_utils import create_jwt,verify_jwt
from google.auth.transport import requests as grequests

load_dotenv()

app = FastAPI()

Base.metadata.create_all(bind=engine)
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET_KEY", "super-secret"))

CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly", "openid", "email", "profile"]

# CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/query")
async def run_agent(request: Request,user_email: str = Depends(get_current_user_email)):
    data = await request.json()
    query = data.get("query")

    if not query:
        return {"error": "Query is required."}

    try:
        events = final_workflow.stream(
            {"query": query,"email":user_email},
            {"configurable": {"thread_id": user_email}},
            stream_mode="values"
        )

        final_message = None
        for event in events:
            if event.get("messages"):
                final_message = event["messages"][-1]

        if final_message:
            return {"answer": final_message.content}
        else:
            return {"answer": "No response generated."}

    except Exception as e:
        return {"error": str(e)}


@app.get("/login")
def login():
    params = {
        "client_id": CLIENT_ID,
        "response_type": "code",
        "scope": " ".join(SCOPES),
        "redirect_uri": REDIRECT_URI,
        "access_type": "offline",
        "prompt": "consent"
    }
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(auth_url)

@app.get("/auth/callback")
async def auth_callback(request: Request):
    code = request.query_params.get("code")

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": CLIENT_ID,
                "client_secret": CLIENT_SECRET,
                "redirect_uri": REDIRECT_URI,
                "grant_type": "authorization_code",
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        tokens = response.json()

    # Get user email using ID token
    idinfo = id_token.verify_oauth2_token(tokens["id_token"], grequests.Request(), CLIENT_ID)
    email = idinfo["email"]
    name = idinfo["name"]
    picture = idinfo["picture"]

    refresh_token = tokens.get('refresh_token')

    response=RedirectResponse(f"http://localhost:5173/")

    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if user:
        if not user.refresh_token:
            user.refresh_token = refresh_token
    else:
        user = User(email=email, name=name, picture=picture, refresh_token=refresh_token)
        db.add(user)
    db.commit()

    jwt_token = create_jwt({"sub": email})
    response = RedirectResponse(url="http://localhost:5173/")
    response.set_cookie(
        key="access_token",
        value=jwt_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
    )
    return response


@app.get('/user')
def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    payload = verify_jwt(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload["sub"]

if __name__=="__main__":
    import uvicorn 
    uvicorn.run(app=app,port=8000,host='127.0.0.1')