/**
 * 🧪 KRINS Test Setup
 * Global test configuration and utilities for all tests
 */

import { jest } from '@jest/globals';

// Global test configuration
beforeAll(() => {
  console.log('🧪 KRINS Test Suite Starting...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = ':memory:'; // Use in-memory SQLite for tests
  
  // Mock external services for tests
  setupGlobalMocks();
});

afterAll(() => {
  console.log('✅ KRINS Test Suite Complete!');
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});

/**
 * Setup global mocks for external dependencies
 */
function setupGlobalMocks() {
  // Mock file system operations
  jest.mock('fs-extra', () => ({
    ensureDir: jest.fn().mockResolvedValue(undefined),
    readJson: jest.fn().mockResolvedValue({}),
    writeJson: jest.fn().mockResolvedValue(undefined),
    exists: jest.fn().mockResolvedValue(true),
    readFile: jest.fn().mockResolvedValue('mock file content'),
    writeFile: jest.fn().mockResolvedValue(undefined)
  }));

  // Mock database connections
  jest.mock('sqlite3', () => ({
    Database: jest.fn().mockImplementation(() => ({
      run: jest.fn((sql, params, callback) => callback?.()),
      get: jest.fn((sql, params, callback) => callback?.(null, {})),
      all: jest.fn((sql, params, callback) => callback?.(null, [])),
      prepare: jest.fn(() => ({
        run: jest.fn(),
        get: jest.fn(() => ({})),
        all: jest.fn(() => [])
      })),
      close: jest.fn()
    }))
  }));

  // Mock PostgreSQL client
  jest.mock('pg', () => ({
    Client: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(undefined),
      query: jest.fn().mockResolvedValue({ rows: [] }),
      end: jest.fn().mockResolvedValue(undefined)
    }))
  }));

  // Mock external API calls
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue('')
  });
}

/**
 * Test utilities for KRINS components
 */
export class TestUtils {
  /**
   * Create mock ADR for testing
   */
  static createMockADR(overrides = {}) {
    return {
      id: 'ADR-0001',
      title: 'Test Decision',
      status: 'accepted',
      date: new Date().toISOString(),
      context: 'Test context',
      decision: 'Test decision',
      consequences: ['Test consequence'],
      tags: ['test'],
      ...overrides
    };
  }

  /**
   * Create mock conversation for testing
   */
  static createMockConversation(overrides = {}) {
    return {
      id: 'conv-123',
      title: 'Test Conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides
    };
  }

  /**
   * Create mock memory for testing
   */
  static createMockMemory(overrides = {}) {
    return {
      id: 'mem-123',
      title: 'Test Memory',
      content: 'Test memory content',
      category: 'test',
      importance: 5,
      created_at: new Date().toISOString(),
      ...overrides
    };
  }

  /**
   * Create mock context for AI testing
   */
  static createMockAIContext(overrides = {}) {
    return {
      query: 'test query',
      relevantADRs: [this.createMockADR()],
      patterns: [],
      runbooks: [],
      confidence: 0.8,
      sources: ['adr'],
      ...overrides
    };
  }

  /**
   * Wait for async operations in tests
   */
  static async waitFor(condition: () => boolean, timeout = 1000) {
    const start = Date.now();
    
    while (!condition() && (Date.now() - start) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    if (!condition()) {
      throw new Error('Timeout waiting for condition');
    }
  }

  /**
   * Create temporary test database
   */
  static createTestDatabase() {
    // Return mock database for testing
    return {
      run: jest.fn(),
      get: jest.fn().mockReturnValue({}),
      all: jest.fn().mockReturnValue([]),
      prepare: jest.fn().mockReturnValue({
        run: jest.fn(),
        get: jest.fn().mockReturnValue({}),
        all: jest.fn().mockReturnValue([])
      }),
      close: jest.fn()
    };
  }

  /**
   * Mock console methods for testing
   */
  static mockConsole() {
    return {
      log: jest.spyOn(console, 'log').mockImplementation(() => {}),
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      info: jest.spyOn(console, 'info').mockImplementation(() => {})
    };
  }
}

// Global test helpers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidADR(): R;
      toBeValidContext(): R;
      toHaveTimestamp(): R;
    }
  }
}

// Custom matchers
expect.extend({
  toBeValidADR(received) {
    const required = ['id', 'title', 'status', 'date', 'context', 'decision'];
    const missing = required.filter(key => !(key in received));
    
    if (missing.length > 0) {
      return {
        message: () => `Expected valid ADR, but missing: ${missing.join(', ')}`,
        pass: false
      };
    }
    
    return {
      message: () => 'Expected invalid ADR',
      pass: true
    };
  },
  
  toBeValidContext(received) {
    const required = ['query', 'confidence', 'sources'];
    const missing = required.filter(key => !(key in received));
    
    if (missing.length > 0) {
      return {
        message: () => `Expected valid context, but missing: ${missing.join(', ')}`,
        pass: false
      };
    }
    
    return {
      message: () => 'Expected invalid context',
      pass: true
    };
  },
  
  toHaveTimestamp(received) {
    const hasTimestamp = 'timestamp' in received || 'created_at' in received || 'date' in received;
    
    return {
      message: () => hasTimestamp ? 'Expected no timestamp' : 'Expected timestamp field',
      pass: hasTimestamp
    };
  }
});

export { jest };