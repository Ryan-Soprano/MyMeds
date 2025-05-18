import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt, JWTError
from config import SECRET_KEY
from Backend.config import JWT_ALGORITHM

ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 1))

# In-memory token tracking
refresh_token_store = {}
refresh_token_blacklist = set()
access_token_blacklist = set()

# === Token Creation ===
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=JWT_ALGORITHM)

def create_refresh_token(data: dict):
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=JWT_ALGORITHM)

# === Token Validation ===
def decode_token(token: str):
    return jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])

def is_token_blacklisted(token: str, is_refresh=False) -> bool:
    return token in (refresh_token_blacklist if is_refresh else access_token_blacklist)

def get_stored_refresh_token(username: str) -> Optional[str]:
    return refresh_token_store.get(username)

def store_refresh_token(username: str, token: str):
    refresh_token_store[username] = token

def blacklist_refresh_token(token: str):
    refresh_token_blacklist.add(token)

def blacklist_access_token(token: str):
    access_token_blacklist.add(token)

def invalidate_user_refresh_token(username: str):
    token = refresh_token_store.pop(username, None)
    if token:
        blacklist_refresh_token(token)
