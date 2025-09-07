"""
🔐 KRINS-Chronicle-Keeper Authentication Models
Enterprise-grade user management and role-based access control
"""

from datetime import datetime, timezone
from typing import List, Optional
from enum import Enum
import uuid
from sqlalchemy import (
    Column, String, DateTime, Boolean, Text, Integer, 
    ForeignKey, Table, UniqueConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from .base import Base

# Many-to-many association table for user roles
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id'), primary_key=True),
    Column('role_id', UUID(as_uuid=True), ForeignKey('roles.id'), primary_key=True),
    Column('assigned_at', DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)),
    Column('assigned_by', UUID(as_uuid=True), ForeignKey('users.id'))
)

# Many-to-many association table for role permissions
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', UUID(as_uuid=True), ForeignKey('roles.id'), primary_key=True),
    Column('permission_id', UUID(as_uuid=True), ForeignKey('permissions.id'), primary_key=True),
    Column('granted_at', DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
)

class UserStatus(str, Enum):
    """User account status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive" 
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"

class PermissionScope(str, Enum):
    """Permission scope for granular access control"""
    # ADR Permissions
    ADR_READ = "adr:read"
    ADR_WRITE = "adr:write" 
    ADR_DELETE = "adr:delete"
    ADR_APPROVE = "adr:approve"
    
    # Decision Management
    DECISION_READ = "decision:read"
    DECISION_WRITE = "decision:write"
    DECISION_DELETE = "decision:delete"
    
    # Pattern Management
    PATTERN_READ = "pattern:read"
    PATTERN_WRITE = "pattern:write"
    PATTERN_DELETE = "pattern:delete"
    
    # Runbook Management
    RUNBOOK_READ = "runbook:read"
    RUNBOOK_WRITE = "runbook:write"
    RUNBOOK_DELETE = "runbook:delete"
    
    # System Administration
    USER_READ = "user:read"
    USER_WRITE = "user:write"
    USER_DELETE = "user:delete"
    ROLE_MANAGE = "role:manage"
    SYSTEM_ADMIN = "system:admin"
    
    # Analytics & Reporting
    ANALYTICS_READ = "analytics:read"
    AUDIT_READ = "audit:read"
    
    # API Management
    API_KEY_CREATE = "api:create"
    API_KEY_MANAGE = "api:manage"

class User(Base):
    """Enterprise user model with full audit trail"""
    __tablename__ = "users"
    
    # Primary identifier
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Basic user information
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Authentication
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    email_verification_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Account status and security
    status: Mapped[UserStatus] = mapped_column(String(50), default=UserStatus.PENDING_VERIFICATION)
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Profile and preferences
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    job_title: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC")
    locale: Mapped[str] = mapped_column(String(10), default="en-US")
    
    # Audit trail
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_login_ip: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)  # IPv6 support
    
    # Relationships
    roles: Mapped[List["Role"]] = relationship("Role", secondary=user_roles, back_populates="users")
    created_api_keys: Mapped[List["ApiKey"]] = relationship("ApiKey", foreign_keys="ApiKey.created_by", back_populates="creator")
    audit_logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="user")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_users_email_status', 'email', 'status'),
        Index('idx_users_username_status', 'username', 'status'),
        Index('idx_users_created_at', 'created_at'),
    )

class Role(Base):
    """Role-based access control roles"""
    __tablename__ = "roles"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Role information
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Role configuration
    is_system_role: Mapped[bool] = mapped_column(Boolean, default=False)  # Cannot be deleted
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Audit trail
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Relationships
    users: Mapped[List[User]] = relationship(User, secondary=user_roles, back_populates="roles")
    permissions: Mapped[List["Permission"]] = relationship("Permission", secondary=role_permissions, back_populates="roles")

class Permission(Base):
    """Granular permissions for fine-grained access control"""
    __tablename__ = "permissions"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Permission information
    scope: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Permission configuration
    is_system_permission: Mapped[bool] = mapped_column(Boolean, default=False)
    resource_pattern: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # For resource-based permissions
    
    # Audit trail
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    roles: Mapped[List[Role]] = relationship(Role, secondary=role_permissions, back_populates="permissions")

class ApiKey(Base):
    """API keys for programmatic access"""
    __tablename__ = "api_keys"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # API key information
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    key_hash: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    key_prefix: Mapped[str] = mapped_column(String(10), nullable=False)  # First few chars for identification
    
    # Access control
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    usage_count: Mapped[int] = mapped_column(Integer, default=0)
    
    # Scoped permissions (JSON array of permission scopes)
    scopes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON array
    
    # Rate limiting
    rate_limit_per_hour: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    rate_limit_per_day: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    # Audit trail
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    revoked_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Relationships
    creator: Mapped[User] = relationship(User, foreign_keys=[created_by], back_populates="created_api_keys")
    
    # Constraints
    __table_args__ = (
        Index('idx_api_keys_active_expires', 'is_active', 'expires_at'),
        Index('idx_api_keys_created_by', 'created_by'),
    )

class AuditLog(Base):
    """Comprehensive audit logging for security and compliance"""
    __tablename__ = "audit_logs"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Event information
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    event_category: Mapped[str] = mapped_column(String(30), nullable=False, index=True)  # AUTH, ADR, DECISION, etc.
    event_description: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Context
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    api_key_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("api_keys.id"), nullable=True)
    resource_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    resource_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Request context
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    request_path: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    request_method: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    
    # Result
    success: Mapped[bool] = mapped_column(Boolean, nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Additional details (JSON)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Timestamp
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    
    # Relationships
    user: Mapped[Optional[User]] = relationship(User, back_populates="audit_logs")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_audit_logs_user_created', 'user_id', 'created_at'),
        Index('idx_audit_logs_event_created', 'event_type', 'created_at'),
        Index('idx_audit_logs_category_created', 'event_category', 'created_at'),
    )

class UserSession(Base):
    """User session management for JWT token tracking"""
    __tablename__ = "user_sessions"
    
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Session information
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    jti: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)  # JWT ID
    
    # Session context
    ip_address: Mapped[str] = mapped_column(String(45), nullable=False)
    user_agent: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Session lifecycle
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    last_activity_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    # Session status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    revoked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user: Mapped[User] = relationship(User)
    
    # Indexes
    __table_args__ = (
        Index('idx_sessions_user_active', 'user_id', 'is_active'),
        Index('idx_sessions_expires', 'expires_at'),
    )