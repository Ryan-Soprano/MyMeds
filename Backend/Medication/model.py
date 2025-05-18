from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime
from typing import Optional, Literal

class MedicationCreate(BaseModel):
    name: str
    dosage: str
    instructions: str
    frequency: int
    pillcount: int
    times: List[str]  # e.g., ["08:00", "20:00"]
    days: List[str]   # e.g., ["Monday", "Tuesday"]
    pillShape: str
    pillColorLeft: str
    pillColorRight: str
    pillColor: str
    backgroundColor: str

class Reminder(BaseModel):
    times: List[str]  # e.g., ["08:00", "20:00"]
    days: List[str]   # e.g., ["Monday", "Tuesday"]
    status: Literal["active", "inactive"] = "active"

class Medication(BaseModel):
    id: str
    name: str
    dosage: str
    instructions: str
    frequency: int
    start_date: str
    end_date: str
    pill_count: int
    created_at: datetime
    updated_at: datetime
    user_id: Optional[str] = None  # 👈 make it optional
    reminders: Optional[List[Reminder]] = []


class MedicationInfo(BaseModel):
    id: str
    dosage: str
    instructions: str
    startDate: datetime
    endDate: datetime