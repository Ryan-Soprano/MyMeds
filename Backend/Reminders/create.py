from fastapi import APIRouter, Depends, HTTPException
from typing import List
from SDK_Database.Create import add_reminder  # Import your function
from Users.routes import get_current_user  # Assuming you have authentication

router = APIRouter()

ALL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

@router.post("/users/{user_id}/medications/{med_id}/reminders/")
def create_reminder(
    user_id: str,
    med_id: str,
    times: List[str],
    days: List[str],
    current_user: dict = Depends(get_current_user)
):
    # Ensure user is authorized to add reminders
    if current_user["id"] != user_id and current_user["role"] not in ["admin", "caretaker"]:
        raise HTTPException(status_code=403, detail="Not authorized to add reminders for this user.")
    
    if "Everyday" in days:
        days = ALL_DAYS  # Expand "Everyday" to all days of the week
    
    add_reminder(user_id, med_id, times, days)
    return {"message": f"Reminder set for medication {med_id} on {days} at {times}."}
