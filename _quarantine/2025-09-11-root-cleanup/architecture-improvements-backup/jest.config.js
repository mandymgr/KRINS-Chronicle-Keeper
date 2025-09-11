/**
 * 🧪 KRINS-Chronicle-Keeper Jest Test Configuration
 * Comprehensive testing setup for organizational intelligence system
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // TypeScript support
  preset: 'ts-jest',
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.(test|spec).ts',
    '**/*.(test|spec).ts'
  ],
  
  // Coverage settings
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  
  // Coverage thresholds - enforce quality
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Critical modules need higher coverage
    './DECISION_MANAGEMENT/decision-tracker.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './AI_INTEGRATION/context-provider.ts': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Files to collect coverage from
  collectCoverageFrom: [
    'DECISION_MANAGEMENT/**/*.ts',
    'AI_INTEGRATION/**/*.ts',
    'GOVERNANCE_PROCESS/**/*.ts',
    'KNOWLEDGE_ORGANIZATION/**/*.ts', 
    'TEAM_COLLABORATION/**/*.ts',
    'ORGANIZATIONAL_INTELLIGENCE/**/*.ts',
    'tools/**/*.ts',
    'scripts/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**'
  ],
  
  // Module resolution
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transform patterns
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  
  // Module name mapping for absolute imports
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@decision/(.*)$': '<rootDir>/DECISION_MANAGEMENT/$1',
    '^@ai/(.*)$': '<rootDir>/AI_INTEGRATION/$1',
    '^@governance/(.*)$': '<rootDir>/GOVERNANCE_PROCESS/$1',
    '^@knowledge/(.*)$': '<rootDir>/KNOWLEDGE_ORGANIZATION/$1',
    '^@team/(.*)$': '<rootDir>/TEAM_COLLABORATION/$1',
    '^@intelligence/(.*)$': '<rootDir>/ORGANIZATIONAL_INTELLIGENCE/$1'
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  
  // Test timeout
  testTimeout: 10000,
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/quarantine-for-review/',
    '/frontend/node_modules/'
  ],
  
  // Verbose output for debugging
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Error on deprecated APIs
  errorOnDeprecated: true,
  
  // Notify mode for watch
  notify: true,
  notifyMode: 'failure-change',
  
  // Maximum worker processes
  maxWorkers: '50%',
  
  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Global test configuration
  globals: {
    'ts-jest': {
      tsconfig: {
        target: 'ES2020',
        module: 'commonjs'
      }
    }
  }
};