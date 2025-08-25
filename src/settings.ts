/**
 * ⚙️ Settings Model
 * จัดการการตั้งค่าทั้งหมดของ Ultima-Orb Plugin
 */

export interface UltimaOrbSettings {
  // AI Provider Settings
  openaiApiKey: string;
  anthropicApiKey: string;
  googleApiKey: string;
  ollamaEndpoint: string;
  anythingLLMEndpoint: string;

  // Model Settings
  defaultModel: string;
  temperature: number;
  maxTokens: number;

  // Integration Settings
  notionToken: string;
  airtableApiKey: string;
  clickUpApiKey: string;
  githubApiKey: string;

  // UI Settings
  enableChatView: boolean;
  enableToolTemplateView: boolean;
  enableKnowledgeView: boolean;
  enableSidebar: boolean;
  enableSettingsPanel: boolean;

  // Advanced Settings
  enableLogging: boolean;
  enablePerformanceOptimization: boolean;
  enableBundleOptimization: boolean;
  enableAdvancedFeatures: boolean;
  enableMaxMode: boolean;
  maxModeApiKey: string;
  enableOllama: boolean;
  ollamaBaseUrl: string;
  enableLMStudio: boolean;
  lmStudioBaseUrl: string;
  enableChartJS: boolean;
  enableD3JS: boolean;
  enableThreeJS: boolean;
  enableScripting: boolean;
  enableRAG: boolean;
  enableExcalidraw: boolean;
  enableGitHub: boolean;
  enableNotion: boolean;

  // MCP Settings
  mcpConnectionType: string;
  notionMCPUrl: string;
  clickUpMCPUrl: string;
  airtableMCPUrl: string;
}

export const DEFAULT_SETTINGS: UltimaOrbSettings = {
  // AI Provider Settings
  openaiApiKey: "",
  anthropicApiKey: "",
  googleApiKey: "",
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
  githubApiKey: "",

  // UI Settings
  enableChatView: true,
  enableToolTemplateView: true,
  enableKnowledgeView: true,
  enableSidebar: true,
  enableSettingsPanel: true,

  // Advanced Settings
  enableLogging: true,
  enablePerformanceOptimization: true,
  enableBundleOptimization: true,
  enableAdvancedFeatures: false,
  enableMaxMode: false,
  maxModeApiKey: "",
  enableOllama: false,
  ollamaBaseUrl: "http://localhost:11434",
  enableLMStudio: false,
  lmStudioBaseUrl: "http://localhost:1234",
  enableChartJS: true,
  enableD3JS: true,
  enableThreeJS: false,
  enableScripting: true,
  enableRAG: true,
  enableExcalidraw: false,
  enableGitHub: false,
  enableNotion: false,

  // MCP Settings
  mcpConnectionType: "http",
  notionMCPUrl: "http://localhost:3000",
  clickUpMCPUrl: "http://localhost:3001",
  airtableMCPUrl: "http://localhost:3002",
};

/**
 * Settings Manager
 * จัดการการอ่าน/เขียนการตั้งค่า
 */
export class SettingsManager {
  private settings: UltimaOrbSettings;

  constructor(initialSettings: Partial<UltimaOrbSettings> = {}) {
    this.settings = { ...DEFAULT_SETTINGS, ...initialSettings };
  }

  /**
   * Get all settings
   */
  getSettings(): UltimaOrbSettings {
    return { ...this.settings };
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<UltimaOrbSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Get specific setting
   */
  getSetting<K extends keyof UltimaOrbSettings>(key: K): UltimaOrbSettings[K] {
    return this.settings[key];
  }

  /**
   * Set specific setting
   */
  setSetting<K extends keyof UltimaOrbSettings>(
    key: K,
    value: UltimaOrbSettings[K]
  ): void {
    this.settings[key] = value;
  }

  /**
   * Reset to default settings
   */
  resetToDefaults(): void {
    this.settings = { ...DEFAULT_SETTINGS };
  }
}
