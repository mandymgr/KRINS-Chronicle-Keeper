"""
🛡️ KRINS-Chronicle-Keeper Authentication Module
Enterprise-grade authentication and authorization system
"""

from .service import AuthService, AuthenticationError
from .models import (
    UserRegistration, UserLogin, ProfileUpdate, PasswordUpdate,
    UserProfile, LoginResponse, TokenRefreshRequest, TokenRefreshResponse,
    ApiKeyCreate, ApiKeyResponse, StandardResponse, ErrorResponse
)
from .jwt_manager import jwt_manager, api_key_manager, token_blacklist
from .rbac import (
    RBACService, UserPermissions, PermissionChecker, permission_cache,
    require_permission, require_any_permission, require_role, require_admin
)
from .middleware import (
    AuthenticationMiddleware, SecurityHeadersMiddleware, 
    RequestLoggingMiddleware, RateLimitingMiddleware,
    get_current_user, get_optional_user, configure_middleware
)
from .config import auth_settings, PermissionScope

__all__ = [
    # Core services
    'AuthService',
    'AuthenticationError',
    'RBACService',
    
    # Models
    'UserRegistration',
    'UserLogin',
    'ProfileUpdate', 
    'PasswordUpdate',
    'UserProfile',
    'LoginResponse',
    'TokenRefreshRequest',
    'TokenRefreshResponse',
    'ApiKeyCreate',
    'ApiKeyResponse',
    'StandardResponse',
    'ErrorResponse',
    
    # JWT and token management
    'jwt_manager',
    'api_key_manager',
    'token_blacklist',
    
    # RBAC
    'UserPermissions',
    'PermissionChecker',
    'permission_cache',
    'require_permission',
    'require_any_permission',
    'require_role',
    'require_admin',
    
    # Middleware
    'AuthenticationMiddleware',
    'SecurityHeadersMiddleware',
    'RequestLoggingMiddleware', 
    'RateLimitingMiddleware',
    'get_current_user',
    'get_optional_user',
    'configure_middleware',
    
    # Configuration
    'auth_settings',
    'PermissionScope',
]