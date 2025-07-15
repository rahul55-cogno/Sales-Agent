from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import os
from token_store import get_refresh_token_for_email
import httpx
import base64
import tempfile
from lib.attachments import extract_docx_text, extract_pdf_text

async def get_access_token(refresh_token: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": os.getenv("CLIENT_ID"),
                "client_secret": os.getenv("CLIENT_SECRET"),
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            },
        )
        return response.json().get("access_token")


def gmail_fetch_emails(email: str,senders_name:str) -> dict:
    refresh_token = get_refresh_token_for_email(email)
    if not refresh_token:
        raise Exception("User not authenticated. No refresh token found.")

    # Step 2: Get fresh access token
    access_token = httpx.post(
        "https://oauth2.googleapis.com/token",
        data={
            "client_id": os.getenv("CLIENT_ID"),
            "client_secret": os.getenv("CLIENT_SECRET"),
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        },
    ).json()["access_token"]

    creds = Credentials(token=access_token)
    service = build("gmail", "v1", credentials=creds)

    results = service.users().messages().list(userId="me", q=f'from:{senders_name}', maxResults=20).execute()
    messages = results.get("messages", [])

    received_messages = []

    for msg in messages:
        
        msg_data = service.users().messages().get(userId="me", id=msg["id"], format="full").execute()
        payload = msg_data["payload"]
        headers = payload["headers"]

        def get_header(name):
            for h in headers:
                if h["name"].lower() == name.lower():
                    return h["value"]
            return ""

        subject = get_header("Subject") or "(No Subject)"
        from_address = get_header("From")
        date = get_header("Date")

        # Extract plain text
        def get_body(payload):
            if payload.get("mimeType") == "text/plain":
                return payload.get("body", {}).get("data", "")
            elif payload.get("mimeType", "").startswith("multipart"):
                for part in payload.get("parts", []):
                    if part.get("mimeType") == "text/plain":
                        return part.get("body", {}).get("data", "")
            return ""

        body_data = get_body(payload)
        decoded_body = base64.urlsafe_b64decode(body_data.encode()).decode(errors="ignore")

        # Extract attachments
        attachments_text = []
        if payload.get("parts"):
            for part in payload["parts"]:
                filename = part.get("filename")
                body = part.get("body", {})
                attachment_id = body.get("attachmentId")

                if filename and attachment_id:
                    ext = filename.lower().split('.')[-1]
                    att = service.users().messages().attachments().get(userId="me", messageId=msg["id"], id=attachment_id).execute()
                    file_data = base64.urlsafe_b64decode(att["data"])

                    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp_file:
                        tmp_file.write(file_data)
                        file_path = tmp_file.name

                    if ext == "pdf":
                        attachments_text.append(extract_pdf_text(file_path))
                    elif ext in ["doc", "docx"]:
                        attachments_text.append(extract_docx_text(file_path))
                    else:
                        attachments_text.append(f"[Unsupported attachment: {filename}]")

        received_messages.append({
            "subject": subject,
            "from_address": from_address,
            "date": date,
            "content": decoded_body,
            "attachments": attachments_text,
        })

    return {"raw_text": received_messages}
