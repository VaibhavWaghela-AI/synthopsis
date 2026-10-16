import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from backend directory or parent directory
env_path = Path(__file__).resolve().parent / ".env"
parent_env = Path(__file__).resolve().parent.parent / "upteky-nexusai" / ".env.local"

if env_path.exists():
    load_dotenv(dotenv_path=env_path)
if parent_env.exists():
    load_dotenv(dotenv_path=parent_env)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "0.0.0.0")

def is_groq_configured() -> bool:
    return bool(GROQ_API_KEY and not GROQ_API_KEY.startswith("your_groq"))

def is_gemini_configured() -> bool:
    return bool(GEMINI_API_KEY and not GEMINI_API_KEY.startswith("your_gemini"))
