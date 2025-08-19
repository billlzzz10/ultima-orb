import { App } from 'obsidian';
import { AIOrchestrator } from '../ai/AIOrchestrator';
import { ToolManager } from '../core/ToolManager';
import { KnowledgeManager } from '../core/KnowledgeManager';
import { Logger } from '../services/Logger';

export class CommandManager {
  private app: App;
  private aiOrchestrator: AIOrchestrator;
  private toolManager: ToolManager;
  private knowledgeManager: KnowledgeManager;
  private logger: Logger;

  constructor(
    app: App,
    aiOrchestrator: AIOrchestrator,
    toolManager: ToolManager,
    knowledgeManager: KnowledgeManager,
    logger: Logger
  ) {
    this.app = app;
    this.aiOrchestrator = aiOrchestrator;
    this.toolManager = toolManager;
    this.knowledgeManager = knowledgeManager;
    this.logger = logger;
  }

  registerCommands(): void {
    // Chat with AI
    this.app.commands.addCommand({
      id: 'ultima-orb-chat',
      name: 'Chat with AI',
      callback: () => {
        this.logger.info('Chat with AI command triggered');
        // TODO: Open chat interface
      }
    });

    // Generate with AI
    this.app.commands.addCommand({
      id: 'ultima-orb-generate',
      name: 'Generate with AI',
      callback: () => {
        this.logger.info('Generate with AI command triggered');
        // TODO: Open generation interface
      }
    });

    // Execute Tool
    this.app.commands.addCommand({
      id: 'ultima-orb-execute-tool',
      name: 'Execute Tool',
      callback: () => {
        this.logger.info('Execute Tool command triggered');
        // TODO: Open tool selection interface
      }
    });

    // Query Knowledge Base
    this.app.commands.addCommand({
      id: 'ultima-orb-query-knowledge',
      name: 'Query Knowledge Base',
      callback: () => {
        this.logger.info('Query Knowledge Base command triggered');
        // TODO: Open knowledge base interface
      }
    });

    // Switch AI Provider
    this.app.commands.addCommand({
      id: 'ultima-orb-switch-provider',
      name: 'Switch AI Provider',
      callback: () => {
        this.logger.info('Switch AI Provider command triggered');
        // TODO: Open provider selection interface
      }
    });

    this.logger.info('Commands registered successfully');
  }
}
