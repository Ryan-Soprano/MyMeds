# FastAPI core
from fastapi import APIRouter, Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from Security.token_manager import create_access_token, timedelta

# JWT + Config
from jose import JWTError, jwt
from Backend.config import SECRET_KEY, JWT_ALGORITHM

# Models and DB logic
from .models import users_db, User, hash_password
from SDK_Database.Create import create_user, connect_users
from SDK_Database.firebase_config import db

# Logging
from Security.security_logging import log_security_event

# Firebase Admin
from firebase_admin import firestore

from pydantic import BaseModel


router = APIRouter()
security = HTTPBearer()

class UserCreateRequest(BaseModel):
    username: str
    password: str
    role: str = "basic"

class ConnectRequest(BaseModel):
    connected_user_id: str
    role: str

def generate_unique_user_id():
    users_ref = db.collection("users")
    users = users_ref.order_by("user_id", direction=firestore.Query.DESCENDING).limit(1).get()

    if users:
        last_user_id = users[0].to_dict().get("user_id", "user_0")
        last_id_num = int(last_user_id.split("_")[-1])
        new_id = f"user_{last_id_num + 1}"
    else:
        new_id = "user_1"

    return new_id

# Function to get current user from JWT token
def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username = payload.get("sub")
        role = payload.get("role")
        if username is None or role is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user_ref = db.collection("users").where("username", "==", username).limit(1).get()
        if not user_ref:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Username")

        user = user_ref[0].to_dict()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        return {
            "id": user["user_id"],
            "username": username,
            "role": role,
            "connected_users": user.get("connected_users", [])
        }

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def check_permissions(current_user: dict, allowed_roles: list, action: str):
    if current_user["role"] not in allowed_roles:
        log_security_event(
            user=current_user["id"],
            event_type="AUTHZ",
            action=action,
            status="DENIED",
            details=f"User with role '{current_user['role']}' tried to perform restricted action: {action}"
        )
        raise HTTPException(status_code=403, detail="Not authorized")

    log_security_event(
        user=current_user["id"],
        event_type="AUTHZ",
        action=action,
        status="SUCCESS",
        details=f"Access granted for role '{current_user['role']}' to perform: {action}"
    )

# Get all users (protected)
@router.get("/users/")
def get_users(current_user: dict = Depends(get_current_user)):
    check_permissions(current_user, ["admin", "caretaker"], "GET_USERS_ATTEMPT")

    log_security_event(
        user=current_user["id"],
        event_type="API_REQUEST",
        action="GET_USERS",
        status="SUCCESS",
        details="Retrieved full user list"
    )
    return list(users_db.values())

# Get a specific user by ID (protected)
@router.get("/users/{user_id}")
def get_user(user_id: int, current_user: dict = Depends(get_current_user)):
    target_user = users_db.get(user_id)

    if not target_user:
        log_security_event(
            user=current_user["id"],
            event_type="API_REQUEST",
            action="GET_USER",
            status="FAILED",
            details=f"User with ID {user_id} not found"
        )
        return {"error": "User not found"}

    if current_user["username"] != target_user.username:
        check_permissions(current_user, ["admin", "caretaker"], "GET_USER_ATTEMPT")

    log_security_event(
        user=current_user["id"],
        event_type="API_REQUEST",
        action="GET_USER",
        status="SUCCESS",
        details=f"Retrieved user data for user ID {user_id}"
    )
    return target_user

# Create a new user (protected)
@router.post("/users/")
def create_new_user(request: UserCreateRequest):
    user_id = generate_unique_user_id()
    hashed_password = hash_password(request.password)
    
    create_user(user_id, request.username, hashed_password, request.role)
    
    return {"message": f"User {user_id} created."}

# Add connection between users
@router.post("/users/connect/")
def connect_to_user(request: ConnectRequest, current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "dependent":
        raise HTTPException(status_code=403, detail="Not authorized to connect users.")
    
    connect_users(current_user["user_id"], request.connected_user_id, request.role)
    return {"message": f"User {current_user['user_id']} connected to {request.connected_user_id} as {request.role}."}

@router.post("/delegate_access/")
def delegate_access(dependent_id: str, current_user: dict = Depends(get_current_user)):
    if dependent_id not in current_user.connected_users:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Create a short-lived token for the dependent
    token = create_access_token({"sub": dependent_id}, expires_delta=timedelta(hours=1))
    return {"access_token": token}
