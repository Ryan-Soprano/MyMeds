from fastapi import APIRouter, Depends, HTTPException, status
from SDK_Database.Update_User import (
    update_user_username, update_user_password,
    update_user_role, update_connected_users
)
from .routes import get_current_user  # Import token-based user retrieval

router = APIRouter()

# Update user name
@router.put("/users/username/")
def update_username(new_name: str, current_user: dict = Depends(get_current_user)):
    update_user_username(current_user["user_id"], new_name)
    return {"message": f"Name updated for {current_user['user_id']}."}

# Update user password
@router.put("/users/password/")
def update_password(new_password: str, current_user: dict = Depends(get_current_user)):
    update_user_password(current_user["user_id"], new_password)
    return {"message": f"Password updated for {current_user['user_id']}."}

# Update user role (Only Admins can change roles)
@router.put("/users/role/")
def update_role(new_role: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to change roles.")
    
    update_user_role(current_user["user_id"], new_role)
    return {"message": f"Role updated for {current_user['user_id']} to {new_role}."}

# Update connected users
@router.put("/users/connected/")
def update_connections(connected_users: dict, current_user: dict = Depends(get_current_user)):
    update_connected_users(current_user["user_id"], connected_users)
    return {"message": f"Connected users updated for {current_user['user_id']}."}
