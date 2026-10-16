"""
Google OAuth 2.0 Authenticator for Synthopsis (Gmail API).
Uses credentials.json from your Google Cloud Console / AURA OS project to generate a fresh token.json.
"""

import os
from pathlib import Path
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.readonly'
]

def authenticate():
    base_dir = Path(__file__).resolve().parent
    cred_file = base_dir / "credentials.json"
    token_file = base_dir / "token.json"

    if not cred_file.exists():
        print(f"Error: credentials.json not found at {cred_file}")
        return

    print("Opening Google Sign-In in your browser...")
    print("Please log in with your Google Account and click 'Allow' to grant Gmail API access.")
    flow = InstalledAppFlow.from_client_secrets_file(str(cred_file), SCOPES)
    creds = flow.run_local_server(port=0)

    with open(token_file, 'w') as f:
        f.write(creds.to_json())

    print(f"\n SUCCESS! Authenticated with Google!")
    print(f" Token saved to: {token_file}")
    print(" NexusAI can now send real emails directly through your Gmail account!")

if __name__ == "__main__":
    authenticate()
