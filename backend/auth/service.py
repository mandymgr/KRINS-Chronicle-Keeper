"""
🔐 KRINS-Chronicle-Keeper Authentication Service
Core authentication business logic and user management
"""

from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timezone, timedelta
import uuid
import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, or_
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from .models import UserRegistration, UserLogin, ProfileUpdate, PasswordUpdate
from .jwt_manager import jwt_manager, token_blacklist
from .rbac import RBACService, UserPermissions, permission_cache
from ..database.auth_models import User, AuditLog, UserSession, ApiKey
from .config import auth_settings

logger = logging.getLogger(__name__)

class AuthenticationError(Exception):
    """Authentication specific error"""
    pass

class AuthService:
    """Core authentication service"""
    
    def __init__(self, db_session: AsyncSession):
        self.db = db_session
        self.rbac_service = RBACService(db_session)
    
    async def register_user(
        self,
        registration: UserRegistration,
        ip_address: Optional[str] = None
    ) -> User:
        """Register a new user"""
        
        # Check if username exists
        username_query = select(User).where(User.username == registration.username)
        existing_username = await self.db.execute(username_query)
        if existing_username.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        
        # Check if email exists
        email_query = select(User).where(User.email == registration.email)
        existing_email = await self.db.execute(email_query)
        if existing_email.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = jwt_manager.password_manager.hash_password(registration.password)
        
        # Create user
        user = User(
            username=registration.username,
            email=registration.email,
            hashed_password=hashed_password,
            full_name=registration.full_name,
            is_active=True,
            is_verified=False,  # Email verification required
            created_at=datetime.now(timezone.utc)
        )
        
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        
        # Assign default role
        await self.rbac_service.assign_role_to_user(str(user.id), "viewer")
        
        # Log registration
        await self._log_audit_event(
            user_id=user.id,
            action="user_registration",
            resource_type="user",
            resource_id=str(user.id),
            details={"username": user.username, "email": user.email},
            ip_address=ip_address,
            success=True
        )
        
        logger.info(f"User registered: {user.username} ({user.email})")
        return user
    
    async def authenticate_user(
        self,
        login: UserLogin,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Tuple[User, UserPermissions]:
        """Authenticate user and return user with permissions"""
        
        # Find user by username or email
        user_query = select(User).where(
            or_(User.username == login.username, User.email == login.username)
        ).options(selectinload(User.roles))
        
        user_result = await self.db.execute(user_query)
        user = user_result.scalar_one_or_none()
        
        if not user:
            await self._log_audit_event(
                action="login_attempt",
                resource_type="authentication",
                details={"username": login.username, "reason": "user_not_found"},
                ip_address=ip_address,
                success=False
            )
            raise AuthenticationError("Invalid username or password")
        
        # Check if user is active
        if not user.is_active:
            await self._log_audit_event(
                user_id=user.id,
                action="login_attempt",
                resource_type="authentication",
                details={"username": user.username, "reason": "account_inactive"},
                ip_address=ip_address,
                success=False
            )
            raise AuthenticationError("Account is disabled")
        
        # Check account lockout
        if await self._is_account_locked(user.id):
            await self._log_audit_event(
                user_id=user.id,
                action="login_attempt",
                resource_type="authentication",
                details={"username": user.username, "reason": "account_locked"},
                ip_address=ip_address,
                success=False
            )
            raise AuthenticationError("Account is temporarily locked due to failed login attempts")
        
        # Verify password
        if not jwt_manager.password_manager.verify_password(login.password, user.hashed_password):
            # Increment failed attempts
            await self._increment_failed_attempts(user.id)
            
            await self._log_audit_event(
                user_id=user.id,
                action="login_attempt",
                resource_type="authentication",
                details={"username": user.username, "reason": "invalid_password"},
                ip_address=ip_address,
                success=False
            )
            raise AuthenticationError("Invalid username or password")
        
        # Reset failed attempts on successful login
        await self._reset_failed_attempts(user.id)
        
        # Update last login
        user.last_login = datetime.now(timezone.utc)
        await self.db.commit()
        
        # Get user permissions
        user_permissions = await self.rbac_service.get_user_permissions(str(user.id))
        if not user_permissions:
            raise AuthenticationError("Unable to load user permissions")
        
        # Create/update session
        await self._create_user_session(user.id, ip_address, user_agent, login.remember_me)
        
        # Log successful login
        await self._log_audit_event(
            user_id=user.id,
            action="successful_login",
            resource_type="authentication",
            details={"username": user.username},
            ip_address=ip_address,
            success=True
        )
        
        logger.info(f"User authenticated: {user.username}")
        return user, user_permissions
    
    async def refresh_token(self, refresh_token: str) -> Tuple[str, str]:
        """Refresh access token using refresh token"""
        
        try:
            # Decode refresh token
            payload = jwt_manager.decode_token(refresh_token)
            
            if payload.get("token_type") != "refresh":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
            
            user_id = payload.get("sub")
            jti = payload.get("jti")
            
            # Check if token is blacklisted
            if token_blacklist.is_token_blacklisted(jti):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has been revoked"
                )
            
            # Get user with permissions
            user_permissions = await self.rbac_service.get_user_permissions(user_id)
            if not user_permissions:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found or inactive"
                )
            
            # Create new tokens
            new_access_token, _ = jwt_manager.create_access_token(
                user_id=user_permissions.user_id,
                username=user_permissions.username,
                email="",  # We'll need to get this from the user
                roles=user_permissions.roles,
                permissions=list(user_permissions.permissions)
            )
            
            new_refresh_token, new_jti = jwt_manager.create_refresh_token(user_id)
            
            # Blacklist old refresh token
            token_blacklist.blacklist_token(jti)
            
            return new_access_token, new_refresh_token
            
        except Exception as e:
            logger.error(f"Token refresh failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token refresh failed"
            )
    
    async def logout_user(self, user_id: str, token_jti: str):
        """Logout user and blacklist token"""
        
        # Blacklist token
        token_blacklist.blacklist_token(token_jti)
        
        # Invalidate user sessions
        await self._deactivate_user_sessions(uuid.UUID(user_id))
        
        # Clear permission cache
        permission_cache.invalidate(user_id)
        
        # Log logout
        await self._log_audit_event(
            user_id=uuid.UUID(user_id),
            action="user_logout",
            resource_type="authentication",
            success=True
        )
        
        logger.info(f"User logged out: {user_id}")
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        query = select(User).where(User.id == uuid.UUID(user_id))
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        query = select(User).where(User.username == username)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        query = select(User).where(User.email == email)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def update_user_profile(
        self,
        user_id: str,
        profile_update: ProfileUpdate
    ) -> User:
        """Update user profile"""
        
        user = await self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Update fields
        update_data = profile_update.dict(exclude_unset=True)
        if update_data:
            for field, value in update_data.items():
                setattr(user, field, value)
            
            user.updated_at = datetime.now(timezone.utc)
            await self.db.commit()
            await self.db.refresh(user)
        
        # Log profile update
        await self._log_audit_event(
            user_id=user.id,
            action="profile_update",
            resource_type="user",
            resource_id=str(user.id),
            details=update_data,
            success=True
        )
        
        return user
    
    async def change_password(
        self,
        user_id: str,
        password_update: PasswordUpdate
    ) -> bool:
        """Change user password"""
        
        user = await self.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Verify current password
        if not jwt_manager.password_manager.verify_password(
            password_update.current_password,
            user.hashed_password
        ):
            await self._log_audit_event(
                user_id=user.id,
                action="password_change_attempt",
                resource_type="user",
                resource_id=str(user.id),
                details={"reason": "invalid_current_password"},
                success=False
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Hash new password
        new_hashed_password = jwt_manager.password_manager.hash_password(
            password_update.new_password
        )
        
        # Update password
        user.hashed_password = new_hashed_password
        user.password_changed_at = datetime.now(timezone.utc)
        user.updated_at = datetime.now(timezone.utc)
        
        await self.db.commit()
        
        # Log password change
        await self._log_audit_event(
            user_id=user.id,
            action="password_changed",
            resource_type="user",
            resource_id=str(user.id),
            success=True
        )
        
        logger.info(f"Password changed for user: {user.username}")
        return True
    
    async def list_users(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None
    ) -> Tuple[List[User], int]:
        """List users with pagination"""
        
        query = select(User).options(selectinload(User.roles))
        
        if search:
            search_filter = or_(
                User.username.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
                User.full_name.ilike(f"%{search}%")
            )
            query = query.where(search_filter)
        
        # Get total count
        count_query = select(User.id)
        if search:
            count_query = count_query.where(search_filter)
        
        count_result = await self.db.execute(count_query)
        total = len(count_result.fetchall())
        
        # Get paginated results
        query = query.offset(skip).limit(limit).order_by(User.created_at.desc())
        result = await self.db.execute(query)
        users = result.scalars().all()
        
        return list(users), total
    
    # Private helper methods
    
    async def _is_account_locked(self, user_id: uuid.UUID) -> bool:
        """Check if account is locked due to failed attempts"""
        now = datetime.now(timezone.utc)
        lockout_window = now - timedelta(minutes=auth_settings.account_lockout_duration_minutes)
        
        # Count recent failed attempts
        query = select(AuditLog).where(
            and_(
                AuditLog.user_id == user_id,
                AuditLog.action == "login_attempt",
                AuditLog.success == False,
                AuditLog.created_at >= lockout_window
            )
        )
        
        result = await self.db.execute(query)
        failed_attempts = len(result.fetchall())
        
        return failed_attempts >= auth_settings.max_failed_login_attempts
    
    async def _increment_failed_attempts(self, user_id: uuid.UUID):
        """Track failed login attempt"""
        # This is handled by the audit log in authenticate_user
        pass
    
    async def _reset_failed_attempts(self, user_id: uuid.UUID):
        """Reset failed attempts counter (handled by successful login)"""
        pass
    
    async def _create_user_session(
        self,
        user_id: uuid.UUID,
        ip_address: Optional[str],
        user_agent: Optional[str],
        remember_me: bool = False
    ):
        """Create or update user session"""
        
        # Deactivate existing sessions for this user/IP combination
        await self._deactivate_user_sessions(user_id, ip_address)
        
        # Calculate expiration
        if remember_me:
            expires_at = datetime.now(timezone.utc) + timedelta(days=30)
        else:
            expires_at = datetime.now(timezone.utc) + timedelta(hours=8)
        
        # Create new session
        session = UserSession(
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent[:500] if user_agent else None,
            expires_at=expires_at
        )
        
        self.db.add(session)
        await self.db.commit()
    
    async def _deactivate_user_sessions(
        self,
        user_id: uuid.UUID,
        ip_address: Optional[str] = None
    ):
        """Deactivate user sessions"""
        
        query = update(UserSession).where(UserSession.user_id == user_id)
        
        if ip_address:
            query = query.where(UserSession.ip_address == ip_address)
        
        query = query.values(is_active=False)
        
        await self.db.execute(query)
        await self.db.commit()
    
    async def _log_audit_event(
        self,
        action: str,
        resource_type: str,
        user_id: Optional[uuid.UUID] = None,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        success: bool = True
    ):
        """Log audit event"""
        
        audit_log = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent[:500] if user_agent else None,
            success=success
        )
        
        self.db.add(audit_log)
        await self.db.commit()