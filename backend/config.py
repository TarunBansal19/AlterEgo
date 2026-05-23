import os
from pathlib import Path
from dotenv import load_dotenv

# Load backend .env
load_dotenv()

# Load frontend .env if it exists
frontend_env = Path(__file__).parent.parent / "frontend" / "alterego" / ".env"
if frontend_env.exists():
    load_dotenv(dotenv_path=frontend_env)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY" , "")
IMAGEKIT_PRIVATE_KEY = os.getenv("IMAGEKIT_PRIVATE_KEY" , "")
IMAGEKIT_PUBLIC_KEY = os.getenv("IMAGEKIT_PUBLIC_KEY" , "")
IMAGEKIT_URL_ENDPOINT = os.getenv("IMAGEKIT_URL_ENDPOINT" , "")

DATABASE_URL = os.getenv("DATABASE_URL" , "")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET" , "")
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL") or ""


