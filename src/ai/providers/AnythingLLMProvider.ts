import {
  BaseProvider,
  ProviderConfig,
  AIRequest,
  AIResponse,
  ProviderStatus,
} from "./BaseProvider";

/**
 * 🤖 AnythingLLM Provider
 * สำหรับ knowledge base integration และ RAG (Retrieval-Augmented Generation)
 */

interface AnythingLLMRequest {
  message: string;
  systemPrompt?: string;
  workspaceId?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  includeSources?: boolean;
  includeImages?: boolean;
}

interface AnythingLLMResponse {
  response: string;
  sources?: Array<{
    title: string;
    content: string;
    score: number;
    url?: string;
  }>;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export class AnythingLLMProvider extends BaseProvider {
  private readonly supportedModels = [
    "gpt-3.5-turbo",
    "gpt-4",
    "claude-3-sonnet",
    "claude-3-haiku",
    "gemini-pro",
    "llama2",
    "mistral",
  ];

  constructor(config: ProviderConfig) {
    super({
      ...config,
      name: config.name || "AnythingLLM",
      model: config.model || "gpt-3.5-turbo",
      endpoint: config.endpoint || "http://localhost:3001",
    });
  }

  async initialize(): Promise<void> {
    try {
      if (!this.validateConfig()) {
        throw new Error("Invalid AnythingLLM configuration");
      }

      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        throw new Error("AnythingLLM server is not available");
      }

      this.isInitialized = true;
      this.logger.info("AnythingLLM provider initialized successfully");
    } catch (error) {
      this.logger.error(
        "Failed to initialize AnythingLLM provider:",
        error as Error
      );
      throw error;
    }
  }

  async sendRequest(request: AIRequest): Promise<AIResponse> {
    if (!this.isInitialized) {
      throw new Error("AnythingLLM provider not initialized");
    }

    if (!this.validateConfig()) {
      throw new Error("Invalid AnythingLLM configuration");
    }

    const anythingLLMRequest: AnythingLLMRequest = {
      message: request.prompt,
      systemPrompt: request.systemPrompt,
      model: request.model || this.config.model,
      temperature: request.temperature || this.config.temperature,
      maxTokens: request.maxTokens || this.config.maxTokens,
      includeSources: true,
      includeImages: false,
    };

    try {
      const response = await this.makeRequest(anythingLLMRequest);
      return this.parseResponse(response);
    } catch (error) {
      this.logger.error("AnythingLLM API request failed:", error as Error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint}/api/health`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async getStatus(): Promise<ProviderStatus> {
    const isAvailable = await this.isAvailable();
    const isConfigured = this.validateConfig();

    return {
      name: this.config.name,
      isAvailable,
      isConfigured,
      lastUsed: new Date(),
      error: isAvailable ? undefined : "AnythingLLM server not available",
    };
  }

  validateConfig(): boolean {
    return !!(this.config.endpoint && this.config.model);
  }

  getSupportedModels(): string[] {
    return [...this.supportedModels];
  }

  private async makeRequest(
    request: AnythingLLMRequest
  ): Promise<AnythingLLMResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.endpoint}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey || ""}`,
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `AnythingLLM API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          `AnythingLLM API request timeout after ${this.config.timeout}ms`
        );
      }
      throw error;
    }
  }

  private parseResponse(response: AnythingLLMResponse): AIResponse {
    if (!response.response) {
      throw new Error("No response from AnythingLLM API");
    }

    return {
      content: response.response,
      model: response.model,
      usage: response.usage,
      metadata: {
        sources: response.sources,
        includeSources: true,
      },
    };
  }

  getModelInfo(model: string): {
    name: string;
    maxTokens: number;
    costPer1kTokens: number;
  } {
    const modelInfo: Record<
      string,
      { name: string; maxTokens: number; costPer1kTokens: number }
    > = {
      "gpt-3.5-turbo": {
        name: "GPT-3.5 Turbo",
        maxTokens: 4096,
        costPer1kTokens: 0.002,
      },
      "gpt-4": { name: "GPT-4", maxTokens: 8192, costPer1kTokens: 0.03 },
      "claude-3-sonnet": {
        name: "Claude 3 Sonnet",
        maxTokens: 200000,
        costPer1kTokens: 0.003,
      },
      "claude-3-haiku": {
        name: "Claude 3 Haiku",
        maxTokens: 200000,
        costPer1kTokens: 0.00025,
      },
      "gemini-pro": {
        name: "Gemini Pro",
        maxTokens: 30720,
        costPer1kTokens: 0.0005,
      },
      llama2: { name: "Llama 2", maxTokens: 4096, costPer1kTokens: 0 },
      mistral: { name: "Mistral", maxTokens: 8192, costPer1kTokens: 0 },
    };

    return (
      modelInfo[model] || { name: model, maxTokens: 4096, costPer1kTokens: 0 }
    );
  }

  calculateCost(
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    },
    model: string
  ): number {
    const modelInfo = this.getModelInfo(model);
    const totalCost = (usage.totalTokens / 1000) * modelInfo.costPer1kTokens;
    return Math.round(totalCost * 100) / 100;
  }

  getModelCapabilities(model: string): string[] {
    const capabilities: Record<string, string[]> = {
      "gpt-3.5-turbo": ["text-generation", "knowledge-base", "rag"],
      "gpt-4": [
        "text-generation",
        "knowledge-base",
        "rag",
        "advanced-reasoning",
      ],
      "claude-3-sonnet": [
        "text-generation",
        "knowledge-base",
        "rag",
        "long-context",
      ],
      "claude-3-haiku": ["text-generation", "knowledge-base", "rag", "fast"],
      "gemini-pro": ["text-generation", "knowledge-base", "rag"],
      llama2: ["text-generation", "knowledge-base", "rag", "local"],
      mistral: ["text-generation", "knowledge-base", "rag", "efficient"],
    };

    return capabilities[model] || ["text-generation", "knowledge-base", "rag"];
  }
}
