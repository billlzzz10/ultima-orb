// 🧪 Test Setup for Ultima-Orb

import { vi } from "vitest";

// ===== GLOBAL MOCKS =====

// Mock Obsidian
vi.mock("obsidian", () => ({
  App: vi.fn().mockImplementation(() => ({
    vault: {
      read: vi.fn(),
      write: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn(),
      getAbstractFileByPath: vi.fn(),
      getFiles: vi.fn(),
      getAllLoadedFiles: vi.fn(),
    },
    workspace: {
      onLayoutReady: vi.fn(),
      getActiveViewOfType: vi.fn(),
      getLeavesOfType: vi.fn(),
      getActiveFile: vi.fn(),
      onFileOpen: vi.fn(),
      onLayoutChange: vi.fn(),
    },
    settings: {
      get: vi.fn(),
      set: vi.fn(),
    },
  })),
  Plugin: vi.fn(),
  PluginSettingTab: vi.fn(),
  ItemView: vi.fn(),
  WorkspaceLeaf: vi.fn(),
  Notice: vi.fn(),
  Modal: vi.fn(),
  SuggestModal: vi.fn(),
  TextAreaComponent: vi.fn(),
  ButtonComponent: vi.fn(),
  Setting: vi.fn(),
  TFile: vi.fn(),
  TFolder: vi.fn(),
  MarkdownView: vi.fn(),
  MarkdownRenderer: {
    render: vi.fn(),
  },
}));

// Mock localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
  },
  writable: true,
});

// Mock fetch
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
beforeEach(() => {
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterEach(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

// ===== GLOBAL TEST UTILITIES =====

/**
 * 🔧 Create Mock App Instance
 */
export function createMockApp() {
  return {
    vault: {
      read: vi.fn().mockResolvedValue("mock content"),
      write: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
      exists: vi.fn().mockResolvedValue(true),
      getAbstractFileByPath: vi.fn().mockReturnValue(null),
      getFiles: vi.fn().mockReturnValue([]),
      getAllLoadedFiles: vi.fn().mockReturnValue([]),
    },
    workspace: {
      onLayoutReady: vi.fn(),
      getActiveViewOfType: vi.fn().mockReturnValue(null),
      getLeavesOfType: vi.fn().mockReturnValue([]),
      getActiveFile: vi.fn().mockReturnValue(null),
      onFileOpen: vi.fn(),
      onLayoutChange: vi.fn(),
    },
    settings: {
      get: vi.fn().mockReturnValue({}),
      set: vi.fn(),
    },
  } as any;
}

/**
 * 🔧 Create Mock Context Boundary
 */
export function createMockContext(config: {
  id: string;
  source?: "user" | "agent" | "tool" | "system";
  scope?: "global" | "session" | "tool" | "temporary";
  payload?: Record<string, any>;
  expiresAt?: number;
}) {
  return {
    id: config.id,
    source: config.source || "user",
    scope: config.scope || "session",
    payload: config.payload || {},
    createdAt: Date.now(),
    expiresAt: config.expiresAt,
    auditTrail: [],
    priority: "medium" as const,
    tags: [],
  };
}

/**
 * 🔧 Create Mock Tool Manifest
 */
export function createMockToolManifest(config: {
  id: string;
  type?: "integration" | "utility" | "agent" | "mcp";
  label?: string;
  description?: string;
  inputs?: Record<string, any>;
  outputs?: Record<string, any>;
  enabled?: boolean;
}) {
  return {
    id: config.id,
    type: config.type || "utility",
    label: config.label || `Mock Tool ${config.id}`,
    description: config.description || "Mock tool for testing",
    version: "1.0.0",
    inputs: config.inputs || {},
    outputs: config.outputs || {},
    execute: vi.fn().mockResolvedValue({ success: true }),
    tags: ["mock", "test"],
    enabled: config.enabled !== false,
    mobileOptimized: true,
    requiresAuth: false,
    rateLimit: {
      requests: 100,
      window: 60,
    },
  };
}

/**
 * 🔧 Create Mock AI Provider
 */
export function createMockAIProvider(config: {
  id: string;
  name?: string;
  capabilities?: any[];
}) {
  return {
    id: config.id,
    name: config.name || `Mock Provider ${config.id}`,
    description: "Mock AI provider for testing",
    capabilities: config.capabilities || [
      {
        type: "chat",
        models: ["mock-model"],
        maxTokens: 1000,
        supportsStreaming: true,
      },
    ],
    isAvailable: vi.fn().mockResolvedValue(true),
    testConnection: vi.fn().mockResolvedValue(true),
  };
}

/**
 * 🔧 Create Mock Mode Config
 */
export function createMockModeConfig(config: {
  id: string;
  label?: string;
  allowedTools?: string[];
  aiProvider?: string;
}) {
  return {
    id: config.id,
    label: config.label || `Mock Mode ${config.id}`,
    description: "Mock mode for testing",
    icon: "test",
    contextScope: "session" as const,
    allowedTools: config.allowedTools || [],
    aiProvider: config.aiProvider || "mock-provider",
    aiModel: "mock-model",
    memoryEnabled: true,
    autoExecute: false,
    mobileOptimized: true,
    settings: {},
  };
}

/**
 * 🔧 Wait for Async Operations
 */
export function waitFor(
  condition: () => boolean,
  timeout = 1000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error("Timeout waiting for condition"));
      } else {
        setTimeout(check, 10);
      }
    };

    check();
  });
}

/**
 * 🔧 Mock Fetch Response
 */
export function mockFetchResponse(data: any, status = 200) {
  (fetch as any).mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
}

/**
 * 🔧 Mock Fetch Error
 */
export function mockFetchError(error: string, status = 500) {
  (fetch as any).mockRejectedValue(new Error(error));
}

/**
 * 🔧 Clear All Mocks
 */
export function clearAllMocks() {
  vi.clearAllMocks();
  localStorage.clear();
  (fetch as any).mockClear();
}

/**
 * 🔧 Reset All Mocks
 */
export function resetAllMocks() {
  vi.resetAllMocks();
  localStorage.clear();
  (fetch as any).mockReset();
}

// ===== GLOBAL TEST CONSTANTS =====

export const TEST_CONSTANTS = {
  TIMEOUTS: {
    SHORT: 100,
    MEDIUM: 500,
    LONG: 1000,
    VERY_LONG: 5000,
  },
  MOCK_DATA: {
    SAMPLE_TEXT: "This is a sample text for testing purposes.",
    SAMPLE_JSON: { key: "value", number: 42, boolean: true },
    SAMPLE_ARRAY: [1, 2, 3, 4, 5],
    SAMPLE_FILE_PATH: "test/sample.md",
    SAMPLE_CONTENT: "# Test Document\n\nThis is a test document.",
  },
  API_RESPONSES: {
    SUCCESS: { success: true, data: "test data" },
    ERROR: { success: false, error: "test error" },
    EMPTY: { success: true, data: null },
  },
} as const;

// ===== GLOBAL TEST HELPERS =====

/**
 * 🔧 Assert Async Success
 */
export async function assertAsyncSuccess<T>(
  promise: Promise<{ success: boolean; data?: T; error?: string }>
): Promise<T> {
  const result = await promise;
  expect(result.success).toBe(true);
  expect(result.data).toBeDefined();
  return result.data!;
}

/**
 * 🔧 Assert Async Error
 */
export async function assertAsyncError(
  promise: Promise<{ success: boolean; data?: any; error?: string }>,
  expectedError?: string
): Promise<string> {
  const result = await promise;
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
  if (expectedError) {
    expect(result.error).toContain(expectedError);
  }
  return result.error!;
}

/**
 * 🔧 Create Test Environment
 */
export function createTestEnvironment() {
  const mockApp = createMockApp();

  return {
    app: mockApp,
    utils: {
      createMockContext,
      createMockToolManifest,
      createMockAIProvider,
      createMockModeConfig,
      waitFor,
      mockFetchResponse,
      mockFetchError,
      clearAllMocks,
      resetAllMocks,
      assertAsyncSuccess,
      assertAsyncError,
    },
    constants: TEST_CONSTANTS,
  };
}

// ===== GLOBAL TEST HOOKS =====

beforeEach(() => {
  clearAllMocks();
});

afterEach(() => {
  resetAllMocks();
});

// Export test utilities globally for convenience
declare global {
  namespace Vi {
    interface JestAssertion<T = any> {
      toBeAsyncSuccess(): T;
      toBeAsyncError(expectedError?: string): string;
    }
  }
}

// Add custom matchers
expect.extend({
  toBeAsyncSuccess(received) {
    const pass = received.success === true && received.data !== undefined;
    return {
      pass,
      message: () =>
        `Expected async result to be successful, but got ${JSON.stringify(
          received
        )}`,
    };
  },
  toBeAsyncError(received, expectedError?: string) {
    const pass = received.success === false && received.error !== undefined;
    const errorMatch = expectedError
      ? received.error?.includes(expectedError)
      : true;

    return {
      pass: pass && errorMatch,
      message: () =>
        `Expected async result to be an error${
          expectedError ? ` containing "${expectedError}"` : ""
        }, but got ${JSON.stringify(received)}`,
    };
  },
});
