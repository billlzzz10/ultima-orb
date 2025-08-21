/**
 * 🔮 Ultima-Orb Types Index
 * Export all type definitions for the plugin ecosystem
 */

// Core API Types
export * from "./api";

// Notion Types
export * from "./notion";
export * from "./notion-api";

// MCP Types
export interface MCPTypes {
  notion: any;
  clickup: any;
  airtable: any;
  github: any;
  gitlab: any;
  slack: any;
  discord: any;
  telegram: any;
  email: any;
  calendar: any;
  drive: any;
  dropbox: any;
  onedrive: any;
  trello: any;
  asana: any;
  jira: any;
  linear: any;
  figma: any;
  canva: any;
  zapier: any;
  ifttt: any;
  webhook: any;
  custom: any;
}

export interface NotionMCP {
  client: any;
  connection: any;
  database: any;
  page: any;
  block: any;
}

export interface ClickUpMCP {
  client: any;
  connection: any;
  task: any;
  list: any;
  space: any;
}

export interface AirtableMCP {
  client: any;
  connection: any;
  base: any;
  table: any;
  record: any;
}

// Notion Types (re-declared for clarity)
export interface NotionDatabase {
  id: string;
  title: string;
  properties: Record<string, any>;
  created_time: string;
  last_edited_time: string;
}

export interface NotionPage {
  id: string;
  title: string;
  properties: Record<string, any>;
  created_time: string;
  last_edited_time: string;
}

export interface NotionBlock {
  id: string;
  type: string;
  content: any;
  created_time: string;
  last_edited_time: string;
}

// ClickUp Types
export interface ClickUpTask {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: number;
  due_date: string;
  created_date: string;
  updated_date: string;
}

export interface ClickUpList {
  id: string;
  name: string;
  task_count: number;
  created_date: string;
  updated_date: string;
}

export interface ClickUpSpace {
  id: string;
  name: string;
  list_count: number;
  created_date: string;
  updated_date: string;
}

// Airtable Types
export interface AirtableBase {
  id: string;
  name: string;
  description: string;
  table_count: number;
  created_time: string;
  updated_time: string;
}

export interface AirtableTable {
  id: string;
  name: string;
  description: string;
  field_count: number;
  record_count: number;
  created_time: string;
  updated_time: string;
}

export interface AirtableField {
  id: string;
  name: string;
  type: string;
  description: string;
  options?: any;
}

export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  created_time: string;
  updated_time: string;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type EventCallback<T = any> = (data: T) => void;

export type AsyncResult<T> = Promise<{
  success: boolean;
  data?: T;
  error?: string;
}>;

// Configuration Types
export interface PluginConfig {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export interface FeatureConfig {
  enabled: boolean;
  maxUsage: number;
  currentUsage: number;
  lastUsed?: Date;
}

export interface AIConfig {
  providers: Record<string, any>;
  defaultProvider: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export interface KnowledgeConfig {
  sources: string[];
  maxDocuments: number;
  embeddingModel: string;
  similarityThreshold: number;
}

export interface AgentConfig {
  maxAgents: number;
  maxSteps: number;
  timeout: number;
  retryAttempts: number;
}

export interface CommandConfig {
  maxCommands: number;
  maxParameters: number;
  timeout: number;
}

export interface IntegrationConfig {
  notion: NotionConfig;
  clickup: ClickUpConfig;
  airtable: AirtableConfig;
}

export interface NotionConfig {
  apiKey: string;
  databaseId: string;
  pageId: string;
  syncInterval: number;
}

export interface ClickUpConfig {
  apiKey: string;
  workspaceId: string;
  projectId: string;
  syncInterval: number;
}

export interface AirtableConfig {
  apiKey: string;
  baseId: string;
  tableId: string;
  syncInterval: number;
}

export interface UIConfig {
  theme: string;
  language: string;
  layout: string;
  animations: boolean;
}

// Error Types
export interface PluginError {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: Date;
  stack?: string;
}

export type ErrorCode =
  | "INVALID_API_KEY"
  | "CONNECTION_FAILED"
  | "RATE_LIMIT_EXCEEDED"
  | "INVALID_REQUEST"
  | "PERMISSION_DENIED"
  | "RESOURCE_NOT_FOUND"
  | "INTERNAL_ERROR"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "VALIDATION_ERROR";

// Event Types (re-declared for clarity in this section)
export interface PluginEvent {
  type: EventType;
  data: any;
  timestamp: Date;
  source: string;
  userId?: string;
  sessionId?: string;
}

export type EventType =
  | "plugin:loaded"
  | "plugin:unloaded"
  | "feature:enabled"
  | "feature:disabled"
  | "ai:request"
  | "ai:response"
  | "agent:started"
  | "agent:completed"
  | "agent:failed"
  | "command:executed"
  | "knowledge:indexed"
  | "knowledge:searched"
  | "integration:connected"
  | "integration:disconnected"
  | "error:occurred"
  | "warning:shown"
  | "info:logged";

// Performance Types
export interface PerformanceMetrics {
  memory: MemoryMetrics;
  cpu: CPUMetrics;
  network: NetworkMetrics;
  operations: OperationMetrics;
  timestamp: Date;
}

export interface MemoryMetrics {
  used: number;
  total: number;
  percentage: number;
  peak: number;
}

export interface CPUMetrics {
  usage: number;
  cores: number;
  temperature?: number;
}

export interface NetworkMetrics {
  requests: number;
  responses: number;
  errors: number;
  latency: number;
  bandwidth: number;
}

export interface OperationMetrics {
  total: number;
  successful: number;
  failed: number;
  averageTime: number;
  maxTime: number;
  minTime: number;
}

// Logging Types
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  source: string;
  context?: Record<string, any>;
  error?: Error;
}

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LoggerConfig {
  level: LogLevel;
  format: string;
  output: string[];
  maxSize: number;
  maxFiles: number;
  enableConsole: boolean;
  enableFile: boolean;
}
