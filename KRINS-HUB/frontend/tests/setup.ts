import { beforeAll, afterAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'cross-fetch/polyfill';

// Mock Service Worker for API mocking
import { server } from './mocks/server';

// Setup MSW
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => {
  server.close();
});

// Global test environment variables
declare global {
  const __TEST_API_URL__: string;
  const __WEBHOOK_URL__: string;
}

// Mock window.matchMedia (used by some UI components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver (used by some UI components)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver (used by some UI components)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Console helpers for tests
global.console = {
  ...console,
  // Suppress console.log in tests unless explicitly needed
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: console.warn,
  error: console.error,
};

// Setup performance.now for benchmarking tests
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
  } as Performance;
}