# These are all the installs you need to be able to run the backend code. Please go into the terminal and use these commands to do so before running

# Install FastAPI for building the API
pip install fastapi 

# Install Uvicorn to run the FastAPI application
pip install uvicorn  

# Install Pydantic for data validation and serialization (comes with FastAPI)
pip install pydantic  

# Install python-dotenv to manage environment variables
pip install python-dotenv  

# Install Google Cloud Vision for image text extraction
pip install google-cloud-vision  

# Install Passlib with bcrypt for password hashing
pip install passlib[bcrypt]  

   # If you get module not found errors with bcrypt, uninstall (pip uninstall bcrypt) and then reinstall (pip install bcrypt==4.0.1)

# Install python-jose for JWT authentication
pip install python-jose  

# Install Google Cloud Logging for authentication logging
pip install google-cloud-logging

# Install Gemini AI for AI parsing of text
pip install google-generativeai


# TO RUN THE APP LOOK HERE
# open the terminal and CD in to the Backend file then run this prompt in the terminal
uvicorn main:app --reload

# After you run this prompt you will find a HTTP/HTTPS link. Ctrl click the link and it will take you to the FastAPI UI for testing