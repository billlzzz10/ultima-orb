import { Logger } from "../../services/Logger";

/**
 * AI Error Class
 */
export class AIError extends Error {
  public readonly details?: any;
  public readonly code?: string;

  constructor(message: string, details?: any, code?: string) {
    super(message);
    this.name = "AIError";
    if (details) {
      this.details = details;
    }
    if (code) {
      this.code = code;
    }
  }
}

/**
 * 🤖 Base AI Provider
 * Abstract class สำหรับ AI providers ทั้งหมด
 */

export interface ProviderConfig {
  name: string;
  apiKey?: string;
  endpoint?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  retries?: number;
}

export interface AIRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  context?: string;
  attachments?: string[];
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface AIResponse {
  content: string;
  text?: string; // For backward compatibility
  model: string;
  provider?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata?: Record<string, any>;
}

export interface ProviderStatus {
  name: string;
  isAvailable: boolean;
  isConfigured: boolean;
  lastUsed?: Date;
  error?: string;
}

/**
 * Base AI Provider Class
 * Abstract class ที่ AI providers ทั้งหมดต้อง extend
 */
export abstract class BaseProvider {
  protected config: ProviderConfig;
  protected logger: Logger;
  protected isInitialized: boolean = false;

  constructor(config: ProviderConfig) {
    this.config = {
      name: config.name,
      apiKey: config.apiKey || "",
      endpoint: config.endpoint || "",
      model: config.model || "",
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 2048,
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
    };
    this.logger = new Logger();
  }

  /**
   * Initialize provider
   */
  abstract initialize(): Promise<void>;

  /**
   * Send request to AI provider
   */
  abstract sendRequest(request: AIRequest): Promise<AIResponse>;

  /**
   * Check if provider is available
   */
  abstract isAvailable(): Promise<boolean>;

  /**
   * Get provider status
   */
  abstract getStatus(): Promise<ProviderStatus>;

  /**
   * Validate configuration
   */
  abstract validateConfig(): boolean;

  /**
   * Get supported models
   */
  abstract getSupportedModels(): string[];

  /**
   * Get provider name
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * Get configuration
   */
  getConfig(): ProviderConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ProviderConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info(`Updated config for ${this.config.name}`);
  }

  /**
   * Set API key
   */
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    this.logger.info(`Updated API key for ${this.config.name}`);
  }

  /**
   * Set model
   */
  setModel(model: string): void {
    this.config.model = model;
    this.logger.info(`Updated model for ${this.config.name}: ${model}`);
  }

  /**
   * Set temperature
   */
  setTemperature(temperature: number): void {
    this.config.temperature = Math.max(0, Math.min(2, temperature));
    this.logger.info(
      `Updated temperature for ${this.config.name}: ${temperature}`
    );
  }

  /**
   * Set max tokens
   */
  setMaxTokens(maxTokens: number): void {
    this.config.maxTokens = Math.max(1, Math.min(8192, maxTokens));
    this.logger.info(
      `Updated max tokens for ${this.config.name}: ${maxTokens}`
    );
  }

  /**
   * Check if provider is configured
   */
  isConfigured(): boolean {
    return this.validateConfig();
  }

  /**
   * Get current model
   */
  getCurrentModel(): string {
    return this.config.model || "";
  }

  /**
   * Get current temperature
   */
  getCurrentTemperature(): number {
    return this.config.temperature || 0.7;
  }

  /**
   * Get current max tokens
   */
  getCurrentMaxTokens(): number {
    return this.config.maxTokens || 2048;
  }

  /**
   * Create default request
   */
  createRequest(prompt: string, options?: Partial<AIRequest>): AIRequest {
    const request: AIRequest = {
      prompt,
    };

    const model = options?.model || this.config.model;
    if (model) {
      request.model = model;
    }
    const temperature = options?.temperature || this.config.temperature;
    if (temperature) {
      request.temperature = temperature;
    }
    const maxTokens = options?.maxTokens || this.config.maxTokens;
    if (maxTokens) {
      request.maxTokens = maxTokens;
    }
    if (options?.systemPrompt) {
      request.systemPrompt = options.systemPrompt;
    }
    if (options?.context) {
      request.context = options.context;
    }
    if (options?.attachments) {
      request.attachments = options.attachments;
    }

    return request;
  }

  /**
   * Send request with retry logic
   */
  async sendRequestWithRetry(request: AIRequest): Promise<AIResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retries!; attempt++) {
      try {
        this.logger.info(
          `Sending request to ${this.config.name} (attempt ${attempt}/${this.config.retries})`
        );
        return await this.sendRequest(request);
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `Request failed for ${this.config.name} (attempt ${attempt}): ${error}`
        );

        if (attempt < this.config.retries!) {
          // Wait before retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(
      `All ${this.config.retries} attempts failed for ${this.config.name}: ${lastError?.message}`
    );
  }

  /**
   * Test provider connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const testRequest = this.createRequest("Hello, this is a test message.");
      await this.sendRequest(testRequest);
      this.logger.info(`Connection test successful for ${this.config.name}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Connection test failed for ${this.config.name}:`,
        error as Error
      );
      return false;
    }
  }

  /**
   * Get provider info
   */
  getInfo(): Record<string, any> {
    return {
      name: this.config.name,
      isInitialized: this.isInitialized,
      isConfigured: this.isConfigured(),
      currentModel: this.getCurrentModel(),
      currentTemperature: this.getCurrentTemperature(),
      currentMaxTokens: this.getCurrentMaxTokens(),
      supportedModels: this.getSupportedModels(),
      config: this.getConfig(),
    };
  }
}
