from .firebase_config import db  # Import Firestore client
from firebase_admin import firestore
from datetime import datetime, timedelta

def create_user(user_id, username, password, role="basic"):
    """Creates a new user document with an empty connected_users dictionary."""
    user_ref = db.collection("users").document(user_id)
    user_ref.set({
        "user_id": user_id,  # Explicitly store user_id
        "username": username,
        "role": role,  # "basic", "dependent", "admin"
        "connected_users": {},  # Stores {connected_user_id: role}
        "created_at": firestore.SERVER_TIMESTAMP,
        "password": password
    })
    print(f"User {user_id} created.")

def add_medication(user_id, name, dosage, frequency, instructions, pillCount, times, days, pillShape, pillColorLeft, pillColorRight, pillColor, backgroundColor):
    """Adds a medication to a user's medications subcollection, calculating start and end dates."""
    
    # Calculate the number of days needed to take the medication
    days_needed = pillCount // frequency
    
    # Set the start date as today
    start_date = datetime.today().strftime('%Y-%m-%d')
    
    # Calculate the end date by adding the days needed to the start date
    end_date = (datetime.today() + timedelta(days=days_needed - 1)).strftime('%Y-%m-%d')  # Subtract 1 because the start day counts

    # Add the medication to Firestore
    meds_ref = db.collection(f"users/{user_id}/medications").document(name)
    meds_ref.set({
        "name": name,
        "dosage": dosage,
        "frequency": frequency,
        "instructions": instructions,
        "pill_count": pillCount,
        "times": times, # List of times (e.g., ["08:00", "20:00"])
        "days": days,   # List of days (e.g., ["Monday", "Tuesday"])
        "taken": False,  # Default status
        "pillShape": pillShape,
        "pillColorLeft": pillColorLeft,
        "pillColorRight": pillColorRight,
        "pillColor": pillColor,
        "backgroundColor": backgroundColor,
        "start_date": start_date,  # Add start date
        "end_date": end_date,  # Add end date
        "created_at": firestore.SERVER_TIMESTAMP,
        "updated_at": firestore.SERVER_TIMESTAMP
    })
    
    print(f"Medication {name} added for user {user_id} with start date {start_date} and end date {end_date}.")

def add_reminder(user_id, med_id, times, days):
    """Adds a reminder for a medication with specified times and days."""
    reminders_ref = db.collection(f"users/{user_id}/medications/{med_id}/reminders").document()
    reminders_ref.set({
        "user_id": user_id,
        "med_id": med_id,
        "times": times,  # List of times (e.g., ["08:00", "20:00"])
        "days": days,    # List of days (e.g., ["Monday", "Tuesday"])
        "status": "active",  # Default status
        "created_at": firestore.SERVER_TIMESTAMP
    })
    print(f"Reminder for medication {med_id} on days {days} at times {times} set.")


def connect_users(user_id, connected_user_id, role):
    """Adds a connection between users by updating the connected_users dictionary."""
    user_ref = db.collection("users").document(user_id)
    user_ref.update({
        f"connected_users.{connected_user_id}": role  # Adds or updates the role
    })
    print(f"User {user_id} connected to {connected_user_id} as {role}.")