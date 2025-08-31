interface CacheEntry<T> {
  data: T;
  timestamp: number;
  maxAge: number; // in milliseconds
}

interface CacheConfig {
  commits: number;    // 5 minutes
  releases: number;   // 15 minutes
  milestones: number; // 15 minutes
  jira: number;       // 2 minutes
  health: number;     // 1 minute
}

// Cache configuration in milliseconds
export const CACHE_DURATION: CacheConfig = {
  commits: 5 * 60 * 1000,      // 5 minutes
  releases: 15 * 60 * 1000,    // 15 minutes
  milestones: 15 * 60 * 1000,  // 15 minutes
  jira: 2 * 60 * 1000,         // 2 minutes
  health: 1 * 60 * 1000,       // 1 minute
};

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, maxAge: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      maxAge,
    });
  }

  get<T>(key: string): { data: T; isStale: boolean } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    const age = now - entry.timestamp;
    const isStale = age > entry.maxAge;

    return {
      data: entry.data as T,
      isStale,
    };
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries (optional background cleanup)
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      // Remove entries older than 2x their maxAge to implement stale-while-revalidate
      if (now - entry.timestamp > entry.maxAge * 2) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cache = new MemoryCache();

// Utility function to get cache headers for HTTP responses
export function getCacheHeaders(resource: keyof CacheConfig): Record<string, string> {
  const maxAge = CACHE_DURATION[resource] / 1000; // Convert to seconds
  const staleWhileRevalidate = maxAge; // Same duration for stale-while-revalidate
  
  return {
    'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    'Vary': 'Accept-Encoding',
  };
}

// Helper function to generate cache keys
export function generateCacheKey(
  prefix: string,
  params: Record<string, string | number | boolean | undefined>
): string {
  const cleanParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}:${value}`)
    .sort()
    .join('|');
  
  return `${prefix}:${cleanParams}`;
}

// Cached fetch wrapper with stale-while-revalidate pattern
export async function cachedFetch<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  maxAge: number,
  force = false
): Promise<{ data: T; cached: boolean; stale: boolean }> {
  if (!force) {
    const cached = cache.get<T>(cacheKey);
    if (cached) {
      // If stale, trigger background refresh but return cached data
      if (cached.isStale) {
        // Background refresh (don't await)
        fetchFn()
          .then(freshData => cache.set(cacheKey, freshData, maxAge))
          .catch(error => console.error(`Background refresh failed for ${cacheKey}:`, error));
      }
      
      return {
        data: cached.data,
        cached: true,
        stale: cached.isStale,
      };
    }
  }

  // Fetch fresh data
  try {
    const data = await fetchFn();
    cache.set(cacheKey, data, maxAge);
    
    return {
      data,
      cached: false,
      stale: false,
    };
  } catch (error) {
    // If fetch fails and we have stale cache, return it
    const staleCache = cache.get<T>(cacheKey);
    if (staleCache) {
      console.warn(`Fetch failed for ${cacheKey}, returning stale cache:`, error);
      return {
        data: staleCache.data,
        cached: true,
        stale: true,
      };
    }
    throw error;
  }
}

// Background cleanup task (can be called periodically)
setInterval(() => {
  cache.cleanup();
}, 10 * 60 * 1000); // Run cleanup every 10 minutes