import firebase_admin
from firebase_admin import credentials, firestore

# Centralized configuration
from Backend.config import SDK_KEY

# Initialize Firebase using centralized SDK key path
cred = credentials.Certificate(SDK_KEY)

# Only initialize the app if it hasn’t been done yet
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

# Firestore client
db = firestore.client()
