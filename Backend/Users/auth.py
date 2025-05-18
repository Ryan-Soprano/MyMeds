# Standard Library
from datetime import datetime, timedelta
from typing import Optional
import time

# Third-Party Packages
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from pydantic import BaseModel
from jose import JWTError

# Internal Imports
from .models import User, UserRole, users_db
from Security.security_logging import log_security_event
from SDK_Database.firebase_config import db
from Security.token_manager import (
    create_access_token,
    create_refresh_token,
    decode_token,
    store_refresh_token,
    get_stored_refresh_token,
    blacklist_refresh_token,
    blacklist_access_token,
    invalidate_user_refresh_token,
    is_token_blacklisted
)

# Centralized config values
from Backend.config import JWT_ALGORITHM, SECRET_KEY, USE_DUMMY_DATA

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def verify_access_token(token: str = Depends(oauth2_scheme)):
    if is_token_blacklisted(token):
        log_security_event(
            user="unknown",
            event_type="AUTH",
            action="BLACKLISTED_TOKEN",
            status="FAILED",
            details="Attempted reuse of a blacklisted token"
        )
        raise HTTPException(status_code=401, detail="Token has been blacklisted")

    try:
        payload = decode_token(token)
        payload["token"] = token
        return payload

    except JWTError as e:
        log_security_event(
            user="unknown",
            event_type="AUTH",
            action="INVALID_TOKEN",
            status="FAILED",
            details=f"JWT error: {str(e)}"
        )
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/login/")
def login(request: LoginRequest):
    if USE_DUMMY_DATA:
        user = next((u for u in users_db.values() if u.username == request.username), None)
        print("I am Here")
        if not user or not verify_password(request.password, user.password):
            log_security_event(
                user=request.username,
                event_type="AUTH",
                action="LOGIN",
                status="FAILED",
                details="User not found" if not user else "Password mismatch"
            )
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        role = user.role
    else:
        user_ref = db.collection("users").where("username", "==", request.username).limit(1).get()
        user = user_ref[0].to_dict() if user_ref else None
        print(user)
        if not user or not verify_password(request.password, user["password"]):
            log_security_event(
                user=request.username,
                event_type="AUTH",
                action="LOGIN",
                status="FAILED",
                details="User not found" if not user else "Password mismatch"
            )
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        role = user["role"]

    access_token = create_access_token(data={"sub": request.username, "role": role})
    refresh_token = create_refresh_token(data={"sub": request.username, "role": role})
    store_refresh_token(user["username"], refresh_token)

    log_security_event(user=request.username, event_type="AUTH", action="LOGIN", status="SUCCESS")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

@router.post("/logout/")
def logout(token_data: dict = Depends(verify_access_token)):
    token_value = token_data["token"]
    username = token_data.get("sub", "unknown")

    blacklist_access_token(token_value)
    invalidate_user_refresh_token(username)

    log_security_event(
        user=username,
        event_type="AUTH",
        action="LOGOUT",
        status="SUCCESS" if username != "unknown" else "FAILED",
        details="User logged out"
    )

    return {"message": f"Logged out user: {username}"}

# === Lightweight Manual Rate Limiter for Refresh Endpoint ===
refresh_attempts = {}

def is_refresh_rate_limited(identifier: str, max_attempts: int = 5, window_seconds: int = 60) -> bool:
    now = time.time()
    if identifier not in refresh_attempts:
        refresh_attempts[identifier] = []
    refresh_attempts[identifier] = [ts for ts in refresh_attempts[identifier] if now - ts < window_seconds]
    if len(refresh_attempts[identifier]) >= max_attempts:
        return True
    refresh_attempts[identifier].append(now)
    return False

@router.post("/refresh-token/")
def refresh_token(request: Request, refresh_data: RefreshRequest):
    identifier = request.client.host  # or pull from Authorization token if available
    if is_refresh_rate_limited(identifier):
        log_security_event(
            user=identifier,
            event_type="RATE_LIMIT",
            action="REFRESH_TOKEN_BLOCKED",
            status="DENIED",
            details="Exceeded refresh attempts limit"
        )
        raise HTTPException(status_code=429, detail="Refresh rate limit exceeded. Please wait before retrying.")

    refresh_token = refresh_data.refresh_token
    try:
        if is_token_blacklisted(refresh_token, is_refresh=True):
            log_security_event(
                user="unknown",
                event_type="AUTH",
                action="REFRESH_TOKEN",
                status="FAILED",
                details="Blacklisted token reuse attempt"
            )
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked")

        payload = decode_token(refresh_token)
        username = payload.get("sub")
        role = payload.get("role")

        if not username or not role:
            log_security_event(
                user="unknown",
                event_type="AUTH",
                action="REFRESH_TOKEN",
                status="FAILED",
                details="Missing sub or role in token payload"
            )
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        stored_token = get_stored_refresh_token(username)
        if stored_token != refresh_token:
            log_security_event(
                user=username,
                event_type="AUTH",
                action="REFRESH_TOKEN",
                status="FAILED",
                details="Replay attempt or token mismatch"
            )
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or reused refresh token")

        # BLACKLIST the old refresh token immediately
        blacklist_refresh_token(refresh_token)

        # ISSUE a new access token and refresh token
        new_access_token = create_access_token(data={"sub": username, "role": role})
        new_refresh_token = create_refresh_token(data={"sub": username, "role": role})

        # STORE the new refresh token
        store_refresh_token(username, new_refresh_token)

        log_security_event(
            user=username,
            event_type="AUTH",
            action="REFRESH_TOKEN",
            status="SUCCESS",
            details="Refresh token rotated successfully"
        )

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }

    except JWTError:
        log_security_event(
            user="unknown",
            event_type="AUTH",
            action="REFRESH_TOKEN",
            status="FAILED",
            details="Invalid or expired refresh token"
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token")

