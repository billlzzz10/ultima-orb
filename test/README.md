# 🧪 Testing Framework for Ultima-Orb

This directory contains the comprehensive testing framework for Ultima-Orb, designed to ensure code quality, reliability, and maintainability.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Utilities](#test-utilities)
- [Mocking](#mocking)
- [Coverage](#coverage)
- [Best Practices](#best-practices)

## 🎯 Overview

The testing framework uses **Vitest** as the primary test runner, providing:
- Fast execution with parallel testing
- Built-in TypeScript support
- Comprehensive mocking capabilities
- Coverage reporting
- Watch mode for development

## 📁 Test Structure

```
test/
├── setup.ts                 # Global test setup and utilities
├── README.md               # This file
├── unit/                   # Unit tests
│   ├── core/              # Core module tests
│   │   ├── ContextStore.test.ts
│   │   ├── ProviderRegistry.test.ts
│   │   └── ToolRegistry.test.ts
│   ├── ai/                # AI module tests
│   │   ├── AIOrchestrator.test.ts
│   │   ├── ModeSystem.test.ts
│   │   └── AIFeatures.test.ts
│   ├── tools/             # Tools module tests
│   └── ui/                # UI module tests
├── integration/           # Integration tests
│   ├── ai-integration.test.ts
│   ├── tool-integration.test.ts
│   └── ui-integration.test.ts
└── e2e/                  # End-to-end tests
    ├── chat-flow.test.ts
    ├── tool-execution.test.ts
    └── mode-switching.test.ts
```

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run all test suites
npm run test:all
```

### Specific Test Files

```bash
# Run specific test file
npm test ContextStore.test.ts

# Run tests in specific directory
npm test unit/core/

# Run tests matching pattern
npm test -- --grep "ContextStore"
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Coverage thresholds
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%
```

## ✍️ Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContextStore } from '../../src/core/context/ContextStore';
import { createMockApp, createMockContext } from '../setup';

describe('ContextStore', () => {
  let contextStore: ContextStore;
  let mockApp: any;

  beforeEach(() => {
    mockApp = createMockApp();
    contextStore = new ContextStore(mockApp);
  });

  describe('createContext', () => {
    it('should create a new context successfully', () => {
      const context = contextStore.createContext({
        id: 'test-context',
        source: 'user',
        scope: 'session',
        payload: { test: 'data' }
      });

      expect(context.id).toBe('test-context');
      expect(context.source).toBe('user');
      expect(context.scope).toBe('session');
      expect(context.payload).toEqual({ test: 'data' });
    });

    it('should add context to internal storage', () => {
      contextStore.createContext({
        id: 'test-context',
        source: 'user',
        scope: 'session',
        payload: { test: 'data' }
      });

      const retrieved = contextStore.getContext('test-context');
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test-context');
    });
  });
});
```

### Async Testing

```typescript
describe('Async Operations', () => {
  it('should handle async operations correctly', async () => {
    const result = await contextStore.someAsyncMethod();
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should handle async errors', async () => {
    const result = await contextStore.someAsyncMethod();
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('expected error message');
  });
});
```

### Testing with Mocks

```typescript
describe('Mocked Dependencies', () => {
  it('should use mocked dependencies', () => {
    const mockTool = createMockToolManifest({
      id: 'test-tool',
      type: 'utility',
      enabled: true
    });

    const result = toolRegistry.registerTool(mockTool);
    expect(result).toBe(true);
  });
});
```

## 🛠️ Test Utilities

### Global Utilities

The test setup provides several utility functions:

```typescript
import {
  createMockApp,
  createMockContext,
  createMockToolManifest,
  createMockAIProvider,
  createMockModeConfig,
  waitFor,
  mockFetchResponse,
  mockFetchError,
  assertAsyncSuccess,
  assertAsyncError
} from '../setup';
```

### Mock Creation

```typescript
// Mock App
const mockApp = createMockApp();

// Mock Context
const mockContext = createMockContext({
  id: 'test-context',
  source: 'user',
  scope: 'session',
  payload: { test: 'data' }
});

// Mock Tool
const mockTool = createMockToolManifest({
  id: 'test-tool',
  type: 'utility',
  enabled: true
});

// Mock AI Provider
const mockProvider = createMockAIProvider({
  id: 'test-provider',
  name: 'Test Provider'
});
```

### Async Testing Helpers

```typescript
// Wait for condition
await waitFor(() => condition(), 1000);

// Assert async success
const data = await assertAsyncSuccess(promise);

// Assert async error
const error = await assertAsyncError(promise, 'expected error');
```

## 🎭 Mocking

### Obsidian Mocks

The framework automatically mocks Obsidian APIs:

```typescript
// Mock vault operations
mockApp.vault.read.mockResolvedValue('mock content');
mockApp.vault.write.mockResolvedValue(undefined);

// Mock workspace operations
mockApp.workspace.getActiveViewOfType.mockReturnValue(null);
```

### Fetch Mocks

```typescript
// Mock successful response
mockFetchResponse({ success: true, data: 'test' });

// Mock error response
mockFetchError('Network error', 500);
```

### LocalStorage Mocks

```typescript
// Mock localStorage operations
localStorage.setItem('key', 'value');
localStorage.getItem('key'); // Returns 'value'
localStorage.clear();
```

## 📊 Coverage

### Coverage Configuration

Coverage is configured in `vitest.config.ts`:

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'html'],
  exclude: [
    'node_modules/',
    'test/',
    'dist/',
    '**/*.d.ts',
    '**/*.config.*'
  ],
  thresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}
```

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open test-results/index.html
```

## 📋 Best Practices

### 1. Test Organization

- Group related tests using `describe` blocks
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

### 2. Mocking Strategy

- Mock external dependencies
- Use factory functions for complex mocks
- Keep mocks simple and focused

### 3. Async Testing

- Always await async operations
- Test both success and error cases
- Use appropriate timeouts

### 4. Test Data

- Use constants for test data
- Create reusable mock factories
- Keep test data minimal and focused

### 5. Assertions

- Use specific assertions
- Test one thing per test
- Use descriptive assertion messages

### Example Best Practice

```typescript
describe('ContextStore Integration', () => {
  let contextStore: ContextStore;
  let mockApp: any;

  beforeEach(() => {
    mockApp = createMockApp();
    contextStore = new ContextStore(mockApp);
  });

  describe('Session Management', () => {
    it('should create and manage session contexts', async () => {
      // Arrange
      const sessionId = 'test-session';
      const sessionData = { userId: 'user123' };

      // Act
      const session = contextStore.createSessionContext(sessionId, sessionData);
      const currentSession = contextStore.getCurrentSession();

      // Assert
      expect(session.id).toBe(`session_${sessionId}`);
      expect(currentSession).toEqual(session);
      expect(session.payload.userId).toBe('user123');
    });

    it('should handle session switching correctly', async () => {
      // Arrange
      const session1 = contextStore.createSessionContext('session-1', {});
      
      // Act
      const session2 = contextStore.switchSession('session-2', { new: 'data' });

      // Assert
      expect(session2.id).toBe('session_session-2');
      expect(session2.payload.new).toBe('data');
      
      const updatedSession1 = contextStore.getContext('session_session-1');
      expect(updatedSession1?.payload.endTime).toBeDefined();
    });
  });
});
```

## 🔧 Configuration

### Vitest Configuration

The main configuration is in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    // ... other configuration
  }
});
```

### Environment Variables

Create a `.env.test` file for test-specific environment variables:

```env
NODE_ENV=test
TEST_API_URL=http://localhost:3000
TEST_DATABASE_URL=test-db
```

## 🚨 Troubleshooting

### Common Issues

1. **Mock not working**: Ensure mocks are set up in `beforeEach`
2. **Async test failing**: Check if you're properly awaiting async operations
3. **Coverage not generating**: Verify coverage configuration in `vitest.config.ts`

### Debug Mode

```bash
# Run tests in debug mode
npm test -- --debug

# Run specific test in debug mode
npm test -- --debug ContextStore.test.ts
```

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://vitest.dev/guide/best-practices.html)
- [Mocking Guide](https://vitest.dev/guide/mocking.html)
- [Coverage Guide](https://vitest.dev/guide/coverage.html)
