from fastapi import FastAPI, Request,Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import desc
from agent import final_workflow
from fastapi.responses import RedirectResponse
from fastapi.responses import JSONResponse
from fastapi import HTTPException
import httpx
from google.oauth2 import id_token
from pydantic import BaseModel
from typing import List
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import RedirectResponse
import os
from dotenv import load_dotenv  
from fastapi import Request
from database.session import SessionLocal
import json
from database.session import Base, engine
import time
from lib.dependencies import get_current_user_email
from urllib.parse import urlencode
from fastapi.responses import StreamingResponse
from lib.jwt_utils import create_jwt,verify_jwt
from google.auth.transport import requests as grequests
from database.models import User,ChatSession,Chats
from sqlalchemy.orm import Session
from database.get_db import get_db
from datetime import datetime

class ChatOut(BaseModel):
    id: int
    type: str
    content: str
    timestamp: datetime
    chatsession_id: int

    class Config:
        orm_mode = True


load_dotenv()

app = FastAPI()

Base.metadata.create_all(bind=engine)
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SESSION_SECRET_KEY", "super-secret"))

from fastapi.staticfiles import StaticFiles
app.mount("/static", StaticFiles(directory="static"), name="static")


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

sent_flags = {
        "customer_name": False,
        "raw_text": False,
        "final_answer": False
}

def reset_flags():
    sent_flags["customer_name"]=False;
    sent_flags["raw_text"]=False;
    sent_flags["final_answer"]=False;

def event_stream(query, user_email,session_id:str,db:Session,existed:bool):
    try:
        if not existed:
            yield f"event: session_id\ndata: {session_id}\n\n"

        yield f"event: starting_agent\ndata: {json.dumps({'message': 'Starting Agent...'})}\n\n"

        Chats.create_chat(
            db=db,
            chatsession_id=session_id,
            content="Starting Agent...",
            type="bot",
            to_show=True,
            for_context=False
        )

        last_5_chats = Chats.get_last_n_chats(db, chatsession_id=session_id, n=2)
        last_5_chat_contents = [chat.content for chat in last_5_chats] if last_5_chats else []
        events = final_workflow.stream(
            {"query": query, "email": user_email,"previous_chats":last_5_chat_contents},
            {"configurable": {"thread_id": user_email}},
            stream_mode="values"
        )

        for event in events:
            if 'customer_name' in event and event['customer_name'] and not sent_flags['customer_name']:
                data = {"customer_name": event['customer_name']}
                yield f"event: customer_name\ndata: {json.dumps(data)}\n\n"
                print(event['customer_name'])
                message = ""
                if event['customer_name']!=None:
                    message = "Identified Customer as " + str(event['customer_name'])
                Chats.create_chat(
                    db=db,
                    chatsession_id=session_id,
                    content=message,
                    type="bot",
                    for_context=True,
                    to_show=True
                )
                if(event['customer_name']):
                    time.sleep(2.0)
                    yield f"event: customer_name_1\ndata: {json.dumps({"message":"Customer Name looks good to me!"})}\n\n"
                    Chats.create_chat(
                        db=db,
                        chatsession_id=session_id,
                        content="Customer Name looks good to me!",
                        type="bot",
                        to_show=True,
                        for_context=False
                    )
                sent_flags['customer_name'] = True
                time.sleep(0.5)

            if event.get('raw_text') is not None and not sent_flags['raw_text']:

                print("Raw text herer")
                yield f"event: email_count_1\ndata: {json.dumps({"message":"Hold on, I'm reading the email..."})}\n\n"
                time.sleep(1.5)
                email_count = len(event['raw_text'])
                data = {
                    "count": email_count,
                    "emails": event['raw_text']
                }
                yield f"event: email_count\ndata: {json.dumps(data)}\n\n"
                Chats.create_chat(
                    db=db,
                    chatsession_id=session_id,
                    content=json.dumps(data),
                    type="bot",
                    to_show=False,
                    for_context=True
                )
                Chats.create_chat(
                    db=db,
                    chatsession_id=session_id,
                    content=f"Yayy! I got {email_count} emails",
                    type="bot",
                    to_show=True,
                    for_context=False
                )
                sent_flags['raw_text'] = True
                time.sleep(0.3)

            if 'final_summary' in event and event['final_summary'] and not sent_flags['final_answer']:
                yield f"event: summary_1\ndata: {json.dumps({"message":"Thanks for Patience. Your final response is almose ready...."})}\n\n"
                time.sleep(1.6)
                summary_text = event['final_summary']
                formatted_summary = {
                    "message": summary_text
                }
                Chats.create_chat(
                    db=db,
                    chatsession_id=session_id,
                    content=summary_text,
                    type="bot",
                    to_show=True,
                    for_context=True
                )
                yield f"event: summary\ndata: {json.dumps(formatted_summary)}\n\n"
                sent_flags['final_answer'] = True
                yield "event: completed\ndata: done\n\n"
                reset_flags()
    except Exception as e:
        print("Exception ",e)
        yield "event: completed\ndata: done\n\n"
        reset_flags()


@app.post("/query")
async def run_agent(request: Request, user_email: str = Depends(get_current_user_email),db: Session = Depends(get_db)):
    data = await request.json()
    query = data.get("query")

    user = User.get_by_email(db=db,email=user_email)
    session_id = data.get("session_id")
    existed=False

    if session_id:
        chat_session = ChatSession.get_session(session_id=session_id,db=db,user_id=user.id)
        if(not chat_session):
            return {"error": "Session not found"}
        else:
            existed=True
    else:
        chat_session = ChatSession.create_session(db=db,user_id=user.id,name=query)
        if(not chat_session):
            return {"error": "Session not created"}
        session_id=chat_session.id

    Chats.create_chat(
        chatsession_id=session_id,
        content=query,
        type="user",
        db=db,
        to_show=True,
        for_context=True
    )

    if not query:
        return {"error": "Query is required."}

    return StreamingResponse(event_stream(query=query,user_email=user_email,session_id=session_id, db=db,existed=existed),media_type="text/event-stream")


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

@app.post("/logout")
def logout():
    response = JSONResponse(content={"message": "Logged out successfully"})
    response.delete_cookie(key="access_token")
    return response


class ChatSessionOut(BaseModel):
    id: int
    user_id: int
    name:str

    class Config:
        orm_mode = True


@app.get("/chat-sessions", response_model=List[ChatSessionOut])
def get_chat_sessions(
    user_email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db),
):
    # Find the user in the DB
    user = User.get_by_email(db=db,email=user_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Query sessions for user
    sessions = db.query(ChatSession).filter(ChatSession.user_id == user.id).order_by(desc(ChatSession.timestamp)).all()
    return sessions

@app.get("/chat-sessions/{session_id}/chats", response_model=List[ChatOut])
def get_chats_of_session(
    session_id: int,
    user_email: str = Depends(get_current_user_email),
    db: Session = Depends(get_db),
):
    # Verify user exists
    user = User.get_by_email(db=db, email=user_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify the chat session belongs to this user
    chat_session = ChatSession.get_session(session_id=session_id, db=db, user_id=user.id)
    if not chat_session:
        raise HTTPException(status_code=404, detail="Chat session not found or unauthorized")

    # Fetch chats of the session, ordered by timestamp ascending
    chats = Chats.get_chats_by_session(db=db, chatsession_id=session_id)

    return chats

if __name__=="__main__":
    import uvicorn 
    uvicorn.run(app=app,port=int(os.getenv("PORT")),host='127.0.0.1')
