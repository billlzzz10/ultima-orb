import { CredentialManager } from '../services/CredentialManager';
import { EventsBus } from '../services/EventsBus';
import { Logger } from '../services/Logger';
import { BaseProvider } from './providers/BaseProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { ClaudeProvider } from './providers/ClaudeProvider';
import { GeminiProvider } from './providers/GeminiProvider';
import { OllamaProvider } from './providers/OllamaProvider';
import { AnythingLLMProvider } from './providers/AnythingLLMProvider';

/**
 * 🤖 AI Orchestrator
 * จัดการ AI providers และการโต้ตอบกับ AI
 */

export interface AIRequest {
  provider: string;
  prompt: string;
  context?: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  };
}

export interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
  provider: string;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: any;
}

export interface ConnectionTestResult {
  success: boolean;
  error?: string;
  provider: string;
  responseTime?: number;
}

export class AIOrchestrator {
  private credentialManager: CredentialManager;
  private eventsBus: EventsBus;
  private logger: Logger;
  private providers: Map<string, BaseProvider> = new Map();
  private defaultProvider: string = 'openai';

  constructor(
    credentialManager: CredentialManager,
    eventsBus: EventsBus,
    logger: Logger
  ) {
    this.credentialManager = credentialManager;
    this.eventsBus = eventsBus;
    this.logger = logger;
  }

  /**
   * Initialize AI providers
   */
  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing AI Orchestrator...');

      // Initialize all providers
      await this.initializeProviders();

      // Set up event listeners
      this.setupEventListeners();

      this.logger.info('AI Orchestrator initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize AI Orchestrator', error as Error);
      throw error;
    }
  }

  /**
   * Initialize all AI providers
   */
  private async initializeProviders(): Promise<void> {
    const providerConfigs = [
      { name: 'openai', class: OpenAIProvider },
      { name: 'claude', class: ClaudeProvider },
      { name: 'gemini', class: GeminiProvider },
      { name: 'ollama', class: OllamaProvider },
      { name: 'anythingllm', class: AnythingLLMProvider }
    ];

    for (const config of providerConfigs) {
      try {
        const hasCredentials = await this.credentialManager.hasCredentials(config.name);
        
        if (hasCredentials) {
          const provider = new config.class(this.credentialManager, this.logger);
          await provider.initialize();
          this.providers.set(config.name, provider);
          this.logger.info(`Initialized ${config.name} provider`);
        } else {
          this.logger.info(`Skipping ${config.name} provider - no credentials`);
        }
      } catch (error) {
        this.logger.error(`Failed to initialize ${config.name} provider`, error as Error);
      }
    }
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    this.eventsBus.on('ai:request:start', (request: AIRequest) => {
      this.logger.info(`AI request started for ${request.provider}`);
    });

    this.eventsBus.on('ai:request:complete', (response: AIResponse) => {
      this.logger.info(`AI request completed for ${response.provider}`);
    });

    this.eventsBus.on('ai:request:error', (error: any) => {
      this.logger.error('AI request failed', error);
    });
  }

  /**
   * Send request to AI provider
   */
  public async sendRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      this.eventsBus.emit('ai:request:start', request);

      const provider = this.providers.get(request.provider);
      if (!provider) {
        throw new Error(`Provider ${request.provider} not found or not initialized`);
      }

      const response = await provider.generateResponse(request.prompt, request.context, request.options);
      
      const aiResponse: AIResponse = {
        success: true,
        content: response.content,
        provider: request.provider,
        model: response.model,
        usage: response.usage,
        metadata: {
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      };

      this.eventsBus.emit('ai:request:complete', aiResponse);
      return aiResponse;

    } catch (error) {
      const aiResponse: AIResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: request.provider,
        metadata: {
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        }
      };

      this.eventsBus.emit('ai:request:error', aiResponse);
      this.logger.error(`AI request failed for ${request.provider}`, error as Error);
      
      return aiResponse;
    }
  }

  /**
   * Test connection to AI provider
   */
  public async testConnection(provider: string): Promise<ConnectionTestResult> {
    const startTime = Date.now();

    try {
      const providerInstance = this.providers.get(provider);
      if (!providerInstance) {
        return {
          success: false,
          error: `Provider ${provider} not found or not initialized`,
          provider
        };
      }

      const testPrompt = 'Hello, this is a test message. Please respond with "Connection successful."';
      const response = await providerInstance.generateResponse(testPrompt);

      const result: ConnectionTestResult = {
        success: response.content !== undefined,
        provider,
        responseTime: Date.now() - startTime
      };

      if (!result.success) {
        result.error = 'No response received from provider';
      }

      return result;

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider,
        responseTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get available providers
   */
  public getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Set default provider
   */
  public setDefaultProvider(provider: string): void {
    if (this.providers.has(provider)) {
      this.defaultProvider = provider;
      this.logger.info(`Set default provider to ${provider}`);
    } else {
      this.logger.warn(`Provider ${provider} not available, cannot set as default`);
    }
  }

  /**
   * Get default provider
   */
  public getDefaultProvider(): string {
    return this.defaultProvider;
  }

  /**
   * Get provider status
   */
  public async getProviderStatus(provider: string): Promise<{
    available: boolean;
    hasCredentials: boolean;
    lastTest?: ConnectionTestResult;
  }> {
    const hasCredentials = await this.credentialManager.hasCredentials(provider);
    const available = this.providers.has(provider);

    return {
      available,
      hasCredentials
    };
  }

  /**
   * Get all providers status
   */
  public async getAllProvidersStatus(): Promise<Record<string, any>> {
    const status: Record<string, any> = {};

    for (const provider of this.providers.keys()) {
      status[provider] = await this.getProviderStatus(provider);
    }

    return status;
  }

  /**
   * Reinitialize provider
   */
  public async reinitializeProvider(provider: string): Promise<boolean> {
    try {
      // Remove existing provider
      this.providers.delete(provider);

      // Reinitialize
      const hasCredentials = await this.credentialManager.hasCredentials(provider);
      if (!hasCredentials) {
        this.logger.warn(`No credentials for ${provider}, skipping reinitialization`);
        return false;
      }

      let providerInstance: BaseProvider;

      switch (provider) {
        case 'openai':
          providerInstance = new OpenAIProvider(this.credentialManager, this.logger);
          break;
        case 'claude':
          providerInstance = new ClaudeProvider(this.credentialManager, this.logger);
          break;
        case 'gemini':
          providerInstance = new GeminiProvider(this.credentialManager, this.logger);
          break;
        case 'ollama':
          providerInstance = new OllamaProvider(this.credentialManager, this.logger);
          break;
        case 'anythingllm':
          providerInstance = new AnythingLLMProvider(this.credentialManager, this.logger);
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      await providerInstance.initialize();
      this.providers.set(provider, providerInstance);

      this.logger.info(`Reinitialized ${provider} provider`);
      return true;

    } catch (error) {
      this.logger.error(`Failed to reinitialize ${provider} provider`, error as Error);
      return false;
    }
  }

  /**
   * Get provider instance
   */
  public getProvider(provider: string): BaseProvider | undefined {
    return this.providers.get(provider);
  }

  /**
   * Check if provider is available
   */
  public isProviderAvailable(provider: string): boolean {
    return this.providers.has(provider);
  }

  /**
   * Get orchestrator statistics
   */
  public getStatistics(): {
    totalProviders: number;
    availableProviders: string[];
    defaultProvider: string;
  } {
    return {
      totalProviders: this.providers.size,
      availableProviders: Array.from(this.providers.keys()),
      defaultProvider: this.defaultProvider
    };
  }

  /**
   * Dispose resources
   */
  public dispose(): void {
    this.logger.info('Disposing AI Orchestrator...');
    
    // Clear providers
    this.providers.clear();
    
    this.logger.info('AI Orchestrator disposed');
  }
}
