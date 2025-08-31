import { App, Notice } from "obsidian";

/**
 * 🔧 Plugin State Manager - จัดการสถานะของปลั๊กอิน
 */
export class PluginStateManager {
  private app: App;
  private state: PluginState;
  private listeners: Map<string, StateChangeListener[]> = new Map();

  constructor(app: App) {
    this.app = app;
    this.state = this.getInitialState();
  }

  /**
   * 📋 Get Initial State
   */
  private getInitialState(): PluginState {
    return {
      // ===== AI STATUS =====
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
        },
        activeProvider: "openai",
        maxMode: false,
      },

      // ===== MCP INTEGRATIONS =====
      mcp: {
        notion: {
          connected: false,
          url: "https://mcp.notion.com/mcp",
          type: "Streamable HTTP",
        },
        clickup: {
          connected: false,
          url: "https://mcp.clickup.com/mcp",
          type: "SSE",
        },
        airtable: {
          connected: false,
          url: "https://mcp.airtable.com/mcp",
          type: "STDIO",
        },
      },

      // ===== KNOWLEDGE BASE =====
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

      // ===== AGENT MODES =====
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

      // ===== CUSTOM COMMANDS =====
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

      // ===== USAGE STATISTICS =====
      stats: {
        totalAICalls: 0,
        commandsUsed: 0,
        filesProcessed: 0,
        timeSaved: 0,
        lastReset: new Date(),
      },

      // ===== PERFORMANCE =====
      performance: {
        responseTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        errorRate: 0,
      },

      // ===== LICENSE =====
      license: {
        type: "free", // "free" | "max"
        features: this.getFreeFeatures(),
        limits: this.getFreeLimits(),
      },
    };
  }

  /**
   * 🆓 Get Free Features
   */
  private getFreeFeatures(): string[] {
    return [
      "basic-ai-chat",
      "simple-agent-mode",
      "basic-at-commands",
      "knowledge-base-basic",
      "notion-integration",
      "custom-commands-basic",
      "settings-dashboard",
    ];
  }

  /**
   * 📊 Get Free Limits
   */
  private getFreeLimits(): FeatureLimits {
    return {
      aiCallsPerDay: 100,
      knowledgeDocuments: 1000,
      customCommands: 10,
      agentFlows: 3,
      customAgents: 5,
      mcpIntegrations: 1,
    };
  }

  /**
   * 💎 Get Max Features
   */
  private getMaxFeatures(): string[] {
    return [
      "advanced-ai-orchestration",
      "agent-flow-mode",
      "build-agent-mode",
      "advanced-at-commands",
      "knowledge-base-advanced",
      "all-mcp-integrations",
      "unlimited-custom-commands",
      "advanced-analytics",
      "real-time-collaboration",
      "priority-support",
    ];
  }

  /**
   * 📊 Get Max Limits
   */
  private getMaxLimits(): FeatureLimits {
    return {
      aiCallsPerDay: -1, // Unlimited
      knowledgeDocuments: -1, // Unlimited
      customCommands: -1, // Unlimited
      agentFlows: -1, // Unlimited
      customAgents: -1, // Unlimited
      mcpIntegrations: -1, // Unlimited
    };
  }

  /**
   * 🔄 Get State
   */
  getState(): PluginState {
    return { ...this.state };
  }

  /**
   * 📝 Update State
   */
  updateState(updates: Partial<PluginState>): void {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };

    // Notify listeners
    this.notifyListeners(oldState, this.state);
  }

  /**
   * 🔧 Update Specific Section
   */
  updateSection<T extends keyof PluginState>(
    section: T,
    updates: Partial<PluginState[T]>
  ): void {
    const oldState = { ...this.state };
    this.state[section] = { ...this.state[section], ...updates };

    // Notify listeners
    this.notifyListeners(oldState, this.state);
  }

  /**
   * 🎧 Add State Change Listener
   */
  addListener(event: string, listener: StateChangeListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  /**
   * 🎧 Remove State Change Listener
   */
  removeListener(event: string, listener: StateChangeListener): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 📢 Notify Listeners
   */
  private notifyListeners(oldState: PluginState, newState: PluginState): void {
    // Notify general state change
    this.notifyEvent("state-change", { oldState, newState });

    // Notify specific section changes
    Object.keys(newState).forEach((section) => {
      const key = section as keyof PluginState;
      if (JSON.stringify(oldState[key]) !== JSON.stringify(newState[key])) {
        this.notifyEvent(`${section}-change`, {
          oldValue: oldState[key],
          newValue: newState[key],
        });
      }
    });
  }

  /**
   * 📢 Notify Event
   */
  private notifyEvent(event: string, data: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in state listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * 💎 Upgrade to Max Mode
   */
  upgradeToMaxMode(): void {
    this.updateSection("license", {
      type: "max",
      features: this.getMaxFeatures(),
      limits: this.getMaxLimits(),
    });

    // Enable max mode features
    this.updateSection("ai", { maxMode: true });
    this.updateSection("knowledge", { maxMode: true });
    this.updateSection("agents", {
      flowMode: { ...this.state.agents.flowMode, active: true },
      buildMode: { ...this.state.agents.buildMode, active: true },
      maxMode: true,
    });
    this.updateSection("commands", { maxMode: true });

    new Notice(
      "🎉 Upgraded to Max Mode! All advanced features are now available."
    );
  }

  /**
   * 🆓 Downgrade to Free Mode
   */
  downgradeToFreeMode(): void {
    this.updateSection("license", {
      type: "free",
      features: this.getFreeFeatures(),
      limits: this.getFreeLimits(),
    });

    // Disable max mode features
    this.updateSection("ai", { maxMode: false });
    this.updateSection("knowledge", { maxMode: false });
    this.updateSection("agents", {
      flowMode: { ...this.state.agents.flowMode, active: false },
      buildMode: { ...this.state.agents.buildMode, active: false },
      maxMode: false,
    });
    this.updateSection("commands", { maxMode: false });

    new Notice("ℹ️ Downgraded to Free Mode. Some features are now limited.");
  }

  /**
   * ✅ Check Feature Access
   */
  hasFeature(feature: string): boolean {
    return this.state.license.features.includes(feature);
  }

  /**
   * 📊 Check Usage Limits
   */
  checkLimit(limitType: keyof FeatureLimits): boolean {
    const limit = this.state.license.limits[limitType];
    if (limit === -1) return true; // Unlimited

    switch (limitType) {
      case "aiCallsPerDay":
        return this.state.stats.totalAICalls < limit;
      case "knowledgeDocuments":
        return this.state.knowledge.totalDocuments < limit;
      case "customCommands":
        return this.state.commands.custom < limit;
      case "agentFlows":
        return this.state.agents.flowMode.totalFlows < limit;
      case "customAgents":
        return this.state.agents.buildMode.totalAgents < limit;
      case "mcpIntegrations":
        const connectedIntegrations = Object.values(this.state.mcp).filter(
          (integration) => integration.connected
        ).length;
        return connectedIntegrations < limit;
      default:
        return true;
    }
  }

  /**
   * 📈 Increment Usage
   */
  incrementUsage(type: "aiCalls" | "commands" | "files"): void {
    switch (type) {
      case "aiCalls":
        this.updateSection("stats", {
          totalAICalls: this.state.stats.totalAICalls + 1,
        });
        break;
      case "commands":
        this.updateSection("stats", {
          commandsUsed: this.state.stats.commandsUsed + 1,
        });
        break;
      case "files":
        this.updateSection("stats", {
          filesProcessed: this.state.stats.filesProcessed + 1,
        });
        break;
    }
  }

  /**
   * 💾 Save State
   */
  async saveState(): Promise<void> {
    try {
      await this.app.vault.adapter.write(
        `.obsidian/plugins/ultima-orb/state.json`,
        JSON.stringify(this.state, null, 2)
      );
    } catch (error) {
      console.error("Error saving plugin state:", error);
    }
  }

  /**
   * 📂 Load State
   */
  async loadState(): Promise<void> {
    try {
      const data = await this.app.vault.adapter.read(
        `.obsidian/plugins/ultima-orb/state.json`
      );
      const savedState = JSON.parse(data);
      this.state = { ...this.getInitialState(), ...savedState };
    } catch (error) {
      console.info("No saved state found, using initial state");
    }
  }

  /**
   * 🔄 Reset State
   */
  resetState(): void {
    this.state = this.getInitialState();
    new Notice("🔄 Plugin state reset to initial values");
  }
}

/**
 * 📋 Plugin State Interface
 */
interface PluginState {
  ai: AIState;
  mcp: MCPState;
  knowledge: KnowledgeState;
  agents: AgentState;
  commands: CommandState;
  stats: UsageStats;
  performance: PerformanceMetrics;
  license: LicenseInfo;
}

/**
 * 🤖 AI State Interface
 */
interface AIState {
  providers: {
    openai: AIProvider;
    claude: AIProvider;
    gemini: AIProvider;
    ollama: AIProvider;
  };
  activeProvider: string;
  maxMode: boolean;
}

/**
 * 🔗 AI Provider Interface
 */
interface AIProvider {
  connected: boolean;
  apiKey?: string;
  url?: string;
  model: string;
}

/**
 * 🔗 MCP State Interface
 */
interface MCPState {
  notion: MCPIntegration;
  clickup: MCPIntegration;
  airtable: MCPIntegration;
}

/**
 * 🔗 MCP Integration Interface
 */
interface MCPIntegration {
  connected: boolean;
  url: string;
  type: string;
}

/**
 * 📚 Knowledge State Interface
 */
interface KnowledgeState {
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

/**
 * 📚 Knowledge Source Interface
 */
interface KnowledgeSource {
  active: boolean;
  count: number;
}

/**
 * 🤖 Agent State Interface
 */
interface AgentState {
  flowMode: FlowModeState;
  buildMode: BuildModeState;
  maxMode: boolean;
}

/**
 * 🔄 Flow Mode State Interface
 */
interface FlowModeState {
  active: boolean;
  totalFlows: number;
  activeFlows: number;
  completedFlows: number;
  successRate: number;
}

/**
 * 🏗️ Build Mode State Interface
 */
interface BuildModeState {
  active: boolean;
  totalAgents: number;
  activeAgents: number;
  templates: number;
}

/**
 * ⚙️ Command State Interface
 */
interface CommandState {
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

/**
 * 📊 Usage Stats Interface
 */
interface UsageStats {
  totalAICalls: number;
  commandsUsed: number;
  filesProcessed: number;
  timeSaved: number;
  lastReset: Date;
}

/**
 * ⚡ Performance Metrics Interface
 */
interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  errorRate: number;
}

/**
 * 📜 License Info Interface
 */
interface LicenseInfo {
  type: "free" | "max";
  features: string[];
  limits: FeatureLimits;
}

/**
 * 📊 Feature Limits Interface
 */
interface FeatureLimits {
  aiCallsPerDay: number;
  knowledgeDocuments: number;
  customCommands: number;
  agentFlows: number;
  customAgents: number;
  mcpIntegrations: number;
}

/**
 * 🎧 State Change Listener Interface
 */
type StateChangeListener = (data: any) => void;
