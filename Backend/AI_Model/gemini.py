import google.generativeai as genai

# Centralized configuration
from Backend.config import GEMINI_API_KEY

# Configure Google Gemini AI
genai.configure(api_key=GEMINI_API_KEY)

def categorize_medicine_text(extracted_text: str) -> dict:
    """Uses Google Gemini AI to categorize medicine text into structured data."""
    
    prompt = f"""
Extract the following information from the text below:

1. Medicine Name
2. Dosage
3. Full Instructions (include dosage timing like 'twice daily' or 'every other day' as part of this field)
4. Pill Count
5. Frequency — a number representation of how often the medicine is taken per day:
   - Example: 'twice daily' = 2
   - Example: 'every other day' = 0.5

Do not remove or paraphrase timing information like 'twice daily' from the instructions — keep it there.

Text to extract from:
{extracted_text}

Return the output in this exact format:
- Medicine Name: [medicine_name]
- Dosage: [dosage]
- Instructions: [full instructions with timing]
- PillCount: [pill_count as a number]
- Frequency: [frequency as a number]
"""

    model = genai.GenerativeModel("gemini-1.5-pro")
    response = model.generate_content(prompt)

    print(f"Raw response from Gemini AI: {response.text}")

    try:
        response_text = response.text

        medicine_name = ""
        dosage = ""
        instructions = ""
        pill_count = ""
        frequency = ""

        if "Medicine Name:" in response_text:
            medicine_name = response_text.split("Medicine Name:")[1].split("\n")[0].strip()

        if "Dosage:" in response_text:
            dosage = response_text.split("Dosage:")[1].split("\n")[0].strip()

        if "Instructions:" in response_text:
            instructions = response_text.split("Instructions:")[1].split("\n")[0].strip()

        if "PillCount:" in response_text:
            pill_count = response_text.split("PillCount:")[1].split("\n")[0].strip()

        if "Frequency:" in response_text:
            frequency = response_text.split("Frequency:")[1].split("\n")[0].strip()
        
        return medicine_name, dosage, instructions, pill_count, frequency

    except Exception as e:
        print(f"Error extracting values: {e}")
        return None, None, None
