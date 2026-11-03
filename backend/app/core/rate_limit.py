import time
from collections import defaultdict
from fastapi import Request, HTTPException, status

class InMemoryRateLimiter:
    def __init__(self, requests_per_minute: int = 40):
        self.requests_per_minute = requests_per_minute
        self.clients = defaultdict(list)

    def check_rate_limit(self, request: Request, identifier: str = None):
        client_ip = identifier or request.client.host if request.client else "unknown"
        now = time.time()
        minute_ago = now - 60
        
        # Clean expired timestamps
        self.clients[client_ip] = [t for t in self.clients[client_ip] if t > minute_ago]
        
        if len(self.clients[client_ip]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Trop de requtes. Veuillez patienter un instant avant de poser une nouvelle question."
            )
        
        self.clients[client_ip].append(now)

rate_limiter = InMemoryRateLimiter(requests_per_minute=40)

