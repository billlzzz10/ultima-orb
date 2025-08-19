/**
 * ⚙️ Settings Model
 * จัดการการตั้งค่าทั้งหมดของ Ultima-Orb Plugin
 */

export interface UltimaOrbSettings {
  // AI Provider Settings
  openaiApiKey: string;
  claudeApiKey: string;
  geminiApiKey: string;
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

  // UI Settings
  enableChatView: boolean;
  enableToolTemplateView: boolean;
  enableKnowledgeView: boolean;

  // Advanced Settings
  enableLogging: boolean;
  enablePerformanceOptimization: boolean;
  enableBundleOptimization: boolean;
}

export const DEFAULT_SETTINGS: UltimaOrbSettings = {
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
  enableBundleOptimization: true,
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
