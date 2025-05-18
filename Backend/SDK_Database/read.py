from .firebase_config import db

def get_reminder(user_id, med_id):
    """Fetches the first reminder for a given medication."""
    reminders_ref = db.collection(f"users/{user_id}/medications/{med_id}/reminders")
    docs = reminders_ref.limit(1).stream()  # Fetch the first document
    
    for doc in docs:
        return doc.to_dict()  # Return the first (and only) reminder
    
    return None  # If no reminders exist