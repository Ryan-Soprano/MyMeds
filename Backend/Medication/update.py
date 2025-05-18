from fastapi import APIRouter, Depends, HTTPException
from SDK_Database.Create import add_medication
from .routes import get_current_user
from .model import MedicationCreate

router = APIRouter()

@router.put("/medications/{name}/")
def update_medication_info(name: str, updated_medication: MedicationCreate, current_user: dict = Depends(get_current_user)):
    # Pass the entire medication object to the update function
    result = add_medication(current_user["id"], name, updated_medication)
    
    return result
