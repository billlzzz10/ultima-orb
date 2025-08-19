import { Plugin, App, PluginSettingTab, Setting } from "obsidian";
import { FeatureManager } from "./src/core/FeatureManager";
import { ToolDatabaseManager } from "./src/core/ToolDatabaseManager";
import { ChatView } from "./src/ui/views/ChatView";
import { SettingsPanel } from "./src/ui/panels/SettingsPanel";
import { SidebarView } from "./src/ui/views/SidebarView";
import { AIOrchestrator } from "./src/ai/AIOrchestrator";
import { AgentManager } from "./src/agents/AgentManager";
import { CommandManager } from "./src/commands/CommandManager";
import { KnowledgeManager } from "./src/knowledge/KnowledgeManager";
import { IntegrationManager } from "./src/integrations/IntegrationManager";
import { VisualizationManager } from "./src/visualization/VisualizationManager";
import { ProductivityManager } from "./src/productivity/ProductivityManager";
import { DataManager } from "./src/data/DataManager";
import { DocumentManager } from "./src/documents/DocumentManager";
import { AssistantManager } from "./src/assistants/AssistantManager";
import { DevelopmentManager } from "./src/development/DevelopmentManager";
import { CollaborationManager } from "./src/collaboration/CollaborationManager";

export interface UltimaOrbSettings {
  // AI Settings
  openaiApiKey: string;
  anthropicApiKey: string;
  googleApiKey: string;
  defaultAIModel: string;

  // Feature Settings
  enableAdvancedFeatures: boolean;
  enableMaxMode: boolean;
  maxModeApiKey: string;

  // UI Settings
  enableChatView: boolean;
  enableSidebar: boolean;
  enableSettingsPanel: boolean;

  // Integration Settings
  enableGitHub: boolean;
  githubApiKey: string;
  enableNotion: boolean;
  notionApiKey: string;

  // Local AI Settings
  enableOllama: boolean;
  ollamaBaseUrl: string;
  enableLMStudio: boolean;
  lmStudioBaseUrl: string;

  // Visualization Settings
  enableChartJS: boolean;
  enableD3JS: boolean;
  enableThreeJS: boolean;

  // Advanced Settings
  enableScripting: boolean;
  enableRAG: boolean;
  enableExcalidraw: boolean;
}

const DEFAULT_SETTINGS: UltimaOrbSettings = {
  openaiApiKey: "",
  anthropicApiKey: "",
  googleApiKey: "",
  defaultAIModel: "gpt-4",
  enableAdvancedFeatures: true,
  enableMaxMode: false,
  maxModeApiKey: "",
  enableChatView: true,
  enableSidebar: true,
  enableSettingsPanel: true,
  enableGitHub: false,
  githubApiKey: "",
  enableNotion: false,
  notionApiKey: "",
  enableOllama: false,
  ollamaBaseUrl: "http://localhost:11434",
  enableLMStudio: false,
  lmStudioBaseUrl: "http://localhost:1234",
  enableChartJS: true,
  enableD3JS: true,
  enableThreeJS: true,
  enableScripting: true,
  enableRAG: true,
  enableExcalidraw: true,
};

export default class UltimaOrbPlugin extends Plugin {
  settings!: UltimaOrbSettings;

  // Core Managers
  featureManager!: FeatureManager;
  toolDatabaseManager!: ToolDatabaseManager;

  // AI & Agent Managers
  aiOrchestrator!: AIOrchestrator;
  agentManager!: AgentManager;

  // Feature Managers
  commandManager!: CommandManager;
  knowledgeManager!: KnowledgeManager;
  integrationManager!: IntegrationManager;
  visualizationManager!: VisualizationManager;
  productivityManager!: ProductivityManager;
  dataManager!: DataManager;
  documentManager!: DocumentManager;
  assistantManager!: AssistantManager;
  developmentManager!: DevelopmentManager;
  collaborationManager!: CollaborationManager;

  // UI Components
  chatView!: ChatView;
  settingsPanel!: SettingsPanel;
  sidebarView!: SidebarView;

  // Views
  chatViewType: any;
  sidebarViewType: any;

  async onload() {
    console.log("🚀 Loading Ultima-Orb Plugin...");

    // Load settings
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

    // Initialize core managers
    await this.initializeCoreManagers();

    // Initialize feature managers
    await this.initializeFeatureManagers();

    // Initialize UI components
    await this.initializeUIComponents();

    // Register views
    this.registerViews();

    // Register commands
    this.registerCommands();

    // Register settings tab
    this.addSettingTab(new UltimaOrbSettingTab(this.app, this));

    // Register event listeners
    this.registerEventListeners();

    console.log("✅ Ultima-Orb Plugin loaded successfully!");
  }

  async initializeCoreManagers() {
    console.log("🔧 Initializing core managers...");

    // Initialize Feature Manager
    this.featureManager = new FeatureManager(this.app);

    // Initialize Tool Database Manager
    this.toolDatabaseManager = new ToolDatabaseManager(
      this.app,
      this.featureManager
    );

    console.log("✅ Core managers initialized");
  }

  async initializeFeatureManagers() {
    console.log("🔧 Initializing feature managers...");

    // Initialize AI Orchestrator
    this.aiOrchestrator = new AIOrchestrator(
      this.app,
      this.featureManager,
      this.settings
    );

    // Initialize Agent Manager
    this.agentManager = new AgentManager(
      this.app,
      this.featureManager,
      this.aiOrchestrator
    );

    // Initialize Command Manager
    this.commandManager = new CommandManager(
      this.app,
      this.featureManager,
      this.aiOrchestrator
    );

    // Initialize Knowledge Manager
    this.knowledgeManager = new KnowledgeManager(this.app, this.featureManager);

    // Initialize Integration Manager
    this.integrationManager = new IntegrationManager(
      this.app,
      this.featureManager,
      this.settings
    );

    // Initialize Visualization Manager
    this.visualizationManager = new VisualizationManager(
      this.app,
      this.featureManager,
      this.settings
    );

    // Initialize Productivity Manager
    this.productivityManager = new ProductivityManager(
      this.app,
      this.featureManager
    );

    // Initialize Data Manager
    this.dataManager = new DataManager(this.app, this.featureManager);

    // Initialize Document Manager
    this.documentManager = new DocumentManager(this.app, this.featureManager);

    // Initialize Assistant Manager
    this.assistantManager = new AssistantManager(
      this.app,
      this.featureManager,
      this.aiOrchestrator
    );

    // Initialize Development Manager
    this.developmentManager = new DevelopmentManager(
      this.app,
      this.featureManager
    );

    // Initialize Collaboration Manager
    this.collaborationManager = new CollaborationManager(
      this.app,
      this.featureManager
    );

    console.log("✅ Feature managers initialized");
  }

  async initializeUIComponents() {
    console.log("🔧 Initializing UI components...");

    // Initialize Chat View
    if (this.settings.enableChatView) {
      this.chatView = new ChatView(
        this.app,
        this.featureManager,
        this.aiOrchestrator
      );
    }

    // Initialize Settings Panel
    if (this.settings.enableSettingsPanel) {
      this.settingsPanel = new SettingsPanel(
        this.app,
        this.featureManager,
        this
      );
    }

    // Initialize Sidebar View
    if (this.settings.enableSidebar) {
      this.sidebarView = new SidebarView(this.app, this.featureManager, this);
    }

    console.log("✅ UI components initialized");
  }

  registerViews() {
    console.log("🔧 Registering views...");

    // Register Chat View
    if (this.settings.enableChatView) {
      this.chatViewType = this.registerView(
        "ultima-orb-chat",
        (leaf) =>
          new ChatView(this.app, this.featureManager, this.aiOrchestrator, leaf)
      );
    }

    // Register Sidebar View
    if (this.settings.enableSidebar) {
      this.sidebarViewType = this.registerView(
        "ultima-orb-sidebar",
        (leaf) => new SidebarView(this.app, this.featureManager, this, leaf)
      );
    }

    console.log("✅ Views registered");
  }

  registerCommands() {
    console.log("🔧 Registering commands...");

    // Register AI Commands
    this.addCommand({
      id: "ultima-orb-ai-chat",
      name: "Open AI Chat",
      callback: () => this.openChatView(),
    });

        this.addCommand({
      id: "ultima-orb-ai-complete",
      name: "AI Code Completion",
      callback: async () => {
        const activeFile = this.app.workspace.getActiveFile();
        if (activeFile) {
          const content = await this.app.vault.read(activeFile);
          await this.aiOrchestrator.completeCode(content);
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
          await this.aiOrchestrator.explainCode(content);
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
          await this.aiOrchestrator.refactorCode(content);
        }
      },
    });

    // Register Agent Commands
    this.addCommand({
      id: "ultima-orb-agent-mode",
      name: "Toggle Agent Mode",
      callback: () => this.agentManager.toggleAgentMode(),
    });

    this.addCommand({
      id: "ultima-orb-agent-flow",
      name: "Agent Flow Mode",
      callback: () => this.agentManager.startFlowMode(),
    });

    // Register Knowledge Commands
    this.addCommand({
      id: "ultima-orb-knowledge-search",
      name: "Search Knowledge Base",
      callback: () => this.knowledgeManager.search(),
    });

    this.addCommand({
      id: "ultima-orb-knowledge-index",
      name: "Index Current File",
      callback: () => this.knowledgeManager.indexCurrentFile(),
    });

    // Register Integration Commands
    this.addCommand({
      id: "ultima-orb-github-sync",
      name: "Sync with GitHub",
      callback: () => this.integrationManager.syncWithGitHub(),
    });

    this.addCommand({
      id: "ultima-orb-notion-sync",
      name: "Sync with Notion",
      callback: () => this.integrationManager.syncWithNotion(),
    });

    // Register Visualization Commands
    this.addCommand({
      id: "ultima-orb-create-chart",
      name: "Create Chart",
      callback: () => this.visualizationManager.createChart(),
    });

    this.addCommand({
      id: "ultima-orb-create-mindmap",
      name: "Create Mind Map",
      callback: () => this.visualizationManager.createMindMap(),
    });

    // Register Productivity Commands
    this.addCommand({
      id: "ultima-orb-kanban-board",
      name: "Open Kanban Board",
      callback: () => this.productivityManager.openKanbanBoard(),
    });

    this.addCommand({
      id: "ultima-orb-calendar",
      name: "Open Calendar",
      callback: () => this.productivityManager.openCalendar(),
    });

    // Register Development Commands
    this.addCommand({
      id: "ultima-orb-code-analysis",
      name: "Code Analysis",
      callback: () => this.developmentManager.analyzeCode(),
    });

    this.addCommand({
      id: "ultima-orb-performance-test",
      name: "Performance Test",
      callback: () => this.developmentManager.testPerformance(),
    });

    console.log("✅ Commands registered");
  }

  registerEventListeners() {
    console.log("🔧 Registering event listeners...");

    // Listen for file changes
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (this.settings.enableRAG) {
          this.knowledgeManager.updateIndex(file);
        }
      })
    );

    // Listen for file creation
    this.registerEvent(
      this.app.vault.on("create", (file) => {
        if (this.settings.enableRAG) {
          this.knowledgeManager.indexFile(file);
        }
      })
    );

    // Listen for file deletion
    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        if (this.settings.enableRAG) {
          this.knowledgeManager.removeFromIndex(file);
        }
      })
    );

    console.log("✅ Event listeners registered");
  }

  async openChatView() {
    const leaf = this.app.workspace.getRightLeaf(false);
    await leaf.setViewState({
      type: "ultima-orb-chat",
      active: true,
    });
    this.app.workspace.revealLeaf(leaf);
  }

  async openSidebarView() {
    const leaf = this.app.workspace.getLeftLeaf(false);
    await leaf.setViewState({
      type: "ultima-orb-sidebar",
      active: true,
    });
    this.app.workspace.revealLeaf(leaf);
  }

  async onunload() {
    console.log("🔄 Unloading Ultima-Orb Plugin...");

    // Cleanup managers
    if (this.aiOrchestrator) {
      await this.aiOrchestrator.cleanup();
    }

    if (this.agentManager) {
      await this.agentManager.cleanup();
    }

    if (this.knowledgeManager) {
      await this.knowledgeManager.cleanup();
    }

    if (this.integrationManager) {
      await this.integrationManager.cleanup();
    }

    if (this.visualizationManager) {
      await this.visualizationManager.cleanup();
    }

    console.log("✅ Ultima-Orb Plugin unloaded");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class UltimaOrbSettingTab extends PluginSettingTab {
  plugin: UltimaOrbPlugin;

  constructor(app: App, plugin: UltimaOrbPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Ultima-Orb Settings" });

    // AI Settings Section
    this.createAISettingsSection(containerEl);

    // Feature Settings Section
    this.createFeatureSettingsSection(containerEl);

    // UI Settings Section
    this.createUISettingsSection(containerEl);

    // Integration Settings Section
    this.createIntegrationSettingsSection(containerEl);

    // Local AI Settings Section
    this.createLocalAISettingsSection(containerEl);

    // Visualization Settings Section
    this.createVisualizationSettingsSection(containerEl);

    // Advanced Settings Section
    this.createAdvancedSettingsSection(containerEl);
  }

  createAISettingsSection(containerEl: HTMLElement) {
    containerEl.createEl("h3", { text: "AI Settings" });

    new Setting(containerEl)
      .setName("OpenAI API Key")
      .setDesc("Enter your OpenAI API key")
      .addText((text) =>
        text
          .setPlaceholder("sk-...")
          .setValue(this.plugin.settings.openaiApiKey)
          .onChange(async (value) => {
            this.plugin.settings.openaiApiKey = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Anthropic API Key")
      .setDesc("Enter your Anthropic API key")
      .addText((text) =>
        text
          .setPlaceholder("sk-ant-...")
          .setValue(this.plugin.settings.anthropicApiKey)
          .onChange(async (value) => {
            this.plugin.settings.anthropicApiKey = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Google API Key")
      .setDesc("Enter your Google API key")
      .addText((text) =>
        text
          .setPlaceholder("AIza...")
          .setValue(this.plugin.settings.googleApiKey)
          .onChange(async (value) => {
            this.plugin.settings.googleApiKey = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Default AI Model")
      .setDesc("Choose your default AI model")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("gpt-4", "GPT-4")
          .addOption("gpt-3.5-turbo", "GPT-3.5 Turbo")
          .addOption("claude-3", "Claude 3")
          .addOption("gemini-pro", "Gemini Pro")
          .setValue(this.plugin.settings.defaultAIModel)
          .onChange(async (value) => {
            this.plugin.settings.defaultAIModel = value;
            await this.plugin.saveSettings();
          })
      );
  }

  createFeatureSettingsSection(containerEl: HTMLElement) {
    containerEl.createEl("h3", { text: "Feature Settings" });

    new Setting(containerEl)
      .setName("Enable Advanced Features")
      .setDesc("Enable advanced AI features")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableAdvancedFeatures)
          .onChange(async (value) => {
            this.plugin.settings.enableAdvancedFeatures = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Enable Max Mode")
      .setDesc("Enable premium features (requires Max Mode API key)")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableMaxMode)
          .onChange(async (value) => {
            this.plugin.settings.enableMaxMode = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Max Mode API Key")
      .setDesc("Enter your Max Mode API key")
      .addText((text) =>
        text
          .setPlaceholder("max-...")
          .setValue(this.plugin.settings.maxModeApiKey)
          .onChange(async (value) => {
            this.plugin.settings.maxModeApiKey = value;
            await this.plugin.saveSettings();
          })
      );
  }

  createUISettingsSection(containerEl: HTMLElement) {
    containerEl.createEl("h3", { text: "UI Settings" });

    new Setting(containerEl)
      .setName("Enable Chat View")
      .setDesc("Enable the AI chat interface")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableChatView)
          .onChange(async (value) => {
            this.plugin.settings.enableChatView = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Enable Sidebar")
      .setDesc("Enable the sidebar view")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableSidebar)
          .onChange(async (value) => {
            this.plugin.settings.enableSidebar = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Enable Settings Panel")
      .setDesc("Enable the settings panel")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableSettingsPanel)
          .onChange(async (value) => {
            this.plugin.settings.enableSettingsPanel = value;
            await this.plugin.saveSettings();
          })
      );
  }

  createIntegrationSettingsSection(containerEl: HTMLElement) {
    containerEl.createEl("h3", { text: "Integration Settings" });

    new Setting(containerEl)
      .setName("Enable GitHub Integration")
      .setDesc("Enable GitHub integration features")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableGitHub)
          .onChange(async (value) => {
            this.plugin.settings.enableGitHub = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("GitHub API Key")
      .setDesc("Enter your GitHub API key")
      .addText((text) =>
        text
          .setPlaceholder("ghp_...")
          .setValue(this.plugin.settings.githubApiKey)
          .onChange(async (value) => {
            this.plugin.settings.githubApiKey = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Enable Notion Integration")
      .setDesc("Enable Notion integration features")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableNotion)
          .onChange(async (value) => {
            this.plugin.settings.enableNotion = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Notion API Key")
      .setDesc("Enter your Notion API key")
      .addText((text) =>
        text
          .setPlaceholder("secret_...")
          .setValue(this.plugin.settings.notionApiKey)
          .onChange(async (value) => {
            this.plugin.settings.notionApiKey = value;
            await this.plugin.saveSettings();
          })
      );
  }

  createLocalAISettingsSection(containerEl: HTMLElement) {
    containerEl.createEl("h3", { text: "Local AI Settings" });

    new Setting(containerEl)
      .setName("Enable Ollama")
      .setDesc("Enable Ollama local AI models")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableOllama)
          .onChange(async (value) => {
            this.plugin.settings.enableOllama = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Ollama Base URL")
      .setDesc("Ollama server URL")
      .addText((text) =>
        text
          .setPlaceholder("http://localhost:11434")
          .setValue(this.plugin.settings.ollamaBaseUrl)
          .onChange(async (value) => {
            this.plugin.settings.ollamaBaseUrl = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Enable LM Studio")
      .setDesc("Enable LM Studio local AI models")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableLMStudio)
          .onChange(async (value) => {
            this.plugin.settings.enableLMStudio = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("LM Studio Base URL")
      .setDesc("LM Studio server URL")
      .addText((text) =>
        text
          .setPlaceholder("http://localhost:1234")
          .setValue(this.plugin.settings.lmStudioBaseUrl)
          .onChange(async (value) => {
            this.plugin.settings.lmStudioBaseUrl = value;
            await this.plugin.saveSettings();
          })
      );
  }

  createVisualizationSettingsSection(containerEl: HTMLElement) {
    containerEl.createEl("h3", { text: "Visualization Settings" });

    new Setting(containerEl)
      .setName("Enable Chart.js")
      .setDesc("Enable Chart.js visualization library")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableChartJS)
          .onChange(async (value) => {
            this.plugin.settings.enableChartJS = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Enable D3.js")
      .setDesc("Enable D3.js visualization library")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableD3JS)
          .onChange(async (value) => {
            this.plugin.settings.enableD3JS = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Enable Three.js")
      .setDesc("Enable Three.js 3D visualization library")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableThreeJS)
          .onChange(async (value) => {
            this.plugin.settings.enableThreeJS = value;
            await this.plugin.saveSettings();
          })
      );
  }

  createAdvancedSettingsSection(containerEl: HTMLElement) {
    containerEl.createEl("h3", { text: "Advanced Settings" });

    new Setting(containerEl)
      .setName("Enable Scripting")
      .setDesc("Enable advanced scripting features")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableScripting)
          .onChange(async (value) => {
            this.plugin.settings.enableScripting = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Enable RAG")
      .setDesc("Enable Retrieval-Augmented Generation")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableRAG)
          .onChange(async (value) => {
            this.plugin.settings.enableRAG = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Enable Excalidraw")
      .setDesc("Enable Excalidraw drawing features")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableExcalidraw)
          .onChange(async (value) => {
            this.plugin.settings.enableExcalidraw = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
