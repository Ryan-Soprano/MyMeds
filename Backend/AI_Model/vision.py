import os
from google.cloud import vision
from .gemini import categorize_medicine_text

# Config
from Backend.config import SDK_KEY

# Google Vision setup
if not SDK_KEY or not os.path.exists(SDK_KEY):
    raise FileNotFoundError(f"Google Cloud service account file not found: {SDK_KEY}")

vision_client = vision.ImageAnnotatorClient.from_service_account_json(SDK_KEY)

def extract_text_from_image(image_content: bytes) -> dict:
    """Extracts text using Google Vision and categorizes it using Gemini AI."""
    image = vision.Image(content=image_content)

    # Perform OCR
    response = vision_client.text_detection(image=image)

    if response.error.message:
        raise Exception(f"Error from Vision API: {response.error.message}")

    texts = response.text_annotations

    if not texts:
        return {"medicine_name": None, "dosage": None, "instructions": None}

    extracted_text = texts[0].description
    return categorize_medicine_text(extracted_text)
