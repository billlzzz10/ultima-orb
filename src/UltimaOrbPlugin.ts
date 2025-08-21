import { App, Plugin, WorkspaceLeaf, Notice } from "obsidian";
import { SettingsManager, UltimaOrbSettings } from "./settings";
import { SynapseCoreAdapter } from "./core/SynapseCoreAdapter";
import { ContextManager } from "./core/ContextManager";
import { Logger } from "./services/Logger";
import { UltimaOrbSettingTab } from "./ui/SettingsTab";
import { ChatView, CHAT_VIEW_TYPE } from "./ui/views/ChatView";
import { KnowledgeView, KNOWLEDGE_VIEW_TYPE } from "./ui/views/KnowledgeView";
import {
  ToolTemplateView,
  TOOL_TEMPLATE_VIEW_TYPE,
} from "./ui/views/ToolTemplateView";
import { openEnhancedCommandPalette } from "./ui/EnhancedCommandPalette";
import { AIFeatures } from "./ai/AIFeatures";
import { AIOrchestrator } from "./ai/AIOrchestrator";
import { AgentMode } from "./ai/AgentMode";
import { AtCommands } from "./ai/AtCommands";
import { CursorFeatures } from "./ai/CursorFeatures";
import { AdvancedChatInterface } from "./ui/AdvancedChatInterface";
import { CursorCommandPalette } from "./ui/CursorCommandPalette";

/**
 * 🔮 Ultima-Orb Plugin
 * The Ultimate Hybrid AI Command Center for Obsidian
 *
 * ใช้ Synapse-Core API สำหรับ core features และจัดการเฉพาะ AI features
 */

export default class UltimaOrbPlugin extends Plugin {
  private settingsManager!: SettingsManager;
  private synapseCoreAdapter!: SynapseCoreAdapter;
  private contextManager!: ContextManager;
  private logger!: Logger;
  private aiOrchestrator!: AIOrchestrator;
  private aiFeatures!: AIFeatures;
  private agentMode!: AgentMode;
  private atCommands!: AtCommands;
  private cursorFeatures!: CursorFeatures;

  async onload() {
    this.logger = new Logger();
    this.logger.info("🚀 Loading Ultima-Orb plugin...");

    try {
      // Initialize settings
      const savedSettings = await this.loadData();
      this.settingsManager = new SettingsManager(savedSettings);

      // Initialize Synapse-Core adapter
      this.synapseCoreAdapter = new SynapseCoreAdapter(this.app);
      const synapseConnected = await this.synapseCoreAdapter.initialize();

      if (synapseConnected) {
        this.logger.info("✅ Connected to Synapse-Core");
      } else {
        this.logger.warn(
          "⚠️ Running in fallback mode (Synapse-Core not available)"
        );
      }

      // Initialize context manager
      this.contextManager = new ContextManager(this.app);
      await this.contextManager.initialize();

      // Initialize AI components (Ultima-Orb specific)
      this.aiOrchestrator = new AIOrchestrator(this.app, this.settingsManager, this.logger);
      this.aiFeatures = new AIFeatures(this.app, this.aiOrchestrator);
      this.agentMode = new AgentMode(this.app, this.aiFeatures);
      this.atCommands = new AtCommands(this.app, this.aiFeatures);
      this.cursorFeatures = new CursorFeatures(this.app, this.aiFeatures);

      // Register commands
      this.registerCommands();

      // Add settings tab
      this.addSettingTab(new UltimaOrbSettingTab(this.app, this));

      // Subscribe to Synapse-Core events
      this.subscribeToSynapseEvents();

      this.logger.info("✅ Ultima-Orb plugin loaded successfully!");
    } catch (error) {
      this.logger.error("❌ Error loading Ultima-Orb plugin:", error as Error);
    }
  }

  async onunload() {
    this.logger.info("🔄 Unloading Ultima-Orb plugin...");

    try {
      // Save settings
      await this.saveData(this.settingsManager.getSettings());
      this.logger.info("✅ Settings saved successfully");
    } catch (error) {
      this.logger.error("❌ Error saving settings:", error as Error);
    }
  }

  /**
   * 📡 Subscribe to Synapse-Core events
   */
  private subscribeToSynapseEvents(): void {
    this.synapseCoreAdapter.subscribe("tool:updated", (tool: any) => {
      this.logger.info("Tool updated via Synapse-Core:", tool);
      // Handle tool updates
    });

    this.synapseCoreAdapter.subscribe("state:updated", (state: any) => {
      this.logger.info("State updated via Synapse-Core:", state);
      // Handle state updates
    });

    this.synapseCoreAdapter.subscribe("mcp:connected", (service: string) => {
      this.logger.info(`MCP service connected: ${service}`);
      // Handle MCP connections
    });
  }

  /**
   * Register plugin commands
   */
  private registerCommands(): void {
    // Open Chat View (Right Sidebar)
    this.addCommand({
      id: "ultima-orb-open-chat",
      name: "Open Ultima-Orb Chat",
      callback: () => this.openChatView(),
    });

    // Open Knowledge View (Left Sidebar)
    this.addCommand({
      id: "ultima-orb-open-knowledge",
      name: "Open Knowledge Base",
      callback: () => this.openKnowledgeView(),
    });

    // Open Tool Template View
    this.addCommand({
      id: "ultima-orb-open-tool-template",
      name: "Open Tool Templates",
      callback: () => this.openToolTemplateView(),
    });

    // Enhanced Command Palette
    this.addCommand({
      id: "ultima-orb-command-palette",
      name: "Open Enhanced Command Palette",
      callback: () => openEnhancedCommandPalette(this.app, this.aiFeatures, this),
    });

    // AI Features
    this.addCommand({
      id: "ultima-orb-ai-complete",
      name: "AI Code Completion",
      callback: async () => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
          const content = await this.app.vault.read(activeFile);
          await this.aiFeatures.completeCode(content);
        }
      },
    });

    this.addCommand({
      id: "ultima-orb-ai-explain",
      name: "AI Code Explanation",
      callback: async () => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
          const content = await this.app.vault.read(activeFile);
          await this.aiFeatures.explainCode(content);
        }
      },
    });

    this.addCommand({
      id: "ultima-orb-ai-debug",
      name: "AI Code Debugging",
      callback: async () => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
          const content = await this.app.vault.read(activeFile);
          await this.aiFeatures.debugCode(content);
        }
      },
    });

    this.addCommand({
      id: "ultima-orb-ai-refactor",
      name: "AI Code Refactoring",
      callback: async () => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
          const content = await this.app.vault.read(activeFile);
          await this.aiFeatures.refactorCode(content);
        }
      },
    });

    this.addCommand({
      id: "ultima-orb-ai-generate-tests",
      name: "AI Generate Tests",
      callback: async () => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
          const content = await this.app.vault.read(activeFile);
          await this.aiFeatures.generateTests(content);
        }
      },
    });

    // Agent Mode
    this.addCommand({
      id: "ultima-orb-agent-mode",
      name: "Toggle Agent Mode",
      callback: () => this.agentMode.toggleAgentMode(),
    });

    // Cursor Features
    this.addCommand({
      id: "ultima-orb-cursor-plan",
      name: "Cursor: Plan",
      callback: () => this.cursorFeatures.plan(),
    });

    this.addCommand({
      id: "ultima-orb-cursor-search",
      name: "Cursor: Search",
      callback: () => this.cursorFeatures.search(),
    });

    this.addCommand({
      id: "ultima-orb-cursor-build",
      name: "Cursor: Build",
      callback: () => this.cursorFeatures.build(),
    });

    this.addCommand({
      id: "ultima-orb-cursor-anything",
      name: "Cursor: Anything",
      callback: async () => {
        await this.cursorFeatures.doAnything("");
      },
    });

    // Synapse-Core Integration
    this.addCommand({
      id: "ultima-orb-synapse-status",
      name: "Show Synapse-Core Status",
      callback: () => this.showSynapseStatus(),
    });

    this.addCommand({
      id: "ultima-orb-sync-notion",
      name: "Sync with Notion (via Synapse-Core)",
      callback: async () => {
        new Notice("🔄 Syncing with Notion via Synapse-Core...");
        await this.synapseCoreAdapter.syncToolsWithNotion();
        new Notice("✅ Sync completed");
      },
    });
  }

  /**
   * 🔍 Show Synapse-Core connection status
   */
  private showSynapseStatus(): void {
    const status = this.synapseCoreAdapter.getConnectionStatus();
    const state = this.synapseCoreAdapter.getPluginState();

    const message = `🔗 Synapse-Core Status:
• Connected: ${status.connected ? "✅ Yes" : "❌ No"}
• Retries: ${status.retries}/${status.maxRetries}
• Notion: ${state.mcp.notion.connected ? "✅ Connected" : "❌ Disconnected"}
• ClickUp: ${state.mcp.clickup.connected ? "✅ Connected" : "❌ Disconnected"}
• Airtable: ${
      state.mcp.airtable.connected ? "✅ Connected" : "❌ Disconnected"
    }`;

    new Notice(message);
  }

  /**
   * 🎯 Open Chat View
   */
  private async openChatView(): Promise<void> {
    const leaf = this.app.workspace.getRightLeaf(false);
    if (leaf) {
      await leaf.setViewState({ type: CHAT_VIEW_TYPE, active: true });
      this.app.workspace.revealLeaf(leaf);
    }
  }

  /**
   * 📚 Open Knowledge View
   */
  private async openKnowledgeView(): Promise<void> {
    const leaf = this.app.workspace.getLeftLeaf(false);
    if (leaf) {
      await leaf.setViewState({ type: KNOWLEDGE_VIEW_TYPE, active: true });
      this.app.workspace.revealLeaf(leaf);
    }
  }

  /**
   * 🛠️ Open Tool Template View
   */
  private async openToolTemplateView(): Promise<void> {
    const leaf = this.app.workspace.getRightLeaf(false);
    if (leaf) {
      await leaf.setViewState({ type: TOOL_TEMPLATE_VIEW_TYPE, active: true });
      this.app.workspace.revealLeaf(leaf);
    }
  }

  /**
   * 🔧 Get Synapse-Core adapter
   */
  getSynapseCoreAdapter(): SynapseCoreAdapter {
    return this.synapseCoreAdapter;
  }

  /**
   * 🎯 Get AI features
   */
  getAIFeatures(): AIFeatures {
    return this.aiFeatures;
  }

  /**
   * 🤖 Get agent mode
   */
  getAgentMode(): AgentMode {
    return this.agentMode;
  }

  /**
   * 📡 Get at commands
   */
  getAtCommands(): AtCommands {
    return this.atCommands;
  }

  /**
   * 🖱️ Get cursor features
   */
  getCursorFeatures(): CursorFeatures {
    return this.cursorFeatures;
  }

  /**
   * ⚙️ Get settings manager
   */
  getSettingsManager(): SettingsManager {
    return this.settingsManager;
  }
}
