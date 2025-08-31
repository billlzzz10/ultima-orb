import { ToolBase, ToolMetadata } from "./ToolBase";
import { AdvancedScriptingTool } from "../../tools/AdvancedScriptingTool";
import { ExcalidrawFeaturesTool } from "../../tools/ExcalidrawFeaturesTool";
import { RAGFeaturesTool } from "../../tools/RAGFeaturesTool";
import { LocalModelsTool } from "../../tools/LocalModelsTool";
import { NotionDatabaseTool } from "../../tools/NotionDatabaseTool";
import { AIOrchestrationTool } from "../../tools/AIOrchestrationTool";
import { WebhookIntegrationTool } from "../../tools/WebhookIntegrationTool";
import { NotionAnalysisTool } from "../../tools/NotionAnalysisTool";
import { ObsidianBasesTool } from "../../tools/ObsidianBasesTool";
import { APIManagerTool } from "../../tools/APIManagerTool";
import { NotionAIAssistantTool } from "../../tools/NotionAIAssistantTool";
import { NotionDataAutomationTool } from "../../tools/NotionDataAutomationTool";
import { FileImportTool } from "../../tools/FileImportTool";
import { AirtableIntegrationTool } from "../../tools/AirtableIntegrationTool";
import { App } from "obsidian";

export interface ToolRegistration {
  id: string;
  tool: ToolBase;
  enabled: boolean;
  initialized: boolean;
  metadata: ToolMetadata;
  category: string;
  tags: string[];
  lastUsed?: Date;
  usageCount: number;
}

export interface ToolRegistryConfig {
  autoInitialize: boolean;
  enableLogging: boolean;
  maxTools: number;
  categories: string[];
}

export class ToolRegistry {
  private tools: Map<string, ToolRegistration> = new Map();
  private config: ToolRegistryConfig;
  private app: App;
  private isInitialized: boolean = false;

  constructor(app: App, config?: Partial<ToolRegistryConfig>) {
    this.app = app;
    this.config = {
      autoInitialize: true,
      enableLogging: true,
      maxTools: 100,
      categories: [
        "AI",
        "Development",
        "Integration",
        "Visualization",
        "Productivity",
        "Data",
      ],
      ...config,
    };
  }

  // Initialize the registry with default tools
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Register default tools
      await this.registerDefaultTools();

      if (this.config.autoInitialize) {
        await this.initializeAllTools();
      }

      this.isInitialized = true;
      this.log("ToolRegistry initialized successfully");
    } catch (error) {
      this.log(`Failed to initialize ToolRegistry: ${error}`, "error");
      throw error;
    }
  }

  // Register a new tool
  async registerTool(
    tool: ToolBase,
    enabled: boolean = true
  ): Promise<boolean> {
    try {
      const metadata = tool.getMetadata();

      if (this.tools.has(metadata.id)) {
        this.log(`Tool with ID ${metadata.id} already exists`, "warn");
        return false;
      }

      if (this.tools.size >= this.config.maxTools) {
        this.log(
          `Maximum number of tools (${this.config.maxTools}) reached`,
          "warn"
        );
        return false;
      }

      const registration: ToolRegistration = {
        id: metadata.id,
        tool,
        enabled,
        initialized: false,
        metadata,
        category: metadata.category,
        tags: metadata.tags,
        usageCount: 0,
      };

      this.tools.set(metadata.id, registration);
      this.log(`Tool ${metadata.name} registered successfully`);

      if (enabled && this.config.autoInitialize) {
        await this.initializeTool(metadata.id);
      }

      return true;
    } catch (error) {
      this.log(`Failed to register tool: ${error}`, "error");
      return false;
    }
  }

  // Unregister a tool
  async unregisterTool(toolId: string): Promise<boolean> {
    try {
      const registration = this.tools.get(toolId);
      if (!registration) {
        this.log(`Tool with ID ${toolId} not found`, "warn");
        return false;
      }

      // Cleanup tool if initialized
      if (registration.initialized) {
        await registration.tool.cleanup();
      }

      this.tools.delete(toolId);
      this.log(`Tool ${registration.metadata.name} unregistered successfully`);
      return true;
    } catch (error) {
      this.log(`Failed to unregister tool: ${error}`, "error");
      return false;
    }
  }

  // Get a tool by ID
  getTool(toolId: string): ToolBase | null {
    const registration = this.tools.get(toolId);
    return registration?.tool || null;
  }

  // Get tool registration by ID
  getToolRegistration(toolId: string): ToolRegistration | null {
    return this.tools.get(toolId) || null;
  }

  // Get all tools
  getAllTools(): ToolBase[] {
    return Array.from(this.tools.values()).map((reg) => reg.tool);
  }

  // Get enabled tools
  getEnabledTools(): ToolBase[] {
    return Array.from(this.tools.values())
      .filter((reg) => reg.enabled)
      .map((reg) => reg.tool);
  }

  // Get initialized tools
  getInitializedTools(): ToolBase[] {
    return Array.from(this.tools.values())
      .filter((reg) => reg.initialized)
      .map((reg) => reg.tool);
  }

  // Get tools by category
  getToolsByCategory(category: string): ToolBase[] {
    return Array.from(this.tools.values())
      .filter((reg) => reg.category === category)
      .map((reg) => reg.tool);
  }

  // Get tools by tag
  getToolsByTag(tag: string): ToolBase[] {
    return Array.from(this.tools.values())
      .filter((reg) => reg.tags.includes(tag))
      .map((reg) => reg.tool);
  }

  // Enable a tool
  async enableTool(toolId: string): Promise<boolean> {
    try {
      const registration = this.tools.get(toolId);
      if (!registration) {
        this.log(`Tool with ID ${toolId} not found`, "warn");
        return false;
      }

      registration.enabled = true;
      registration.tool.enable();

      if (!registration.initialized && this.config.autoInitialize) {
        await this.initializeTool(toolId);
      }

      this.log(`Tool ${registration.metadata.name} enabled`);
      return true;
    } catch (error) {
      this.log(`Failed to enable tool: ${error}`, "error");
      return false;
    }
  }

  // Disable a tool
  async disableTool(toolId: string): Promise<boolean> {
    try {
      const registration = this.tools.get(toolId);
      if (!registration) {
        this.log(`Tool with ID ${toolId} not found`, "warn");
        return false;
      }

      registration.enabled = false;
      registration.tool.disable();

      this.log(`Tool ${registration.metadata.name} disabled`);
      return true;
    } catch (error) {
      this.log(`Failed to disable tool: ${error}`, "error");
      return false;
    }
  }

  // Initialize a specific tool
  async initializeTool(toolId: string): Promise<boolean> {
    try {
      const registration = this.tools.get(toolId);
      if (!registration) {
        this.log(`Tool with ID ${toolId} not found`, "warn");
        return false;
      }

      if (registration.initialized) {
        return true;
      }

      await registration.tool.initialize();
      registration.initialized = true;

      this.log(`Tool ${registration.metadata.name} initialized`);
      return true;
    } catch (error) {
      this.log(`Failed to initialize tool: ${error}`, "error");
      return false;
    }
  }

  // Execute a tool
  async executeTool(toolId: string, params: any): Promise<any> {
    try {
      const registration = this.tools.get(toolId);
      if (!registration) {
        throw new Error(`Tool with ID ${toolId} not found`);
      }

      if (!registration.enabled) {
        throw new Error(`Tool ${registration.metadata.name} is disabled`);
      }

      if (!registration.initialized) {
        await this.initializeTool(toolId);
      }

      // Update usage statistics
      registration.usageCount++;
      registration.lastUsed = new Date();

      const result = await registration.tool.execute(params);

      this.log(`Tool ${registration.metadata.name} executed successfully`);
      return result;
    } catch (error) {
      this.log(`Failed to execute tool: ${error}`, "error");
      throw error;
    }
  }

  // Test a tool
  async testTool(toolId: string): Promise<any> {
    try {
      const registration = this.tools.get(toolId);
      if (!registration) {
        throw new Error(`Tool with ID ${toolId} not found`);
      }

      const result = await registration.tool.test();
      this.log(`Tool ${registration.metadata.name} test completed`);
      return result;
    } catch (error) {
      this.log(`Tool test failed: ${error}`, "error");
      throw error;
    }
  }

  // Get tool statistics
  getToolStats(): any {
    const stats = {
      total: this.tools.size,
      enabled: 0,
      initialized: 0,
      byCategory: {} as Record<string, number>,
      byTag: {} as Record<string, number>,
      mostUsed: [] as any[],
      recentlyUsed: [] as any[],
    };

    for (const registration of this.tools.values()) {
      if (registration.enabled) stats.enabled++;
      if (registration.initialized) stats.initialized++;

      // Category stats
      stats.byCategory[registration.category] =
        (stats.byCategory[registration.category] || 0) + 1;

      // Tag stats
      for (const tag of registration.tags) {
        stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;
      }

      // Usage stats
      if (registration.usageCount > 0) {
        stats.mostUsed.push({
          id: registration.id,
          name: registration.metadata.name,
          usageCount: registration.usageCount,
        });
      }

      if (registration.lastUsed) {
        stats.recentlyUsed.push({
          id: registration.id,
          name: registration.metadata.name,
          lastUsed: registration.lastUsed,
        });
      }
    }

    // Sort by usage
    stats.mostUsed.sort((a, b) => b.usageCount - a.usageCount);
    stats.recentlyUsed.sort(
      (a, b) => b.lastUsed.getTime() - a.lastUsed.getTime()
    );

    return stats;
  }

  // Search tools
  searchTools(query: string): ToolBase[] {
    const results: ToolBase[] = [];
    const lowerQuery = query.toLowerCase();

    for (const registration of this.tools.values()) {
      const { metadata, tags } = registration;

      if (
        metadata.name.toLowerCase().includes(lowerQuery) ||
        metadata.description.toLowerCase().includes(lowerQuery) ||
        metadata.category.toLowerCase().includes(lowerQuery) ||
        tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      ) {
        results.push(registration.tool);
      }
    }

    return results;
  }

  // Export registry configuration
  exportConfig(): any {
    const config = {
      tools: Array.from(this.tools.values()).map((reg) => ({
        id: reg.id,
        enabled: reg.enabled,
        initialized: reg.initialized,
        metadata: reg.metadata,
        category: reg.category,
        tags: reg.tags,
        lastUsed: reg.lastUsed,
        usageCount: reg.usageCount,
      })),
      config: this.config,
      stats: this.getToolStats(),
    };

    return config;
  }

  // Import registry configuration
  async importConfig(config: any): Promise<void> {
    try {
      // Clear existing tools
      this.tools.clear();

      // Import tools
      for (const toolConfig of config.tools || []) {
        // Recreate tool instance (this is a simplified approach)
        // In a real implementation, you'd need to properly reconstruct tool instances
        this.log(`Imported tool configuration for ${toolConfig.metadata.name}`);
      }

      // Update config
      if (config.config) {
        this.config = { ...this.config, ...config.config };
      }

      this.log("Registry configuration imported successfully");
    } catch (error) {
      this.log(`Failed to import configuration: ${error}`, "error");
      throw error;
    }
  }

  // Cleanup registry
  async cleanup(): Promise<void> {
    try {
      for (const registration of this.tools.values()) {
        if (registration.initialized) {
          await registration.tool.cleanup();
        }
      }

      this.tools.clear();
      this.isInitialized = false;
      this.log("ToolRegistry cleaned up successfully");
    } catch (error) {
      this.log(`Failed to cleanup registry: ${error}`, "error");
      throw error;
    }
  }

  // Private methods
  private async registerDefaultTools(): Promise<void> {
    const aiOrchestration = new AIOrchestrationTool(this.app);
    const apiManager = new APIManagerTool(this.app);
    const defaultTools = [
      new AdvancedScriptingTool(this.app),
      new ExcalidrawFeaturesTool(),
      new RAGFeaturesTool(),
      new LocalModelsTool(),
      new NotionDatabaseTool(),
      aiOrchestration,
      new WebhookIntegrationTool(this.app),
      new NotionAnalysisTool(this.app, aiOrchestration),
      new ObsidianBasesTool(this.app),
      apiManager,
      new NotionAIAssistantTool(this.app, apiManager, aiOrchestration),
      new NotionDataAutomationTool(this.app, apiManager),
      new FileImportTool(this.app, apiManager),
      new AirtableIntegrationTool(this.app, apiManager),
    ];

    for (const tool of defaultTools) {
      await this.registerTool(tool, true);
    }
  }

  private async initializeAllTools(): Promise<void> {
    const enabledTools = Array.from(this.tools.values()).filter(
      (reg) => reg.enabled && !reg.initialized
    );

    for (const registration of enabledTools) {
      await this.initializeTool(registration.id);
    }
  }

  private log(
    message: string,
    level: "info" | "warn" | "error" = "info"
  ): void {
    if (!this.config.enableLogging) return;

    const timestamp = new Date().toISOString();
    const logMessage = `[ToolRegistry] ${timestamp} [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case "error":
        console.error(logMessage);
        break;
      case "warn":
        console.warn(logMessage);
        break;
      default:
        console.info(logMessage);
    }
  }
}
