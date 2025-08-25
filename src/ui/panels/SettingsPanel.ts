import { App, PluginSettingTab, Setting } from "obsidian";
import { UltimaOrbPlugin } from "../../UltimaOrbPlugin";
import { UltimaOrbSettings } from "../../settings";
import { FeatureManager } from "../../core/FeatureManager";

export class SettingsPanel extends PluginSettingTab {
  private app: App;
  private featureManager: FeatureManager;
  private plugin: UltimaOrbPlugin;

  constructor(
    app: App,
    featureManager: FeatureManager,
    plugin: UltimaOrbPlugin
  ) {
    super(app, plugin);
    this.app = app;
    this.featureManager = featureManager;
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

  private createAISettingsSection(containerEl: HTMLElement) {
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

  private createFeatureSettingsSection(containerEl: HTMLElement) {
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

  private createUISettingsSection(containerEl: HTMLElement) {
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

  private createIntegrationSettingsSection(containerEl: HTMLElement) {
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

  private createLocalAISettingsSection(containerEl: HTMLElement) {
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

  private createVisualizationSettingsSection(containerEl: HTMLElement) {
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

  private createAdvancedSettingsSection(containerEl: HTMLElement) {
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
