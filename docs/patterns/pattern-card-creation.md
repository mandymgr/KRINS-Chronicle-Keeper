# Pattern: Pattern Card Creation
**Når bruke:** Ved gjenbrukbare løsninger som kan brukes på tvers av språk/team  •  **Ikke bruk når:** Engangsløsninger eller svært spesifikke implementasjoner  •  **Kontekst:** @reuse/@documentation

## Steg-for-steg
1) Identifiser et gjentakende problem eller løsning i codebase
2) Dokumenter når pattern skal/ikke skal brukes
3) Lag kodeeksempler for relevante språk/frameworks
4) Inkluder ytelse-, sikkerhets- og observability-veiledning
5) Test eksemplene og samle feedback fra team

## Språkvarianter
### TypeScript/Node (Next.js)
```ts
// API Error Handler Pattern
export function withErrorHandler<T>(
  handler: (req: NextRequest) => Promise<T>
) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      console.error('API Error:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}
```

### Python (FastAPI)
```py
# API Error Handler Pattern
from functools import wraps
from fastapi import HTTPException
import logging

def with_error_handler(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            logging.error(f"API Error: {e}")
            raise HTTPException(status_code=500, detail="Internal Server Error")
    return wrapper
```

### Java (Spring)
```java
// API Error Handler Pattern
@RestControllerAdvice
public class GlobalErrorHandler {
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception e) {
        log.error("API Error", e);
        return ResponseEntity.status(500)
            .body(new ErrorResponse("Internal Server Error"));
    }
}
```

## Ytelse/Sikkerhet
Pattern cards reduserer utviklingstid ved å gi proven løsninger; standardiserer sikkerhetspraksis på tvers av team; letter code review og onboarding.

## Observability
Spor: Pattern-bruk per prosjekt, team-adoptions-rate, pattern-effectiveness. Logg når patterns oppdateres eller deprecated.

## Vanlige feil / Anti-mønstre
- Lage patterns for alt (overengineering)
- Ikke oppdatere patterns når best practices endres
- For komplekse eksempler som skjuler hovedpoenget
- Manglende kontekst om når pattern IKKE skal brukes