import { Plugin, App, PluginSettingTab, WorkspaceLeaf } from "obsidian";
import {
  UltimaOrbSettings,
  DEFAULT_SETTINGS,
  SettingsManager,
} from "./settings";
import { AIOrchestrator } from "./ai/AIOrchestrator";
import { ModeSystem } from "./ai/ModeSystem";
import { FeatureManager } from "./core/FeatureManager";
import { AIFeatures } from "./ai/AIFeatures";
import { AgentMode } from "./ai/AgentMode";
import { AgentFlowMode } from "./ai/AgentFlowMode";
import { CursorFeatures } from "./ui/CursorFeatures";
import { ChatView } from "./ui/views/ChatView";
import { SettingsTab } from "./ui/SettingsTab";
import { FlowDebuggerView } from "./ui/views/FlowDebuggerView";
import { KnowledgeView } from "./ui/views/KnowledgeView";
import { ToolTemplateView } from "./ui/views/ToolTemplateView";
import { SidebarView } from "./ui/views/SidebarView";
import { IntegrationManager } from "./integrations/IntegrationManager";
import { openEnhancedCommandPalette } from "./ui/EnhancedCommandPalette";

export class UltimaOrbPlugin extends Plugin {
  settings!: UltimaOrbSettings;
  settingsManager!: SettingsManager;
  featureManager!: FeatureManager;
  aiOrchestrator!: AIOrchestrator;
  modeSystem!: ModeSystem;
  aiFeatures!: AIFeatures;
  agentMode!: AgentMode;
  agentFlowMode!: AgentFlowMode;
  cursorFeatures!: CursorFeatures;
  integrationManager!: IntegrationManager;

  // UI Components
  chatView!: ChatView;
  settingsTab!: SettingsTab;
  flowDebuggerView!: FlowDebuggerView;
  knowledgeView!: KnowledgeView;
  toolTemplateView!: ToolTemplateView;
  sidebarView!: SidebarView;

  async onload() {
    console.info("Loading Ultima-Orb plugin...");

    // Initialize settings
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.settingsManager = new SettingsManager(this.settings);

    // Initialize core managers
    this.featureManager = new FeatureManager(this.app);
    this.aiOrchestrator = new AIOrchestrator(
      this.app,
      this.featureManager,
      this.settings
    );
    this.modeSystem = new ModeSystem();
    this.aiFeatures = new AIFeatures(this.app, this.aiOrchestrator);
    this.agentMode = new AgentMode(this.app, this.aiFeatures);
    this.agentFlowMode = new AgentFlowMode(this.app, this.aiFeatures);
    this.cursorFeatures = new CursorFeatures(this.app, this.aiOrchestrator);
    this.integrationManager = new IntegrationManager(
      this.app,
      this.featureManager,
      this.settings
    );

    // Initialize UI components
    this.initializeUIComponents();

    // Register commands
    this.registerCommands();

    // Register views
    this.registerViews();

    // Add settings tab
    this.addSettingTab(new SettingsTab(this.app, this));

    console.info("Ultima-Orb plugin loaded successfully!");
  }

  private initializeUIComponents() {
    this.chatView = new ChatView(
      this.app.workspace.getRightLeaf(false)!,
      this.aiOrchestrator
    );
    this.settingsTab = new SettingsTab(this.app, this);
    this.flowDebuggerView = new FlowDebuggerView(
      this.app.workspace.getRightLeaf(false)!,
      this.aiOrchestrator
    );
    this.knowledgeView = new KnowledgeView(
      this.app.workspace.getRightLeaf(false)!,
      this.aiOrchestrator
    );
    this.toolTemplateView = new ToolTemplateView(
      this.app.workspace.getRightLeaf(false)!,
      this.aiOrchestrator
    );
    this.sidebarView = new SidebarView(
      this.app.workspace.getRightLeaf(false)!,
      this
    );
  }

  private registerCommands() {
    // AI Commands
    this.addCommand({
      id: "ultima-orb-chat",
      name: "Open AI Chat",
      callback: () => this.openChatView(),
    });

    this.addCommand({
      id: "ultima-orb-settings",
      name: "Open Settings",
      callback: () => this.openSettings(),
    });

    this.addCommand({
      id: "ultima-orb-command-palette",
      name: "Enhanced Command Palette",
      callback: () => this.openEnhancedCommandPalette(),
    });

    // AI Features
    this.addCommand({
      id: "ultima-orb-explain-code",
      name: "Explain Code",
      editorCallback: async (editor) => {
        const selectedText = editor.getSelection();
        await this.aiFeatures.explainCode(selectedText);
      },
    });

    this.addCommand({
      id: "ultima-orb-refactor-code",
      name: "Refactor Code",
      editorCallback: async (editor) => {
        const selectedText = editor.getSelection();
        await this.aiFeatures.refactorCode(selectedText);
      },
    });

    // Agent Commands
    this.addCommand({
      id: "ultima-orb-toggle-agent",
      name: "Toggle Agent Mode",
      callback: () => this.agentMode.stopAgentMode(),
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
  }

  private registerViews() {
    this.registerView(
      "ultima-orb-chat",
      (leaf: WorkspaceLeaf) => new ChatView(leaf, this.aiOrchestrator)
    );

    this.registerView(
      "ultima-orb-flow-debugger",
      (leaf: WorkspaceLeaf) => new FlowDebuggerView(leaf, this.aiOrchestrator)
    );

    this.registerView(
      "ultima-orb-knowledge",
      (leaf: WorkspaceLeaf) => new KnowledgeView(leaf, this.aiOrchestrator)
    );

    this.registerView(
      "ultima-orb-tool-template",
      (leaf: WorkspaceLeaf) => new ToolTemplateView(leaf, this.aiOrchestrator)
    );

    this.registerView(
      "ultima-orb-sidebar",
      (leaf: WorkspaceLeaf) => new SidebarView(leaf, this)
    );
  }

  // Public methods for UI access
  public openChatView() {
    this.chatView.open();
  }

  public openSettings() {
    this.app.settings.open();
    this.app.settings.openTabById("ultima-orb");
  }

  public openEnhancedCommandPalette() {
    // Simplified command palette
    console.info("Opening enhanced command palette...");
  }

  public getSettingsManager(): SettingsManager {
    return this.settingsManager;
  }

  public getFeatureManager(): FeatureManager {
    return this.featureManager;
  }

  public getAIOrchestrator(): AIOrchestrator {
    return this.aiOrchestrator;
  }

  public getModeSystem(): ModeSystem {
    return this.modeSystem;
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async onunload() {
    console.info("Unloading Ultima-Orb plugin...");

    // Cleanup managers
    this.aiOrchestrator?.cleanup();
    this.integrationManager?.cleanup();

    console.info("Ultima-Orb plugin unloaded successfully!");
  }
}

// Default export for main.ts
export default UltimaOrbPlugin;
