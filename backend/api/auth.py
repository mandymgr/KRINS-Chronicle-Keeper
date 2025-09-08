"""
🔐 KRINS-Chronicle-Keeper Authentication API Endpoints
Enterprise user management, login, registration, and profile management
"""

from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from pydantic import BaseModel, EmailStr, Field, validator
import ipaddress

from database.auth_models import User, Role, UserStatus, AuditLog, UserSession
from auth.jwt_manager import jwt_manager, token_blacklist
from auth.rbac import RBACService, UserPermissions, require_permission, require_admin
from auth.config import auth_settings, PasswordPolicy, PermissionScope
from database.connection import get_db_session

# Pydantic models for API requests/responses
class UserRegistration(BaseModel):
    """User registration request"""
    username: str = Field(..., min_length=3, max_length=50, pattern=r'^[a-zA-Z0-9_-]+$')
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=255)
    department: Optional[str] = Field(None, max_length=100)
    job_title: Optional[str] = Field(None, max_length=100)
    timezone: str = Field(default="UTC", max_length=50)
    locale: str = Field(default="en-US", max_length=10)

class UserLogin(BaseModel):
    """User login request"""
    username: str
    password: str
    remember_me: bool = False

class UserProfile(BaseModel):
    """User profile response"""
    id: str
    username: str
    email: str
    full_name: str
    department: Optional[str]
    job_title: Optional[str]
    avatar_url: Optional[str]
    timezone: str
    locale: str
    status: str
    is_email_verified: bool
    roles: List[str]
    permissions: List[str]
    last_login_at: Optional[datetime]
    created_at: datetime

class TokenResponse(BaseModel):
    """Authentication token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserProfile

class PasswordChange(BaseModel):
    """Password change request"""
    current_password: str
    new_password: str = Field(..., min_length=8)

class PasswordReset(BaseModel):
    """Password reset request"""
    email: EmailStr

class UserUpdate(BaseModel):
    """User profile update request"""
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    department: Optional[str] = Field(None, max_length=100)
    job_title: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = Field(None, max_length=500)
    timezone: Optional[str] = Field(None, max_length=50)
    locale: Optional[str] = Field(None, max_length=10)

class UserCreateAdmin(BaseModel):
    """Admin user creation request"""
    username: str = Field(..., min_length=3, max_length=50, pattern=r'^[a-zA-Z0-9_-]+$')
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=255)
    department: Optional[str] = Field(None, max_length=100)
    job_title: Optional[str] = Field(None, max_length=100)
    roles: List[str] = Field(default_factory=list)
    is_email_verified: bool = False
    status: UserStatus = UserStatus.ACTIVE

# Authentication service class
class AuthService:
    """Authentication business logic"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.rbac = RBACService(db)
        self.password_policy = PasswordPolicy(auth_settings)
    
    async def register_user(self, registration: UserRegistration, ip_address: str) -> User:
        """Register a new user"""
        
        # Validate password policy
        is_valid, errors = self.password_policy.validate_password(registration.password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "Password does not meet requirements", "errors": errors}
            )
        
        # Check if username or email already exists
        existing_query = select(User).where(
            or_(User.username == registration.username, User.email == registration.email)
        )
        existing_result = await self.db.execute(existing_query)
        existing_user = existing_result.scalar_one_or_none()
        
        if existing_user:
            if existing_user.username == registration.username:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username already exists"
                )
            else:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already registered"
                )
        
        # Create new user
        user = User(
            username=registration.username,
            email=registration.email,
            full_name=registration.full_name,
            hashed_password=jwt_manager.password_manager.hash_password(registration.password),
            department=registration.department,
            job_title=registration.job_title,
            timezone=registration.timezone,
            locale=registration.locale,
            status=UserStatus.PENDING_VERIFICATION
        )
        
        # Assign default viewer role
        viewer_role = await self._get_role_by_name("viewer")
        if viewer_role:
            user.roles = [viewer_role]
        
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        
        # Log registration
        await self._log_audit_event(
            "user_registered",
            "AUTH",
            f"New user registered: {user.username}",
            user_id=str(user.id),
            ip_address=ip_address,
            success=True
        )
        
        return user
    
    async def authenticate_user(self, username: str, password: str, ip_address: str) -> Optional[User]:
        """Authenticate user credentials"""
        
        # Get user by username or email
        user_query = select(User).where(
            or_(User.username == username, User.email == username),
            User.status != UserStatus.SUSPENDED
        )
        result = await self.db.execute(user_query)
        user = result.scalar_one_or_none()
        
        if not user:
            await self._log_audit_event(
                "login_failed",
                "AUTH",
                f"Login attempt with invalid username: {username}",
                ip_address=ip_address,
                success=False,
                error_message="Invalid credentials"
            )
            return None
        
        # Check if account is locked
        if user.locked_until and user.locked_until > datetime.now(timezone.utc):
            await self._log_audit_event(
                "login_blocked",
                "AUTH",
                f"Login blocked for locked account: {user.username}",
                user_id=str(user.id),
                ip_address=ip_address,
                success=False,
                error_message="Account locked"
            )
            return None
        
        # Verify password
        if not jwt_manager.password_manager.verify_password(password, user.hashed_password):
            # Increment failed attempts
            user.failed_login_attempts += 1
            
            # Lock account if too many failed attempts
            if user.failed_login_attempts >= auth_settings.max_failed_login_attempts:
                user.locked_until = datetime.now(timezone.utc) + timedelta(
                    minutes=auth_settings.account_lockout_duration_minutes
                )
            
            await self.db.commit()
            
            await self._log_audit_event(
                "login_failed",
                "AUTH",
                f"Failed login attempt for user: {user.username}",
                user_id=str(user.id),
                ip_address=ip_address,
                success=False,
                error_message="Invalid credentials"
            )
            return None
        
        # Reset failed attempts on successful login
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login_at = datetime.now(timezone.utc)
        user.last_login_ip = ip_address
        
        await self.db.commit()
        
        await self._log_audit_event(
            "login_success",
            "AUTH",
            f"Successful login for user: {user.username}",
            user_id=str(user.id),
            ip_address=ip_address,
            success=True
        )
        
        return user
    
    async def create_user_tokens(self, user: User, ip_address: str, user_agent: str = None) -> TokenResponse:
        """Create access and refresh tokens for user"""
        
        # Get user permissions
        user_permissions = await self.rbac.get_user_permissions(str(user.id))
        if not user_permissions:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to load user permissions"
            )
        
        # Create tokens
        access_token, token_payload = jwt_manager.create_access_token(
            user_id=str(user.id),
            username=user.username,
            email=user.email,
            roles=user_permissions.roles,
            permissions=list(user_permissions.permissions)
        )
        
        refresh_token, refresh_jti = jwt_manager.create_refresh_token(str(user.id))
        
        # Create session record
        session = UserSession(
            user_id=user.id,
            jti=token_payload.jti,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=token_payload.expires_at
        )
        
        self.db.add(session)
        await self.db.commit()
        
        # Build user profile
        profile = UserProfile(
            id=str(user.id),
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            department=user.department,
            job_title=user.job_title,
            avatar_url=user.avatar_url,
            timezone=user.timezone,
            locale=user.locale,
            status=user.status.value,
            is_email_verified=user.is_email_verified,
            roles=user_permissions.roles,
            permissions=list(user_permissions.permissions),
            last_login_at=user.last_login_at,
            created_at=user.created_at
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=auth_settings.jwt_access_token_expire_minutes * 60,
            user=profile
        )
    
    async def get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile with permissions"""
        user_query = select(User).where(User.id == uuid.UUID(user_id))
        result = await self.db.execute(user_query)
        user = result.scalar_one_or_none()
        
        if not user:
            return None
        
        user_permissions = await self.rbac.get_user_permissions(user_id)
        if not user_permissions:
            return None
        
        return UserProfile(
            id=str(user.id),
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            department=user.department,
            job_title=user.job_title,
            avatar_url=user.avatar_url,
            timezone=user.timezone,
            locale=user.locale,
            status=user.status.value,
            is_email_verified=user.is_email_verified,
            roles=user_permissions.roles,
            permissions=list(user_permissions.permissions),
            last_login_at=user.last_login_at,
            created_at=user.created_at
        )
    
    async def _get_role_by_name(self, role_name: str) -> Optional[Role]:
        """Get role by name"""
        role_query = select(Role).where(Role.name == role_name, Role.is_active == True)
        result = await self.db.execute(role_query)
        return result.scalar_one_or_none()
    
    async def _log_audit_event(
        self,
        event_type: str,
        category: str,
        description: str,
        user_id: Optional[str] = None,
        ip_address: Optional[str] = None,
        success: bool = True,
        error_message: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Log audit event"""
        log_entry = AuditLog(
            event_type=event_type,
            event_category=category,
            event_description=description,
            user_id=uuid.UUID(user_id) if user_id else None,
            ip_address=ip_address,
            success=success,
            error_message=error_message,
            metadata=str(metadata) if metadata else None
        )
        self.db.add(log_entry)
        # Note: Commit handled by caller

# FastAPI router
auth_router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])
security = HTTPBearer()

def get_client_ip(request: Request) -> str:
    """Extract client IP address from request"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.client.host

@auth_router.post("/register", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
async def register_user(
    registration: UserRegistration,
    request: Request,
    db: AsyncSession = Depends(get_db_session)
):
    """Register a new user account"""
    auth_service = AuthService(db)
    ip_address = get_client_ip(request)
    
    try:
        user = await auth_service.register_user(registration, ip_address)
        profile = await auth_service.get_user_profile(str(user.id))
        return profile
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@auth_router.post("/login", response_model=TokenResponse)
async def login_user(
    credentials: UserLogin,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db_session)
):
    """Authenticate user and return JWT tokens"""
    auth_service = AuthService(db)
    ip_address = get_client_ip(request)
    user_agent = request.headers.get("User-Agent", "Unknown")
    
    # Authenticate user
    user = await auth_service.authenticate_user(
        credentials.username,
        credentials.password,
        ip_address
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create tokens
    token_response = await auth_service.create_user_tokens(user, ip_address, user_agent)
    
    # Set secure HTTP-only cookie for refresh token if remember_me
    if credentials.remember_me:
        response.set_cookie(
            key="refresh_token",
            value=token_response.refresh_token,
            max_age=auth_settings.jwt_refresh_token_expire_days * 24 * 3600,
            httponly=auth_settings.cookie_httponly,
            secure=auth_settings.cookie_secure,
            samesite=auth_settings.cookie_samesite
        )
    
    return token_response

@auth_router.post("/logout")
async def logout_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db_session)
):
    """Logout user and blacklist token"""
    try:
        # Extract JTI from token
        jti = jwt_manager.get_token_jti(credentials.credentials)
        if jti:
            token_blacklist.blacklist_token(jti)
            
            # Deactivate session
            session_query = select(UserSession).where(UserSession.jti == jti)
            result = await db.execute(session_query)
            session = result.scalar_one_or_none()
            
            if session:
                session.is_active = False
                session.revoked_at = datetime.now(timezone.utc)
                await db.commit()
        
        return {"message": "Successfully logged out"}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Logout failed: {str(e)}"
        )

@auth_router.get("/profile", response_model=UserProfile)
async def get_current_user_profile(
    current_user: UserPermissions = Depends(require_permission(PermissionScope.USER_READ)),
    db: AsyncSession = Depends(get_db_session)
):
    """Get current user's profile"""
    auth_service = AuthService(db)
    profile = await auth_service.get_user_profile(current_user.user_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    return profile

@auth_router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    updates: UserUpdate,
    current_user: UserPermissions = Depends(require_permission(PermissionScope.USER_READ)),
    db: AsyncSession = Depends(get_db_session)
):
    """Update current user's profile"""
    user_query = select(User).where(User.id == uuid.UUID(current_user.user_id))
    result = await db.execute(user_query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update provided fields
    update_data = updates.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    user.updated_at = datetime.now(timezone.utc)
    await db.commit()
    
    # Return updated profile
    auth_service = AuthService(db)
    return await auth_service.get_user_profile(current_user.user_id)

@auth_router.post("/change-password")
async def change_password(
    password_change: PasswordChange,
    request: Request,
    current_user: UserPermissions = Depends(require_permission(PermissionScope.USER_READ)),
    db: AsyncSession = Depends(get_db_session)
):
    """Change user password"""
    auth_service = AuthService(db)
    ip_address = get_client_ip(request)
    
    # Get user
    user_query = select(User).where(User.id == uuid.UUID(current_user.user_id))
    result = await db.execute(user_query)
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify current password
    if not jwt_manager.password_manager.verify_password(
        password_change.current_password,
        user.hashed_password
    ):
        await auth_service._log_audit_event(
            "password_change_failed",
            "AUTH",
            f"Failed password change attempt - invalid current password",
            user_id=current_user.user_id,
            ip_address=ip_address,
            success=False,
            error_message="Invalid current password"
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid current password"
        )
    
    # Validate new password
    is_valid, errors = auth_service.password_policy.validate_password(password_change.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "New password does not meet requirements", "errors": errors}
        )
    
    # Update password
    user.hashed_password = jwt_manager.password_manager.hash_password(password_change.new_password)
    user.updated_at = datetime.now(timezone.utc)
    await db.commit()
    
    await auth_service._log_audit_event(
        "password_changed",
        "AUTH",
        f"Password successfully changed for user: {user.username}",
        user_id=current_user.user_id,
        ip_address=ip_address,
        success=True
    )
    
    return {"message": "Password successfully changed"}

# Admin endpoints
@auth_router.get("/users", response_model=List[UserProfile])
@require_admin()
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: UserPermissions = None,
    db: AsyncSession = Depends(get_db_session)
):
    """List all users (admin only)"""
    auth_service = AuthService(db)
    
    users_query = select(User).offset(skip).limit(limit)
    result = await db.execute(users_query)
    users = result.scalars().all()
    
    profiles = []
    for user in users:
        profile = await auth_service.get_user_profile(str(user.id))
        if profile:
            profiles.append(profile)
    
    return profiles

@auth_router.post("/users", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
@require_admin()
async def create_user_admin(
    user_data: UserCreateAdmin,
    current_user: UserPermissions = None,
    request: Request = None,
    db: AsyncSession = Depends(get_db_session)
):
    """Create user (admin only)"""
    auth_service = AuthService(db)
    ip_address = get_client_ip(request)
    
    # Validate password
    is_valid, errors = auth_service.password_policy.validate_password(user_data.password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Password does not meet requirements", "errors": errors}
        )
    
    # Check uniqueness
    existing_query = select(User).where(
        or_(User.username == user_data.username, User.email == user_data.email)
    )
    existing_result = await db.execute(existing_query)
    existing_user = existing_result.scalar_one_or_none()
    
    if existing_user:
        if existing_user.username == user_data.username:
            raise HTTPException(status.HTTP_409_CONFLICT, detail="Username already exists")
        else:
            raise HTTPException(status.HTTP_409_CONFLICT, detail="Email already registered")
    
    # Create user
    user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=jwt_manager.password_manager.hash_password(user_data.password),
        department=user_data.department,
        job_title=user_data.job_title,
        status=user_data.status,
        is_email_verified=user_data.is_email_verified
    )
    
    # Assign roles
    if user_data.roles:
        roles = []
        for role_name in user_data.roles:
            role = await auth_service._get_role_by_name(role_name)
            if role:
                roles.append(role)
        user.roles = roles
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    await auth_service._log_audit_event(
        "user_created_admin",
        "ADMIN",
        f"User created by admin: {user.username}",
        user_id=str(user.id),
        ip_address=ip_address,
        success=True,
        metadata={"created_by": current_user.user_id}
    )
    
    return await auth_service.get_user_profile(str(user.id))