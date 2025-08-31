interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string;
}

class RateLimitStore {
  private store = new Map<string, RateLimitEntry>();

  private generateKey(identifier: string, ip: string): string {
    return `${identifier}:${ip}`;
  }

  increment(identifier: string, ip: string, windowMs: number): RateLimitEntry {
    const key = this.generateKey(identifier, ip);
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
      };
      this.store.set(key, newEntry);
      console.log(`[DEBUG] [RateLimit] Rate limit configured`, { identifier, config: { maxRequests: 'N/A', windowMs } });
      return newEntry;
    }

    // Increment existing entry
    entry.count++;
    this.store.set(key, entry);
    return entry;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  stats(): { totalKeys: number; entries: Array<{ key: string; count: number; resetTime: number }> } {
    return {
      totalKeys: this.store.size,
      entries: Array.from(this.store.entries()).map(([key, entry]) => ({
        key,
        count: entry.count,
        resetTime: entry.resetTime,
      })),
    };
  }
}

const rateLimitStore = new RateLimitStore();

// Default rate limit configurations
export const RATE_LIMIT_CONFIGS: Record<string, Omit<RateLimitConfig, 'identifier'>> = {
  github: {
    maxRequests: 5000, // GitHub API allows 5000 requests per hour
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  jira: {
    maxRequests: 100, // Conservative limit for Jira API
    windowMs: 60 * 1000, // 1 minute
  },
  'api:github': {
    maxRequests: 30, // Our API endpoint limit
    windowMs: 60 * 1000, // 1 minute
  },
  'api:jira': {
    maxRequests: 20, // Our API endpoint limit
    windowMs: 60 * 1000, // 1 minute
  },
  'api:health': {
    maxRequests: 60, // Health check endpoint
    windowMs: 60 * 1000, // 1 minute
  },
};

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

export function checkRateLimit(
  identifier: string,
  ip: string,
  config?: Partial<RateLimitConfig>
): RateLimitResult {
  const defaultConfig = RATE_LIMIT_CONFIGS[identifier];
  const finalConfig = {
    ...defaultConfig,
    ...config,
    identifier,
  };

  if (!finalConfig.maxRequests || !finalConfig.windowMs) {
    throw new Error(`Rate limit configuration not found for identifier: ${identifier}`);
  }

  console.log(`[DEBUG] [RateLimit] Rate limit configured`, { identifier, config: finalConfig });

  const entry = rateLimitStore.increment(identifier, ip, finalConfig.windowMs);
  
  return {
    allowed: entry.count <= finalConfig.maxRequests,
    limit: finalConfig.maxRequests,
    remaining: Math.max(0, finalConfig.maxRequests - entry.count),
    resetTime: entry.resetTime,
  };
}

// Middleware function for Next.js API routes
export function rateLimitMiddleware(identifier: string, config?: Partial<RateLimitConfig>) {
  return (req: Request): { allowed: boolean; headers: Record<string, string> } => {
    // Extract IP from request (considering various proxy headers)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIp || '127.0.0.1';

    const result = checkRateLimit(identifier, ip, config);
    
    const headers = {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    };

    if (!result.allowed) {
      headers['Retry-After'] = Math.ceil((result.resetTime - Date.now()) / 1000).toString();
    }

    return {
      allowed: result.allowed,
      headers,
    };
  };
}

// Error class for rate limit exceeded
export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number,
    public limit: number,
    public resetTime: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Helper function to create rate limit error response
export function createRateLimitErrorResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message: `Too many requests. Limit: ${result.limit} requests. Try again in ${retryAfter} seconds.`,
      retryAfter,
      resetTime: new Date(result.resetTime).toISOString(),
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}

// Cleanup task - run periodically to remove expired entries
setInterval(() => {
  rateLimitStore.cleanup();
}, 5 * 60 * 1000); // Run cleanup every 5 minutes

// Debug function to get rate limit stats
export function getRateLimitStats(): ReturnType<typeof rateLimitStore.stats> {
  return rateLimitStore.stats();
}