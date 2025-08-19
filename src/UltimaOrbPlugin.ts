import { Plugin, App, Notice } from 'obsidian';
import { Logger } from './services/Logger';
import { EventsBus } from './services/EventsBus';
import { StorageManager } from './services/StorageManager';
import { CredentialManager } from './services/CredentialManager';
import { AIOrchestrator } from './ai/AIOrchestrator';
import { ContextManager } from './core/ContextManager';
import { IntegrationManager } from './core/IntegrationManager';
import { ToolManager } from './core/ToolManager';
import { TemplateManager } from './core/TemplateManager';
import { KnowledgeManager } from './core/KnowledgeManager';
import { SettingsTab } from './ui/SettingsTab';
import { ChatView } from './ui/views/ChatView';
import { AIGenerationButtons } from './ui/components/AIGenerationButtons';
import { ToolTemplateView } from './ui/views/ToolTemplateView';
import { KnowledgeView } from './ui/views/KnowledgeView';
import { AnalyticsDashboard } from './ui/views/AnalyticsDashboard';

/**
 * 🔮 Ultima-Orb: Main Plugin Class
 * Core implementation of the Ultima-Orb plugin
 */

export class UltimaOrbPlugin {
  // Core plugin reference
  public readonly app: App;
  private plugin: Plugin;

  // Core services
  public readonly logger: Logger;
  public readonly eventsBus: EventsBus;
  public readonly storage: StorageManager;
  public readonly credentialManager: CredentialManager;

  // Core managers
  public readonly contextManager: ContextManager;
  public readonly integrationManager: IntegrationManager;
  public readonly toolManager: ToolManager;
  public readonly templateManager: TemplateManager;
  public readonly knowledgeManager: KnowledgeManager;

  // AI components
  public readonly aiOrchestrator: AIOrchestrator;

  // UI components
  public readonly settingsTab: SettingsTab;
  private chatView: ChatView | null = null;
  private aiGenerationButtons: AIGenerationButtons | null = null;
  private toolTemplateView: ToolTemplateView | null = null;
  private knowledgeView: KnowledgeView | null = null;
  private analyticsDashboard: AnalyticsDashboard | null = null;

  // Settings
  public readonly settings: StorageManager;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
    this.app = plugin.app;

    // Initialize core services
    this.logger = new Logger();
    this.eventsBus = new EventsBus();
    this.storage = new StorageManager(this.app);
    this.credentialManager = new CredentialManager(this.storage);
    this.settings = this.storage;

    // Initialize core managers
    this.contextManager = new ContextManager(this.app);
    this.integrationManager = new IntegrationManager(this.credentialManager, this.logger);
    this.toolManager = new ToolManager(this.eventsBus, this.logger);
    this.templateManager = new TemplateManager(this.app);
    this.knowledgeManager = new KnowledgeManager(this.credentialManager, this.logger);

    // Initialize AI orchestrator
    this.aiOrchestrator = new AIOrchestrator(this.credentialManager, this.eventsBus, this.logger);

    // Initialize settings tab
    this.settingsTab = new SettingsTab(this.app, this);
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Ultima-Orb plugin...');

      // Initialize AI orchestrator
      await this.aiOrchestrator.initialize();

      // Register settings tab
      this.plugin.addSettingTab(this.settingsTab);

      // Initialize default settings
      await this.initializeDefaultSettings();

      this.logger.info('Ultima-Orb plugin initialized successfully!');
    } catch (error) {
      this.logger.error('Failed to initialize Ultima-Orb plugin:', error);
      throw error;
    }
  }

  private async initializeDefaultSettings(): Promise<void> {
    const defaultSettings = {
      hasCompletedOnboarding: false,
      showQuickStartOnStartup: true,
      defaultAIProvider: 'openai',
      enableAnalytics: true,
      enableErrorReporting: true,
      theme: 'auto',
      language: 'th',
      maxChatHistory: 100,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedFileTypes: ['pdf', 'jpg', 'png', 'txt', 'md', 'doc', 'docx'],
      sessionTimeout: 3600000, // 1 hour
      enableEncryption: true,
      enableCaching: true,
      cacheTTL: 300000, // 5 minutes
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
      const existingValue = await this.settings.get(key);
      if (existingValue === undefined) {
        await this.settings.set(key, value);
      }
    }
  }

  public async cleanup(): Promise<void> {
    try {
      this.logger.info('Cleaning up Ultima-Orb plugin...');

      // Emit cleanup event
      this.eventsBus.emit('plugin:cleanup');

      // Dispose UI components
      this.chatView?.dispose();
      this.aiGenerationButtons?.dispose();
      this.toolTemplateView?.dispose();
      this.knowledgeView?.dispose();
      this.analyticsDashboard?.dispose();

      // Dispose managers
      this.aiOrchestrator?.dispose();
      this.toolManager?.dispose();
      this.knowledgeManager?.dispose();

      this.logger.info('Ultima-Orb plugin cleaned up successfully!');
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
    }
  }

  // UI Methods
  public openChatInterface(): void {
    try {
      if (!this.chatView) {
        this.chatView = new ChatView(this);
      }
      this.chatView.open();
    } catch (error) {
      this.logger.error('Failed to open chat interface:', error);
      new Notice('❌ Failed to open chat interface');
    }
  }

  public openAIGeneration(): void {
    try {
      if (!this.aiGenerationButtons) {
        this.aiGenerationButtons = new AIGenerationButtons(this);
      }
      this.aiGenerationButtons.open();
    } catch (error) {
      this.logger.error('Failed to open AI generation:', error);
      new Notice('❌ Failed to open AI generation');
    }
  }

  public openToolManagement(): void {
    try {
      if (!this.toolTemplateView) {
        this.toolTemplateView = new ToolTemplateView(this);
      }
      this.toolTemplateView.open();
    } catch (error) {
      this.logger.error('Failed to open tool management:', error);
      new Notice('❌ Failed to open tool management');
    }
  }

  public openKnowledgeBase(): void {
    try {
      if (!this.knowledgeView) {
        this.knowledgeView = new KnowledgeView(this);
      }
      this.knowledgeView.open();
    } catch (error) {
      this.logger.error('Failed to open knowledge base:', error);
      new Notice('❌ Failed to open knowledge base');
    }
  }

  public openAnalytics(): void {
    try {
      if (!this.analyticsDashboard) {
        this.analyticsDashboard = new AnalyticsDashboard(this);
      }
      this.analyticsDashboard.open();
    } catch (error) {
      this.logger.error('Failed to open analytics:', error);
      new Notice('❌ Failed to open analytics');
    }
  }

  public openSettings(): void {
    try {
      this.app.setting.open();
      this.app.setting.openTabById('ultima-orb');
    } catch (error) {
      this.logger.error('Failed to open settings:', error);
      new Notice('❌ Failed to open settings');
    }
  }

  // Public getters
  public getLogger(): Logger {
    return this.logger;
  }

  public getEventsBus(): EventsBus {
    return this.eventsBus;
  }

  public getAIOrchestrator(): AIOrchestrator {
    return this.aiOrchestrator;
  }

  public getToolManager(): ToolManager {
    return this.toolManager;
  }

  public getKnowledgeManager(): KnowledgeManager {
    return this.knowledgeManager;
  }

  public getCredentialManager(): CredentialManager {
    return this.credentialManager;
  }

  public getContextManager(): ContextManager {
    return this.contextManager;
  }

  public getIntegrationManager(): IntegrationManager {
    return this.integrationManager;
  }

  public getTemplateManager(): TemplateManager {
    return this.templateManager;
  }
}
