from fastapi import APIRouter, HTTPException
from Security.security_logging import log_security_event

router = APIRouter()

# --- 1. AUTHORIZATION TEST ---
@router.get("/test/authz-denied")
def test_authz_denied():
    user = "test_user"
    log_security_event(user, "AUTHZ", "ACCESS_DENIED", "DENIED", details="Non-admin tried to access admin route")
    raise HTTPException(status_code=403, detail="Access denied")


# --- 2. API ACCESS TEST ---
@router.get("/test/api-access")
def test_api_access():
    user = "admin_user"
    log_security_event(user, "API_REQUEST", "GET_MED_LIST", "SUCCESS", details="Retrieved medication list")
    return {"message": "API access logged successfully"}


# --- 3. CONFIG CHANGE TEST ---
@router.post("/test/config-change")
def test_config_change():
    user = "admin_user"
    log_security_event(user, "CONFIG_CHANGE", "TOGGLE_REMINDER", "SUCCESS", details="Turned off daily reminders")
    return {"message": "Config change logged"}


# --- 4. FAILED TOKEN / INVALID AUTH ---
@router.get("/test/token-invalid")
def test_invalid_token():
    log_security_event("unknown", "AUTH", "INVALID_TOKEN", "FAILED", details="Missing or malformed JWT")
    raise HTTPException(status_code=401, detail="Unauthorized")


# --- 5. BRUTE FORCE SIMULATION ---
@router.post("/test/login-brute")
def test_brute_force_simulation():
    user = "brute_user"
    for i in range(5):
        log_security_event(user, "AUTH", "LOGIN_ATTEMPT", "FAILED", details=f"Failed attempt #{i+1}")
    return {"message": "Simulated brute-force attack logged"}
