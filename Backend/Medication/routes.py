from fastapi import APIRouter, Depends, HTTPException
from typing import List

# Auth & Permissions
from Users.routes import get_current_user, check_permissions
from Users.models import users_db

# Medication models
from .model import Medication, MedicationCreate, MedicationInfo

# Logging
from Security.security_logging import log_security_event

# External services and SDKs
from google.cloud import firestore
from SDK_Database.Create import add_medication
from SDK_Database.firebase_config import db


router = APIRouter()

# Get all medications for the current user (or all if admin)
@router.get("/medications/", response_model=List[dict])
def get_medications(current_user: dict = Depends(get_current_user)):
    medications = []

    def transform_for_frontend(med: dict) -> dict:
        return {
            "name": med.get("name", ""),
            "dosage": med.get("dosage", ""),
            "times": med.get("times", []),
            "days": med.get("days", []),
            "taken": False,  # Set this based on your logic later
            "pillShape": med.get("pillShape", "circle"),
            "pillColorLeft": med.get("pillColorLeft", "#FFFFFF"),
            "pillColorRight": med.get("pillColorRight", "#FFFFFF"),
            "pillColor": med.get("pillColor", "#FFFFFF"),
            "backgroundColor": med.get("backgroundColor", "#D9D9D9")
        }

    # Admins see all meds
    if current_user["role"] == "admin":
        log_security_event(
            user=current_user["id"],
            event_type="READ",
            action="GET_MEDICATIONS",
            status="SUCCESS",
            details="Admin fetched all medications"
        )
        meds_ref = db.collection("medications")
        meds = meds_ref.stream()
        medications = [transform_for_frontend(med.to_dict()) for med in meds]
        return medications

    # Regular users see their own meds
    log_security_event(
        user=current_user["id"],
        event_type="READ",
        action="GET_MEDICATIONS",
        status="SUCCESS",
        details="User fetched their medication list"
    )

    meds_ref = db.collection(f"users/{current_user['id']}/medications")
    meds = meds_ref.stream()

    for med in meds:
        med_dict = med.to_dict()
        med_dict["id"] = med.id
        med_dict["user_id"] = current_user["id"]
        medications.append(transform_for_frontend(med_dict))

    return medications

@router.get("/medicationsmedpage/", response_model=List[dict])
def get_medications(current_user: dict = Depends(get_current_user)):
    medications = []

    def transform_for_frontend(med: dict) -> dict:
        return {
            "name": med.get("name", ""),
            "dosage": med.get("dosage", ""),
            "quantity": med.get("pill_count", 0),
            "timesPerDay": med.get("frequency", 0),
            "times": med.get("times", []),
            "days": med.get("days", []),
            "startDate": med.get("start_date", ""),
            "endDate": med.get("end_date", ""),
            "taken": False,  # Set this based on your logic later
            "pillShape": med.get("pillShape", "circle"),
            "pillColorLeft": med.get("pillColorLeft", "#FFFFFF"),
            "pillColorRight": med.get("pillColorRight", "#FFFFFF"),
            "pillColor": med.get("pillColor", "#FFFFFF"),
            "backgroundColor": med.get("backgroundColor", "#D9D9D9")
        }

    # Admins see all meds
    if current_user["role"] == "admin":
        log_security_event(
            user=current_user["id"],
            event_type="READ",
            action="GET_MEDICATIONS",
            status="SUCCESS",
            details="Admin fetched all medications"
        )
        meds_ref = db.collection("medications")
        meds = meds_ref.stream()
        medications = [transform_for_frontend(med.to_dict()) for med in meds]
        return medications

    # Regular users see their own meds
    log_security_event(
        user=current_user["id"],
        event_type="READ",
        action="GET_MEDICATIONS",
        status="SUCCESS",
        details="User fetched their medication list"
    )

    meds_ref = db.collection(f"users/{current_user['id']}/medications")
    meds = meds_ref.stream()

    for med in meds:
        med_dict = med.to_dict()
        med_dict["id"] = med.id
        med_dict["user_id"] = current_user["id"]
        medications.append(transform_for_frontend(med_dict))

    return medications

# Add new medication for the current user
@router.post("/medications/")
def add_medication_route(
    med: MedicationCreate, 
    current_user: dict = Depends(get_current_user),
    user_id: str = None  # Optional user_id for caretakers adding for dependents
):
    # If the user is a dependent, they cannot add medications
    print(current_user)
    if current_user["role"] == "dependent":
        log_security_event(
            user=current_user["id"],
            event_type="AUTHZ",
            action="ADD_MEDICATION_ATTEMPT",
            status="DENIED",
            details="Dependent attempted to add medication"
        )
        raise HTTPException(status_code=403, detail="Dependents cannot add medications.")

    # Check if the user is a caretaker
    caretaker_for = [
        uid for uid, role in current_user["connected_users"].items() if role == "caretaker"
    ]

    print(current_user["connected_users"])
    # Determine the actual user receiving the medication
    target_user_id = user_id if user_id else current_user["id"]

    # If they are a caretaker for multiple dependents, they must specify a user_id
    if target_user_id != current_user["id"]:
        print(caretaker_for)
        if user_id not in caretaker_for:
            log_security_event(
                user=current_user["id"],
                event_type="AUTHZ",
                action="ADD_MEDICATION_ATTEMPT",
                status="DENIED",
                details=f"Unauthorized attempt to add med for user {user_id}"
            )
            raise HTTPException(
                status_code=403,
                detail="You are not a caretaker for this user."
            )

    if "Everyday" in med.days:
        med.days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    
    # Add medication
    add_medication(target_user_id, med.name, med.dosage, med.frequency, med.instructions, med.pillcount, med.times, med.days, med.pillShape, med.pillColorLeft, med.pillColorRight, med.pillColor, med.backgroundColor)  # Call add_medication from SDK_Database
    return {"message": f"Medication {med.name} added for user {target_user_id}."}


@router.delete("/medications/")
def delete_medication(
    med_name: str, 
    current_user: dict = Depends(get_current_user), 
    user_id: str = None  # Optional user_id for caretakers deleting for dependents
):
    # Dependents cannot delete medications
    if current_user["role"] == "dependent":
        log_security_event(
            user=current_user["id"],
            event_type="AUTHZ",
            action="DELETE_MEDICATION_ATTEMPT",
            status="DENIED",
            details="Dependent tried to delete medication"
        )
        raise HTTPException(status_code=403, detail="Dependents cannot delete medications.")

    # Check if the user is a caretaker for any dependents
    caretaker_for = [
        uid for uid, role in current_user["connected_users"].items() if role == "caretaker"
    ]

    # If the user is a caretaker but also deleting their OWN medication, no user_id is needed
    if user_id is None:
        target_user_id = current_user["id"]  # Just deleting their own medication
        
    else:
        if user_id not in caretaker_for:
            log_security_event(
                user=current_user["id"],
                event_type="AUTHZ",
                action="DELETE_MEDICATION_ATTEMPT",
                status="DENIED",
                details=f"Unauthorized delete attempt for user {user_id}"
            )
            raise HTTPException(
                status_code=403,
                detail="You are not a caretaker for this user."
            )
        target_user_id = user_id
    print(target_user_id)

    # Find the medication by name and user_id
    med_to_delete = None
    for med_id, med in medication_db.items():
        if med.user_id == target_user_id and med.name.lower() == med_name.lower():
            med_to_delete = med_id
            break

    if med_to_delete is None:
        log_security_event(
            user=current_user["id"],
            event_type="API_REQUEST",
            action="DELETE_MEDICATION_ATTEMPT",
            status="FAILED",
            details=f"Medication '{med_name}' not found for user {target_user_id}"
        )
        raise HTTPException(status_code=404, detail="Medication not found.")

    # Delete the medication
    del medication_db[med_to_delete]
    log_security_event(
        user=current_user["id"],
        event_type="API_REQUEST",
        action="DELETE_MEDICATION",
        status="SUCCESS",
        details=f"Deleted medication '{med_name}' for user {target_user_id}"
    )
    return {"message": f"Medication '{med_name}' deleted successfully."}


# Get medications for the connected user (for Basic User and Caretaker User)
@router.get("/connected_user_medications/", response_model=List[Medication])
def get_connected_user_medications(current_user: dict = Depends(get_current_user)):
    check_permissions(current_user, ["basic", "caretaker"], "GET_CONNECTED_USER_MEDICATIONS_ATTEMPT")

    connected_users = current_user["connected_users"]  # Dict {user_id: role}
    if not connected_users:
        raise HTTPException(status_code=404, detail="No connected users found")

    # Fetch medications only for users where the current user is a "caretaker"
    authorized_users = [
        user_id for user_id, role in connected_users.items() if role == "caretaker" or role == "basic"
    ]

    if not authorized_users:
        raise HTTPException(status_code=403, detail="No caretaker access to connected users")

    connected_user_medications = [
        med for med in db.values() if med.user_id in authorized_users
    ]
    log_security_event(
        user=current_user["id"],
        event_type="READ",
        action="GET_CONNECTED_USER_MEDICATIONS",
        status="SUCCESS",
        details="Fetched medications for connected users"
    )
    return connected_user_medications
