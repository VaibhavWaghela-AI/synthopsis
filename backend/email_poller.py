"""
Autonomous IMAP Inbound Email Poller for Synthopsis / ApexRig Gaming.
Listens to vaibhavwaghelaa@gmail.com on imap.gmail.com:993 for UNSEEN customer inquiries.
When a customer sends an email, it automatically parses the body, feeds it into the
FastAPI /api/email/incoming pipeline, triggers the Enterprise DAG workflow, and dispatches the AI reply.
"""

import os
import sys
import re
import time
import email
import imaplib
import requests
from email.header import decode_header
from pathlib import Path
from dotenv import load_dotenv

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Load backend .env
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

IMAP_SERVER = os.getenv("IMAP_SERVER", "imap.gmail.com")
IMAP_PORT = int(os.getenv("IMAP_PORT", 993))
BACKEND_WEBHOOK = "http://127.0.0.1:8000/api/email/incoming"

IGNORE_SENDERS = [
    "noreply", "no-reply", "alerts", "notification", "notifications",
    "mailer-daemon", "postmaster", "promotions", "newsletter",
    "security-noreply@google.com", "udemy.com", "coursera.org", "internshala.com",
    "linkedin.com", "github.com", "google.com", "quora.com", "youtube.com",
    "facebook.com", "instagram.com", "twitter.com", "x.com", "netflix.com",
    "amazon.in", "amazon.com", "flipkart.com", "zomato.com", "swiggy.com",
    "naukri.com", "indeed.com", "glassdoor.com"
]

def clean_header(header_val: str) -> str:
    if not header_val:
        return ""
    try:
        decoded_parts = decode_header(header_val)
        result = ""
        for part, enc in decoded_parts:
            if isinstance(part, bytes):
                try:
                    result += part.decode(enc or "utf-8", errors="ignore")
                except Exception:
                    result += part.decode("utf-8", errors="ignore")
            else:
                result += str(part)
        return result
    except Exception:
        return str(header_val)

def extract_body(msg) -> str:
    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition", ""))
            if content_type == "text/plain" and "attachment" not in content_disposition:
                payload = part.get_payload(decode=True)
                if payload:
                    return payload.decode(errors="ignore")
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            return payload.decode(errors="ignore")
    return ""

def is_relevant_inquiry(subject: str, body: str, sender: str) -> bool:
    clean = (subject + " " + body).lower()
    subj_lower = subject.strip().lower()

    # 1. Anti-loop protection: Never reply to automated replies or existing threads
    if subj_lower.startswith("re:") or subj_lower.startswith("fwd:") or "apexrig custom pcs" in clean:
        return False
    
    # 2. Ignore known automated notification senders
    if any(ign in sender.lower() for ign in IGNORE_SENDERS):
        return False
        
    # 3. Check for commercial / hardware / quote / RFP intent
    keywords = [
        "quote", "quotation", "price", "pricing", "cost", "pc", "gaming", "rig",
        "build", "gpu", "cpu", "rtx", "4080", "4090", "4070", "ryzen", "intel",
        "i3", "i5", "i7", "i9", "bottleneck", "order", "rfq", "sample", "apexrig",
        "synthopsis", "deal", "delivery", "spec", "specification", "hardware"
    ]
    return any(k in clean for k in keywords)

def check_mailbox():
    user = os.getenv("SMTP_USER") or os.getenv("EMAIL_USER") or os.getenv("COMPANY_EMAIL", "vaibhavwaghelaa@gmail.com")
    raw_pwd = os.getenv("SMTP_PASSWORD") or os.getenv("EMAIL_PASS")

    if not raw_pwd:
        return

    password = raw_pwd.replace(" ", "")

    try:
        mail = imaplib.IMAP4_SSL(IMAP_SERVER, IMAP_PORT)
        mail.login(user, password)
        mail.select("INBOX")

        # Search for unseen/unread emails
        status, messages = mail.search(None, "UNSEEN")
        if status != "OK" or not messages[0]:
            mail.logout()
            return

        msg_ids = messages[0].split()
        if not msg_ids:
            mail.logout()
            return

        print(f"[Email Poller] Inspecting {len(msg_ids)} unread email(s) in {user} INBOX...")

        for m_id in msg_ids:
            try:
                res, data = mail.fetch(m_id, "(RFC822)")
                for response_part in data:
                    if isinstance(response_part, tuple):
                        raw_email = response_part[1]
                        parsed_msg = email.message_from_bytes(raw_email)

                        subject = clean_header(parsed_msg.get("Subject", "No Subject"))
                        from_hdr = clean_header(parsed_msg.get("From", ""))
                        emails = re.findall(r"[\w\.-]+@[\w\.-]+", from_hdr)
                        sender_email = emails[0] if emails else from_hdr

                        body = extract_body(parsed_msg)

                        # Filter: only reply to business inquiries and avoid newsletters
                        if not is_relevant_inquiry(subject, body, sender_email):
                            # Mark as seen so we don't inspect again
                            mail.store(m_id, '+FLAGS', '\\Seen')
                            continue

                        print(f"\n[Email Poller] [INQUIRY] Valid Inquiry detected from {sender_email}: \"{subject}\"")

                        # Deliver to inbound webhook
                        try:
                            resp = requests.post(
                                BACKEND_WEBHOOK,
                                json={
                                    "from": sender_email,
                                    "to": user,
                                    "subject": subject,
                                    "body": body
                                },
                                timeout=15.0
                            )
                            if resp.status_code == 200:
                                print(f"[Email Poller] [REPLIED] Successfully ingested & replied to {sender_email}")
                                mail.store(m_id, '+FLAGS', '\\Seen')
                        except Exception as req_err:
                            print(f"[Email Poller] Failed to forward email to {BACKEND_WEBHOOK}: {req_err}")
            except Exception as msg_err:
                print(f"[Email Poller] Error reading message {m_id}: {msg_err}")

        mail.logout()
    except Exception as e:
        print(f"[Email Poller] IMAP Error: {e}")

def main():
    user = os.getenv("SMTP_USER") or "vaibhavwaghelaa@gmail.com"
    pwd = os.getenv("SMTP_PASSWORD")
    print("=======================================================")
    print(f"[Email Poller] Initializing IMAP watcher for: {user}")
    print(f"[Email Poller] Active 24/7 background polling running on imap.gmail.com:993!")
    print("=======================================================")

    while True:
        check_mailbox()
        time.sleep(8)

if __name__ == "__main__":
    main()
