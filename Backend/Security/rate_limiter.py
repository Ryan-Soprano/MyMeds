import time
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from Security.security_logging import log_security_event # Import the logging function

# Settings
RATE_LIMIT = 100          # Max requests
WINDOW_SIZE = 15 * 60     # Time window in seconds (15 minutes)

# In-memory request tracking
request_log = {}

def get_request_identifier(request: Request):
    # Use token if provided, else fallback to client IP
    token = request.headers.get("Authorization")
    if token and token.startswith("Bearer "):
        return token.split(" ")[1]
    return request.client.host

async def rate_limiter(request: Request, call_next):
    identifier = get_request_identifier(request)
    now = time.time()

    if identifier not in request_log:
        request_log[identifier] = []

    # Filter timestamps within the current window
    request_log[identifier] = [ts for ts in request_log[identifier] if now - ts < WINDOW_SIZE]

    if len(request_log[identifier]) >= RATE_LIMIT:
        log_security_event(
            user=identifier,
            event_type="RATE_LIMIT",
            action="API_REQUEST_BLOCKED",
            status="DENIED",
            details=f"Exceeded {RATE_LIMIT} requests in {WINDOW_SIZE // 60} minutes"
        )
        return JSONResponse(
            status_code=429,
            content={"detail": "Rate limit exceeded. Please wait before sending more requests."}
        )

    request_log[identifier].append(now)
    response = await call_next(request)
    return response
