from fastapi import APIRouter, Depends, HTTPException
from Users.routes import get_current_user
from SDK_Database.read import get_reminder  # Import Firestore query function

router = APIRouter()

@router.get("/users/{user_id}/medications/{med_id}/reminders/")
def get_medication_reminder(
    user_id: str,
    med_id: str,
    current_user: dict = Depends(get_current_user)
):
    # Ensure user is authorized to view reminders
    if current_user["user_id"] != user_id and current_user["role"] not in ["admin", "caretaker"]:
        raise HTTPException(status_code=403, detail="Not authorized to view this reminder.")
    
    reminder = get_reminder(user_id, med_id)
    
    if not reminder:
        raise HTTPException(status_code=404, detail="No reminder found for this medication.")
    
    return reminder
