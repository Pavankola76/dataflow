"""Rate Limiting Middleware using Memory (Redis intended for Prod)."""
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import time
from typing import Dict, Tuple

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = 100, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, Tuple[int, float]] = {}

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for static assets or docs if needed
        if request.url.path.startswith("/docs") or request.url.path.startswith("/openapi.json"):
            return await call_next(request)
            
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Simple sliding window implementation in memory
        if client_ip in self.requests:
            count, window_start = self.requests[client_ip]
            if now - window_start > self.window_seconds:
                # Reset window
                self.requests[client_ip] = (1, now)
            else:
                if count >= self.max_requests:
                    return JSONResponse(
                        status_code=429,
                        content={"error": {"code": 429, "message": "Too Many Requests"}},
                        headers={"Retry-After": str(int(self.window_seconds - (now - window_start)))}
                    )
                self.requests[client_ip] = (count + 1, window_start)
        else:
            self.requests[client_ip] = (1, now)
            
        response = await call_next(request)
        return response
