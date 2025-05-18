import sys
import os
from fastapi.middleware.cors import CORSMiddleware


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from fastapi import FastAPI, File, UploadFile

# App config
from Backend.config import USE_DUMMY_DATA

# Middleware
from Security.rate_limiter import rate_limiter

# User routes and auth
from Users.routes import router as Users_router
from Users.auth import router as auth_router
from Users.update import router as update_router

# Medication routes
from Medication.routes import router as medication_router
from Medication.update import router as update_med_router

# Reminders
from Reminders.create import router as reminders_router
from Reminders.get import router as get_reminders_router

# AI & Vision
from AI_Model.vision import extract_text_from_image

# Logging / Security
from TestRoutes.security_log_tests import router as SecurityLogTestRouter

# Initialize FastAPI app
app = FastAPI()

# Register the rate limiting middleware
app.middleware("http")(rate_limiter)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with your frontend URL for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(Users_router)
app.include_router(auth_router)
app.include_router(update_router)
app.include_router(update_med_router)
app.include_router(medication_router)
app.include_router(reminders_router)
app.include_router(get_reminders_router)
app.include_router(SecurityLogTestRouter, prefix="/logs")

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Welcome to MyMeds API",
        "dummy_data": USE_DUMMY_DATA
    }

# Upload endpoint for Vision API
@app.post("/upload-image/")
async def upload_image(file: UploadFile = File(...)):
    image_content = await file.read()
    extracted_text = extract_text_from_image(image_content)
    return {extracted_text}

# Optional route to confirm rate limit isn't triggered
@app.get("/rate-limit-test")
def rate_limit_test():
    return {"message": "Request successful"}
