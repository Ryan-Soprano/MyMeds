import sys, os
os.environ["USE_DUMMY_DATA"] = "1"
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from jose import jwt
from Users.models import users_db, plaintext_passwords, pwd_context
from Backend.Security.token_manager import refresh_token_store, refresh_token_blacklist
from main import app

# Centralized config
from Backend.config import SECRET_KEY, JWT_ALGORITHM

client = TestClient(app)

# === 🔐 Dynamically Build Known Password Map ===
def build_username_password_map():
    known_passwords = [
        "password123",
        "admin123",
        "dependent123",
        "hunter2",
        "qwerty",
        "test123"
    ]
    result = {}
    for user in users_db.values():
        for pwd in known_passwords:
            if pwd_context.verify(pwd, user.password):
                result[user.username] = pwd
                break
    return result

username_password_map = build_username_password_map()

def get_password_for_user(user):
    return plaintext_passwords.get(user.username, "test123")

# === Test Cases: Login ===
def test_valid_login_returns_tokens():
    for user in users_db.values():
        password = get_password_for_user(user)

        response = client.post("/login/", json={
            "username": user.username,
            "password": password
        })

        assert response.status_code == 200, f"Login failed for {user.username}"
        tokens = response.json()
        assert "access_token" in tokens, f"No access token for {user.username}"
        assert "refresh_token" in tokens, f"No refresh token for {user.username}"

def test_login_failure_invalid_password():
    response = client.post("/login/", json={
        "username": "alice",
        "password": "wrongpass"
    })
    assert response.status_code == 401
    assert response.json().get("detail") == "Invalid credentials"

# === Test Cases: Logout ===
def test_expired_token_is_rejected():
    expired_payload = {
        "sub": "testuser",
        "role": "user",
        "exp": datetime.now(timezone.utc) - timedelta(seconds=1)
    }
    expired_token = jwt.encode(expired_payload, SECRET_KEY, algorithm=JWT_ALGORITHM)

    response = client.post("/logout/", headers={
        "Authorization": f"Bearer {expired_token}"
    }, json={})

    assert response.status_code == 401
    assert "Invalid token" in response.json()["detail"]

def test_blacklisted_token_is_rejected():
    # Use a real user to get a real token
    login = client.post("/login/", json={"username": "alice", "password": "password123"})
    assert login.status_code == 200

    token = login.json()["access_token"]

    # Log out to blacklist the token
    logout = client.post("/logout/", headers={"Authorization": f"Bearer {token}"})
    assert logout.status_code == 200

    # Attempt to reuse the blacklisted token
    reuse = client.post("/logout/", headers={"Authorization": f"Bearer {token}"})
    assert reuse.status_code == 401
    assert "Token has been blacklisted" in reuse.json()["detail"]

# === Test Cases: Refresh Token ===
def test_refresh_token_flow():
    refresh_token_store.clear()
    refresh_token_blacklist.clear()
    
    for user in users_db.values():
        password = get_password_for_user(user)

        login = client.post("/login/", json={
            "username": user.username,
            "password": password
        })
        assert login.status_code == 200, f"Login failed for {user.username}"

        refresh_token = login.json()["refresh_token"]
        refresh = client.post("/refresh-token/", json={
            "refresh_token": refresh_token
        })

        assert refresh.status_code == 200, f"Refresh failed for {user.username}"
        assert "access_token" in refresh.json(), f"No access token returned for {user.username}"

# === Test Cases: Logout ===
def test_logout_success():
    for user in users_db.values():
        password = get_password_for_user(user)

        login = client.post("/login/", json={
            "username": user.username,
            "password": password
        })
        assert login.status_code == 200, f"Login failed for {user.username}"

        access_token = login.json()["access_token"]
        logout = client.post("/logout/", headers={
            "Authorization": f"Bearer {access_token}"
        })

        assert logout.status_code == 200, f"Logout failed for {user.username}"

# === Test Refresh Token ===
def test_refresh_token_rotation():
    refresh_token_store.clear()
    refresh_token_blacklist.clear()

    # Step 1: Login to get initial access and refresh tokens
    login = client.post("/login/", json={
        "username": "alice",
        "password": "password123"
    })
    assert login.status_code == 200
    tokens = login.json()
    old_refresh_token = tokens["refresh_token"]

    # Step 2: Use the refresh token to get new tokens
    refresh = client.post("/refresh-token/", json={
        "refresh_token": old_refresh_token
    })
    assert refresh.status_code == 200
    refreshed_tokens = refresh.json()
    new_access_token = refreshed_tokens["access_token"]
    new_refresh_token = refreshed_tokens["refresh_token"]

    # Step 3: Make sure a new refresh token is issued
    assert new_refresh_token != old_refresh_token, "Refresh token was not rotated properly!"

    # Step 4: Attempt to reuse the old refresh token (should fail)
    reuse_attempt = client.post("/refresh-token/", json={
        "refresh_token": old_refresh_token
    })
    assert reuse_attempt.status_code == 401, "Old refresh token reuse should have been rejected!"
    assert reuse_attempt.json()["detail"] == "Token has been revoked"

