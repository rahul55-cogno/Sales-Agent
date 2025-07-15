import tempfile
import fitz  
import docx
from email.header import decode_header

def decode_mime_words(s):
    decoded_fragments = decode_header(s)
    return ''.join(
        fragment.decode(encoding or 'utf-8') if isinstance(fragment, bytes) else fragment
        for fragment, encoding in decoded_fragments
    )

def extract_pdf_text(file_path):
    text = ""
    try:
        with fitz.open(file_path) as doc:
            for page in doc:
                text += page.get_text()
    except Exception as e:
        text = f"[Error reading PDF: {e}]"
    return text

def extract_docx_text(file_path):
    text = ""
    try:
        doc = docx.Document(file_path)
        text = "\n".join([p.text for p in doc.paragraphs])
    except Exception as e:
        text = f"[Error reading DOCX: {e}]"
    return text

def get_body_and_attachments(msg):
    text_content = ""
    attachments_content = []

    for part in msg.walk():
        content_disposition = str(part.get("Content-Disposition"))
        content_type = part.get_content_type()

        # Get plain text content
        if content_type == "text/plain" and "attachment" not in content_disposition:
            text_content += part.get_payload(decode=True).decode(errors="ignore")

        # Check for attachments
        elif "attachment" in content_disposition:
            filename = part.get_filename()
            if filename:
                decoded_filename = decode_mime_words(filename)
                ext = decoded_filename.lower().split(".")[-1]

                with tempfile.NamedTemporaryFile(delete=False, suffix=f".{ext}") as tmp_file:
                    tmp_file.write(part.get_payload(decode=True))
                    tmp_path = tmp_file.name

                if ext == "pdf":
                    attachments_content.append(extract_pdf_text(tmp_path))
                elif ext in ["docx", "doc"]:
                    attachments_content.append(extract_docx_text(tmp_path))
                else:
                    attachments_content.append(f"[Unsupported attachment: {decoded_filename}]")

    return text_content, attachments_content
