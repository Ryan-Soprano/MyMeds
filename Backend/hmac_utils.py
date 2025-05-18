import hmac
import hashlib
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SECRET_KEY = os.getenv("HMAC_KEY")

if not SECRET_KEY:
    raise RuntimeError("HMAC_KEY not set in environment variables")

def generate_hmac(message: str) -> str:
    """Generate an HMAC SHA-256 signature for a given message."""
    return hmac.new(SECRET_KEY.encode(), message.encode(), hashlib.sha256).hexdigest()
