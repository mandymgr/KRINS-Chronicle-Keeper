"""
📋 KRINS-Chronicle-Keeper Authentication Models
Pydantic models for authentication API requests and responses
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator
import uuid

# Request Models
class UserRegistration(BaseModel):
    """User registration request"""
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, max_length=100, description="User password")
    full_name: Optional[str] = Field(None, max_length=100, description="Full name")
    
    @validator('username')
    def validate_username(cls, v):
        if not v.isalnum() and '_' not in v and '-' not in v:
            raise ValueError('Username can only contain letters, numbers, underscores, and hyphens')
        return v.lower()
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v

class UserLogin(BaseModel):
    """User login request"""
    username: str = Field(..., description="Username or email")
    password: str = Field(..., description="User password")
    remember_me: bool = Field(False, description="Extended session duration")

class PasswordReset(BaseModel):
    """Password reset request"""
    email: EmailStr = Field(..., description="User email address")

class PasswordUpdate(BaseModel):
    """Password update request"""
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, max_length=100, description="New password")
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one number')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v

class ProfileUpdate(BaseModel):
    """User profile update request"""
    full_name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = Field(None, max_length=500)

class RoleAssignment(BaseModel):
    """Role assignment request"""
    user_id: str = Field(..., description="User ID")
    role_name: str = Field(..., description="Role name")

class ApiKeyCreate(BaseModel):
    """API key creation request"""
    name: str = Field(..., min_length=1, max_length=100, description="API key name")
    description: Optional[str] = Field(None, max_length=500, description="API key description")
    expires_at: Optional[datetime] = Field(None, description="Expiration date (optional)")
    permissions: Optional[List[str]] = Field([], description="Specific permissions for this key")

# Response Models
class UserProfile(BaseModel):
    """User profile response"""
    id: str
    username: str
    email: str
    full_name: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    roles: List[str] = []
    
    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    """Login response with tokens"""
    success: bool
    message: str
    user: UserProfile
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int  # seconds

class TokenRefreshRequest(BaseModel):
    """Token refresh request"""
    refresh_token: str = Field(..., description="Refresh token")

class TokenRefreshResponse(BaseModel):
    """Token refresh response"""
    success: bool
    message: str
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int

class ApiKeyResponse(BaseModel):
    """API key response"""
    id: str
    name: str
    description: Optional[str]
    prefix: str  # First 8 characters for identification
    created_at: datetime
    expires_at: Optional[datetime]
    last_used_at: Optional[datetime]
    is_active: bool
    permissions: List[str] = []
    
    class Config:
        from_attributes = True

class ApiKeyCreateResponse(BaseModel):
    """API key creation response with full key"""
    success: bool
    message: str
    api_key: str  # Full key - only shown once
    key_info: ApiKeyResponse

class RoleInfo(BaseModel):
    """Role information"""
    name: str
    display_name: str
    description: Optional[str]
    permissions: List[str] = []
    is_system_role: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class PermissionInfo(BaseModel):
    """Permission information"""
    scope: str
    name: str
    description: Optional[str]
    is_system_permission: bool
    
    class Config:
        from_attributes = True

class UserListResponse(BaseModel):
    """Paginated user list response"""
    users: List[UserProfile]
    total: int
    page: int
    page_size: int
    total_pages: int

class AuditLogEntry(BaseModel):
    """Audit log entry"""
    id: str
    user_id: Optional[str]
    username: Optional[str]
    action: str
    resource_type: str
    resource_id: Optional[str]
    details: Dict[str, Any] = {}
    ip_address: Optional[str]
    user_agent: Optional[str]
    success: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class SessionInfo(BaseModel):
    """User session information"""
    id: str
    user_id: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime
    last_activity: datetime
    expires_at: datetime
    is_active: bool
    
    class Config:
        from_attributes = True

# Standard API Response Models
class StandardResponse(BaseModel):
    """Standard API response"""
    success: bool
    message: str
    data: Optional[Any] = None
    errors: Optional[List[str]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ErrorResponse(BaseModel):
    """Error response"""
    success: bool = False
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)