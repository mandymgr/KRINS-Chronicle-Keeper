import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cache } from '@/lib/cache';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    cache: vi.fn(),
  },
}));

describe('Cache', () => {
  beforeEach(() => {
    cache.clear();
  });

  describe('basic operations', () => {
    it('should store and retrieve data', () => {
      const testData = { message: 'test' };
      cache.set('test-key', testData);
      
      const retrieved = cache.get('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const result = cache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should delete entries', () => {
      cache.set('test-key', 'test-value');
      expect(cache.get('test-key')).toBe('test-value');
      
      cache.delete('test-key');
      expect(cache.get('test-key')).toBeNull();
    });

    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      cache.clear();
      
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('TTL functionality', () => {
    it('should expire entries after TTL', () => {
      const testData = 'test-value';
      cache.set('test-key', testData, 0.001); // 1ms TTL
      
      expect(cache.get('test-key')).toBe(testData);
      
      // Wait for expiration
      return new Promise(resolve => {
        setTimeout(() => {
          expect(cache.get('test-key')).toBeNull();
          resolve(undefined);
        }, 10);
      });
    });

    it('should use default TTL when not specified', () => {
      const testData = 'test-value';
      cache.set('test-key', testData);
      
      // Should still be available (default TTL is 5 minutes)
      expect(cache.get('test-key')).toBe(testData);
    });
  });

  describe('GitHub-specific methods', () => {
    it('should cache and retrieve GitHub commits', () => {
      const commits = [
        { id: '1', message: 'Initial commit', author: { name: 'John' } }
      ];
      
      cache.github.setCommits('owner', 'repo', commits);
      const retrieved = cache.github.getCommits('owner', 'repo');
      
      expect(retrieved).toEqual(commits);
    });

    it('should cache and retrieve GitHub releases', () => {
      const releases = [
        { id: '1', version: 'v1.0.0', name: 'First Release' }
      ];
      
      cache.github.setReleases('owner', 'repo', releases);
      const retrieved = cache.github.getReleases('owner', 'repo');
      
      expect(retrieved).toEqual(releases);
    });

    it('should cache and retrieve GitHub milestones', () => {
      const milestones = [
        { id: '1', title: 'Milestone 1', state: 'open' }
      ];
      
      cache.github.setMilestones('owner', 'repo', milestones);
      const retrieved = cache.github.getMilestones('owner', 'repo');
      
      expect(retrieved).toEqual(milestones);
    });
  });

  describe('Jira-specific methods', () => {
    it('should cache and retrieve Jira issues', () => {
      const issues = [
        { id: '1', key: 'TEST-1', title: 'Test Issue' }
      ];
      
      cache.jira.setIssues('TEST', issues);
      const retrieved = cache.jira.getIssues('TEST');
      
      expect(retrieved).toEqual(issues);
    });

    it('should cache and retrieve Jira project', () => {
      const project = { id: '1', key: 'TEST', name: 'Test Project' };
      
      cache.jira.setProject('TEST', project);
      const retrieved = cache.jira.getProject('TEST');
      
      expect(retrieved).toEqual(project);
    });
  });

  describe('withCache method', () => {
    it('should fetch and cache data when not cached', async () => {
      const fetchFn = vi.fn().mockResolvedValue('fetched-data');
      
      const result = await cache.withCache('test-key', fetchFn, { ttl: 300 });
      
      expect(result).toBe('fetched-data');
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(cache.get('test-key')).toBe('fetched-data');
    });

    it('should return cached data without calling fetcher', async () => {
      const fetchFn = vi.fn().mockResolvedValue('fetched-data');
      cache.set('test-key', 'cached-data');
      
      const result = await cache.withCache('test-key', fetchFn);
      
      expect(result).toBe('cached-data');
      expect(fetchFn).not.toHaveBeenCalled();
    });
  });
});