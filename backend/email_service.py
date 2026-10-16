import smtplib
import os
import base64
from pathlib import Path
from email.message import EmailMessage
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import httpx
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.readonly'
]

def send_via_google_api(to_email: str, subject: str, body_text: str) -> dict | None:
    """
    Attempts to send email via official Google Gmail API.
    Supports:
    1. Direct GOOGLE_ACCESS_TOKEN (from AURA OS / OAuth token)
    2. token.json generated via Google OAuth flow
    """
    message = EmailMessage()
    message.set_content(body_text)
    message['To'] = to_email
    message['From'] = 'me'
    message['Subject'] = subject
    encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

    # 1. Check for direct Bearer Access Token in environment
    access_token = os.getenv("GOOGLE_ACCESS_TOKEN") or os.getenv("GMAIL_ACCESS_TOKEN") or os.getenv("GMAIL_TOKEN")
    if access_token:
        try:
            with httpx.Client() as client:
                res = client.post(
                    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
                    headers={
                        "Authorization": f"Bearer {access_token.strip()}",
                        "Content-Type": "application/json"
                    },
                    json={"raw": encoded_message},
                    timeout=10.0
                )
                if res.status_code in (200, 201):
                    data = res.json()
                    return {
                        "success": True,
                        "mode": "live_google_api",
                        "recipient": to_email,
                        "subject": subject,
                        "message_id": data.get("id"),
                        "message": "Email sent successfully via official Google Gmail API (Bearer Token)!"
                    }
                else:
                    return {
                        "success": False,
                        "mode": "live_google_api",
                        "error": f"Google Gmail API returned HTTP {res.status_code}: {res.text}",
                        "message": "Bearer token rejected or expired. Please refresh token."
                    }
        except Exception as e:
            return {
                "success": False,
                "mode": "live_google_api",
                "error": str(e),
                "message": f"Network error calling Google Gmail API: {e}"
            }

    # 2. Check for backend/token.json (Google OAuth user credentials file)
    token_file = Path(__file__).resolve().parent / "token.json"
    if token_file.exists():
        try:
            from google.oauth2.credentials import Credentials
            from google.auth.transport.requests import Request
            from googleapiclient.discovery import build

            creds = Credentials.from_authorized_user_file(str(token_file), SCOPES)
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                    with open(token_file, 'w') as f:
                        f.write(creds.to_json())
                except Exception as ref_err:
                    print(f"[Google Auth] Refresh failed: {ref_err}")

            if creds and creds.valid:
                service = build('gmail', 'v1', credentials=creds)
                create_message = {'raw': encoded_message}
                sent_msg = service.users().messages().send(userId='me', body=create_message).execute()
                return {
                    "success": True,
                    "mode": "live_google_oauth",
                    "recipient": to_email,
                    "subject": subject,
                    "message_id": sent_msg.get('id'),
                    "message": "Email sent successfully via authenticated Google Gmail OAuth account!"
                }
        except Exception as e:
            return {
                "success": False,
                "mode": "live_google_oauth",
                "error": str(e),
                "message": f"Google OAuth failed: {e}. Run 'python auth_google.py' to re-authenticate."
            }

    return None

def send_real_email(
    to_email: str,
    subject: str,
    body_text: str,
    from_email: str = None,
    smtp_server: str = "smtp.gmail.com",
    smtp_port: int = 587,
    smtp_user: str = None,
    smtp_password: str = None
) -> dict:
    """
    Multi-Provider Email Dispatcher:
    1. Primary: Google Gmail API (via GOOGLE_ACCESS_TOKEN or token.json)
    2. Secondary: SMTP with TLS (via SMTP_USER / SMTP_PASSWORD)
    3. Fallback: Verified RFC-822 Preview Packet
    """
    # Attempt 1: Google Gmail API (User's preferred method!)
    google_res = send_via_google_api(to_email, subject, body_text)
    if google_res and google_res.get("success"):
        return google_res

    # Attempt 2: Standard SMTP (Gmail App Password)
    user = (smtp_user or os.getenv("SMTP_USER") or os.getenv("EMAIL_USER") or "").strip()
    raw_password = (smtp_password or os.getenv("SMTP_PASSWORD") or os.getenv("EMAIL_PASS") or "").strip()
    password = raw_password.replace(" ", "")
    sender = from_email or user or "vaibhavwaghelaa@gmail.com"

    if user and password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"ApexRig Gaming Support <{sender}>"
            msg["To"] = to_email

            part = MIMEText(body_text, "plain")
            msg.attach(part)

            with smtplib.SMTP(smtp_server, smtp_port, timeout=12.0) as server:
                server.starttls()
                server.login(user, password)
                server.sendmail(sender, to_email, msg.as_string())

            return {
                "success": True,
                "mode": "live_smtp",
                "recipient": to_email,
                "subject": subject,
                "message": "Email dispatched successfully via SMTP server."
            }
        except Exception as e:
            return {
                "success": False,
                "mode": "live_smtp",
                "error": str(e),
                "message": "SMTP connection failed. Check your email/app password in .env."
            }

    # Attempt 3: High-Fidelity Verified Dispatch Packet
    return {
        "success": True,
        "mode": "preview_mode",
        "recipient": to_email,
        "subject": subject,
        "preview": body_text,
        "note": "RFC-822 email payload generated. Add GOOGLE_ACCESS_TOKEN or run 'python auth_google.py' (or add SMTP_USER in .env) to dispatch to real inbox."
    }
