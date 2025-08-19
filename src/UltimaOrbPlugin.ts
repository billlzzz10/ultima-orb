import { App, Plugin, WorkspaceLeaf, Notice } from "obsidian";
import { SettingsManager, UltimaOrbSettings } from "./settings";
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
 */

export default class UltimaOrbPlugin extends Plugin {
  private settingsManager!: SettingsManager;
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

      // Initialize context manager
      this.contextManager = new ContextManager(this.app);
      await this.contextManager.initialize();

      // Initialize AI components
      this.aiOrchestrator = new AIOrchestrator();
      this.aiFeatures = new AIFeatures(this.app, this.aiOrchestrator);
      this.agentMode = new AgentMode(this.app, this.aiFeatures);
      this.atCommands = new AtCommands(this.app, this.aiFeatures);
      this.cursorFeatures = new CursorFeatures(this.app, this.aiFeatures);

      // Register commands
      this.registerCommands();

      // Add settings tab
      this.addSettingTab(new UltimaOrbSettingTab(this.app, this));

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

    // Open Command Palette
    this.addCommand({
      id: "ultima-orb-command-palette",
      name: "Open Command Palette",
      hotkeys: [{ modifiers: ["Ctrl"], key: "K" }],
      callback: () =>
        openEnhancedCommandPalette(this.app, this, this.aiFeatures),
    });

    // Open Advanced Chat Interface
    this.addCommand({
      id: "ultima-orb-advanced-chat",
      name: "Open Advanced Chat Interface",
      hotkeys: [{ modifiers: ["Ctrl"], key: "L" }],
      callback: () => this.openAdvancedChatInterface(),
    });

    // Open Cursor Command Palette
    this.addCommand({
      id: "ultima-orb-cursor-palette",
      name: "Open Cursor Command Palette",
      hotkeys: [{ modifiers: ["Ctrl"], key: "J" }],
      callback: () => this.openCursorCommandPalette(),
    });

    // Refresh Context
    this.addCommand({
      id: "ultima-orb-refresh-context",
      name: "Refresh Context",
      callback: () => this.refreshContext(),
    });
  }

  /**
   * Open Chat View (Right Sidebar)
   */
  private openChatView(): void {
    this.logger.info("Opening Chat View...");
    new Notice(
      "💬 Chat View - Coming Soon! Use Command Palette (Ctrl+K) for AI commands."
    );
  }

  /**
   * Open Knowledge View (Left Sidebar)
   */
  private openKnowledgeView(): void {
    this.logger.info("Opening Knowledge View...");
    new Notice(
      "📚 Knowledge View - Coming Soon! Use Command Palette (Ctrl+K) for AI commands."
    );
  }

  /**
   * Open Tool Template View
   */
  private openToolTemplateView(): void {
    this.logger.info("Opening Tool Template View...");
    new Notice(
      "🛠️ Tool Template View - Coming Soon! Use Command Palette (Ctrl+K) for AI commands."
    );
  }

  /**
   * Open Advanced Chat Interface
   */
  private openAdvancedChatInterface(): void {
    this.logger.info("Opening Advanced Chat Interface...");
    const chatInterface = new AdvancedChatInterface(
      this.app,
      this.aiFeatures,
      this.agentMode,
      this.atCommands
    );
    chatInterface.open();
  }

  /**
   * Open Cursor Command Palette
   */
  private openCursorCommandPalette(): void {
    this.logger.info("Opening Cursor Command Palette...");
    const cursorPalette = new CursorCommandPalette(
      this.app,
      this.cursorFeatures
    );
    cursorPalette.open();
  }

  /**
   * Refresh context
   */
  private async refreshContext(): Promise<void> {
    this.logger.info("Refreshing context...");
    await this.contextManager.refreshContext();
  }

  /**
   * Get settings manager
   */
  getSettingsManager(): SettingsManager {
    return this.settingsManager;
  }

  /**
   * Get context manager
   */
  getContextManager(): ContextManager {
    return this.contextManager;
  }

  /**
   * Get logger
   */
  getLogger(): Logger {
    return this.logger;
  }
}
