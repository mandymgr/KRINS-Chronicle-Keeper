"""
🔐 KRINS-Chronicle-Keeper JWT Token Management
Enterprise-grade JWT token handling with security best practices
"""

from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
import uuid
import jwt
from jwt import InvalidTokenError
from passlib.context import CryptContext
from passlib.hash import bcrypt
import secrets
import hashlib
import hmac
from dataclasses import dataclass

from .config import auth_settings

@dataclass
class TokenPayload:
    """JWT token payload structure"""
    user_id: str
    username: str
    email: str
    roles: List[str]
    permissions: List[str]
    jti: str
    token_type: str  # 'access' or 'refresh'
    issued_at: datetime
    expires_at: datetime

class PasswordManager:
    """Secure password hashing and verification"""
    
    def __init__(self):
        self.pwd_context = CryptContext(
            schemes=["bcrypt"],
            deprecated="auto",
            bcrypt__rounds=12  # Higher security, slower but more secure
        )
    
    def hash_password(self, password: str) -> str:
        """Hash a password securely"""
        return self.pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def needs_update(self, hashed_password: str) -> bool:
        """Check if password hash needs updating (algorithm upgrade)"""
        return self.pwd_context.needs_update(hashed_password)

class JWTManager:
    """JWT token management with enterprise security features"""
    
    def __init__(self):
        self.password_manager = PasswordManager()
        self._validate_configuration()
    
    def _validate_configuration(self):
        """Validate JWT configuration on startup"""
        if len(auth_settings.jwt_secret_key) < 32:
            raise ValueError("JWT secret key must be at least 32 characters long")
        
        if auth_settings.jwt_access_token_expire_minutes <= 0:
            raise ValueError("JWT access token expiration must be positive")
    
    def create_access_token(
        self,
        user_id: str,
        username: str,
        email: str,
        roles: List[str],
        permissions: List[str],
        expires_delta: Optional[timedelta] = None
    ) -> tuple[str, TokenPayload]:
        """Create a new JWT access token"""
        
        if expires_delta is None:
            expires_delta = timedelta(minutes=auth_settings.jwt_access_token_expire_minutes)
        
        now = datetime.now(timezone.utc)
        expires_at = now + expires_delta
        jti = str(uuid.uuid4())
        
        payload = {
            # Standard JWT claims
            "sub": user_id,  # Subject (user ID)
            "iat": int(now.timestamp()),  # Issued at
            "exp": int(expires_at.timestamp()),  # Expiration time
            "jti": jti,  # JWT ID (unique token identifier)
            "iss": auth_settings.jwt_issuer,  # Issuer
            "aud": auth_settings.jwt_audience,  # Audience
            
            # Custom claims
            "username": username,
            "email": email,
            "roles": roles,
            "permissions": permissions,
            "token_type": "access",
            
            # Security claims
            "auth_time": int(now.timestamp()),  # Authentication time
        }
        
        token = jwt.encode(
            payload,
            auth_settings.jwt_secret_key,
            algorithm=auth_settings.jwt_algorithm
        )
        
        token_payload = TokenPayload(
            user_id=user_id,
            username=username,
            email=email,
            roles=roles,
            permissions=permissions,
            jti=jti,
            token_type="access",
            issued_at=now,
            expires_at=expires_at
        )
        
        return token, token_payload
    
    def create_refresh_token(
        self,
        user_id: str,
        expires_delta: Optional[timedelta] = None
    ) -> tuple[str, str]:
        """Create a new JWT refresh token"""
        
        if expires_delta is None:
            expires_delta = timedelta(days=auth_settings.jwt_refresh_token_expire_days)
        
        now = datetime.now(timezone.utc)
        expires_at = now + expires_delta
        jti = str(uuid.uuid4())
        
        payload = {
            "sub": user_id,
            "iat": int(now.timestamp()),
            "exp": int(expires_at.timestamp()),
            "jti": jti,
            "iss": auth_settings.jwt_issuer,
            "aud": auth_settings.jwt_audience,
            "token_type": "refresh"
        }
        
        token = jwt.encode(
            payload,
            auth_settings.jwt_secret_key,
            algorithm=auth_settings.jwt_algorithm
        )
        
        return token, jti
    
    def decode_token(self, token: str, verify_exp: bool = True) -> Dict[str, Any]:
        """Decode and validate a JWT token"""
        try:
            payload = jwt.decode(
                token,
                auth_settings.jwt_secret_key,
                algorithms=[auth_settings.jwt_algorithm],
                issuer=auth_settings.jwt_issuer,
                audience=auth_settings.jwt_audience,
                options={"verify_exp": verify_exp}
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise InvalidTokenError("Token has expired")
        except jwt.InvalidIssuerError:
            raise InvalidTokenError("Invalid token issuer")
        except jwt.InvalidAudienceError:
            raise InvalidTokenError("Invalid token audience")
        except jwt.InvalidSignatureError:
            raise InvalidTokenError("Invalid token signature")
        except jwt.DecodeError:
            raise InvalidTokenError("Invalid token format")
        except Exception as e:
            raise InvalidTokenError(f"Token validation failed: {str(e)}")
    
    def extract_token_payload(self, token: str) -> Optional[TokenPayload]:
        """Extract structured payload from JWT token"""
        try:
            payload = self.decode_token(token)
            
            return TokenPayload(
                user_id=payload.get("sub"),
                username=payload.get("username"),
                email=payload.get("email"),
                roles=payload.get("roles", []),
                permissions=payload.get("permissions", []),
                jti=payload.get("jti"),
                token_type=payload.get("token_type"),
                issued_at=datetime.fromtimestamp(payload.get("iat"), tz=timezone.utc),
                expires_at=datetime.fromtimestamp(payload.get("exp"), tz=timezone.utc)
            )
        except InvalidTokenError:
            return None
    
    def is_token_expired(self, token: str) -> bool:
        """Check if token is expired without raising exception"""
        try:
            self.decode_token(token, verify_exp=True)
            return False
        except InvalidTokenError:
            return True
    
    def get_token_jti(self, token: str) -> Optional[str]:
        """Extract JTI (JWT ID) from token without full validation"""
        try:
            # Decode without verification to get JTI for blacklist checking
            payload = jwt.decode(token, options={"verify_signature": False})
            return payload.get("jti")
        except Exception:
            return None

class ApiKeyManager:
    """API key generation and management"""
    
    def __init__(self):
        self.password_manager = PasswordManager()
    
    def generate_api_key(self) -> tuple[str, str, str]:
        """Generate a new API key with prefix and hash"""
        # Generate random key
        key_bytes = secrets.token_bytes(auth_settings.api_key_total_length // 2)
        full_key = key_bytes.hex()
        
        # Extract prefix for identification
        prefix = full_key[:auth_settings.api_key_prefix_length]
        
        # Hash the full key for storage
        key_hash = self._hash_api_key(full_key)
        
        return full_key, prefix, key_hash
    
    def _hash_api_key(self, api_key: str) -> str:
        """Hash API key for secure storage"""
        return hashlib.sha256(api_key.encode()).hexdigest()
    
    def verify_api_key(self, provided_key: str, stored_hash: str) -> bool:
        """Verify API key against stored hash"""
        provided_hash = self._hash_api_key(provided_key)
        return hmac.compare_digest(provided_hash, stored_hash)

class TokenBlacklist:
    """In-memory token blacklist for logout and revocation"""
    
    def __init__(self):
        self._blacklisted_tokens: set[str] = set()
        self._last_cleanup = datetime.now(timezone.utc)
    
    def blacklist_token(self, jti: str):
        """Add token JTI to blacklist"""
        self._blacklisted_tokens.add(jti)
        self._cleanup_expired()
    
    def is_token_blacklisted(self, jti: str) -> bool:
        """Check if token JTI is blacklisted"""
        self._cleanup_expired()
        return jti in self._blacklisted_tokens
    
    def _cleanup_expired(self):
        """Clean up expired tokens from blacklist periodically"""
        now = datetime.now(timezone.utc)
        if (now - self._last_cleanup).total_seconds() > 3600:  # Clean up every hour
            # In a real implementation, you would check expiration times
            # For now, we'll just clear old entries periodically
            self._last_cleanup = now

# Global instances
jwt_manager = JWTManager()
api_key_manager = ApiKeyManager()
token_blacklist = TokenBlacklist()