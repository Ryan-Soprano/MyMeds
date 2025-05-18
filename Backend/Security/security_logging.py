import os
import logging
import json
import hmac
import hashlib
from config import HMAC_KEY
from dotenv import load_dotenv
from google.cloud import logging as gcp_logging
from google.oauth2 import service_account

# Config
from Backend.config import SDK_KEY

logger = None

def generate_hmac(message: str) -> str:
    """Generate an HMAC SHA-256 signature for a given message."""
    return hmac.new(HMAC_KEY.encode(), message.encode(), hashlib.sha256).hexdigest()

# Get path to service account credentials
cred_path = os.getenv("SDK_KEY")

if cred_path and os.path.isfile(cred_path):
    try:
        credentials = service_account.Credentials.from_service_account_file(SDK_KEY)
        client = gcp_logging.Client(credentials=credentials, project=credentials.project_id)
        logger = client.logger("security-logs")
    except Exception as e:
        print(f"Failed to initialize Google Cloud Logging: {e}")
        logger = logging.getLogger("fallback-logger")
        logging.basicConfig(level=logging.INFO)
else:
    print("WARNING: SDK_KEY not set or file missing. Using local fallback logger.")
    logger = logging.getLogger("fallback-logger")
    logging.basicConfig(level=logging.INFO)

def log_security_event(user: str, event_type: str, action: str, status: str, details: str = ""):
    log_entry = {
        "user": user,
        "event_type": event_type,
        "action": action,
        "status": status,
        "details": details
    }

    # Create JSON and generate HMAC signature
    event_json = json.dumps(log_entry, sort_keys=True)
    log_entry["hmac"] = generate_hmac(event_json)

    if hasattr(logger, "log_struct"):
        logger.log_struct(log_entry)
    else:
        logger.info(f"SECURITY EVENT: {log_entry}")

def log_unauthorized_access(user: str, endpoint: str, reason: str):
    log_security_event(
        user=user,
        event_type="AUTH",
        action="UNAUTHORIZED_ACCESS",
        status="FAILED",
        details=f"Tried to access {endpoint} — {reason}"
    )
