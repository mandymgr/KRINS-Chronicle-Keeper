"""
🗄️ KRINS-Chronicle-Keeper Database Module
SQLAlchemy async database connection and models
"""

from .connection import (
    db_manager, get_db_session, get_db_session_context,
    init_database, cleanup_database, check_database_health
)
from .auth_models import (
    Base, User, Role, Permission, ApiKey, AuditLog, UserSession,
    user_roles, role_permissions
)

__all__ = [
    # Connection management
    'db_manager',
    'get_db_session',
    'get_db_session_context',
    'init_database',
    'cleanup_database',
    'check_database_health',
    
    # Models
    'Base',
    'User',
    'Role',
    'Permission',
    'ApiKey',
    'AuditLog',
    'UserSession',
    'user_roles',
    'role_permissions',
]