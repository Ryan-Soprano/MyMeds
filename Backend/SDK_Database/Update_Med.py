from .firebase_config import db
from firebase_admin import firestore

def update_medication(user_id, name, updated_medication):
    """Updates the medication information based on provided data."""
    
    # Prepare the update data
    update_data = {}
    if "dosage" in updated_medication:
        update_data["dosage"] = updated_medication["dosage"]
    if "frequency" in updated_medication:
        update_data["frequency"] = updated_medication["frequency"]
    if "instructions" in updated_medication:
        update_data["instructions"] = updated_medication["instructions"]
    if "pill_count" in updated_medication:
        update_data["pill_count"] = updated_medication["pill_count"]
    if "startDate" in updated_medication:
        update_data["start_date"] = updated_medication["startDate"]
    if "endDate" in updated_medication:
        update_data["end_date"] = updated_medication["endDate"]

    # Add the timestamp for any update
    update_data["updated_at"] = firestore.SERVER_TIMESTAMP
    
    # Perform the update operation
    db.collection(f"users/{user_id}/medications").document(name).update(update_data)
    
    return {"message": f"Medication {name} updated successfully."}
