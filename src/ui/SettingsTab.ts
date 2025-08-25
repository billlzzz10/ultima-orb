import { PluginSettingTab, Setting, App } from "obsidian";
import { UltimaOrbPlugin } from "../UltimaOrbPlugin";

export class SettingsTab extends PluginSettingTab {
  plugin: UltimaOrbPlugin;

  constructor(app: App, plugin: UltimaOrbPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Ultima-Orb Settings" });

    // AI Provider Settings
    this.createAISettings();

    // Integration Settings
    this.createIntegrationSettings();

    // UI Settings
    this.createUISettings();

    // Advanced Settings
    this.createAdvancedSettings();
  }

  private createAISettings(): void {
    const container = this.containerEl.createEl("div");
    container.createEl("h3", { text: "AI Provider Settings" });

    new Setting(container)
      .setName("OpenAI API Key")
      .setDesc("Enter your OpenAI API key")
      .addText((text) =>
        text
          .setPlaceholder("sk-...")
          .setValue(this.plugin.settings.openaiApiKey)
          .onChange(async (value) => {
            this.plugin.settings.openaiApiKey = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(container)
      .setName("Anthropic API Key")
      .setDesc("Enter your Anthropic API key")
      .addText((text) =>
        text
          .setPlaceholder("sk-ant-...")
          .setValue(this.plugin.settings.anthropicApiKey)
          .onChange(async (value) => {
            this.plugin.settings.anthropicApiKey = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(container)
      .setName("Google AI API Key")
      .setDesc("Enter your Google AI API key")
      .addText((text) =>
        text
          .setPlaceholder("AIza...")
          .setValue(this.plugin.settings.googleApiKey)
          .onChange(async (value) => {
            this.plugin.settings.googleApiKey = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(container)
      .setName("Default AI Model")
      .setDesc("Select the default AI model to use")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("gpt-3.5-turbo", "GPT-3.5 Turbo")
          .addOption("gpt-4", "GPT-4")
          .addOption("claude-3-sonnet", "Claude 3 Sonnet")
          .addOption("claude-3-opus", "Claude 3 Opus")
          .addOption("gemini-pro", "Gemini Pro")
          .setValue(this.plugin.settings.defaultModel)
          .onChange(async (value) => {
            this.plugin.settings.defaultModel = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );
  }

  private createIntegrationSettings(): void {
    const container = this.containerEl.createEl("div");
    container.createEl("h3", { text: "Integration Settings" });

    new Setting(container)
      .setName("Notion Token")
      .setDesc("Enter your Notion integration token")
      .addText((text) =>
        text
          .setPlaceholder("secret_...")
          .setValue(this.plugin.settings.notionToken)
          .onChange(async (value) => {
            this.plugin.settings.notionToken = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(container)
      .setName("Airtable API Key")
      .setDesc("Enter your Airtable API key")
      .addText((text) =>
        text
          .setPlaceholder("key...")
          .setValue(this.plugin.settings.airtableApiKey)
          .onChange(async (value) => {
            this.plugin.settings.airtableApiKey = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(container)
      .setName("ClickUp API Key")
      .setDesc("Enter your ClickUp API key")
      .addText((text) =>
        text
          .setPlaceholder("pk_...")
          .setValue(this.plugin.settings.clickUpApiKey)
          .onChange(async (value) => {
            this.plugin.settings.clickUpApiKey = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );
  }

  private createUISettings(): void {
    const container = this.containerEl.createEl("div");
    container.createEl("h3", { text: "UI Settings" });

    new Setting(container)
      .setName("Enable Chat View")
      .setDesc("Show the AI chat interface")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableChatView)
          .onChange(async (value) => {
            this.plugin.settings.enableChatView = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(container)
      .setName("Enable Sidebar")
      .setDesc("Show the Ultima-Orb sidebar")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableSidebar)
          .onChange(async (value) => {
            this.plugin.settings.enableSidebar = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(container)
      .setName("Enable Knowledge View")
      .setDesc("Show the knowledge base interface")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableKnowledgeView)
          .onChange(async (value) => {
            this.plugin.settings.enableKnowledgeView = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );
  }

  private createAdvancedSettings(): void {
    const container = this.containerEl.createEl("div");
    container.createEl("h3", { text: "Advanced Settings" });

    new Setting(container)
      .setName("Enable Advanced Features")
      .setDesc("Enable advanced AI features")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableAdvancedFeatures)
          .onChange(async (value) => {
            this.plugin.settings.enableAdvancedFeatures = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(container)
      .setName("Enable RAG")
      .setDesc("Enable Retrieval-Augmented Generation")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableRAG)
          .onChange(async (value) => {
            this.plugin.settings.enableRAG = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );

    new Setting(container)
      .setName("Enable Scripting")
      .setDesc("Enable JavaScript scripting features")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableScripting)
          .onChange(async (value) => {
            this.plugin.settings.enableScripting = value;
            await this.plugin.saveData(this.plugin.settings);
          })
      );
  }
}
