import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rateLimiter } from '@/lib/rateLimit';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    rateLimit: vi.fn(),
  },
}));

describe('RateLimiter', () => {
  beforeEach(() => {
    // Clear all rate limit entries
    (rateLimiter as any).limits.clear();
  });

  describe('basic rate limiting', () => {
    it('should allow requests within limit', () => {
      // Add a test rate limit
      rateLimiter.addLimit('test', { maxRequests: 5, windowMs: 60000 });
      
      // First request should be allowed
      const result = rateLimiter.check('test', 'client1');
      
      expect(result.allowed).toBe(true);
      expect(result.remainingRequests).toBe(3); // 5 max - 1 used - 1 for next = 3
    });

    it('should block requests when limit exceeded', () => {
      rateLimiter.addLimit('test', { maxRequests: 2, windowMs: 60000 });
      
      // Use up the limit
      rateLimiter.check('test', 'client1');
      rateLimiter.check('test', 'client1');
      
      // This should be blocked
      const result = rateLimiter.check('test', 'client1');
      
      expect(result.allowed).toBe(false);
      expect(result.remainingRequests).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should separate limits by client ID', () => {
      rateLimiter.addLimit('test', { maxRequests: 2, windowMs: 60000 });
      
      // Client 1 uses up their limit
      rateLimiter.check('test', 'client1');
      rateLimiter.check('test', 'client1');
      
      // Client 2 should still be allowed
      const result = rateLimiter.check('test', 'client2');
      
      expect(result.allowed).toBe(true);
    });

    it('should reset limits after time window', async () => {
      rateLimiter.addLimit('test', { maxRequests: 1, windowMs: 10 }); // 10ms window
      
      // Use up the limit
      const first = rateLimiter.check('test', 'client1');
      expect(first.allowed).toBe(true);
      
      const second = rateLimiter.check('test', 'client1');
      expect(second.allowed).toBe(false);
      
      // Wait for window to reset
      await new Promise(resolve => setTimeout(resolve, 20));
      
      const third = rateLimiter.check('test', 'client1');
      expect(third.allowed).toBe(true);
    });
  });

  describe('GitHub rate limiting', () => {
    it('should provide GitHub-specific rate limit checks', () => {
      const result = rateLimiter.github.check('client1');
      expect(result.allowed).toBe(true);
    });

    it('should provide GitHub API rate limit checks', () => {
      const result = rateLimiter.github.apiCheck('client1');
      expect(result.allowed).toBe(true);
    });
  });

  describe('Jira rate limiting', () => {
    it('should provide Jira-specific rate limit checks', () => {
      const result = rateLimiter.jira.check('client1');
      expect(result.allowed).toBe(true);
    });

    it('should provide Jira API rate limit checks', () => {
      const result = rateLimiter.jira.apiCheck('client1');
      expect(result.allowed).toBe(true);
    });
  });

  describe('enforce method', () => {
    it('should not throw when within limits', async () => {
      rateLimiter.addLimit('test', { maxRequests: 5, windowMs: 60000 });
      
      await expect(rateLimiter.enforce('test', 'client1')).resolves.not.toThrow();
    });

    it('should throw when rate limit exceeded', async () => {
      rateLimiter.addLimit('test', { maxRequests: 1, windowMs: 60000 });
      
      // Use up the limit
      await rateLimiter.enforce('test', 'client1');
      
      // This should throw
      await expect(rateLimiter.enforce('test', 'client1')).rejects.toThrow('Rate limit exceeded');
    });

    it('should throw error with proper properties', async () => {
      rateLimiter.addLimit('test', { maxRequests: 1, windowMs: 60000 });
      
      // Use up the limit
      await rateLimiter.enforce('test', 'client1');
      
      try {
        await rateLimiter.enforce('test', 'client1');
        expect.fail('Should have thrown');
      } catch (error: any) {
        expect(error.message).toBe('Rate limit exceeded');
        expect(error.statusCode).toBe(429);
        expect(error.retryAfter).toBeGreaterThan(0);
      }
    });
  });

  describe('status method', () => {
    it('should return current status without incrementing', () => {
      rateLimiter.addLimit('test', { maxRequests: 5, windowMs: 60000 });
      
      // Check status multiple times
      const status1 = rateLimiter.status('test', 'client1');
      const status2 = rateLimiter.status('test', 'client1');
      
      expect(status1?.remainingRequests).toBe(5);
      expect(status2?.remainingRequests).toBe(5); // Should be the same
      expect(status1?.allowed).toBe(true);
    });

    it('should return null for non-existent rate limits', () => {
      const status = rateLimiter.status('non-existent', 'client1');
      expect(status).toBeNull();
    });
  });
});