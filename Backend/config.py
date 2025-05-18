import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# === Firebase SDK Key ===
SDK_KEY = os.getenv("SDK_KEY")
USE_DUMMY_DATA = os.getenv("USE_DUMMY_DATA", "0") == "1"

# === JWT Configuration ===
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

# === Key paths: Always reference project root, not current file ===
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SECRETS_DIR = os.path.join(PROJECT_ROOT, "Backend", "Secrets")

# === HMAC Key: Load from file or fallback to .env ===
def load_hmac_key():
    hmac_path = os.path.join(SECRETS_DIR, "hmac.key")
    try:
        with open(hmac_path, "r") as f:
            key = f.read().strip()
            if not key:
                raise ValueError("HMAC_KEY file is empty.")
            return key
    except FileNotFoundError:
        print("[WARN] hmac.key not found. Falling back to HMAC_KEY in .env")
        return os.getenv("HMAC_KEY")

HMAC_KEY = load_hmac_key()

if not HMAC_KEY:
    raise ValueError("Missing HMAC_KEY. Set it in .env or create Backend/Secrets/hmac.key")

# === SECRET_KEY: Load from file or fallback ===
def load_secret_key():
    secret_path = os.path.join(SECRETS_DIR, "secret.key")
    try:
        with open(secret_path, "r") as f:
            key = f.read().strip()
            if not key:
                raise ValueError("SECRET_KEY is empty.")
            return key
    except FileNotFoundError:
        print("[WARN] secret.key not found. Using fallback.")
        return "dev_fallback_key"

SECRET_KEY = load_secret_key()

# === ENCRYPTION Key: Load from file or fallback to .env ===
def load_encryption_key():
    encryption_path = os.path.join(SECRETS_DIR, "encryption.key")
    try:
        with open(encryption_path, "r") as f:
            key = f.read().strip()
            if not key:
                raise ValueError("ENCRYPTION_KEY file is empty.")
            return key
    except FileNotFoundError:
        print("[WARN] encryption.key not found. Falling back to ENCRYPTION_KEY in .env")
        return os.getenv("ENCRYPTION_KEY")

ENCRYPTION_KEY = load_encryption_key()

if not ENCRYPTION_KEY:
    raise ValueError("Missing ENCRYPTION_KEY. Set it in .env or create Backend/Secrets/encryption.key")

# === GEMINI API Key: File or fallback ===
def load_gemini_key():
    gemini_path = os.path.join(SECRETS_DIR, "gemini.key")
    try:
        with open(gemini_path, "r") as f:
            key = f.read().strip()
            if not key:
                raise ValueError("GEMINI_API_KEY file is empty.")
            return key
    except FileNotFoundError:
        print("[WARN] gemini.key not found. Falling back to GEMINI_API_KEY in .env")
        return os.getenv("GEMINI_API_KEY", "fallback_gemini_key")

GEMINI_API_KEY = load_gemini_key()

# === Final validation ===
if not SDK_KEY:
    raise ValueError("Missing SDK_KEY in .env")

if not JWT_ALGORITHM:
    raise ValueError("Missing JWT_ALGORITHM in .env")

if USE_DUMMY_DATA:
    print("[INFO] Running with dummy data")
