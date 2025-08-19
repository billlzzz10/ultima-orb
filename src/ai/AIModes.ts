import { AIOrchestrator } from './AIOrchestrator';
import { ToolManager } from '../core/ToolManager';
import { ContextManager } from '../core/ContextManager';
import { Logger } from '../services/Logger';

export interface AIModeConfig {
  name: string;
  description: string;
  systemPrompt: string;
  maxTokens?: number;
  temperature?: number;
  tools?: string[];
}

export interface AIModeResponse {
  content: string;
  mode: string;
  toolsUsed?: string[];
  metadata?: Record<string, any>;
}

export class AIModes {
  private aiOrchestrator: AIOrchestrator;
  private toolManager: ToolManager;
  private contextManager: ContextManager;
  private logger: Logger;
  private modes: Map<string, AIModeConfig> = new Map();

  constructor(
    aiOrchestrator: AIOrchestrator,
    toolManager: ToolManager,
    contextManager: ContextManager,
    logger: Logger
  ) {
    this.aiOrchestrator = aiOrchestrator;
    this.toolManager = toolManager;
    this.contextManager = contextManager;
    this.logger = logger;
    this.initializeModes();
  }

  private initializeModes(): void {
    // Chat Mode - Simple conversation
    this.modes.set('chat', {
      name: 'Chat',
      description: 'Simple conversation mode for general questions and discussions',
      systemPrompt: `You are a helpful AI assistant integrated with Ultima-Orb. 
      You can help with general questions, coding, analysis, and creative tasks.
      Be conversational, helpful, and provide clear, actionable responses.`,
      maxTokens: 2048,
      temperature: 0.7
    });

    // Assistant Mode - Tool-enabled assistance
    this.modes.set('assistant', {
      name: 'Assistant',
      description: 'Tool-enabled assistant that can use Notion, Airtable, and other integrations',
      systemPrompt: `You are an advanced AI assistant with access to various tools and integrations.
      You can:
      - Create and manage Notion pages and databases
      - Work with Airtable records and bases
      - Manage ClickUp tasks and projects
      - Access knowledge bases and documents
      
      When a user asks for something that requires external tools, use the appropriate tool.
      Always explain what you're doing and provide clear feedback.`,
      maxTokens: 4096,
      temperature: 0.5,
      tools: ['notion', 'airtable', 'clickup', 'knowledge']
    });

    // Agent Mode - Autonomous task execution
    this.modes.set('agent', {
      name: 'Agent',
      description: 'Autonomous agent that can execute complex multi-step tasks',
      systemPrompt: `You are an autonomous AI agent capable of executing complex, multi-step tasks.
      You have access to all available tools and can:
      - Plan and execute multi-step workflows
      - Make decisions based on context and available information
      - Use tools sequentially to achieve goals
      - Adapt plans based on results and feedback
      
      When given a task:
      1. Break it down into steps
      2. Execute each step using appropriate tools
      3. Evaluate results and adjust if needed
      4. Provide comprehensive reports
      
      Always be thorough and explain your reasoning.`,
      maxTokens: 8192,
      temperature: 0.3,
      tools: ['notion', 'airtable', 'clickup', 'knowledge', 'automation']
    });

    // Creative Mode - For creative writing and brainstorming
    this.modes.set('creative', {
      name: 'Creative',
      description: 'Creative mode for writing, brainstorming, and artistic tasks',
      systemPrompt: `You are a creative AI assistant specialized in creative writing, brainstorming, and artistic tasks.
      You excel at:
      - Creative writing and storytelling
      - Brainstorming and ideation
      - Poetry and artistic expression
      - Creative problem solving
      
      Be imaginative, expressive, and encourage creative thinking.
      Don't be afraid to suggest unconventional ideas.`,
      maxTokens: 3072,
      temperature: 0.9
    });

    // Analysis Mode - For data analysis and research
    this.modes.set('analysis', {
      name: 'Analysis',
      description: 'Analysis mode for data analysis, research, and detailed examination',
      systemPrompt: `You are an analytical AI assistant specialized in data analysis, research, and detailed examination.
      You excel at:
      - Data analysis and interpretation
      - Research and fact-checking
      - Detailed examination of complex topics
      - Providing evidence-based insights
      
      Be thorough, analytical, and provide well-reasoned conclusions.
      Always cite sources when possible and acknowledge limitations.`,
      maxTokens: 4096,
      temperature: 0.2
    });
  }

  async executeMode(
    modeName: string,
    userInput: string,
    context?: string
  ): Promise<AIModeResponse> {
    const mode = this.modes.get(modeName);
    if (!mode) {
      throw new Error(`Unknown AI mode: ${modeName}`);
    }

    this.logger.info(`Executing AI mode: ${modeName}`);

    try {
      // Build enhanced prompt with mode-specific instructions
      const enhancedPrompt = this.buildModePrompt(mode, userInput, context);

      // Generate response using AI orchestrator
      const response = await this.aiOrchestrator.generateResponse({
        prompt: enhancedPrompt,
        context: context || '',
        maxTokens: mode.maxTokens,
        temperature: mode.temperature
      });

      // If mode has tools, try to use them
      let toolsUsed: string[] = [];
      if (mode.tools && mode.tools.length > 0) {
        toolsUsed = await this.attemptToolUsage(userInput, response.content);
      }

      return {
        content: response.content,
        mode: modeName,
        toolsUsed,
        metadata: {
          provider: response.provider,
          model: response.model,
          usage: response.usage
        }
      };

    } catch (error) {
      this.logger.error(`Error executing mode ${modeName}:`, error);
      throw error;
    }
  }

  private buildModePrompt(mode: AIModeConfig, userInput: string, context?: string): string {
    let prompt = `${mode.systemPrompt}\n\n`;
    
    if (context) {
      prompt += `Context: ${context}\n\n`;
    }

    if (mode.tools && mode.tools.length > 0) {
      prompt += `Available tools: ${mode.tools.join(', ')}\n\n`;
    }

    prompt += `User request: ${userInput}\n\n`;
    prompt += `Please respond according to the ${mode.name} mode guidelines.`;

    return prompt;
  }

  private async attemptToolUsage(userInput: string, aiResponse: string): Promise<string[]> {
    const toolsUsed: string[] = [];
    
    try {
      // Simple tool detection based on keywords
      const toolKeywords = {
        'notion': ['notion', 'page', 'database', 'create', 'update', 'search'],
        'airtable': ['airtable', 'record', 'base', 'table', 'create', 'update'],
        'clickup': ['clickup', 'task', 'project', 'list', 'create', 'update'],
        'knowledge': ['search', 'find', 'document', 'knowledge', 'information']
      };

      for (const [tool, keywords] of Object.entries(toolKeywords)) {
        if (keywords.some(keyword => 
          userInput.toLowerCase().includes(keyword) || 
          aiResponse.toLowerCase().includes(keyword)
        )) {
          toolsUsed.push(tool);
        }
      }

      // TODO: Implement actual tool execution logic
      // This would involve parsing the AI response and executing appropriate tools

    } catch (error) {
      this.logger.error('Error attempting tool usage:', error);
    }

    return toolsUsed;
  }

  getAvailableModes(): string[] {
    return Array.from(this.modes.keys());
  }

  getModeConfig(modeName: string): AIModeConfig | undefined {
    return this.modes.get(modeName);
  }

  addCustomMode(config: AIModeConfig): void {
    this.modes.set(config.name.toLowerCase(), config);
    this.logger.info(`Added custom AI mode: ${config.name}`);
  }

  removeMode(modeName: string): boolean {
    const removed = this.modes.delete(modeName);
    if (removed) {
      this.logger.info(`Removed AI mode: ${modeName}`);
    }
    return removed;
  }
}
