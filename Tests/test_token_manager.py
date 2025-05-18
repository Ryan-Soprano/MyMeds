import pytest
from datetime import timedelta
from jose import jwt, JWTError
from Security import token_manager

# Sample user data
sample_data = {"sub": "testuser", "role": "admin"}

def test_create_and_decode_access_token():
    token = token_manager.create_access_token(sample_data)
    decoded = token_manager.decode_token(token)
    assert decoded["sub"] == "testuser"
    assert decoded["role"] == "admin"

def test_create_and_decode_refresh_token():
    token = token_manager.create_refresh_token(sample_data)
    decoded = token_manager.decode_token(token)
    assert decoded["sub"] == "testuser"
    assert decoded["role"] == "admin"

def test_refresh_token_storage():
    token = token_manager.create_refresh_token(sample_data)
    token_manager.store_refresh_token("testuser", token)
    stored = token_manager.get_stored_refresh_token("testuser")
    assert stored == token

def test_token_blacklisting():
    token = token_manager.create_refresh_token(sample_data)
    token_manager.blacklist_refresh_token(token)
    assert token_manager.is_token_blacklisted(token, is_refresh=True)

def test_invalid_token_raises():
    with pytest.raises(JWTError):
        token_manager.decode_token("this.is.not.valid")
