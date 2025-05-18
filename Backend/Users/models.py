from enum import Enum
from pydantic import BaseModel
from typing import List, Dict
from passlib.context import CryptContext

# Define user roles
class UserRole(str, Enum):
    BASIC = "basic"
    DEPENDENT = "dependent"
    ADMIN = "admin"

# Define user model
class User(BaseModel):
    id: int
    username: str
    role: UserRole  # Global role (only affects their own account)
    password: str
    connected_users: Dict[int, str] = {}  # Dictionary {connected_user_id: role}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Used only for development/test login
plaintext_passwords = {
    "alice": "password123",
    "bob": "password123",
    "charlie": "dependent123",
    "dave": "admin123"
}

def hash_password(password: str):
    return pwd_context.hash(password)

# Dummy user data
users_db = {
    1: User(id=1, username="alice", role=UserRole.BASIC, password=hash_password(plaintext_passwords["alice"]), connected_users={2: "basic", 3: "caretaker"}),
    2: User(id=2, username="bob", role=UserRole.BASIC, password=hash_password(plaintext_passwords["bob"]), connected_users={1: "basic"}),
    3: User(id=3, username="charlie", role=UserRole.DEPENDENT, password=hash_password(plaintext_passwords["charlie"])),
    4: User(id=4, username="dave", role=UserRole.ADMIN, password=hash_password(plaintext_passwords["dave"])),
}

