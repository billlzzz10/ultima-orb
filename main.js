"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => main_default
});
module.exports = __toCommonJS(main_exports);

// src/UltimaOrbPlugin.ts
var import_obsidian2 = require("obsidian");

// src/settings.ts
var DEFAULT_SETTINGS = {
  // AI Provider Settings
  openaiApiKey: "",
  claudeApiKey: "",
  geminiApiKey: "",
  ollamaEndpoint: "http://localhost:11434",
  anythingLLMEndpoint: "http://localhost:3001",
  // Model Settings
  defaultModel: "gpt-3.5-turbo",
  temperature: 0.7,
  maxTokens: 2048,
  // Integration Settings
  notionToken: "",
  airtableApiKey: "",
  clickUpApiKey: "",
  // UI Settings
  enableChatView: true,
  enableToolTemplateView: true,
  enableKnowledgeView: true,
  // Advanced Settings
  enableLogging: true,
  enablePerformanceOptimization: true,
  enableBundleOptimization: true
};
var SettingsManager = class {
  constructor(initialSettings = {}) {
    this.settings = { ...DEFAULT_SETTINGS, ...initialSettings };
  }
  /**
   * Get all settings
   */
  getSettings() {
    return { ...this.settings };
  }
  /**
   * Update settings
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }
  /**
   * Get specific setting
   */
  getSetting(key) {
    return this.settings[key];
  }
  /**
   * Set specific setting
   */
  setSetting(key, value) {
    this.settings[key] = value;
  }
  /**
   * Reset to default settings
   */
  resetToDefaults() {
    this.settings = { ...DEFAULT_SETTINGS };
  }
};

// src/services/Logger.ts
var Logger = class {
  constructor() {
    this.prefix = "[Ultima-Orb]";
  }
  info(message, ...args) {
    console.log(`${this.prefix} [INFO] ${message}`, ...args);
  }
  warn(message, ...args) {
    console.warn(`${this.prefix} [WARN] ${message}`, ...args);
  }
  error(message, error) {
    console.error(`${this.prefix} [ERROR] ${message}`, error);
  }
  debug(message, ...args) {
    console.debug(`${this.prefix} [DEBUG] ${message}`, ...args);
  }
};

// src/core/ContextManager.ts
var ContextManager = class {
  constructor(app) {
    this.app = app;
    this.logger = new Logger();
    this.contextData = {
      activeFile: null,
      attachedFiles: [],
      vaultFiles: [],
      selectedText: "",
      cursorPosition: null,
      metadata: {}
    };
  }
  /**
   * Initialize context manager
   */
  async initialize() {
    this.logger.info("Initializing Context Manager...");
    await this.refreshContext();
  }
  /**
   * Refresh context data
   */
  async refreshContext() {
    try {
      const activeFile = this.app.workspace.getActiveFile();
      if (activeFile) {
        this.contextData.activeFile = await this.getFileContext(activeFile);
      }
      this.contextData.vaultFiles = this.app.vault.getMarkdownFiles();
      this.logger.info("Context refreshed successfully");
    } catch (error) {
      this.logger.error("Error refreshing context:", error);
    }
  }
  /**
   * Get file context
   */
  async getFileContext(file) {
    var _a, _b, _c;
    try {
      const content = await this.app.vault.read(file);
      const frontmatter = ((_a = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _a.frontmatter) || {};
      const tags = ((_c = (_b = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _b.tags) == null ? void 0 : _c.map((t) => t.tag)) || [];
      return {
        file,
        content,
        path: file.path,
        name: file.name,
        extension: file.extension,
        size: file.stat.size,
        modified: new Date(file.stat.mtime),
        tags,
        frontmatter
      };
    } catch (error) {
      this.logger.error(
        `Error getting file context for ${file.path}:`,
        error
      );
      throw error;
    }
  }
  /**
   * Get current context data
   */
  getContextData() {
    return { ...this.contextData };
  }
  /**
   * Get active file context
   */
  getActiveFileContext() {
    return this.contextData.activeFile;
  }
  /**
   * Get attached files
   */
  getAttachedFiles() {
    return [...this.contextData.attachedFiles];
  }
  /**
   * Add attached file
   */
  async addAttachedFile(file) {
    const fileContext = await this.getFileContext(file);
    this.contextData.attachedFiles.push(fileContext);
    this.logger.info(`Added attached file: ${file.path}`);
  }
  /**
   * Remove attached file
   */
  removeAttachedFile(filePath) {
    this.contextData.attachedFiles = this.contextData.attachedFiles.filter(
      (f) => f.path !== filePath
    );
    this.logger.info(`Removed attached file: ${filePath}`);
  }
  /**
   * Set selected text
   */
  setSelectedText(text) {
    this.contextData.selectedText = text;
  }
  /**
   * Set cursor position
   */
  setCursorPosition(position) {
    this.contextData.cursorPosition = position;
  }
  /**
   * Add metadata
   */
  addMetadata(key, value) {
    this.contextData.metadata[key] = value;
  }
  /**
   * Get metadata
   */
  getMetadata(key) {
    return this.contextData.metadata[key];
  }
  /**
   * Clear context
   */
  clearContext() {
    this.contextData = {
      activeFile: null,
      attachedFiles: [],
      vaultFiles: [],
      selectedText: "",
      cursorPosition: null,
      metadata: {}
    };
    this.logger.info("Context cleared");
  }
};

// src/ui/SettingsTab.ts
var import_obsidian = require("obsidian");
var UltimaOrbSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.logger = new Logger();
  }
  display() {
    this.logger.info("Displaying Ultima-Orb Settings Tab");
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Ultima-Orb Settings" });
    containerEl.createEl("p", {
      text: "Configure your Ultima-Orb AI assistant and integrations",
      cls: "setting-item-description"
    });
    this.createTabNavigation(containerEl);
    this.createTabContent(containerEl);
  }
  /**
   * Create tab navigation
   */
  createTabNavigation(containerEl) {
    const tabContainer = containerEl.createEl("div", {
      cls: "ultima-orb-tabs"
    });
    const tabs = [
      { id: "ai", name: "\u{1F916} AI Providers", icon: "brain" },
      { id: "model", name: "\u2699\uFE0F Model Settings", icon: "settings" },
      { id: "integrations", name: "\u{1F517} Integrations", icon: "link" },
      { id: "ui", name: "\u{1F3A8} UI Settings", icon: "layout" },
      { id: "advanced", name: "\u{1F527} Advanced", icon: "tool" }
    ];
    const tabNav = tabContainer.createEl("div", { cls: "ultima-orb-tab-nav" });
    tabs.forEach((tab, index) => {
      const tabButton = tabNav.createEl("button", {
        cls: `ultima-orb-tab-button ${index === 0 ? "active" : ""}`,
        attr: { "data-tab": tab.id }
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
  createTabContent(containerEl) {
    const contentContainer = containerEl.createEl("div", {
      cls: "ultima-orb-tab-content"
    });
    this.createAITab(contentContainer);
    this.createModelTab(contentContainer);
    this.createIntegrationsTab(contentContainer);
    this.createUITab(contentContainer);
    this.createAdvancedTab(contentContainer);
    this.showTab("ai");
  }
  /**
   * Switch tab
   */
  switchTab(tabId) {
    const tabButtons = document.querySelectorAll(".ultima-orb-tab-button");
    tabButtons.forEach((button) => {
      button.classList.remove("active");
      if (button.getAttribute("data-tab") === tabId) {
        button.classList.add("active");
      }
    });
    this.showTab(tabId);
  }
  /**
   * Show tab content
   */
  showTab(tabId) {
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
  createAITab(container) {
    const tabPanel = container.createEl("div", {
      cls: "ultima-orb-tab-panel",
      attr: { "data-tab": "ai" }
    });
    tabPanel.createEl("h3", { text: "\u{1F916} AI Provider Settings" });
    tabPanel.createEl("p", {
      text: "Configure your AI service providers and API keys",
      cls: "setting-item-description"
    });
    new import_obsidian.Setting(tabPanel).setName("OpenAI API Key").setDesc("Enter your OpenAI API key for GPT models").addText((text) => {
      text.setPlaceholder("sk-...").setValue(this.plugin.getSettingsManager().getSetting("openaiApiKey")).onChange(async (value) => {
        this.plugin.getSettingsManager().setSetting("openaiApiKey", value);
        await this.plugin.saveData(
          this.plugin.getSettingsManager().getSettings()
        );
      });
    });
    new import_obsidian.Setting(tabPanel).setName("Claude API Key").setDesc("Enter your Anthropic Claude API key").addText((text) => {
      text.setPlaceholder("sk-ant-...").setValue(this.plugin.getSettingsManager().getSetting("claudeApiKey")).onChange(async (value) => {
        this.plugin.getSettingsManager().setSetting("claudeApiKey", value);
        await this.plugin.saveData(
          this.plugin.getSettingsManager().getSettings()
        );
      });
    });
    new import_obsidian.Setting(tabPanel).setName("Gemini API Key").setDesc("Enter your Google Gemini API key").addText((text) => {
      text.setPlaceholder("AIza...").setValue(this.plugin.getSettingsManager().getSetting("geminiApiKey")).onChange(async (value) => {
        this.plugin.getSettingsManager().setSetting("geminiApiKey", value);
        await this.plugin.saveData(
          this.plugin.getSettingsManager().getSettings()
        );
      });
    });
    new import_obsidian.Setting(tabPanel).setName("Ollama Endpoint").setDesc("Local Ollama server endpoint").addText((text) => {
      text.setPlaceholder("http://localhost:11434").setValue(
        this.plugin.getSettingsManager().getSetting("ollamaEndpoint")
      ).onChange(async (value) => {
        this.plugin.getSettingsManager().setSetting("ollamaEndpoint", value);
        await this.plugin.saveData(
          this.plugin.getSettingsManager().getSettings()
        );
      });
    });
    new import_obsidian.Setting(tabPanel).setName("AnythingLLM Endpoint").setDesc("AnythingLLM server endpoint").addText((text) => {
      text.setPlaceholder("http://localhost:3001").setValue(
        this.plugin.getSettingsManager().getSetting("anythingLLMEndpoint")
      ).onChange(async (value) => {
        this.plugin.getSettingsManager().setSetting("anythingLLMEndpoint", value);
        await this.plugin.saveData(
          this.plugin.getSettingsManager().getSettings()
        );
      });
    });
  }
  /**
   * Create Model Settings Tab
   */
  createModelTab(container) {
    const tabPanel = container.createEl("div", {
      cls: "ultima-orb-tab-panel",
      attr: { "data-tab": "model" }
    });
    tabPanel.createEl("h3", { text: "\u2699\uFE0F Model Settings" });
    tabPanel.createEl("p", {
      text: "Configure AI model parameters and behavior",
      cls: "setting-item-description"
    });
    new import_obsidian.Setting(tabPanel).setName("Default Model").setDesc("Select your preferred AI model").addDropdown((dropdown) => {
      dropdown.addOption("gpt-3.5-turbo", "GPT-3.5 Turbo").addOption("gpt-4", "GPT-4").addOption("claude-3-sonnet", "Claude 3 Sonnet").addOption("claude-3-haiku", "Claude 3 Haiku").addOption("gemini-pro", "Gemini Pro").addOption("llama2", "Llama 2 (Ollama)").addOption("anythingllm", "AnythingLLM").setValue(this.plugin.getSettingsManager().getSetting("defaultModel")).onChange(async (value) => {
        this.plugin.getSettingsManager().setSetting("defaultModel", value);
        await this.plugin.saveData(
          this.plugin.getSettingsManager().getSettings()
        );
      });
    });
    new import_obsidian.Setting(tabPanel).setName("Temperature").setDesc("Control randomness (0 = focused, 2 = creative)").addSlider((slider) => {
      slider.setLimits(0, 2, 0.1).setValue(this.plugin.getSettingsManager().getSetting("temperature")).setDynamicTooltip().onChange(async (value) => {
        this.plugin.getSettingsManager().setSetting("temperature", value);
        await this.plugin.saveData(
          this.plugin.getSettingsManager().getSettings()
        );
      });
    });
    new import_obsidian.Setting(tabPanel).setName("Max Tokens").setDesc("Maximum response length").addText((text) => {
      text.setPlaceholder("2048").setValue(
        this.plugin.getSettingsManager().getSetting("maxTokens").toString()
      ).onChange(async (value) => {
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
  createIntegrationsTab(container) {
    const tabPanel = container.createEl("div", {
      cls: "ultima-orb-tab-panel",
      attr: { "data-tab": "integrations" }
    });
    tabPanel.createEl("h3", { text: "\u{1F517} Integration Settings" });
    tabPanel.createEl("p", {
      text: "Connect with external services and platforms",
      cls: "setting-item-description"
    });
    new import_obsidian.Setting(tabPanel).setName("Notion Integration").setDesc("Connect to Notion workspace").addText((text) => {
      text.setPlaceholder("secret_...").setValue(this.plugin.getSettingsManager().getSetting("notionToken")).onChange(async (value) => {
        this.plugin.getSettingsManager().setSetting("notionToken", value);
        await this.plugin.saveData(
          this.plugin.getSettingsManager().getSettings()
        );
      });
    });
    new import_obsidian.Setting(tabPanel).setName("Airtable API Key").setDesc("Connect to Airtable databases").addText((text) => {
      text.setPlaceholder("key...").setValue(
        this.plugin.getSettingsManager().getSetting("airtableApiKey")
      ).onChange(async (value) => {
        this.plugin.getSettingsManager().setSetting("airtableApiKey", value);
        await this.plugin.saveData(
          this.plugin.getSettingsManager().getSettings()
        );
      });
    });
    new import_obsidian.Setting(tabPanel).setName("ClickUp API Key").setDesc("Connect to ClickUp workspace").addText((text) => {
      text.setPlaceholder("pk_...").setValue(
        this.plugin.getSettingsManager().getSetting("clickUpApiKey")
      ).onChange(async (value) => {
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
  createUITab(container) {
    const tabPanel = container.createEl("div", {
      cls: "ultima-orb-tab-panel",
      attr: { "data-tab": "ui" }
    });
    tabPanel.createEl("h3", { text: "\u{1F3A8} UI Settings" });
    tabPanel.createEl("p", {
      text: "Customize the user interface and features",
      cls: "setting-item-description"
    });
    new import_obsidian.Setting(tabPanel).setName("Enable Chat View").setDesc("Enable the AI chat interface").addToggle((toggle) => {
      toggle.setValue(
        this.plugin.getSettingsManager().getSetting("enableChatView")
      ).onChange(async (value) => {
        this.plugin.getSettingsManager().setSetting("enableChatView", value);
        await this.plugin.saveData(
          this.plugin.getSettingsManager().getSettings()
        );
      });
    });
    new import_obsidian.Setting(tabPanel).setName("Enable Tool Template View").setDesc("Enable tool template management").addToggle((toggle) => {
      toggle.setValue(
        this.plugin.getSettingsManager().getSetting("enableToolTemplateView")
      ).onChange(async (value) => {
        this.plugin.getSettingsManager().setSetting("enableToolTemplateView", value);
        await this.plugin.saveData(
          this.plugin.getSettingsManager().getSettings()
        );
      });
    });
    new import_obsidian.Setting(tabPanel).setName("Enable Knowledge View").setDesc("Enable knowledge base management").addToggle((toggle) => {
      toggle.setValue(
        this.plugin.getSettingsManager().getSetting("enableKnowledgeView")
      ).onChange(async (value) => {
        this.plugin.getSettingsManager().setSetting("enableKnowledgeView", value);
        await this.plugin.saveData(
          this.plugin.getSettingsManager().getSettings()
        );
      });
    });
  }
  /**
   * Create Advanced Settings Tab
   */
  createAdvancedTab(container) {
    const tabPanel = container.createEl("div", {
      cls: "ultima-orb-tab-panel",
      attr: { "data-tab": "advanced" }
    });
    tabPanel.createEl("h3", { text: "\u{1F527} Advanced Settings" });
    tabPanel.createEl("p", {
      text: "Advanced configuration options for power users",
      cls: "setting-item-description"
    });
    new import_obsidian.Setting(tabPanel).setName("Enable Logging").setDesc("Enable detailed logging for debugging").addToggle((toggle) => {
      toggle.setValue(
        this.plugin.getSettingsManager().getSetting("enableLogging")
      ).onChange(async (value) => {
        this.plugin.getSettingsManager().setSetting("enableLogging", value);
        await this.plugin.saveData(
          this.plugin.getSettingsManager().getSettings()
        );
      });
    });
    new import_obsidian.Setting(tabPanel).setName("Performance Optimization").setDesc("Enable performance optimizations").addToggle((toggle) => {
      toggle.setValue(
        this.plugin.getSettingsManager().getSetting("enablePerformanceOptimization")
      ).onChange(async (value) => {
        this.plugin.getSettingsManager().setSetting("enablePerformanceOptimization", value);
        await this.plugin.saveData(
          this.plugin.getSettingsManager().getSettings()
        );
      });
    });
    new import_obsidian.Setting(tabPanel).setName("Bundle Optimization").setDesc("Enable bundle size optimizations").addToggle((toggle) => {
      toggle.setValue(
        this.plugin.getSettingsManager().getSetting("enableBundleOptimization")
      ).onChange(async (value) => {
        this.plugin.getSettingsManager().setSetting("enableBundleOptimization", value);
        await this.plugin.saveData(
          this.plugin.getSettingsManager().getSettings()
        );
      });
    });
    new import_obsidian.Setting(tabPanel).setName("Reset to Defaults").setDesc("Reset all settings to their default values").addButton((button) => {
      button.setButtonText("Reset").setWarning().onClick(async () => {
        this.plugin.getSettingsManager().resetToDefaults();
        await this.plugin.saveData(
          this.plugin.getSettingsManager().getSettings()
        );
        this.display();
      });
    });
  }
};

// src/UltimaOrbPlugin.ts
var UltimaOrbPlugin = class extends import_obsidian2.Plugin {
  async onload() {
    this.logger = new Logger();
    this.logger.info("\u{1F680} Loading Ultima-Orb plugin...");
    try {
      const savedSettings = await this.loadData();
      this.settingsManager = new SettingsManager(savedSettings);
      this.contextManager = new ContextManager(this.app);
      await this.contextManager.initialize();
      this.registerCommands();
      this.addSettingTab(new UltimaOrbSettingTab(this.app, this));
      this.logger.info("\u2705 Ultima-Orb plugin loaded successfully!");
    } catch (error) {
      this.logger.error("\u274C Error loading Ultima-Orb plugin:", error);
    }
  }
  async onunload() {
    this.logger.info("\u{1F504} Unloading Ultima-Orb plugin...");
    try {
      await this.saveData(this.settingsManager.getSettings());
      this.logger.info("\u2705 Settings saved successfully");
    } catch (error) {
      this.logger.error("\u274C Error saving settings:", error);
    }
  }
  /**
   * Register plugin commands
   */
  registerCommands() {
    this.addCommand({
      id: "ultima-orb-open-chat",
      name: "Open Ultima-Orb Chat",
      callback: () => this.openChatView()
    });
    this.addCommand({
      id: "ultima-orb-open-tool-template",
      name: "Open Tool Template View",
      callback: () => this.openToolTemplateView()
    });
    this.addCommand({
      id: "ultima-orb-open-knowledge",
      name: "Open Knowledge View",
      callback: () => this.openKnowledgeView()
    });
    this.addCommand({
      id: "ultima-orb-refresh-context",
      name: "Refresh Context",
      callback: () => this.refreshContext()
    });
  }
  /**
   * Open Chat View
   */
  openChatView() {
    this.logger.info("Opening Chat View...");
  }
  /**
   * Open Tool Template View
   */
  openToolTemplateView() {
    this.logger.info("Opening Tool Template View...");
  }
  /**
   * Open Knowledge View
   */
  openKnowledgeView() {
    this.logger.info("Opening Knowledge View...");
  }
  /**
   * Refresh context
   */
  async refreshContext() {
    this.logger.info("Refreshing context...");
    await this.contextManager.refreshContext();
  }
  /**
   * Get settings manager
   */
  getSettingsManager() {
    return this.settingsManager;
  }
  /**
   * Get context manager
   */
  getContextManager() {
    return this.contextManager;
  }
  /**
   * Get logger
   */
  getLogger() {
    return this.logger;
  }
};

// main.ts
var main_default = UltimaOrbPlugin;
