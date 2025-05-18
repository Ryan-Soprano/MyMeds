
# Tests Directory

This folder contains backend test files for the Med Reminder App. These tests are written using `pytest` and focus on validating core security and infrastructure components.

## How to Run the Tests

To run all tests in this directory, navigate to the project root and execute:

```
pytest Tests/
```

Make sure you have `pytest` installed. You can install it using:

```
pip install pytest
```

## Test Files Overview

### test_auth.py
Tests authentication functionality including JWT validation, token blacklisting, and expired token handling.

### test_logging.py
Verifies that the `log_security_event()` utility logs the correct structure and fields to Google Cloud Logging.

### test_rate_limiter.py
Tests the custom FastAPI rate limiting middleware. Ensures that clients are blocked appropriately when limits are exceeded.

## Notes

- These are unit and functional tests meant for backend components.
- Logging and simulated security events can also be triggered using manual test routes in `Backend/TestRoutes/security_log_tests.py`, which are useful for generating demo logs.
