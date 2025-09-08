"""
🛡️ KRINS-Chronicle-Keeper Role-Based Access Control (RBAC)
Advanced permission checking and role management system
"""

from typing import List, Set, Optional, Dict, Any, Union
from enum import Enum
from dataclasses import dataclass
from functools import wraps
import uuid
import asyncio
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException, status, Depends

from .config import PermissionScope, DEFAULT_ROLES, DEFAULT_PERMISSIONS
from database.auth_models import User, Role, Permission, user_roles, role_permissions

@dataclass
class UserPermissions:
    """User's computed permissions from all roles"""
    user_id: str
    username: str
    roles: List[str]
    permissions: Set[str]
    is_admin: bool
    is_super_admin: bool
    computed_at: datetime

class PermissionChecker:
    """Core permission checking logic"""
    
    def __init__(self, user_permissions: UserPermissions):
        self.user_permissions = user_permissions
    
    def has_permission(self, required_permission: Union[str, PermissionScope]) -> bool:
        """Check if user has a specific permission"""
        perm_str = required_permission.value if isinstance(required_permission, PermissionScope) else required_permission
        return perm_str in self.user_permissions.permissions
    
    def has_any_permission(self, required_permissions: List[Union[str, PermissionScope]]) -> bool:
        """Check if user has any of the specified permissions"""
        perm_strings = [
            perm.value if isinstance(perm, PermissionScope) else perm 
            for perm in required_permissions
        ]
        return any(perm in self.user_permissions.permissions for perm in perm_strings)
    
    def has_all_permissions(self, required_permissions: List[Union[str, PermissionScope]]) -> bool:
        """Check if user has all specified permissions"""
        perm_strings = [
            perm.value if isinstance(perm, PermissionScope) else perm 
            for perm in required_permissions
        ]
        return all(perm in self.user_permissions.permissions for perm in perm_strings)
    
    def has_role(self, role_name: str) -> bool:
        """Check if user has a specific role"""
        return role_name in self.user_permissions.roles
    
    def has_any_role(self, role_names: List[str]) -> bool:
        """Check if user has any of the specified roles"""
        return any(role in self.user_permissions.roles for role in role_names)
    
    def can_access_resource(self, resource_type: str, action: str) -> bool:
        """Check if user can perform an action on a resource type"""
        permission = f"{resource_type}:{action}"
        return self.has_permission(permission)
    
    def can_manage_users(self) -> bool:
        """Check if user can manage other users"""
        return self.has_any_permission([
            PermissionScope.USER_WRITE,
            PermissionScope.USER_DELETE,
            PermissionScope.SYSTEM_ADMIN
        ])
    
    def can_approve_adrs(self) -> bool:
        """Check if user can approve ADRs"""
        return self.has_permission(PermissionScope.ADR_APPROVE)
    
    def is_system_admin(self) -> bool:
        """Check if user is a system administrator"""
        return self.user_permissions.is_super_admin or self.has_permission(PermissionScope.SYSTEM_ADMIN)

class RBACService:
    """Role-Based Access Control service"""
    
    def __init__(self, db_session: Session):
        self.db = db_session
    
    async def get_user_permissions(self, user_id: str) -> Optional[UserPermissions]:
        """Get computed permissions for a user"""
        # Get user with roles
        user_query = select(User).where(User.id == uuid.UUID(user_id))
        user_result = await self.db.execute(user_query)
        user = user_result.scalar_one_or_none()
        
        if not user:
            return None
        
        # Get all permissions from user's roles
        permissions = set()
        role_names = []
        
        for role in user.roles:
            if role.is_active:
                role_names.append(role.name)
                for permission in role.permissions:
                    permissions.add(permission.scope)
        
        # Check admin status
        is_admin = 'admin' in role_names
        is_super_admin = 'super_admin' in role_names
        
        return UserPermissions(
            user_id=str(user.id),
            username=user.username,
            roles=role_names,
            permissions=permissions,
            is_admin=is_admin,
            is_super_admin=is_super_admin,
            computed_at=datetime.now(timezone.utc)
        )
    
    async def create_role(
        self,
        name: str,
        display_name: str,
        description: Optional[str] = None,
        permissions: Optional[List[str]] = None,
        created_by: Optional[str] = None
    ) -> Role:
        """Create a new role with permissions"""
        
        # Check if role already exists
        existing_query = select(Role).where(Role.name == name)
        existing_result = await self.db.execute(existing_query)
        existing_role = existing_result.scalar_one_or_none()
        
        if existing_role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Role '{name}' already exists"
            )
        
        # Create role
        role = Role(
            name=name,
            display_name=display_name,
            description=description,
            created_by=uuid.UUID(created_by) if created_by else None
        )
        
        # Add permissions if provided
        if permissions:
            permission_objects = []
            for perm_scope in permissions:
                perm_query = select(Permission).where(Permission.scope == perm_scope)
                perm_result = await self.db.execute(perm_query)
                perm = perm_result.scalar_one_or_none()
                
                if perm:
                    permission_objects.append(perm)
            
            role.permissions = permission_objects
        
        self.db.add(role)
        await self.db.commit()
        await self.db.refresh(role)
        
        return role
    
    async def assign_role_to_user(
        self,
        user_id: str,
        role_name: str,
        assigned_by: Optional[str] = None
    ) -> bool:
        """Assign a role to a user"""
        
        # Get user and role
        user_query = select(User).where(User.id == uuid.UUID(user_id))
        role_query = select(Role).where(Role.name == role_name, Role.is_active == True)
        
        user_result = await self.db.execute(user_query)
        role_result = await self.db.execute(role_query)
        
        user = user_result.scalar_one_or_none()
        role = role_result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Role '{role_name}' not found or inactive"
            )
        
        # Check if user already has this role
        if role in user.roles:
            return False
        
        # Assign role
        user.roles.append(role)
        await self.db.commit()
        
        return True
    
    async def remove_role_from_user(self, user_id: str, role_name: str) -> bool:
        """Remove a role from a user"""
        
        user_query = select(User).where(User.id == uuid.UUID(user_id))
        user_result = await self.db.execute(user_query)
        user = user_result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Find and remove the role
        for role in user.roles[:]:  # Create a copy to iterate
            if role.name == role_name:
                user.roles.remove(role)
                await self.db.commit()
                return True
        
        return False
    
    async def initialize_default_roles_and_permissions(self):
        """Initialize system with default roles and permissions"""
        
        # Create default permissions
        for scope, (name, description) in DEFAULT_PERMISSIONS.items():
            existing_query = select(Permission).where(Permission.scope == scope)
            existing_result = await self.db.execute(existing_query)
            existing_perm = existing_result.scalar_one_or_none()
            
            if not existing_perm:
                permission = Permission(
                    scope=scope,
                    name=name,
                    description=description,
                    is_system_permission=True
                )
                self.db.add(permission)
        
        await self.db.commit()
        
        # Create default roles
        for role_name, role_config in DEFAULT_ROLES.items():
            existing_query = select(Role).where(Role.name == role_name)
            existing_result = await self.db.execute(existing_query)
            existing_role = existing_result.scalar_one_or_none()
            
            if not existing_role:
                role = Role(
                    name=role_name,
                    display_name=role_config["display_name"],
                    description=role_config["description"],
                    is_system_role=role_config["is_system_role"]
                )
                
                # Add permissions to role
                permissions = []
                for perm_scope in role_config["permissions"]:
                    perm_query = select(Permission).where(Permission.scope == perm_scope)
                    perm_result = await self.db.execute(perm_query)
                    perm = perm_result.scalar_one_or_none()
                    if perm:
                        permissions.append(perm)
                
                role.permissions = permissions
                self.db.add(role)
        
        await self.db.commit()

class PermissionCache:
    """In-memory cache for user permissions to improve performance"""
    
    def __init__(self, ttl_seconds: int = 300):  # 5 minute default TTL
        self.cache: Dict[str, UserPermissions] = {}
        self.ttl_seconds = ttl_seconds
    
    def get(self, user_id: str) -> Optional[UserPermissions]:
        """Get cached permissions for user"""
        user_perms = self.cache.get(user_id)
        
        if user_perms:
            # Check if cache entry is still valid
            age = (datetime.now(timezone.utc) - user_perms.computed_at).total_seconds()
            if age < self.ttl_seconds:
                return user_perms
            else:
                # Remove expired entry
                del self.cache[user_id]
        
        return None
    
    def set(self, user_permissions: UserPermissions):
        """Cache user permissions"""
        self.cache[user_permissions.user_id] = user_permissions
    
    def invalidate(self, user_id: str):
        """Remove user permissions from cache"""
        self.cache.pop(user_id, None)
    
    def clear(self):
        """Clear all cached permissions"""
        self.cache.clear()

# Decorators for FastAPI endpoints
def require_permission(required_permission: Union[str, PermissionScope]):
    """Decorator to require specific permission for endpoint access"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract current user from kwargs (injected by auth middleware)
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            checker = PermissionChecker(current_user)
            if not checker.has_permission(required_permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def require_any_permission(required_permissions: List[Union[str, PermissionScope]]):
    """Decorator to require any of the specified permissions"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            checker = PermissionChecker(current_user)
            if not checker.has_any_permission(required_permissions):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def require_role(required_role: str):
    """Decorator to require specific role for endpoint access"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            checker = PermissionChecker(current_user)
            if not checker.has_role(required_role):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Role '{required_role}' required"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def require_admin():
    """Decorator to require admin role"""
    return require_any_permission([PermissionScope.SYSTEM_ADMIN, "admin"])

# Global permission cache instance
permission_cache = PermissionCache()