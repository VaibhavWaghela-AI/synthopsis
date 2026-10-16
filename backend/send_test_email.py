# -*- coding: utf-8 -*-
"""
Synthopsis Real Email Dispatch CLI Test Utility
===============================================
Usage:
  python send_test_email.py --to recipient@example.com --subject "Hello from Synthopsis"
  python send_test_email.py --to recipient@example.com --user mygmail@gmail.com --password "16-char-app-password"
"""

import sys
import argparse
from email_service import send_real_email

def main():
    parser = argparse.ArgumentParser(description="Send real email via Synthopsis")
    parser.add_argument("--to", required=True, help="Recipient email address")
    parser.add_argument("--subject", default="Synthopsis Enterprise Verification Test", help="Email subject line")
    parser.add_argument("--body", default="This is a live test email sent from Synthopsis Multi-Agent AI Platform.", help="Email body text")
    parser.add_argument("--user", default=None, help="SMTP username / Gmail address (overrides .env)")
    parser.add_argument("--password", default=None, help="SMTP password / App password (overrides .env)")
    parser.add_argument("--server", default="smtp.gmail.com", help="SMTP server host")
    parser.add_argument("--port", type=int, default=587, help="SMTP port")

    args = parser.parse_args()

    print(f"==================================================")
    print(f"DISPATCHING REAL EMAIL VIA SYNTHOPSIS")
    print(f"==================================================")
    print(f"  Recipient : {args.to}")
    print(f"  Subject   : {args.subject}")
    print(f"  SMTP Host : {args.server}:{args.port}")

    res = send_real_email(
        to_email=args.to,
        subject=args.subject,
        body_text=args.body,
        smtp_user=args.user,
        smtp_password=args.password,
        smtp_server=args.server,
        smtp_port=args.port
    )

    print("\nResult:")
    print(f"  Success : {res.get('success')}")
    print(f"  Mode    : {res.get('mode')}")
    print(f"  Message : {res.get('message')}")
    if res.get("error"):
        print(f"  Error   : {res.get('error')}")

if __name__ == "__main__":
    main()
