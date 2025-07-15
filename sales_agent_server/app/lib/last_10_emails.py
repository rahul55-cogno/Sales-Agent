from dotenv import load_dotenv
import os
from email.header import decode_header
import imaplib
from lib.attachments import get_body_and_attachments
load_dotenv()
import email

email_user=os.getenv("EMAIL")
password=os.getenv("PASSWORD")

IMAP_SERVER = "imap.gmail.com"

def decode_mime_words(s):
    parts = decode_header(s)
    decoded = ''
    for part, encoding in parts:
        if isinstance(part, bytes):
            decoded += part.decode(encoding or 'utf-8', errors='ignore')
        else:
            decoded += part
    return decoded

def get_body(msg):
    if msg.is_multipart():
        for part in msg.walk():
            if part.get_content_type() == "text/plain" and "attachment" not in str(part.get("Content-Disposition")):
                return part.get_payload(decode=True).decode(errors="ignore")
    else:
        return msg.get_payload(decode=True).decode(errors="ignore")
    return ""

def main(sender_mail: str):
    received_messages = []
    mail = imaplib.IMAP4_SSL(IMAP_SERVER)
    mail.login(email_user, password)
    mail.select('inbox')

    status, email_ids = mail.search(None, 'FROM', f'"{sender_mail}"')
    email_id_list = email_ids[0].split()

    if not email_id_list:
        print("No emails found from sender.")
        return

    latest_10_email_ids = email_id_list[-10:]

    for email_id in reversed(latest_10_email_ids):
        status, msg_data = mail.fetch(email_id, '(RFC822)')
        for response_part in msg_data:
            if isinstance(response_part, tuple):
                msg = email.message_from_bytes(response_part[1])
                from_address = msg['from']
                subject = decode_mime_words(msg['subject']) if msg['subject'] else "(No Subject)"
                date = msg['date']
                
                # Extract body and attachments
                body, attachments = get_body_and_attachments(msg)

                to_append = {
                    "subject": subject,
                    "date": date,
                    "from_address": from_address,
                    "content": body,
                    "attachments": attachments
                }
                received_messages.append(to_append)
    print(received_messages)
    mail.logout()
    return received_messages


if __name__=="__main__":
    print(main('rahul24012006@gmail.com'))