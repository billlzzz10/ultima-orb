import { App, Notice } from "obsidian";
import { 
  SynapseCoreAPI, 
  PluginState, 
  Tool, 
  ToolDatabase,
  EventCallback,
  AsyncResult 
} from "../types/api";

/**
 * 🔗 Synapse-Core Adapter - เชื่อมต่อ Ultima-Orb กับ Synapse-Core API
 *
 * หน้าที่หลัก:
 * - รอให้ Synapse-Core โหลดเสร็จ
 * - จัดการการเชื่อมต่อกับ Synapse-Core API
 * - ให้ fallback เมื่อ Synapse-Core ไม่พร้อมใช้งาน
 */
export class SynapseCoreAdapter {
  private app: App;
  private api: SynapseCoreAPI | null = null;
  private isConnected: boolean = false;
  private connectionRetries: number = 0;
  private maxRetries: number = 10;
  private retryInterval: number = 1000; // 1 second

  constructor(app: App) {
    this.app = app;
  }

  /**
   * 🔗 Initialize connection to Synapse-Core
   */
  async initialize(): Promise<boolean> {
    console.log("🔗 Initializing Synapse-Core connection...");

    try {
      await this.waitForSynapseCore();
      this.api = this.getSynapseCoreAPI();

      if (this.api) {
        this.isConnected = true;
        console.log("✅ Connected to Synapse-Core successfully");
        return true;
      } else {
        console.warn("⚠️ Synapse-Core not available, using fallback mode");
        return false;
      }
    } catch (error) {
      console.error("❌ Failed to connect to Synapse-Core:", error);
      return false;
    }
  }

  /**
   * ⏳ Wait for Synapse-Core to load
   */
  private async waitForSynapseCore(): Promise<void> {
    while (this.connectionRetries < this.maxRetries) {
      if (this.app.plugins.plugins["synapse-core"]) {
        return;
      }

      this.connectionRetries++;
      console.log(
        `⏳ Waiting for Synapse-Core... (${this.connectionRetries}/${this.maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, this.retryInterval));
    }

    throw new Error("Synapse-Core not found after maximum retries");
  }

  /**
   * 📡 Get Synapse-Core API
   */
  private getSynapseCoreAPI(): SynapseCoreAPI | null {
    const synapseCore = this.app.plugins.plugins["synapse-core"];
    return synapseCore?.api || null;
  }

  /**
   * 🔍 Check if connected to Synapse-Core
   */
  isSynapseCoreConnected(): boolean {
    return this.isConnected && this.api !== null;
  }

  /**
   * 🎯 Check feature availability
   */
  hasFeature(feature: string): boolean {
    if (this.isSynapseCoreConnected() && this.api) {
      return this.api.hasFeature(feature);
    }
    // Fallback: assume all features are available in Ultima-Orb
    return true;
  }

  /**
   * 📊 Check feature limit
   */
  checkFeatureLimit(feature: string, currentUsage: number): boolean {
    if (this.isSynapseCoreConnected() && this.api) {
      return this.api.checkFeatureLimit(feature, currentUsage);
    }
    // Fallback: no limits in Ultima-Orb
    return true;
  }

  /**
   * 💾 Save data
   */
  async saveData(key: string, data: any): Promise<void> {
    if (this.isSynapseCoreConnected() && this.api) {
      this.api.saveData(key, data);
    } else {
      // Fallback: use Obsidian's built-in storage
      await this.app.vault.adapter.write(
        `ultima-orb-${key}.json`,
        JSON.stringify(data)
      );
    }
  }

  /**
   * 📂 Load data
   */
  async loadData(key: string): Promise<any> {
    if (this.isSynapseCoreConnected() && this.api) {
      return this.api.loadData(key);
    } else {
      // Fallback: use Obsidian's built-in storage
      try {
        const data = await this.app.vault.adapter.read(
          `ultima-orb-${key}.json`
        );
        return JSON.parse(data);
      } catch (error) {
        return null;
      }
    }
  }

  /**
   * 📡 Subscribe to events
   */
  subscribe(event: string, callback: EventCallback): void {
    if (this.isSynapseCoreConnected() && this.api) {
      this.api.subscribe(event, callback);
    } else {
      // Fallback: use local event system
      console.warn(`Event subscription not available for: ${event}`);
    }
  }

  /**
   * 📢 Publish events
   */
  publish(event: string, data: any): void {
    if (this.isSynapseCoreConnected() && this.api) {
      this.api.publish(event, data);
    } else {
      // Fallback: use local event system
      console.warn(`Event publishing not available for: ${event}`);
    }
  }

  /**
   * 🔗 Get Notion client
   */
  getNotionClient(): any {
    if (this.isSynapseCoreConnected() && this.api) {
      return this.api.getNotionClient();
    }
    return null;
  }

  /**
   * 🔄 Sync tools with Notion
   */
  async syncToolsWithNotion(): Promise<void> {
    if (this.isSynapseCoreConnected() && this.api) {
      await this.api.syncToolsWithNotion();
    } else {
      new Notice("⚠️ Notion sync requires Synapse-Core");
    }
  }

  /**
   * 📊 Get plugin state
   */
  getPluginState(): PluginState {
    if (this.isSynapseCoreConnected() && this.api) {
      return this.api.getPluginState();
    }
    return this.getFallbackState();
  }

  /**
   * 🔄 Update plugin state
   */
  updatePluginState(state: Partial<PluginState>): void {
    if (this.isSynapseCoreConnected() && this.api) {
      this.api.updatePluginState(state);
    } else {
      console.warn("State update not available without Synapse-Core");
    }
  }

  /**
   * 🛠️ Get tool database
   */
  getToolDatabase(): ToolDatabase {
    if (this.isSynapseCoreConnected() && this.api) {
      return this.api.getToolDatabase();
    }
    return this.getFallbackToolDatabase();
  }

  /**
   * 🔄 Update tool in database
   */
  updateToolInDatabase(tool: Tool): void {
    if (this.isSynapseCoreConnected() && this.api) {
      this.api.updateToolInDatabase(tool);
    } else {
      console.warn("Tool database update not available without Synapse-Core");
    }
  }

  /**
   * ➕ Create new tool
   */
  createTool(tool: Omit<Tool, "id" | "createdAt" | "updatedAt">): Tool | null {
    if (this.isSynapseCoreConnected() && this.api) {
      return this.api.createTool(tool);
    }
    console.warn("Tool creation not available without Synapse-Core");
    return null;
  }

  /**
   * 🗑️ Delete tool
   */
  deleteTool(toolId: string): boolean {
    if (this.isSynapseCoreConnected() && this.api) {
      return this.api.deleteTool(toolId);
    }
    console.warn("Tool deletion not available without Synapse-Core");
    return false;
  }

  /**
   * 🔗 Connect to MCP service
   */
  async connectToService(service: string): Promise<boolean> {
    if (this.isSynapseCoreConnected() && this.api) {
      return await this.api.connectToService(service);
    }
    console.warn(`MCP service connection not available for: ${service}`);
    return false;
  }

  /**
   * 🛡️ Get fallback state
   */
  private getFallbackState(): PluginState {
    return {
      ai: {
        providers: {
          openai: { connected: false, apiKey: "", model: "gpt-4" },
          claude: { connected: false, apiKey: "", model: "claude-3" },
          gemini: { connected: false, apiKey: "", model: "gemini-pro" },
          ollama: {
            connected: false,
            url: "http://localhost:11434",
            model: "llama2",
          },
          anythingllm: { connected: false, apiKey: "", model: "default" },
        },
        activeProvider: "openai",
        maxMode: false,
        usage: {
          totalRequests: 0,
          totalTokens: 0,
          monthlyRequests: 0,
          monthlyTokens: 0,
        },
      },
      mcp: {
        notion: { connected: false, url: "", type: "Streamable HTTP" },
        clickup: { connected: false, url: "", type: "SSE" },
        airtable: { connected: false, url: "", type: "STDIO" },
        github: { connected: false, url: "", type: "Streamable HTTP" },
        gitlab: { connected: false, url: "", type: "Streamable HTTP" },
        slack: { connected: false, url: "", type: "Streamable HTTP" },
        discord: { connected: false, url: "", type: "Streamable HTTP" },
        telegram: { connected: false, url: "", type: "Streamable HTTP" },
        email: { connected: false, url: "", type: "Streamable HTTP" },
        calendar: { connected: false, url: "", type: "Streamable HTTP" },
        drive: { connected: false, url: "", type: "Streamable HTTP" },
        dropbox: { connected: false, url: "", type: "Streamable HTTP" },
        onedrive: { connected: false, url: "", type: "Streamable HTTP" },
        trello: { connected: false, url: "", type: "Streamable HTTP" },
        asana: { connected: false, url: "", type: "Streamable HTTP" },
        jira: { connected: false, url: "", type: "Streamable HTTP" },
        linear: { connected: false, url: "", type: "Streamable HTTP" },
        figma: { connected: false, url: "", type: "Streamable HTTP" },
        canva: { connected: false, url: "", type: "Streamable HTTP" },
        zapier: { connected: false, url: "", type: "Streamable HTTP" },
        ifttt: { connected: false, url: "", type: "Streamable HTTP" },
        webhook: { connected: false, url: "", type: "Streamable HTTP" },
        custom: { connected: false, url: "", type: "Streamable HTTP" },
      },
      knowledge: {
        totalDocuments: 0,
        indexedFiles: 0,
        embeddings: 0,
        lastSync: null,
        sources: {
          obsidian: { active: true, count: 0 },
          notion: { active: false, count: 0 },
          web: { active: false, count: 0 },
          local: { active: false, count: 0 },
        },
        maxMode: false,
      },
      agents: {
        flowMode: {
          active: false,
          totalFlows: 0,
          activeFlows: 0,
          completedFlows: 0,
          successRate: 0,
        },
        buildMode: {
          active: false,
          totalAgents: 0,
          activeAgents: 0,
          templates: 0,
        },
        maxMode: false,
      },
      commands: {
        total: 0,
        custom: 0,
        mostUsed: "@search",
        categories: {
          ai: 0,
          file: 0,
          data: 0,
          code: 0,
          integration: 0,
          custom: 0,
        },
        maxMode: false,
      },
      features: {
        free: {
          ai: true,
          knowledge: true,
          agents: true,
          commands: true,
          mcp: true,
        },
        max: {
          advancedAI: false,
          collaboration: false,
          analytics: false,
          customIntegrations: false,
        },
      },
    };
  }

  /**
   * 🛠️ Get fallback tool database
   */
  private getFallbackToolDatabase(): ToolDatabase {
    return {
      tools: [],
      categories: ["ai", "file", "data", "code", "integration", "productivity", "visualization", "automation", "custom"],
      totalTools: 0,
      lastUpdated: new Date(),
    };
  }

  /**
   * 🔧 Get connection status
   */
  getConnectionStatus(): { connected: boolean; retries: number; maxRetries: number } {
    return {
      connected: this.isConnected,
      retries: this.connectionRetries,
      maxRetries: this.maxRetries,
    };
  }

  /**
   * 🔄 Reconnect to Synapse-Core
   */
  async reconnect(): Promise<boolean> {
    console.log("🔄 Attempting to reconnect to Synapse-Core...");
    this.isConnected = false;
    this.connectionRetries = 0;
    return await this.initialize();
  }
}
