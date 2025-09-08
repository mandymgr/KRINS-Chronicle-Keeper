"""
🛡️ KRINS-Chronicle-Keeper Authentication Middleware
FastAPI middleware for JWT authentication and security enforcement
"""

from typing import Optional, List, Callable, Dict, Any
from fastapi import FastAPI, Request, Response, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import time
import uuid
import logging
from datetime import datetime, timezone

from .jwt_manager import jwt_manager, token_blacklist
from .rbac import RBACService, UserPermissions, permission_cache
from database.connection import get_db_session
from database.auth_models import AuditLog

logger = logging.getLogger(__name__)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next: Callable):
        response = await call_next(request)
        
        # Add security headers
        response.headers.update({
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
            "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
        })
        
        return response

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log all HTTP requests for audit purposes"""
    
    async def dispatch(self, request: Request, call_next: Callable):
        start_time = time.time()
        
        # Extract client information
        client_ip = self._get_client_ip(request)
        user_agent = request.headers.get("user-agent", "")
        
        # Process request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Log request details
        logger.info(
            f"HTTP {request.method} {request.url.path} - "
            f"Status: {response.status_code} - "
            f"Time: {process_time:.3f}s - "
            f"IP: {client_ip} - "
            f"Agent: {user_agent[:100]}"
        )
        
        # Add processing time header
        response.headers["X-Process-Time"] = str(process_time)
        
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request"""
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"

class AuthenticationMiddleware(BaseHTTPMiddleware):
    """JWT authentication middleware with permission checking"""
    
    def __init__(self, app: FastAPI, excluded_paths: Optional[List[str]] = None):
        super().__init__(app)
        self.excluded_paths = excluded_paths or [
            "/",
            "/health",
            "/docs",
            "/openapi.json",
            "/auth/login",
            "/auth/register",
            "/auth/refresh"
        ]
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Skip authentication for excluded paths
        if self._is_path_excluded(request.url.path):
            return await call_next(request)
        
        # Extract token from request
        token = self._extract_token(request)
        
        if not token:
            return self._unauthorized_response("Missing authentication token")
        
        # Validate token and get user permissions
        user_permissions = await self._authenticate_user(token, request)
        
        if not user_permissions:
            return self._unauthorized_response("Invalid or expired token")
        
        # Add user permissions to request state
        request.state.current_user = user_permissions
        request.state.authenticated = True
        
        # Log authentication event
        await self._log_authentication_event(request, user_permissions)
        
        return await call_next(request)
    
    def _is_path_excluded(self, path: str) -> bool:
        """Check if path should skip authentication"""
        for excluded_path in self.excluded_paths:
            if path.startswith(excluded_path):
                return True
        return False
    
    def _extract_token(self, request: Request) -> Optional[str]:
        """Extract JWT token from request headers"""
        auth_header = request.headers.get("authorization")
        
        if not auth_header:
            return None
        
        if not auth_header.startswith("Bearer "):
            return None
        
        return auth_header.replace("Bearer ", "")
    
    async def _authenticate_user(self, token: str, request: Request) -> Optional[UserPermissions]:
        """Authenticate user and return permissions"""
        try:
            # Check if token is blacklisted
            token_jti = jwt_manager.get_token_jti(token)
            if token_jti and token_blacklist.is_token_blacklisted(token_jti):
                logger.warning(f"Blacklisted token used: {token_jti}")
                return None
            
            # Decode and validate token
            token_payload = jwt_manager.extract_token_payload(token)
            if not token_payload:
                return None
            
            # Check cache first
            cached_permissions = permission_cache.get(token_payload.user_id)
            if cached_permissions:
                return cached_permissions
            
            # Get fresh permissions from database
            async with get_db_session() as db:
                rbac_service = RBACService(db)
                user_permissions = await rbac_service.get_user_permissions(token_payload.user_id)
                
                if user_permissions:
                    permission_cache.set(user_permissions)
                    return user_permissions
            
            return None
        
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return None
    
    async def _log_authentication_event(self, request: Request, user_permissions: UserPermissions):
        """Log authentication event for audit purposes"""
        try:
            async with get_db_session() as db:
                audit_log = AuditLog(
                    user_id=uuid.UUID(user_permissions.user_id),
                    action="authentication",
                    resource_type="session",
                    resource_id=None,
                    details={
                        "method": request.method,
                        "path": request.url.path,
                        "ip_address": self._get_client_ip(request),
                        "user_agent": request.headers.get("user-agent", "")[:500]
                    },
                    ip_address=self._get_client_ip(request)
                )
                
                db.add(audit_log)
                await db.commit()
        
        except Exception as e:
            logger.error(f"Failed to log authentication event: {str(e)}")
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request"""
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    def _unauthorized_response(self, message: str) -> JSONResponse:
        """Return standardized unauthorized response"""
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "success": False,
                "error": "authentication_required",
                "message": message,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        )

class RateLimitingMiddleware(BaseHTTPMiddleware):
    """Simple rate limiting middleware"""
    
    def __init__(self, app: FastAPI, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.request_counts: Dict[str, List[float]] = {}
    
    async def dispatch(self, request: Request, call_next: Callable):
        client_ip = self._get_client_ip(request)
        current_time = time.time()
        
        # Clean old entries
        self._cleanup_old_requests(client_ip, current_time)
        
        # Check rate limit
        if self._is_rate_limited(client_ip, current_time):
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "success": False,
                    "error": "rate_limit_exceeded",
                    "message": f"Rate limit exceeded: {self.requests_per_minute} requests per minute",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
            )
        
        # Record request
        self._record_request(client_ip, current_time)
        
        return await call_next(request)
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request"""
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        return request.client.host if request.client else "unknown"
    
    def _cleanup_old_requests(self, client_ip: str, current_time: float):
        """Remove requests older than 1 minute"""
        if client_ip not in self.request_counts:
            self.request_counts[client_ip] = []
        
        cutoff_time = current_time - 60  # 1 minute ago
        self.request_counts[client_ip] = [
            req_time for req_time in self.request_counts[client_ip]
            if req_time > cutoff_time
        ]
    
    def _is_rate_limited(self, client_ip: str, current_time: float) -> bool:
        """Check if client has exceeded rate limit"""
        if client_ip not in self.request_counts:
            return False
        
        return len(self.request_counts[client_ip]) >= self.requests_per_minute
    
    def _record_request(self, client_ip: str, current_time: float):
        """Record new request for client"""
        if client_ip not in self.request_counts:
            self.request_counts[client_ip] = []
        
        self.request_counts[client_ip].append(current_time)

# FastAPI dependency for getting authenticated user
security_scheme = HTTPBearer()

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme)
) -> UserPermissions:
    """FastAPI dependency to get current authenticated user"""
    
    # Check if user was authenticated by middleware
    if hasattr(request.state, 'current_user') and request.state.current_user:
        return request.state.current_user
    
    # Fallback: authenticate directly
    token = credentials.credentials
    
    # Check blacklist
    token_jti = jwt_manager.get_token_jti(token)
    if token_jti and token_blacklist.is_token_blacklisted(token_jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked"
        )
    
    # Validate token
    token_payload = jwt_manager.extract_token_payload(token)
    if not token_payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Get user permissions
    async with get_db_session() as db:
        rbac_service = RBACService(db)
        user_permissions = await rbac_service.get_user_permissions(token_payload.user_id)
        
        if not user_permissions:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        return user_permissions

async def get_optional_user(request: Request) -> Optional[UserPermissions]:
    """FastAPI dependency to optionally get authenticated user"""
    
    if hasattr(request.state, 'current_user'):
        return request.state.current_user
    
    return None

def configure_middleware(app: FastAPI):
    """Configure all middleware for the FastAPI application"""
    
    # Add middleware in reverse order (last added = first executed)
    
    # Rate limiting (first check)
    app.add_middleware(RateLimitingMiddleware, requests_per_minute=60)
    
    # Security headers
    app.add_middleware(SecurityHeadersMiddleware)
    
    # Request logging
    app.add_middleware(RequestLoggingMiddleware)
    
    # Authentication (last, so user info is available in other middleware)
    app.add_middleware(
        AuthenticationMiddleware,
        excluded_paths=[
            "/",
            "/health",
            "/docs",
            "/openapi.json",
            "/redoc",
            "/auth/login",
            "/auth/register",
            "/auth/refresh",
            "/auth/forgot-password",
            "/auth/reset-password"
        ]
    )
    
    logger.info("All authentication middleware configured successfully")