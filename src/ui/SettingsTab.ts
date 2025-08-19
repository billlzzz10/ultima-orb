import { App, PluginSettingTab, Setting } from "obsidian";
import UltimaOrbPlugin from "../UltimaOrbPlugin";
import { Logger } from "../services/Logger";

/**
 * 🎨 Settings Tab
 * UI การตั้งค่าหลัก แบบ Tabs
 * Version: v1.1.0
 * Priority: High
 */

export class UltimaOrbSettingTab extends PluginSettingTab {
  private plugin: UltimaOrbPlugin;
  private logger: Logger;

  constructor(app: App, plugin: UltimaOrbPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.logger = new Logger();
  }

  display(): void {
    this.logger.info("Displaying Ultima-Orb Settings Tab");

    const { containerEl } = this;
    containerEl.empty();

    // Header
    containerEl.createEl("h2", { text: "Ultima-Orb Settings" });
    containerEl.createEl("p", {
      text: "Configure your Ultima-Orb AI assistant and integrations",
      cls: "setting-item-description",
    });

    // Create tab navigation
    this.createTabNavigation(containerEl);

    // Create tab content
    this.createTabContent(containerEl);
  }

  /**
   * Create tab navigation
   */
  private createTabNavigation(containerEl: HTMLElement): void {
    const tabContainer = containerEl.createEl("div", {
      cls: "ultima-orb-tabs",
    });

    const tabs = [
      { id: "ai", name: "🤖 AI Providers", icon: "brain" },
      { id: "model", name: "⚙️ Model Settings", icon: "settings" },
      { id: "integrations", name: "🔗 Integrations", icon: "link" },
      { id: "ui", name: "🎨 UI Settings", icon: "layout" },
      { id: "advanced", name: "🔧 Advanced", icon: "tool" },
    ];

    const tabNav = tabContainer.createEl("div", { cls: "ultima-orb-tab-nav" });

    tabs.forEach((tab, index) => {
      const tabButton = tabNav.createEl("button", {
        cls: `ultima-orb-tab-button ${index === 0 ? "active" : ""}`,
        attr: { "data-tab": tab.id },
      });

      tabButton.createEl("span", { text: tab.name });

      tabButton.addEventListener("click", () => {
        this.switchTab(tab.id);
      });
    });
  }

  /**
   * Create tab content
   */
  private createTabContent(containerEl: HTMLElement): void {
    const contentContainer = containerEl.createEl("div", {
      cls: "ultima-orb-tab-content",
    });

    // AI Providers Tab
    this.createAITab(contentContainer);

    // Model Settings Tab
    this.createModelTab(contentContainer);

    // Integrations Tab
    this.createIntegrationsTab(contentContainer);

    // UI Settings Tab
    this.createUITab(contentContainer);

    // Advanced Tab
    this.createAdvancedTab(contentContainer);

    // Show first tab by default
    this.showTab("ai");
  }

  /**
   * Switch tab
   */
  private switchTab(tabId: string): void {
    // Update tab buttons
    const tabButtons = document.querySelectorAll(".ultima-orb-tab-button");
    tabButtons.forEach((button) => {
      button.classList.remove("active");
      if (button.getAttribute("data-tab") === tabId) {
        button.classList.add("active");
      }
    });

    // Show tab content
    this.showTab(tabId);
  }

  /**
   * Show tab content
   */
  private showTab(tabId: string): void {
    const tabContents = document.querySelectorAll(".ultima-orb-tab-panel");
    tabContents.forEach((content) => {
      content.classList.remove("active");
      if (content.getAttribute("data-tab") === tabId) {
        content.classList.add("active");
      }
    });
  }

  /**
   * Create AI Providers Tab
   */
  private createAITab(container: HTMLElement): void {
    const tabPanel = container.createEl("div", {
      cls: "ultima-orb-tab-panel",
      attr: { "data-tab": "ai" },
    });

    tabPanel.createEl("h3", { text: "🤖 AI Provider Settings" });
    tabPanel.createEl("p", {
      text: "Configure your AI service providers and API keys",
      cls: "setting-item-description",
    });

    // OpenAI Settings
    new Setting(tabPanel)
      .setName("OpenAI API Key")
      .setDesc("Enter your OpenAI API key for GPT models")
      .addText((text) => {
        text
          .setPlaceholder("sk-...")
          .setValue(this.plugin.getSettingsManager().getSetting("openaiApiKey"))
          .onChange(async (value) => {
            this.plugin.getSettingsManager().setSetting("openaiApiKey", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });

    // Claude Settings
    new Setting(tabPanel)
      .setName("Claude API Key")
      .setDesc("Enter your Anthropic Claude API key")
      .addText((text) => {
        text
          .setPlaceholder("sk-ant-...")
          .setValue(this.plugin.getSettingsManager().getSetting("claudeApiKey"))
          .onChange(async (value) => {
            this.plugin.getSettingsManager().setSetting("claudeApiKey", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });

    // Gemini Settings
    new Setting(tabPanel)
      .setName("Gemini API Key")
      .setDesc("Enter your Google Gemini API key")
      .addText((text) => {
        text
          .setPlaceholder("AIza...")
          .setValue(this.plugin.getSettingsManager().getSetting("geminiApiKey"))
          .onChange(async (value) => {
            this.plugin.getSettingsManager().setSetting("geminiApiKey", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });

    // Ollama Settings
    new Setting(tabPanel)
      .setName("Ollama Endpoint")
      .setDesc("Local Ollama server endpoint")
      .addText((text) => {
        text
          .setPlaceholder("http://localhost:11434")
          .setValue(
            this.plugin.getSettingsManager().getSetting("ollamaEndpoint")
          )
          .onChange(async (value) => {
            this.plugin
              .getSettingsManager()
              .setSetting("ollamaEndpoint", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });

    // AnythingLLM Settings
    new Setting(tabPanel)
      .setName("AnythingLLM Endpoint")
      .setDesc("AnythingLLM server endpoint")
      .addText((text) => {
        text
          .setPlaceholder("http://localhost:3001")
          .setValue(
            this.plugin.getSettingsManager().getSetting("anythingLLMEndpoint")
          )
          .onChange(async (value) => {
            this.plugin
              .getSettingsManager()
              .setSetting("anythingLLMEndpoint", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });
  }

  /**
   * Create Model Settings Tab
   */
  private createModelTab(container: HTMLElement): void {
    const tabPanel = container.createEl("div", {
      cls: "ultima-orb-tab-panel",
      attr: { "data-tab": "model" },
    });

    tabPanel.createEl("h3", { text: "⚙️ Model Settings" });
    tabPanel.createEl("p", {
      text: "Configure AI model parameters and behavior",
      cls: "setting-item-description",
    });

    // Default Model
    new Setting(tabPanel)
      .setName("Default Model")
      .setDesc("Select your preferred AI model")
      .addDropdown((dropdown) => {
        dropdown
          .addOption("gpt-3.5-turbo", "GPT-3.5 Turbo")
          .addOption("gpt-4", "GPT-4")
          .addOption("claude-3-sonnet", "Claude 3 Sonnet")
          .addOption("claude-3-haiku", "Claude 3 Haiku")
          .addOption("gemini-pro", "Gemini Pro")
          .addOption("llama2", "Llama 2 (Ollama)")
          .addOption("anythingllm", "AnythingLLM")
          .setValue(this.plugin.getSettingsManager().getSetting("defaultModel"))
          .onChange(async (value) => {
            this.plugin.getSettingsManager().setSetting("defaultModel", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });

    // Temperature
    new Setting(tabPanel)
      .setName("Temperature")
      .setDesc("Control randomness (0 = focused, 2 = creative)")
      .addSlider((slider) => {
        slider
          .setLimits(0, 2, 0.1)
          .setValue(this.plugin.getSettingsManager().getSetting("temperature"))
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.getSettingsManager().setSetting("temperature", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });

    // Max Tokens
    new Setting(tabPanel)
      .setName("Max Tokens")
      .setDesc("Maximum response length")
      .addText((text) => {
        text
          .setPlaceholder("2048")
          .setValue(
            this.plugin.getSettingsManager().getSetting("maxTokens").toString()
          )
          .onChange(async (value) => {
            const numValue = parseInt(value) || 2048;
            this.plugin.getSettingsManager().setSetting("maxTokens", numValue);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });
  }

  /**
   * Create Integrations Tab
   */
  private createIntegrationsTab(container: HTMLElement): void {
    const tabPanel = container.createEl("div", {
      cls: "ultima-orb-tab-panel",
      attr: { "data-tab": "integrations" },
    });

    tabPanel.createEl("h3", { text: "🔗 Integration Settings" });
    tabPanel.createEl("p", {
      text: "Connect with external services and platforms",
      cls: "setting-item-description",
    });

    // Notion Integration
    new Setting(tabPanel)
      .setName("Notion Integration")
      .setDesc("Connect to Notion workspace")
      .addText((text) => {
        text
          .setPlaceholder("secret_...")
          .setValue(this.plugin.getSettingsManager().getSetting("notionToken"))
          .onChange(async (value) => {
            this.plugin.getSettingsManager().setSetting("notionToken", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });

    // Airtable Integration
    new Setting(tabPanel)
      .setName("Airtable API Key")
      .setDesc("Connect to Airtable databases")
      .addText((text) => {
        text
          .setPlaceholder("key...")
          .setValue(
            this.plugin.getSettingsManager().getSetting("airtableApiKey")
          )
          .onChange(async (value) => {
            this.plugin
              .getSettingsManager()
              .setSetting("airtableApiKey", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });

    // ClickUp Integration
    new Setting(tabPanel)
      .setName("ClickUp API Key")
      .setDesc("Connect to ClickUp workspace")
      .addText((text) => {
        text
          .setPlaceholder("pk_...")
          .setValue(
            this.plugin.getSettingsManager().getSetting("clickUpApiKey")
          )
          .onChange(async (value) => {
            this.plugin.getSettingsManager().setSetting("clickUpApiKey", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });
  }

  /**
   * Create UI Settings Tab
   */
  private createUITab(container: HTMLElement): void {
    const tabPanel = container.createEl("div", {
      cls: "ultima-orb-tab-panel",
      attr: { "data-tab": "ui" },
    });

    tabPanel.createEl("h3", { text: "🎨 UI Settings" });
    tabPanel.createEl("p", {
      text: "Customize the user interface and features",
      cls: "setting-item-description",
    });

    // Enable Chat View
    new Setting(tabPanel)
      .setName("Enable Chat View")
      .setDesc("Enable the AI chat interface")
      .addToggle((toggle) => {
        toggle
          .setValue(
            this.plugin.getSettingsManager().getSetting("enableChatView")
          )
          .onChange(async (value) => {
            this.plugin
              .getSettingsManager()
              .setSetting("enableChatView", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });

    // Enable Tool Template View
    new Setting(tabPanel)
      .setName("Enable Tool Template View")
      .setDesc("Enable tool template management")
      .addToggle((toggle) => {
        toggle
          .setValue(
            this.plugin
              .getSettingsManager()
              .getSetting("enableToolTemplateView")
          )
          .onChange(async (value) => {
            this.plugin
              .getSettingsManager()
              .setSetting("enableToolTemplateView", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });

    // Enable Knowledge View
    new Setting(tabPanel)
      .setName("Enable Knowledge View")
      .setDesc("Enable knowledge base management")
      .addToggle((toggle) => {
        toggle
          .setValue(
            this.plugin.getSettingsManager().getSetting("enableKnowledgeView")
          )
          .onChange(async (value) => {
            this.plugin
              .getSettingsManager()
              .setSetting("enableKnowledgeView", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });
  }

  /**
   * Create Advanced Settings Tab
   */
  private createAdvancedTab(container: HTMLElement): void {
    const tabPanel = container.createEl("div", {
      cls: "ultima-orb-tab-panel",
      attr: { "data-tab": "advanced" },
    });

    tabPanel.createEl("h3", { text: "🔧 Advanced Settings" });
    tabPanel.createEl("p", {
      text: "Advanced configuration options for power users",
      cls: "setting-item-description",
    });

    // Enable Logging
    new Setting(tabPanel)
      .setName("Enable Logging")
      .setDesc("Enable detailed logging for debugging")
      .addToggle((toggle) => {
        toggle
          .setValue(
            this.plugin.getSettingsManager().getSetting("enableLogging")
          )
          .onChange(async (value) => {
            this.plugin.getSettingsManager().setSetting("enableLogging", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });

    // Performance Optimization
    new Setting(tabPanel)
      .setName("Performance Optimization")
      .setDesc("Enable performance optimizations")
      .addToggle((toggle) => {
        toggle
          .setValue(
            this.plugin
              .getSettingsManager()
              .getSetting("enablePerformanceOptimization")
          )
          .onChange(async (value) => {
            this.plugin
              .getSettingsManager()
              .setSetting("enablePerformanceOptimization", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });

    // Bundle Optimization
    new Setting(tabPanel)
      .setName("Bundle Optimization")
      .setDesc("Enable bundle size optimizations")
      .addToggle((toggle) => {
        toggle
          .setValue(
            this.plugin
              .getSettingsManager()
              .getSetting("enableBundleOptimization")
          )
          .onChange(async (value) => {
            this.plugin
              .getSettingsManager()
              .setSetting("enableBundleOptimization", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });

    // Reset to Defaults Button
    new Setting(tabPanel)
      .setName("Reset to Defaults")
      .setDesc("Reset all settings to their default values")
      .addButton((button) => {
        button
          .setButtonText("Reset")
          .setWarning()
          .onClick(async () => {
            this.plugin.getSettingsManager().resetToDefaults();
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
            this.display(); // Refresh the settings display
          });
      });
  }
}
