# Service Layer Pattern

## Description
Python service layer pattern with dependency injection, error handling, and logging.

## Usage
Use this pattern for business logic services to ensure separation of concerns and testability.

## Code

```python
from abc import ABC, abstractmethod
from typing import TypeVar, Generic, Optional
from dataclasses import dataclass
import logging
from contextlib import asynccontextmanager

T = TypeVar('T')

@dataclass
class ServiceResult(Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None
    error_code: Optional[str] = None

class BaseService(ABC):
    def __init__(self, logger: Optional[logging.Logger] = None):
        self.logger = logger or logging.getLogger(self.__class__.__name__)
    
    @asynccontextmanager
    async def handle_service_errors(self):
        """Context manager for consistent error handling"""
        try:
            yield
        except ValidationError as e:
            self.logger.warning(f"Validation error: {e}")
            raise
        except BusinessLogicError as e:
            self.logger.error(f"Business logic error: {e}")
            raise
        except Exception as e:
            self.logger.error(f"Unexpected error: {e}", exc_info=True)
            raise ServiceError("Internal service error") from e

    async def execute_with_result(self, operation) -> ServiceResult[T]:
        """Execute operation and return standardized result"""
        try:
            async with self.handle_service_errors():
                result = await operation()
                return ServiceResult(success=True, data=result)
        except ValidationError as e:
            return ServiceResult(
                success=False, 
                error=str(e), 
                error_code="VALIDATION_ERROR"
            )
        except BusinessLogicError as e:
            return ServiceResult(
                success=False, 
                error=str(e), 
                error_code="BUSINESS_ERROR"
            )
        except ServiceError as e:
            return ServiceResult(
                success=False, 
                error=str(e), 
                error_code="SERVICE_ERROR"
            )

class ValidationError(Exception):
    pass

class BusinessLogicError(Exception):
    pass

class ServiceError(Exception):
    pass
```

## Related ADRs
- ADR-0005: Python service architecture standards