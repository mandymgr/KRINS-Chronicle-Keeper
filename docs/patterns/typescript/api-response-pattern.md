# API Response Pattern

## Description
Standardized API response structure with consistent error handling and type safety.

## Usage
Use this pattern for all API endpoints to ensure consistent response format and error handling.

## Code

```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export class ApiResponseBuilder {
  static success<T>(data: T, metadata?: any): ApiResponse<T> {
    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: '1.0.0',
        ...metadata
      }
    };
  }

  static error(
    code: string, 
    message: string, 
    details?: any
  ): ApiResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId(),
        version: '1.0.0'
      }
    };
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Express middleware for consistent error handling
export const errorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  console.error('API Error:', err);
  
  const response = ApiResponseBuilder.error(
    'INTERNAL_ERROR',
    'An unexpected error occurred',
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
  
  res.status(500).json(response);
};
```

## Related ADRs
- ADR-0001: RESTful API design standards