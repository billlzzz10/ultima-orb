/**
 * 🔮 Ultima-Orb API Definitions
 * Type definitions for Ultima-Orb plugin ecosystem
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export interface PluginState {
  ai: AIState;
  mcp: MCPState;
  knowledge: KnowledgeState;
  agents: AgentState;
  commands: CommandState;
  features: FeatureState;
}

export interface AIState {
  providers: {
    openai: AIProvider;
    claude: AIProvider;
    gemini: AIProvider;
    ollama: AIProvider;
    anythingllm: AIProvider;
  };
  activeProvider: string;
  maxMode: boolean;
  usage: {
    totalRequests: number;
    totalTokens: number;
    monthlyRequests: number;
    monthlyTokens: number;
  };
}

export interface AIProvider {
  connected: boolean;
  apiKey: string;
  model: string;
  url?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface MCPState {
  notion: MCPConnection;
  clickup: MCPConnection;
  airtable: MCPConnection;
  github: MCPConnection;
  gitlab: MCPConnection;
  slack: MCPConnection;
  discord: MCPConnection;
  telegram: MCPConnection;
  email: MCPConnection;
  calendar: MCPConnection;
  drive: MCPConnection;
  dropbox: MCPConnection;
  onedrive: MCPConnection;
  trello: MCPConnection;
  asana: MCPConnection;
  jira: MCPConnection;
  linear: MCPConnection;
  figma: MCPConnection;
  canva: MCPConnection;
  zapier: MCPConnection;
  ifttt: MCPConnection;
  webhook: MCPConnection;
  custom: MCPConnection;
}

export interface MCPConnection {
  connected: boolean;
  url: string;
  type: "Streamable HTTP" | "SSE" | "STDIO";
  apiKey?: string;
  lastSync?: Date;
}

export interface KnowledgeState {
  totalDocuments: number;
  indexedFiles: number;
  embeddings: number;
  lastSync: Date | null;
  sources: {
    obsidian: KnowledgeSource;
    notion: KnowledgeSource;
    web: KnowledgeSource;
    local: KnowledgeSource;
  };
  maxMode: boolean;
}

export interface KnowledgeSource {
  active: boolean;
  count: number;
  lastIndexed?: Date;
}

export interface AgentState {
  flowMode: AgentFlowMode;
  buildMode: AgentBuildMode;
  maxMode: boolean;
}

export interface AgentFlowMode {
  active: boolean;
  totalFlows: number;
  activeFlows: number;
  completedFlows: number;
  successRate: number;
}

export interface AgentBuildMode {
  active: boolean;
  totalAgents: number;
  activeAgents: number;
  templates: number;
}

export interface CommandState {
  total: number;
  custom: number;
  mostUsed: string;
  categories: {
    ai: number;
    file: number;
    data: number;
    code: number;
    integration: number;
    custom: number;
  };
  maxMode: boolean;
}

export interface FeatureState {
  free: {
    ai: boolean;
    knowledge: boolean;
    agents: boolean;
    commands: boolean;
    mcp: boolean;
  };
  max: {
    advancedAI: boolean;
    collaboration: boolean;
    analytics: boolean;
    customIntegrations: boolean;
  };
}

// ============================================================================
// TOOL TYPES
// ============================================================================

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  type: ToolType;
  status: ToolStatus;
  version: string;
  author: string;
  tags: string[];
  dependencies: string[];
  configuration: ToolConfiguration;
  usage: ToolUsage;
  createdAt: Date;
  updatedAt: Date;
  lastUsed?: Date;
}

export type ToolCategory = 
  | "ai" 
  | "file" 
  | "data" 
  | "code" 
  | "integration" 
  | "productivity" 
  | "visualization" 
  | "automation" 
  | "custom";

export type ToolType = 
  | "command" 
  | "function" 
  | "template" 
  | "workflow" 
  | "integration" 
  | "visualization";

export type ToolStatus = 
  | "active" 
  | "inactive" 
  | "deprecated" 
  | "experimental" 
  | "beta";

export interface ToolConfiguration {
  parameters: ToolParameter[];
  settings: Record<string, any>;
  permissions: string[];
}

export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  required: boolean;
  default?: any;
  description: string;
}

export interface ToolUsage {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecuted?: Date;
}

export interface ToolDatabase {
  tools: Tool[];
  categories: ToolCategory[];
  totalTools: number;
  lastUpdated: Date;
}

// ============================================================================
// AI TYPES
// ============================================================================

export interface AIRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  provider?: string;
  context?: string;
  history?: AIMessage[];
}

export interface AIResponse {
  content: string;
  model: string;
  provider: string;
  tokens: number;
  latency: number;
  timestamp: Date;
}

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  model: string;
  provider: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// AGENT TYPES
// ============================================================================

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  status: AgentStatus;
  configuration: AgentConfiguration;
  execution: AgentExecution;
  createdAt: Date;
  updatedAt: Date;
}

export type AgentType = "flow" | "build" | "custom";

export type AgentStatus = "idle" | "running" | "completed" | "failed" | "paused";

export interface AgentConfiguration {
  steps: AgentStep[];
  triggers: AgentTrigger[];
  conditions: AgentCondition[];
  actions: AgentAction[];
}

export interface AgentStep {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
  order: number;
  required: boolean;
}

export interface AgentTrigger {
  type: "event" | "schedule" | "manual" | "condition";
  parameters: Record<string, any>;
}

export interface AgentCondition {
  type: "if" | "while" | "for";
  expression: string;
  parameters: Record<string, any>;
}

export interface AgentAction {
  type: "ai" | "file" | "data" | "integration" | "custom";
  parameters: Record<string, any>;
}

export interface AgentExecution {
  id: string;
  agentId: string;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  steps: StepExecution[];
  result?: any;
  error?: string;
}

export type ExecutionStatus = "running" | "completed" | "failed" | "paused";

export interface StepExecution {
  id: string;
  name: string;
  status: "running" | "completed" | "failed";
  startTime: Date;
  endTime?: Date;
  result?: any;
  error?: string;
}

// ============================================================================
// COMMAND TYPES
// ============================================================================

export interface Command {
  id: string;
  name: string;
  description: string;
  category: CommandCategory;
  type: CommandType;
  parameters: CommandParameter[];
  permissions: string[];
  usage: CommandUsage;
  createdAt: Date;
  updatedAt: Date;
}

export type CommandCategory = 
  | "ai" 
  | "file" 
  | "data" 
  | "code" 
  | "integration" 
  | "productivity" 
  | "custom";

export type CommandType = 
  | "function" 
  | "workflow" 
  | "template" 
  | "integration";

export interface CommandParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object" | "file";
  required: boolean;
  default?: any;
  description: string;
}

export interface CommandUsage {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecuted?: Date;
}

// ============================================================================
// KNOWLEDGE TYPES
// ============================================================================

export interface Document {
  id: string;
  title: string;
  content: string;
  source: DocumentSource;
  type: DocumentType;
  metadata: DocumentMetadata;
  embeddings: number[];
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentSource = "obsidian" | "notion" | "web" | "local";

export type DocumentType = "markdown" | "text" | "pdf" | "html" | "json";

export interface DocumentMetadata {
  path?: string;
  tags: string[];
  author?: string;
  language?: string;
  size: number;
  wordCount: number;
}

export interface KnowledgeQuery {
  query: string;
  filters?: KnowledgeFilter;
  limit?: number;
  threshold?: number;
}

export interface KnowledgeFilter {
  sources?: DocumentSource[];
  types?: DocumentType[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface KnowledgeResult {
  documents: Document[];
  score: number;
  query: string;
  timestamp: Date;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export interface Event {
  type: string;
  data: any;
  timestamp: Date;
  source: string;
}

export type EventType = 
  | "tool:created"
  | "tool:updated"
  | "tool:deleted"
  | "agent:started"
  | "agent:completed"
  | "agent:failed"
  | "command:executed"
  | "knowledge:indexed"
  | "mcp:connected"
  | "mcp:disconnected"
  | "state:updated"
  | "error:occurred";

// ============================================================================
// API INTERFACES
// ============================================================================

export interface SynapseCoreAPI {
  // Plugin State Management
  getPluginState(): PluginState;
  updatePluginState(state: Partial<PluginState>): void;
  
  // Feature Management
  hasFeature(feature: string): boolean;
  checkFeatureLimit(feature: string, currentUsage: number): boolean;
  
  // Tool Database Management
  getToolDatabase(): ToolDatabase;
  updateToolInDatabase(tool: Tool): void;
  createTool(tool: Omit<Tool, "id" | "createdAt" | "updatedAt">): Tool;
  deleteTool(toolId: string): boolean;
  
  // MCP Integration
  getNotionClient(): any;
  updateNotionDatabase(tool: Tool): Promise<void>;
  syncToolsWithNotion(): Promise<void>;
  getMCPManager(): any;
  connectToService(service: string): Promise<boolean>;
  
  // Storage
  getStorage(): any;
  saveData(key: string, data: any): void;
  loadData(key: string): any;
  
  // Events
  subscribe(event: string, callback: Function): void;
  publish(event: string, data: any): void;
  unsubscribe(event: string, callback: Function): void;
}

export interface UltimaOrbAPI {
  // AI Features
  getAIFeatures(): any;
  generateResponse(request: AIRequest): Promise<AIResponse>;
  createConversation(title: string): AIConversation;
  getConversation(id: string): AIConversation | null;
  
  // Agent Management
  getAgentMode(): any;
  createAgent(config: AgentConfiguration): Agent;
  executeAgent(agentId: string): Promise<AgentExecution>;
  
  // Command Management
  getAtCommands(): any;
  registerCommand(command: Command): void;
  executeCommand(commandId: string, parameters?: Record<string, any>): Promise<any>;
  
  // Knowledge Management
  indexDocument(document: Document): Promise<void>;
  searchKnowledge(query: KnowledgeQuery): Promise<KnowledgeResult>;
  
  // Cursor Features
  getCursorFeatures(): any;
  plan(): Promise<string>;
  search(): Promise<string>;
  build(): Promise<string>;
  doAnything(request: string): Promise<string>;
  
  // Synapse-Core Integration
  getSynapseCoreAdapter(): any;
  isSynapseCoreConnected(): boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type EventCallback<T = any> = (data: T) => void;

export type AsyncResult<T> = Promise<{ success: boolean; data?: T; error?: string }>;
