"""
Rate Limiting Middleware for FastAPI
Implements tiered rate limiting based on user status and request patterns.
"""

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, Tuple, Optional
import asyncio
import hashlib

# ==================== CONFIGURATION ====================

RATE_LIMITS: Dict[str, Dict[str, int]] = {
    # Tier: {endpoint_pattern: requests_per_hour}
    "free": {
        "default": 100,
        "/api/data": 200,
        "/api/sponsor-transaction": 50,
    },
    "staking_user": {
        "default": 1000,
        "/api/data": 2000,
        "/api/sponsor-transaction": 500,
    },
    "admin": {
        "default": 10000,
        "/api/data": 20000,
        "/api/sponsor-transaction": 5000,
    },
}

# Window duration in seconds (1 hour = 3600)
WINDOW_DURATION = 3600

# Cleanup interval in seconds (clean old entries every 5 minutes)
CLEANUP_INTERVAL = 300


# ==================== RATE LIMITER CLASS ====================

class RateLimiter:
    """
    Token bucket rate limiter with sliding window.
    Tracks requests per IP address and applies tiered limits.
    """
    
    def __init__(self):
        # Structure: {ip_address: {endpoint: [(timestamp, count), ...]}}
        self._requests: Dict[str, Dict[str, list]] = defaultdict(lambda: defaultdict(list))
        self._last_cleanup = datetime.now()
        self._lock = asyncio.Lock()
    
    def _get_client_identifier(self, request: Request) -> str:
        """
        Get a unique identifier for the client.
        Uses X-Forwarded-For header if behind a proxy, otherwise client IP.
        """
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Take the first IP in the chain (original client)
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"
        
        # Hash the IP for privacy
        return hashlib.sha256(client_ip.encode()).hexdigest()[:16]
    
    def _get_user_tier(self, request: Request) -> str:
        """
        Determine user tier based on request headers or authentication.
        In production, this would integrate with your auth system.
        """
        # Check for admin API key
        api_key = request.headers.get("X-API-Key")
        if api_key and self._validate_admin_key(api_key):
            return "admin"
        
        # Check for authenticated staking user (wallet address in header)
        wallet_address = request.headers.get("X-Wallet-Address")
        if wallet_address and self._is_valid_wallet(wallet_address):
            return "staking_user"
        
        return "free"
    
    def _validate_admin_key(self, api_key: str) -> bool:
        """Validate admin API key. In production, use secure comparison."""
        # TODO: Implement proper API key validation
        return False
    
    def _is_valid_wallet(self, wallet_address: str) -> bool:
        """Check if wallet address is valid Ethereum format."""
        if not wallet_address:
            return False
        # Basic Ethereum address validation
        return wallet_address.startswith("0x") and len(wallet_address) == 42
    
    def _get_limit_for_endpoint(self, tier: str, path: str) -> int:
        """Get the rate limit for a specific tier and endpoint."""
        tier_limits = RATE_LIMITS.get(tier, RATE_LIMITS["free"])
        
        # Check for exact path match
        if path in tier_limits:
            return tier_limits[path]
        
        # Check for pattern matches
        for pattern, limit in tier_limits.items():
            if pattern != "default" and path.startswith(pattern):
                return limit
        
        return tier_limits.get("default", 100)
    
    async def _cleanup_old_entries(self):
        """Remove entries older than the window duration."""
        now = datetime.now()
        if (now - self._last_cleanup).total_seconds() < CLEANUP_INTERVAL:
            return
        
        async with self._lock:
            cutoff = now - timedelta(seconds=WINDOW_DURATION)
            
            for client_id in list(self._requests.keys()):
                for endpoint in list(self._requests[client_id].keys()):
                    # Filter out old entries
                    self._requests[client_id][endpoint] = [
                        (ts, count) for ts, count in self._requests[client_id][endpoint]
                        if ts > cutoff
                    ]
                    
                    # Remove empty endpoint entries
                    if not self._requests[client_id][endpoint]:
                        del self._requests[client_id][endpoint]
                
                # Remove empty client entries
                if not self._requests[client_id]:
                    del self._requests[client_id]
            
            self._last_cleanup = now
    
    async def check_rate_limit(self, request: Request) -> Tuple[bool, Dict]:
        """
        Check if the request is within rate limits.
        
        Returns:
            Tuple of (is_allowed, rate_limit_info)
        """
        await self._cleanup_old_entries()
        
        client_id = self._get_client_identifier(request)
        tier = self._get_user_tier(request)
        path = request.url.path
        limit = self._get_limit_for_endpoint(tier, path)
        
        now = datetime.now()
        window_start = now - timedelta(seconds=WINDOW_DURATION)
        
        async with self._lock:
            # Get current window requests
            requests = self._requests[client_id][path]
            
            # Count requests in current window
            current_count = sum(
                count for ts, count in requests 
                if ts > window_start
            )
            
            # Calculate remaining
            remaining = max(0, limit - current_count)
            reset_time = now + timedelta(seconds=WINDOW_DURATION)
            
            rate_info = {
                "limit": limit,
                "remaining": remaining,
                "reset": reset_time.isoformat(),
                "tier": tier,
            }
            
            if current_count >= limit:
                return False, rate_info
            
            # Record this request
            requests.append((now, 1))
            rate_info["remaining"] = remaining - 1
            
            return True, rate_info


# ==================== MIDDLEWARE ====================

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    FastAPI middleware for rate limiting.
    Applies tiered rate limits and adds rate limit headers to responses.
    """
    
    def __init__(self, app, rate_limiter: Optional[RateLimiter] = None):
        super().__init__(app)
        self.rate_limiter = rate_limiter or RateLimiter()
    
    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks
        if request.url.path in ["/health", "/", "/docs", "/openapi.json"]:
            return await call_next(request)
        
        # Check rate limit
        is_allowed, rate_info = await self.rate_limiter.check_rate_limit(request)
        
        if not is_allowed:
            raise HTTPException(
                status_code=429,
                detail={
                    "error": "Rate limit exceeded",
                    "message": f"You have exceeded the rate limit of {rate_info['limit']} requests per hour.",
                    "retry_after": rate_info["reset"],
                    "tier": rate_info["tier"],
                }
            )
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(rate_info["limit"])
        response.headers["X-RateLimit-Remaining"] = str(rate_info["remaining"])
        response.headers["X-RateLimit-Reset"] = rate_info["reset"]
        response.headers["X-RateLimit-Tier"] = rate_info["tier"]
        
        return response


# ==================== HELPER FUNCTIONS ====================

def create_rate_limiter() -> RateLimiter:
    """Factory function to create a rate limiter instance."""
    return RateLimiter()


def get_rate_limit_status(rate_limiter: RateLimiter, request: Request) -> Dict:
    """Get current rate limit status for a request without consuming a token."""
    client_id = rate_limiter._get_client_identifier(request)
    tier = rate_limiter._get_user_tier(request)
    path = request.url.path
    limit = rate_limiter._get_limit_for_endpoint(tier, path)
    
    now = datetime.now()
    window_start = now - timedelta(seconds=WINDOW_DURATION)
    
    requests = rate_limiter._requests[client_id][path]
    current_count = sum(
        count for ts, count in requests 
        if ts > window_start
    )
    
    return {
        "tier": tier,
        "limit": limit,
        "used": current_count,
        "remaining": max(0, limit - current_count),
        "reset_at": (now + timedelta(seconds=WINDOW_DURATION)).isoformat(),
    }
