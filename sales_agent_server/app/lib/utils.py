import os

ATTACHMENT_DIR = "static/attachments"

def save_attachment_locally(file_content: bytes, filename: str) -> str:
    """
    Saves the attachment locally and returns the public URL.
    """
    if not os.path.exists(ATTACHMENT_DIR):
        os.makedirs(ATTACHMENT_DIR)

    file_path = os.path.join(ATTACHMENT_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(file_content)

    # Return URL that can be served by FastAPI static route
    return f"/static/attachments/{filename}"

import re

def extract_attachment_links(text: str):
    """
    Extracts URLs and filenames from the text in 'filename (url)' format.
    Returns a list of dicts: [{"name": "filename.pdf", "url": "/static/attachments/filename.pdf"}]
    """
    pattern = r"([\w\-\.\s]+)\s*\((https?://[^\s]+|/static/[^\s]+)\)"
    matches = re.findall(pattern, text)
    return [{"name": name.strip(), "url": url.strip()} for name, url in matches]
