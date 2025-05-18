from .firebase_config import db  # Import Firestore client
from firebase_admin import firestore


def update_user_username(user_id: str, new_username: str):
    """Update a user's username."""
    user_ref = db.collection("users").document(user_id)
    user_ref.update({"username": new_username})
    print(f"Updated name for {user_id}.")


def update_user_password(user_id: str, new_password: str):
    """Update a user's password (already hashed)."""
    user_ref = db.collection("users").document(user_id)
    user_ref.update({"password": new_password})
    print(f"Updated password for {user_id}.")


def update_user_role(user_id: str, new_role: str):
    """Update a user's role."""
    user_ref = db.collection("users").document(user_id)
    user_ref.update({"role": new_role})
    print(f"Updated role for {user_id} to {new_role}.")


def update_connected_users(user_id: str, connected_users: dict):
    """Update a user's connected users dictionary."""
    user_ref = db.collection("users").document(user_id)
    user_ref.update({"connected_users": connected_users})
    print(f"Updated connected users for {user_id}.")