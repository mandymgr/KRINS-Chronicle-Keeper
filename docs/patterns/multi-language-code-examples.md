# Pattern: Multi-Language Code Examples
**Når bruke:** Når samme konsept implementeres på tvers av ulike tech-stacks  •  **Ikke bruk når:** Språkspesifikke patterns som ikke oversettes  •  **Kontekst:** @polyglot/@standardization

## Steg-for-steg
1) Identifiser et konsept som gjentas på tvers av språk/frameworks
2) Implementer canonical versjon i hovedspråket
3) Oversett til andre relevante språk med idiomatisk kode
4) Test alle varianter og sikre konsistent oppførsel
5) Dokumenter forskjeller og språkspesifikke hensyn

## Språkvarianter
### TypeScript/Node (Retry Pattern)
```ts
async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error('Max attempts reached');
}

// Usage
const result = await withRetry(
  () => fetch('/api/data').then(r => r.json()),
  3,
  1000
);
```

### Python (Retry Pattern)
```py
import asyncio
from typing import Callable, TypeVar, Awaitable
import logging

T = TypeVar('T')

async def with_retry(
    operation: Callable[[], Awaitable[T]],
    max_attempts: int = 3,
    delay: float = 1.0
) -> T:
    for attempt in range(1, max_attempts + 1):
        try:
            return await operation()
        except Exception as e:
            if attempt == max_attempts:
                raise e
            await asyncio.sleep(delay * attempt)
            logging.warning(f"Retry attempt {attempt} failed: {e}")
    
    raise Exception("Max attempts reached")

# Usage
result = await with_retry(
    lambda: httpx.get("/api/data").json(),
    max_attempts=3,
    delay=1.0
)
```

### Java (Retry Pattern)
```java
// Retry Pattern
public class RetryUtil {
    
    public static <T> T withRetry(
            Supplier<T> operation,
            int maxAttempts,
            Duration delay
    ) throws Exception {
        Exception lastException = null;
        
        for (int attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return operation.get();
            } catch (Exception e) {
                lastException = e;
                if (attempt == maxAttempts) {
                    throw e;
                }
                Thread.sleep(delay.toMillis() * attempt);
            }
        }
        throw new RuntimeException("Max attempts reached", lastException);
    }
}

// Usage
String result = RetryUtil.withRetry(
    () -> restTemplate.getForObject("/api/data", String.class),
    3,
    Duration.ofSeconds(1)
);
```

### Go (Retry Pattern)
```go
package retry

import (
    "context"
    "fmt"
    "time"
)

func WithRetry[T any](
    ctx context.Context,
    operation func() (T, error),
    maxAttempts int,
    delay time.Duration,
) (T, error) {
    var zero T
    
    for attempt := 1; attempt <= maxAttempts; attempt++ {
        result, err := operation()
        if err == nil {
            return result, nil
        }
        
        if attempt == maxAttempts {
            return zero, fmt.Errorf("max attempts reached: %w", err)
        }
        
        select {
        case <-ctx.Done():
            return zero, ctx.Err()
        case <-time.After(delay * time.Duration(attempt)):
        }
    }
    
    return zero, fmt.Errorf("unexpected end of retry loop")
}

// Usage
result, err := WithRetry(ctx,
    func() (string, error) {
        return httpClient.Get("/api/data")
    },
    3,
    1*time.Second,
)
```

## Ytelse/Sikkerhet
Multi-språk patterns sikrer konsistent oppførsel på tvers av tech-stack; reduserer læringskurve for utviklere som jobber med flere språk; standardiserer sikkerhetspraksis.

## Observability
Spor: Pattern-adoption per språk, cross-language-consistency-score, developer-satisfaction med multi-language docs.

## Vanlige feil / Anti-mønstre
- Direkteoversettelse uten å følge språkets idiomer
- Ignorere språkspesifikke optimalisering-muligheter  
- For mange språkvarianter som ikke vedlikeholdes
- Ikke oppdatere alle varianter når pattern endres