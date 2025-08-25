// 🔮 Core Interfaces for Ultima-Orb

// ===== AI PROVIDER INTERFACES =====
export interface AIProvider {
  id: string;
  name: string;
  description: string;
  capabilities: AICapability[];
  isAvailable(): Promise<boolean>;
  testConnection(): Promise<boolean>;
}

export interface AICapability {
  type: "chat" | "completion" | "embedding" | "image" | "audio";
  models: string[];
  maxTokens?: number;
  supportsStreaming?: boolean;
}

export interface AIRequest {
  provider: string;
  model: string;
  prompt: string;
  context?: string;
  options?: AIRequestOptions;
}

export interface AIRequestOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
}

// ===== TOOL MANIFEST INTERFACES =====
export interface ToolManifest {
  id: string;
  type: "integration" | "utility" | "agent" | "mcp";
  label: string;
  description?: string;
  version: string;
  inputs: Record<string, ToolInput>;
  outputs: Record<string, ToolOutput>;
  execute: (params: Record<string, any>) => Promise<any>;
  tags?: string[];
  enabled?: boolean;
  mobileOptimized?: boolean;
  requiresAuth?: boolean;
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
}

export interface ToolInput {
  type: "string" | "number" | "boolean" | "array" | "object" | "file";
  required: boolean;
  description?: string;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: string[];
  };
}

export interface ToolOutput {
  type: "string" | "number" | "boolean" | "array" | "object" | "file";
  description?: string;
}

// ===== MODE SYSTEM INTERFACES =====
export interface ModeConfig {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  contextScope: "global" | "session" | "tool";
  allowedTools: string[];
  aiProvider: string;
  aiModel?: string;
  memoryEnabled: boolean;
  autoExecute?: boolean;
  mobileOptimized?: boolean;
  settings?: Record<string, any>;
}

export interface ModeContext {
  id: string;
  modeId: string;
  source: "user" | "agent" | "tool";
  scope: "global" | "session" | "tool";
  payload: Record<string, any>;
  createdAt: number;
  expiresAt?: number;
  auditTrail: string[];
  metadata?: Record<string, any>;
}

export interface ModeTransition {
  from: string;
  to: string;
  timestamp: number;
  reason: string;
  context?: Record<string, any>;
}

// ===== CONTEXT MANAGEMENT INTERFACES =====
export interface ContextBoundary {
  id: string;
  source: "user" | "agent" | "tool" | "system";
  scope: "global" | "session" | "tool" | "temporary";
  payload: Record<string, any>;
  createdAt: number;
  expiresAt?: number;
  auditTrail: string[];
  priority: "low" | "medium" | "high" | "critical";
  tags?: string[];
}

export interface ContextQuery {
  scope?: "global" | "session" | "tool" | "temporary";
  source?: string[];
  tags?: string[];
  priority?: string[];
  limit?: number;
  sortBy?: "createdAt" | "priority" | "expiresAt";
  sortOrder?: "asc" | "desc";
}

// ===== RAG MODEL INTERFACES =====
export interface RAGModel {
  id: string;
  name: string;
  type: "local" | "remote";
  size: "tiny" | "small" | "medium" | "large";
  dimensions: number;
  maxTokens: number;
  isMobileOptimized: boolean;
  load(): Promise<void>;
  unload(): Promise<void>;
  embed(text: string): Promise<number[]>;
  search(query: string, documents: string[]): Promise<SearchResult[]>;
}

export interface SearchResult {
  document: string;
  score: number;
  metadata?: Record<string, any>;
}

// ===== AUDIT & LOGGING INTERFACES =====
export interface AuditEvent {
  id: string;
  timestamp: number;
  type: "tool_execution" | "mode_transition" | "context_access" | "error";
  source: string;
  target?: string;
  payload: Record<string, any>;
  duration?: number;
  success: boolean;
  error?: string;
}

export interface AuditHook {
  onToolExecution(
    toolId: string,
    params: any,
    result: any,
    duration: number
  ): void;
  onModeTransition(from: string, to: string, reason: string): void;
  onContextAccess(contextId: string, operation: string): void;
  onError(error: Error, context: Record<string, any>): void;
}

// ===== MOBILE OPTIMIZATION INTERFACES =====
export interface MobileConfig {
  enableOfflineMode: boolean;
  enableLocalRAG: boolean;
  enableBackgroundSync: boolean;
  maxStorageSize: number; // in MB
  compressionLevel: "low" | "medium" | "high";
  cacheStrategy: "memory" | "disk" | "hybrid";
}

export interface OfflineCapability {
  canWorkOffline: boolean;
  requiresSync: boolean;
  syncInterval: number; // in minutes
  maxOfflineDuration: number; // in hours
}

// ===== PLUGIN STATE INTERFACES =====
export interface PluginState {
  version: string;
  mode: string;
  context: Record<string, any>;
  tools: Record<string, boolean>;
  providers: Record<string, boolean>;
  mobile: MobileConfig;
  audit: {
    enabled: boolean;
    retention: number; // in days
  };
}

// ===== UTILITY TYPES =====
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type AsyncResult<T> = Promise<{
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}>;

export type EventHandler<T = any> = (event: T) => void | Promise<void>;

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};
