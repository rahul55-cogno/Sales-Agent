from fastapi import FastAPI, Request,Depends
from fastapi.middleware.cors import CORSMiddleware
from agent import final_workflow
from fastapi.responses import RedirectResponse
from fastapi import HTTPException
import httpx
from google.oauth2 import id_token
import asyncio
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import RedirectResponse
import os
from dotenv import load_dotenv  
from fastapi import Request
from database.session import SessionLocal
from database.models import User
import json
from typing import AsyncGenerator
from database.session import Base, engine
import time
from lib.dependencies import get_current_user_email
from urllib.parse import urlencode
from fastapi.responses import StreamingResponse
from lib.jwt_utils import create_jwt,verify_jwt
from google.auth.transport import requests as grequests

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
        "context_data": False,
        "final_answer": False
}

def event_stream(query, user_email):
    yield f"event: starting_agent\ndata: {json.dumps({'message': 'Starting Agent...'})}\n\n"

    # (Optional) Progress status
    yield f"event: reading_emails\ndata: {json.dumps({'message': 'Reading recent emails...'})}\n\n"
    time.sleep(0.7)

    events = final_workflow.stream(
        {"query": query, "email": user_email},
        {"configurable": {"thread_id": user_email}},
        stream_mode="values"
    )

    for event in events:
        if 'customer_name' in event and not sent_flags['customer_name']:
            data = {"customer_name": event['customer_name']}
            yield f"event: customer_name\ndata: {json.dumps(data)}\n\n"
            if(event['customer_name']):
                time.sleep(2.0)
                yield f"event: customer_name_1\ndata: {json.dumps({"message":"Customer Name looks good to me!"})}\n\n"
            sent_flags['customer_name'] = True
            time.sleep(0.5)

        if 'raw_text' in event and not sent_flags['raw_text']:
            yield f"event: email_count_1\ndata: {json.dumps({"message":"Hold on, I'm reading the email..."})}\n\n"
            time.sleep(1.5)
            email_count = len(event['raw_text'])
            data = {
                "count": email_count,
                "emails": event['raw_text']
            }
            yield f"event: email_count\ndata: {json.dumps(data)}\n\n"
            sent_flags['raw_text'] = True
            time.sleep(0.3)

        if 'context_data' in event and not sent_flags['context_data']:
            yield f"event: context_ready_1\ndata: {json.dumps({"message":"Let me get the context first"})}\n\n"
            time.sleep(1)
            data = {"context": event['context_data']}      # <-- FULL OBJECT!
            yield f"event: context_ready\ndata: {json.dumps(data)}\n\n"
            sent_flags['context_data'] = True
            time.sleep(0.6)

        if 'messages' in event and not sent_flags['final_answer'] and len(event['messages']) > 0:
            yield f"event: summary_1\ndata: {json.dumps({"message":"Thanks for Patience. Your final response is almose ready...."})}\n\n"
            time.sleep(1.6)
            summary_text = event['messages'][-1].content
            formatted_summary = {
                "title": "Customer Communication Summary",
                "customer": event.get('customer_name', 'Unknown'),
                "emails": [line.strip() for line in summary_text.split("\n") if line.strip()]
            }
            yield f"event: summary\ndata: {json.dumps(formatted_summary)}\n\n"
            sent_flags['final_answer'] = True
            time.sleep(0.3)

    if all(sent_flags.values()):
        yield "event: completed\ndata: done\n\n"


@app.post("/query")
async def run_agent(request: Request, user_email: str = Depends(get_current_user_email)):
    data = await request.json()
    query = data.get("query")

    if not query:
        return {"error": "Query is required."}

    # async def event_stream():
    #     try:
    #         yield f"data: {json.dumps({'status': 'Starting agent pipeline...'})}\n\n"
    #         await asyncio.sleep(0)  # flush immediately

    #         events = final_workflow.stream(
    #             {"query": query, "email": user_email},
    #             {"configurable": {"thread_id": user_email}},
    #             stream_mode="values"
    #         )

    #         for event in events:
    #             if "customer_name" in event:
    #                 yield f"data: {json.dumps({'status': 'Extracted sender name', 'name': event['customer_name']})}\n\n"
    #             if "raw_text" in event:
    #                 yield f"data: {json.dumps({'status': 'Fetched emails', 'emails_count': len(event['raw_text'])})}\n\n"
    #             if "context_data" in event:
    #                 snippet = event['context_data'][0][:200]
    #                 yield f"data: {json.dumps({'status': 'Context prepared', 'context_snippet': snippet})}\n\n"
    #             if "messages" in event:
    #                 yield f"data: {json.dumps({'status': 'Answer generated', 'answer': event['messages'][-1].content})}\n\n"

    #             await asyncio.sleep(0)

    #         yield f"data: {json.dumps({'status': 'Completed'})}\n\n"
    #     except Exception as e:
    #         yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_stream(query=query,user_email=user_email), media_type="text/event-stream")


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