// 🔮 Core Module Index - Controlled Exports for Ultima-Orb

// ===== INTERFACES =====
export * from "./interfaces";

// ===== CONTEXT MANAGEMENT =====
export { ContextStore } from "./context/ContextStore";

// ===== RAG MODELS =====
export { MobileRAGModel, MobileRAGModelFactory } from "./rag/MobileRAGModel";

// ===== PROVIDERS =====
export {
  ProviderRegistry,
  ProviderFactory,
} from "./providers/ProviderRegistry";

// ===== TOOLS =====
export { ToolRegistry } from "../tools/ToolRegistry";

// ===== MODES =====
export { ModeSystem } from "../ai/ModeSystem";

// ===== UI VIEWS =====
export { FlowDebuggerView } from "../ui/views/FlowDebuggerView";

// ===== UTILITY TYPES =====
export type {
  DeepPartial,
  AsyncResult,
  EventHandler,
  ValidationResult,
} from "./interfaces";

// ===== CORE CONSTANTS =====
export const CORE_VERSION = "1.0.0";
export const SUPPORTED_PROVIDERS = [
  "openai",
  "anthropic",
  "local",
  "groq",
  "ollama",
] as const;
export const SUPPORTED_MODES = [
  "ask",
  "write",
  "learn",
  "research",
  "code",
] as const;
export const SUPPORTED_TOOL_TYPES = [
  "integration",
  "utility",
  "agent",
  "mcp",
] as const;

// ===== CORE CONFIGURATION =====
export const DEFAULT_CONFIG = {
  mobile: {
    enableOfflineMode: true,
    enableLocalRAG: true,
    enableBackgroundSync: false,
    maxStorageSize: 100, // MB
    compressionLevel: "medium" as const,
    cacheStrategy: "hybrid" as const,
  },
  audit: {
    enabled: true,
    retention: 30, // days
  },
  rag: {
    defaultModelSize: "small" as const,
    maxDimensions: 256,
    similarityThreshold: 0.3,
  },
} as const;

// ===== CORE UTILITIES =====
export const CoreUtils = {
  /**
   * 🔧 สร้าง Unique ID
   */
  generateId(): string {
    return `ultima_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * 📊 ตรวจสอบ Mobile Device
   */
  isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  /**
   * 💾 ตรวจสอบ Storage Quota
   */
  async checkStorageQuota(): Promise<{ used: number; available: number }> {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0,
      };
    }
    return { used: 0, available: 0 };
  },

  /**
   * 🔄 Debounce Function
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * 📝 Format Bytes
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  /**
   * 🕒 Format Duration
   */
  formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  },
};

// ===== CORE VALIDATORS =====
export const CoreValidators = {
  /**
   * ✅ ตรวจสอบ Provider ID
   */
  isValidProviderId(id: string): boolean {
    return SUPPORTED_PROVIDERS.includes(id as any);
  },

  /**
   * ✅ ตรวจสอบ Mode ID
   */
  isValidModeId(id: string): boolean {
    return SUPPORTED_MODES.includes(id as any);
  },

  /**
   * ✅ ตรวจสอบ Tool Type
   */
  isValidToolType(type: string): boolean {
    return SUPPORTED_TOOL_TYPES.includes(type as any);
  },

  /**
   * ✅ ตรวจสอบ API Key Format
   */
  isValidApiKey(key: string): boolean {
    return key.length > 0 && /^sk-[a-zA-Z0-9]{32,}$/.test(key);
  },

  /**
   * ✅ ตรวจสอบ URL Format
   */
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};

// ===== CORE EVENTS =====
export const CoreEvents = {
  PROVIDER_REGISTERED: "provider:registered",
  PROVIDER_REMOVED: "provider:removed",
  MODE_CHANGED: "mode:changed",
  TOOL_EXECUTED: "tool:executed",
  CONTEXT_CREATED: "context:created",
  CONTEXT_UPDATED: "context:updated",
  RAG_MODEL_LOADED: "rag:loaded",
  RAG_MODEL_UNLOADED: "rag:unloaded",
  AUDIT_EVENT: "audit:event",
} as const;

// ===== CORE ERROR TYPES =====
export class CoreError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "CoreError";
  }
}

export class ProviderError extends CoreError {
  constructor(
    message: string,
    providerId: string,
    details?: Record<string, any>
  ) {
    super(message, "PROVIDER_ERROR", { providerId, ...details });
    this.name = "ProviderError";
  }
}

export class ToolError extends CoreError {
  constructor(message: string, toolId: string, details?: Record<string, any>) {
    super(message, "TOOL_ERROR", { toolId, ...details });
    this.name = "ToolError";
  }
}

export class ContextError extends CoreError {
  constructor(
    message: string,
    contextId: string,
    details?: Record<string, any>
  ) {
    super(message, "CONTEXT_ERROR", { contextId, ...details });
    this.name = "ContextError";
  }
}

// ===== CORE LOGGER =====
export class CoreLogger {
  private static instance: CoreLogger;
  private logLevel: "debug" | "info" | "warn" | "error" = "info";

  private constructor() {}

  static getInstance(): CoreLogger {
    if (!CoreLogger.instance) {
      CoreLogger.instance = new CoreLogger();
    }
    return CoreLogger.instance;
  }

  setLogLevel(level: "debug" | "info" | "warn" | "error"): void {
    this.logLevel = level;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog("debug")) {
      console.debug(`[Ultima-Orb Debug] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog("info")) {
      console.info(`[Ultima-Orb Info] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog("warn")) {
      console.warn(`[Ultima-Orb Warn] ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog("error")) {
      console.error(`[Ultima-Orb Error] ${message}`, ...args);
    }
  }

  private shouldLog(level: "debug" | "info" | "warn" | "error"): boolean {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.logLevel];
  }
}

// ===== DEFAULT EXPORT =====
export default {
  version: CORE_VERSION,
  utils: CoreUtils,
  validators: CoreValidators,
  events: CoreEvents,
  logger: CoreLogger.getInstance(),
  config: DEFAULT_CONFIG,
};
