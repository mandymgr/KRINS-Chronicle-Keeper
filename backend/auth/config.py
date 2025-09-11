"""
🔐 KRINS-Chronicle-Keeper Authentication Configuration
JWT settings, password policies, and security configuration
"""

from datetime import timedelta
from typing import List, Optional, Union
from enum import Enum
from pydantic_settings import BaseSettings
from pydantic import field_validator, ConfigDict
import secrets
import string

class PermissionScope(Enum):
    """Permission scopes for RBAC system"""
    # User management
    USER_READ = "user:read"
    USER_WRITE = "user:write" 
    USER_DELETE = "user:delete"
    
    # ADR management
    ADR_READ = "adr:read"
    ADR_WRITE = "adr:write"
    ADR_DELETE = "adr:delete"
    ADR_APPROVE = "adr:approve"
    
    # Decision management
    DECISION_READ = "decision:read"
    DECISION_WRITE = "decision:write"
    DECISION_DELETE = "decision:delete"
    
    # Pattern management
    PATTERN_READ = "pattern:read"
    PATTERN_WRITE = "pattern:write"
    PATTERN_DELETE = "pattern:delete"
    
    # System administration
    SYSTEM_ADMIN = "system:admin"
    ANALYTICS_READ = "analytics:read"

class AuthSettings(BaseSettings):
    """Authentication and security settings"""
    
    # JWT Configuration
    jwt_secret_key: str = secrets.token_urlsafe(32)
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7
    jwt_issuer: str = "krins-chronicle-keeper"
    jwt_audience: str = "krins-chronicle-api"
    
    # Password Policy
    password_min_length: int = 12
    password_require_uppercase: bool = True
    password_require_lowercase: bool = True
    password_require_numbers: bool = True
    password_require_special: bool = True
    password_special_chars: str = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    
    # Account Security
    max_failed_login_attempts: int = 5
    account_lockout_duration_minutes: int = 30
    email_verification_token_expire_hours: int = 24
    password_reset_token_expire_hours: int = 2
    
    # Session Management
    session_max_duration_days: int = 30
    session_cleanup_interval_hours: int = 6
    max_concurrent_sessions_per_user: int = 5
    
    # Rate Limiting
    login_rate_limit_per_minute: int = 5
    registration_rate_limit_per_hour: int = 3
    password_reset_rate_limit_per_hour: int = 2
    
    # API Key Management
    api_key_default_expire_days: int = 90
    api_key_prefix_length: int = 8
    api_key_total_length: int = 64
    
    # Two-Factor Authentication
    totp_enabled: bool = False
    totp_issuer_name: str = "KRINS Chronicle Keeper"
    
    # CORS Settings for Authentication
    cors_origins: Union[str, List[str]] = ["http://localhost:3000", "http://localhost:3001"]
    cors_credentials: bool = True
    
    # Cookie Settings
    cookie_secure: bool = True
    cookie_samesite: str = "lax"
    cookie_httponly: bool = True
    
    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra='ignore'  # Ignore extra fields from .env that don't match this model
    )
    
    @field_validator('jwt_secret_key')
    @classmethod
    def validate_jwt_secret(cls, v):
        if len(v) < 32:
            raise ValueError('JWT secret key must be at least 32 characters long')
        return v
    
    @field_validator('cors_origins', mode='before')
    @classmethod
    def validate_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v

class PasswordPolicy:
    """Password validation and generation utilities"""
    
    def __init__(self, settings: AuthSettings):
        self.settings = settings
    
    def validate_password(self, password: str) -> tuple[bool, List[str]]:
        """Validate password against policy rules"""
        errors = []
        
        if len(password) < self.settings.password_min_length:
            errors.append(f"Password must be at least {self.settings.password_min_length} characters long")
        
        if self.settings.password_require_uppercase and not any(c.isupper() for c in password):
            errors.append("Password must contain at least one uppercase letter")
        
        if self.settings.password_require_lowercase and not any(c.islower() for c in password):
            errors.append("Password must contain at least one lowercase letter")
        
        if self.settings.password_require_numbers and not any(c.isdigit() for c in password):
            errors.append("Password must contain at least one number")
        
        if self.settings.password_require_special and not any(c in self.settings.password_special_chars for c in password):
            errors.append(f"Password must contain at least one special character: {self.settings.password_special_chars}")
        
        return len(errors) == 0, errors
    
    def generate_secure_password(self, length: Optional[int] = None) -> str:
        """Generate a secure password meeting all policy requirements"""
        if length is None:
            length = max(self.settings.password_min_length, 16)
        
        # Ensure we have at least one character from each required category
        password_chars = []
        
        if self.settings.password_require_uppercase:
            password_chars.append(secrets.choice(string.ascii_uppercase))
        
        if self.settings.password_require_lowercase:
            password_chars.append(secrets.choice(string.ascii_lowercase))
        
        if self.settings.password_require_numbers:
            password_chars.append(secrets.choice(string.digits))
        
        if self.settings.password_require_special:
            password_chars.append(secrets.choice(self.settings.password_special_chars))
        
        # Fill the rest randomly
        all_chars = string.ascii_letters + string.digits
        if self.settings.password_require_special:
            all_chars += self.settings.password_special_chars
        
        for _ in range(length - len(password_chars)):
            password_chars.append(secrets.choice(all_chars))
        
        # Shuffle the password
        secrets.SystemRandom().shuffle(password_chars)
        
        return ''.join(password_chars)

class SecurityHeaders:
    """Security headers for HTTP responses"""
    
    @staticmethod
    def get_security_headers() -> dict[str, str]:
        """Get recommended security headers"""
        return {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Content-Security-Policy": (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self'; "
                "connect-src 'self'; "
                "frame-ancestors 'none';"
            ),
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": (
                "geolocation=(), "
                "microphone=(), "
                "camera=(), "
                "payment=(), "
                "usb=(), "
                "magnetometer=(), "
                "gyroscope=(), "
                "accelerometer=()"
            )
        }

# Default system roles and permissions
DEFAULT_ROLES = {
    "super_admin": {
        "display_name": "Super Administrator",
        "description": "Full system access with all permissions",
        "is_system_role": True,
        "permissions": [
            "system:admin", "user:read", "user:write", "user:delete", "role:manage",
            "adr:read", "adr:write", "adr:delete", "adr:approve",
            "decision:read", "decision:write", "decision:delete",
            "pattern:read", "pattern:write", "pattern:delete",
            "runbook:read", "runbook:write", "runbook:delete",
            "analytics:read", "audit:read", "api:create", "api:manage"
        ]
    },
    "admin": {
        "display_name": "Administrator", 
        "description": "Administrative access to most system functions",
        "is_system_role": True,
        "permissions": [
            "user:read", "user:write", "role:manage",
            "adr:read", "adr:write", "adr:delete", "adr:approve",
            "decision:read", "decision:write", "decision:delete",
            "pattern:read", "pattern:write", "pattern:delete",
            "runbook:read", "runbook:write", "runbook:delete",
            "analytics:read", "audit:read", "api:create"
        ]
    },
    "editor": {
        "display_name": "Editor",
        "description": "Can create and edit ADRs, decisions, patterns, and runbooks",
        "is_system_role": True,
        "permissions": [
            "adr:read", "adr:write", "decision:read", "decision:write",
            "pattern:read", "pattern:write", "runbook:read", "runbook:write",
            "analytics:read"
        ]
    },
    "reviewer": {
        "display_name": "Reviewer",
        "description": "Can review and approve ADRs and decisions",
        "is_system_role": True,
        "permissions": [
            "adr:read", "adr:approve", "decision:read", 
            "pattern:read", "runbook:read", "analytics:read"
        ]
    },
    "viewer": {
        "display_name": "Viewer",
        "description": "Read-only access to organizational knowledge",
        "is_system_role": True,
        "permissions": [
            "adr:read", "decision:read", "pattern:read", "runbook:read"
        ]
    }
}

# Default permissions with descriptions
DEFAULT_PERMISSIONS = {
    # System Administration
    "system:admin": ("System Administration", "Full system administration access"),
    "user:read": ("Read Users", "View user accounts and profiles"),
    "user:write": ("Write Users", "Create and modify user accounts"),
    "user:delete": ("Delete Users", "Remove user accounts"),
    "role:manage": ("Manage Roles", "Create, modify, and assign roles"),
    
    # ADR Management
    "adr:read": ("Read ADRs", "View architecture decision records"),
    "adr:write": ("Write ADRs", "Create and edit architecture decision records"),
    "adr:delete": ("Delete ADRs", "Remove architecture decision records"),
    "adr:approve": ("Approve ADRs", "Review and approve architecture decisions"),
    
    # Decision Management
    "decision:read": ("Read Decisions", "View organizational decisions"),
    "decision:write": ("Write Decisions", "Create and edit decisions"),
    "decision:delete": ("Delete Decisions", "Remove decisions"),
    
    # Pattern Management
    "pattern:read": ("Read Patterns", "View code and architecture patterns"),
    "pattern:write": ("Write Patterns", "Create and edit patterns"),
    "pattern:delete": ("Delete Patterns", "Remove patterns"),
    
    # Runbook Management
    "runbook:read": ("Read Runbooks", "View operational runbooks"),
    "runbook:write": ("Write Runbooks", "Create and edit runbooks"),
    "runbook:delete": ("Delete Runbooks", "Remove runbooks"),
    
    # Analytics & Reporting
    "analytics:read": ("Read Analytics", "View system analytics and reports"),
    "audit:read": ("Read Audit Logs", "View audit trails and security logs"),
    
    # API Management
    "api:create": ("Create API Keys", "Generate API keys for external access"),
    "api:manage": ("Manage API Keys", "Full API key lifecycle management")
}

# Global auth settings instance
auth_settings = AuthSettings()