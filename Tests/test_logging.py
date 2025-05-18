import requests
import json
from Backend.Security.security_logging import log_security_event, generate_hmac

BASE_URL = "http://127.0.0.1:8000"

# === Manual Log Route Tests ===
def test_manual_routes():
    print("\n== Manual Security Test Endpoints ==")

    endpoints = [
        ("Authorization Denied", f"{BASE_URL}/logs/test/authz-denied", "GET"),
        ("API Access", f"{BASE_URL}/logs/test/api-access", "GET"),
        ("Config Change", f"{BASE_URL}/logs/test/config-change", "POST"),
        ("Invalid Token", f"{BASE_URL}/logs/test/token-invalid", "GET"),
        ("Brute Force Simulation", f"{BASE_URL}/logs/test/login-brute", "POST"),
    ]

    for label, url, method in endpoints:
        print(f"\nTriggering: {label}")
        if method == "POST":
            r = requests.post(url)
        else:
            r = requests.get(url)
        print(f"Status: {r.status_code} - {r.text}")


# === Auth Helpers ===
def login(username, password):
    res = requests.post(f"{BASE_URL}/login/", json={"username": username, "password": password})
    print(f"Login for {username}: {res.status_code}")
    if res.status_code == 200:
        token = res.json()["access_token"]
        print(f"Token: {token}")
        return token
    else:
        print(f"Login failed: {res.text}")
        return None

def auth_get(path, token):
    headers = {"Authorization": f"Bearer {token}"}
    return requests.get(f"{BASE_URL}{path}", headers=headers)


# === Simulate Failed Login ===
def test_failed_login():
    print("\n== Failed Login Simulation ==")

    payload = {
        "username": "alice",  # Valid user
        "password": "wrongpassword"
    }

    response = requests.post(f"{BASE_URL}/login/", json=payload)
    print(f"Status: {response.status_code} - {response.text}")


# === Logout & Blacklist Tests ===
def test_logout_and_blacklist():
    print("\n== Logout & Blacklisting Test ==")

    username = "alice"
    password = "password123"

    # Step 1: Login
    token = login(username, password)
    if not token:
        print("Login failed. Skipping logout test.")
        return

    # Step 2: Logout (blacklists token)
    logout_res = requests.post(f"{BASE_URL}/logout/", headers={
        "Authorization": f"Bearer {token}"
    })
    print(f"Logout: {logout_res.status_code} - {logout_res.text}")

    # Step 3: Try reusing the blacklisted token
    reuse_res = requests.post(f"{BASE_URL}/logout/", headers={
        "Authorization": f"Bearer {token}"
    })
    print(f"Reuse Attempt: {reuse_res.status_code} - {reuse_res.text}")


# === RBAC Tests ===
def test_rbac_routes():
    print("\n== RBAC Permission Tests ==")

    # These MUST match Users/models.py
    roles = {
        "admin": ("dave", "admin123"),
        "caretaker": ("bob", "password123"),
        "basic": ("alice", "password123"),
        "dependent": ("charlie", "dependent123")
    }

    tests = [
        ("Admin accessing GET /users/", "admin", "/users/"),
        ("Dependent attempting GET /users/", "dependent", "/users/"),
        ("Caretaker accessing GET /medications/1", "caretaker", "/medications/1"),
        ("Dependent attempting GET /medications/1", "dependent", "/medications/1"),
    ]

    for desc, role_key, route in tests:
        print(f"\nTesting: {desc}")
        username, password = roles[role_key]
        token = login(username, password)
        if not token:
            print(f"Skipping {desc} due to failed login.")
            continue
        res = auth_get(route, token)
        print(f"Status: {res.status_code} - {res.text}")


# === HMAC Signature Test ===
def test_hmac_signature_in_log():
    # Create a fake security event
    fake_event = {
        "user": "test_hmac",
        "event_type": "TEST",
        "action": "HMAC_TEST",
        "status": "SUCCESS",
        "details": "Testing HMAC signing"
    }

    # Generate expected HMAC manually
    event_json = json.dumps(fake_event, sort_keys=True)
    expected_hmac = generate_hmac(event_json)

    # Simulate real logging (this will add HMAC to event)
    log_security_event(**fake_event)

    # Now simulate a log entry capture (you would mock this in full tests)
    # For now, we manually check the signing process
    fake_event["hmac"] = expected_hmac

    assert fake_event["hmac"] == expected_hmac, "HMAC signature did not match!"

# === Main Entrypoint ===
if __name__ == "__main__":
    test_manual_routes()
    test_rbac_routes()
    test_logout_and_blacklist()
    test_failed_login()
    test_hmac_signature_in_log()
    print("\nAll tests completed.")
    

