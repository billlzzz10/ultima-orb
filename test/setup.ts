// Global test setup
import { beforeAll, afterAll } from 'vitest';

// Mock console methods to avoid noise in tests
const originalConsole = { ...console };

beforeAll(() => {
  // Suppress console output during tests
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsole.log;
  console.info = originalConsole.info;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});
