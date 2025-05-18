import time
import sys
import os
from fastapi import FastAPI
from fastapi.testclient import TestClient

from Security.rate_limiter import rate_limiter, request_log  # Import the shared request_log

# Create a minimal FastAPI app for testing just the middleware
app = FastAPI()
app.middleware("http")(rate_limiter)

@app.get("/dummy")
def dummy_endpoint():
    return {"message": "OK"}

client = TestClient(app)

def test_rate_limiting_basic():
    request_log.clear()  # Ensure clean state before starting test

    allowed = 100
    for i in range(allowed + 10):
        response = client.get("/dummy")
        if i < allowed:
            assert response.status_code == 200, f"Unexpected fail at {i+1}"
        else:
            assert response.status_code == 429, f"Expected 429 at {i+1}"
