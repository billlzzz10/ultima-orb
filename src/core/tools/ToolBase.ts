export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  version: string;
  author: string;
  tags: string[];
  commands?: Array<{
    name: string;
    description: string;
    parameters: Record<
      string,
      {
        type: string;
        required: boolean;
        description: string;
      }
    >;
  }>;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  timestamp: Date;
}

export abstract class ToolBase {
  protected metadata: ToolMetadata;
  protected isEnabled: boolean = true;
  protected isInitialized: boolean = false;

  constructor(metadata: ToolMetadata) {
    this.metadata = metadata;
  }

  // Abstract method that must be implemented by subclasses
  abstract execute(params: any): Promise<any>;

  // Get tool metadata
  getMetadata(): ToolMetadata {
    return this.metadata;
  }

  // Get tool ID
  getId(): string {
    return this.metadata.id;
  }

  // Get tool name
  getName(): string {
    return this.metadata.name;
  }

  // Get tool description
  getDescription(): string {
    return this.metadata.description;
  }

  // Get tool category
  getCategory(): string {
    return this.metadata.category;
  }

  // Get tool icon
  getIcon(): string {
    return this.metadata.icon;
  }

  // Get tool version
  getVersion(): string {
    return this.metadata.version;
  }

  // Get tool author
  getAuthor(): string {
    return this.metadata.author;
  }

  // Get tool tags
  getTags(): string[] {
    return this.metadata.tags;
  }

  // Check if tool is enabled
  isToolEnabled(): boolean {
    return this.isEnabled;
  }

  // Enable tool
  enable(): void {
    this.isEnabled = true;
  }

  // Disable tool
  disable(): void {
    this.isEnabled = false;
  }

  // Check if tool is initialized
  isToolInitialized(): boolean {
    return this.isInitialized;
  }

  // Initialize tool (can be overridden by subclasses)
  async initialize(): Promise<void> {
    this.isInitialized = true;
  }

  // Cleanup tool (can be overridden by subclasses)
  async cleanup(): Promise<void> {
    this.isInitialized = false;
  }

  // Validate parameters (can be overridden by subclasses)
  validateParams(params: any): boolean {
    return params !== null && params !== undefined;
  }

  // Get tool status
  getStatus(): any {
    return {
      id: this.metadata.id,
      name: this.metadata.name,
      enabled: this.isEnabled,
      initialized: this.isInitialized,
      version: this.metadata.version,
      category: this.metadata.category,
    };
  }

  // Create success result
  protected createSuccessResult(data?: any, message?: string): ToolResult {
    const result: ToolResult = {
      success: true,
      timestamp: new Date(),
    };
    if (data) {
      result.data = data;
    }
    if (message) {
      result.message = message;
    }
    return result;
  }

  // Create error result
  protected createErrorResult(error: string, data?: any): ToolResult {
    return {
      success: false,
      error,
      data,
      timestamp: new Date(),
    };
  }

  // Log tool execution
  protected logExecution(action: string, params: any, result: any): void {
    console.info(`[${this.metadata.name}] ${action}:`, {
      params,
      result,
      timestamp: new Date(),
    });
  }

  // Get tool info for display
  getToolInfo(): any {
    return {
      ...this.metadata,
      enabled: this.isEnabled,
      initialized: this.isInitialized,
      status: this.getStatus(),
    };
  }

  // Export tool configuration
  exportConfig(): any {
    return {
      metadata: this.metadata,
      enabled: this.isEnabled,
      initialized: this.isInitialized,
    };
  }

  // Import tool configuration
  importConfig(config: any): void {
    if (config.metadata) {
      this.metadata = { ...this.metadata, ...config.metadata };
    }
    if (config.enabled !== undefined) {
      this.isEnabled = config.enabled;
    }
    if (config.initialized !== undefined) {
      this.isInitialized = config.initialized;
    }
  }

  // Check if tool supports a specific feature
  supportsFeature(feature: string): boolean {
    // Can be overridden by subclasses to provide feature support information
    return false;
  }

  // Get tool capabilities
  getCapabilities(): string[] {
    // Can be overridden by subclasses to provide capability information
    return [];
  }

  // Get tool requirements
  getRequirements(): any {
    // Can be overridden by subclasses to provide requirement information
    return {
      permissions: [],
      dependencies: [],
      system: {
        os: [],
        memory: 0,
        storage: 0,
      },
    };
  }

  // Test tool functionality
  async test(): Promise<ToolResult> {
    try {
      // Basic test - try to execute with empty parameters
      const result = await this.execute({});
      return this.createSuccessResult(
        result,
        "Tool test completed successfully"
      );
    } catch (error) {
      return this.createErrorResult(
        error instanceof Error ? error.message : String(error),
        "Tool test failed"
      );
    }
  }

  // Get tool documentation
  getDocumentation(): any {
    return {
      name: this.metadata.name,
      description: this.metadata.description,
      version: this.metadata.version,
      author: this.metadata.author,
      category: this.metadata.category,
      tags: this.metadata.tags,
      capabilities: this.getCapabilities(),
      requirements: this.getRequirements(),
      examples: this.getExamples(),
      api: this.getAPI(),
    };
  }

  // Get tool examples (can be overridden by subclasses)
  protected getExamples(): any[] {
    return [];
  }

  // Get tool API documentation (can be overridden by subclasses)
  protected getAPI(): any {
    return {
      execute: {
        description: "Execute the tool with given parameters",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
        returns: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: { type: "any" },
            error: { type: "string" },
            message: { type: "string" },
            timestamp: { type: "Date" },
          },
        },
      },
    };
  }

  // Clone tool
  clone(): ToolBase {
    const cloned = Object.create(Object.getPrototypeOf(this));
    Object.assign(cloned, this);
    cloned.metadata = { ...this.metadata };
    cloned.metadata.id = `${this.metadata.id}_clone_${Date.now()}`;
    return cloned;
  }

  // Compare with another tool
  equals(other: ToolBase): boolean {
    return this.metadata.id === other.metadata.id;
  }

  // Get tool hash
  getHash(): string {
    return `${this.metadata.id}_${this.metadata.version}_${this.metadata.author}`;
  }

  // Serialize tool
  serialize(): string {
    return JSON.stringify({
      metadata: this.metadata,
      enabled: this.isEnabled,
      initialized: this.isInitialized,
    });
  }

  // Deserialize tool
  deserialize(data: string): void {
    const config = JSON.parse(data);
    this.importConfig(config);
  }

  // Get tool metrics
  getMetrics(): any {
    return {
      id: this.metadata.id,
      name: this.metadata.name,
      category: this.metadata.category,
      version: this.metadata.version,
      enabled: this.isEnabled,
      initialized: this.isInitialized,
      timestamp: new Date(),
    };
  }

  // Update tool metadata
  updateMetadata(updates: Partial<ToolMetadata>): void {
    this.metadata = { ...this.metadata, ...updates };
  }

  // Add tag to tool
  addTag(tag: string): void {
    if (!this.metadata.tags.includes(tag)) {
      this.metadata.tags.push(tag);
    }
  }

  // Remove tag from tool
  removeTag(tag: string): void {
    this.metadata.tags = this.metadata.tags.filter((t) => t !== tag);
  }

  // Check if tool has tag
  hasTag(tag: string): boolean {
    return this.metadata.tags.includes(tag);
  }

  // Get tools by category
  static getToolsByCategory(tools: ToolBase[], category: string): ToolBase[] {
    return tools.filter((tool) => tool.getCategory() === category);
  }

  // Get tools by tag
  static getToolsByTag(tools: ToolBase[], tag: string): ToolBase[] {
    return tools.filter((tool) => tool.hasTag(tag));
  }

  // Get enabled tools
  static getEnabledTools(tools: ToolBase[]): ToolBase[] {
    return tools.filter((tool) => tool.isToolEnabled());
  }

  // Get initialized tools
  static getInitializedTools(tools: ToolBase[]): ToolBase[] {
    return tools.filter((tool) => tool.isToolInitialized());
  }

  // Sort tools by name
  static sortToolsByName(tools: ToolBase[]): ToolBase[] {
    return tools.sort((a, b) => a.getName().localeCompare(b.getName()));
  }

  // Sort tools by category
  static sortToolsByCategory(tools: ToolBase[]): ToolBase[] {
    return tools.sort((a, b) => a.getCategory().localeCompare(b.getCategory()));
  }

  // Get unique categories
  static getUniqueCategories(tools: ToolBase[]): string[] {
    const categories = tools.map((tool) => tool.getCategory());
    return [...new Set(categories)];
  }

  // Get unique tags
  static getUniqueTags(tools: ToolBase[]): string[] {
    const tags = tools.flatMap((tool) => tool.getTags());
    return [...new Set(tags)];
  }
}
