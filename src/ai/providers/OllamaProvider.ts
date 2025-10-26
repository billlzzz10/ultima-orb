import {
  BaseProvider,
  ProviderConfig,
  AIRequest,
  AIResponse,
  ProviderStatus,
} from "./BaseProvider";

/**
 * 🤖 Ollama Provider
 * สำหรับ local models เช่น Llama 2, Mistral, CodeLlama และอื่นๆ
 */

interface OllamaRequest {
  model: string;
  prompt: string;
  system?: string;
  template?: string;
  context?: number[];
  options?: {
    temperature?: number;
    num_predict?: number;
    top_k?: number;
    top_p?: number;
    repeat_penalty?: number;
    seed?: number;
  };
  stream?: boolean;
}

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export class OllamaProvider extends BaseProvider {
  private readonly supportedModels = [
    "llama2",
    "llama2:7b",
    "llama2:13b",
    "llama2:70b",
    "llama2:7b-chat",
    "llama2:13b-chat",
    "llama2:70b-chat",
    "mistral",
    "mistral:7b",
    "mistral:7b-instruct",
    "codellama",
    "codellama:7b",
    "codellama:13b",
    "codellama:34b",
    "codellama:7b-instruct",
    "codellama:13b-instruct",
    "codellama:34b-instruct",
    "neural-chat",
    "orca-mini",
    "vicuna",
    "wizard-vicuna-uncensored",
    "nous-hermes",
    "nous-hermes-llama2",
    "wizard-math",
    "wizard-coder",
    "wizard-vicuna",
    "dolphin-phi",
    "phi",
    "phi:2.7b",
    "phi:3.5b",
    "phi:3.8b",
  ];

  constructor(config: ProviderConfig) {
    super({
      ...config,
      name: config.name || "Ollama",
      model: config.model || "llama2",
      endpoint: config.endpoint || "http://localhost:11434",
    });
  }

  /**
   * Initialize Ollama provider
   */
  async initialize(): Promise<void> {
    try {
      if (!this.validateConfig()) {
        throw new Error("Invalid Ollama configuration");
      }

      // Test connection
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        throw new Error("Ollama server is not available");
      }

      this.isInitialized = true;
      this.logger.info("Ollama provider initialized successfully");
    } catch (error) {
      this.logger.error(
        "Failed to initialize Ollama provider:",
        error as Error
      );
      throw error;
    }
  }

  /**
   * Send request to Ollama API
   */
  async sendRequest(request: AIRequest): Promise<AIResponse> {
    if (!this.isInitialized) {
      throw new Error("Ollama provider not initialized");
    }

    if (!this.validateConfig()) {
      throw new Error("Invalid Ollama configuration");
    }

    const model = request.model || this.config.model || "llama2";
    const prompt = this.buildPrompt(request);

    const options: OllamaRequest["options"] = {
      top_k: 40,
      top_p: 0.9,
      repeat_penalty: 1.1,
    };

    const temperature = request.temperature || this.config.temperature;
    if (temperature) {
      options.temperature = temperature;
    }
    const maxTokens = request.maxTokens || this.config.maxTokens;
    if (maxTokens) {
      options.num_predict = maxTokens;
    }

    const ollamaRequest: OllamaRequest = {
      model,
      prompt,
      options,
      stream: false,
    };
    if (request.systemPrompt) {
      ollamaRequest.system = request.systemPrompt;
    }

    try {
      const response = await this.makeRequest(ollamaRequest);
      return this.parseResponse(response);
    } catch (error) {
      this.logger.error("Ollama API request failed:", error as Error);
      throw error;
    }
  }

  /**
   * Check if Ollama provider is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint}/api/tags`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return !!data.models;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get provider status
   */
  async getStatus(): Promise<ProviderStatus> {
    const isAvailable = await this.isAvailable();
    const isConfigured = this.validateConfig();

    const status: ProviderStatus = {
      name: this.config.name,
      isAvailable,
      isConfigured,
      lastUsed: new Date(),
    };

    if (!isAvailable) {
      status.error = "Ollama server not available";
    }

    return status;
  }

  /**
   * Validate configuration
   */
  validateConfig(): boolean {
    return !!(this.config.endpoint && this.config.model);
  }

  /**
   * Get supported models
   */
  getSupportedModels(): string[] {
    return [...this.supportedModels];
  }

  /**
   * Get available models from Ollama server
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.endpoint}/api/tags`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch available models");
      }

      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      this.logger.error("Failed to get available models:", error as Error);
      return [];
    }
  }

  /**
   * Build prompt for Ollama
   */
  private buildPrompt(request: AIRequest): string {
    let prompt = request.prompt;

    // Add context if provided
    if (request.context) {
      prompt = `Context: ${request.context}\n\n${prompt}`;
    }

    // Add attachments if provided
    if (request.attachments && request.attachments.length > 0) {
      const attachmentsText = request.attachments.join("\n\n");
      prompt = `Attachments:\n${attachmentsText}\n\n${prompt}`;
    }

    return prompt;
  }

  /**
   * Make HTTP request to Ollama API
   */
  private async makeRequest(request: OllamaRequest): Promise<OllamaResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.endpoint}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Ollama API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          `Ollama API request timeout after ${this.config.timeout}ms`
        );
      }
      throw error;
    }
  }

  /**
   * Parse Ollama response
   */
  private parseResponse(response: OllamaResponse): AIResponse {
    if (!response.response) {
      throw new Error("No response from Ollama API");
    }

    return {
      content: response.response,
      model: response.model,
      usage: {
        promptTokens: response.prompt_eval_count || 0,
        completionTokens: response.eval_count || 0,
        totalTokens:
          (response.prompt_eval_count || 0) + (response.eval_count || 0),
      },
      metadata: {
        done: response.done,
        totalDuration: response.total_duration,
        loadDuration: response.load_duration,
        promptEvalDuration: response.prompt_eval_duration,
        evalDuration: response.eval_duration,
        context: response.context,
      },
    };
  }

  /**
   * Get model info
   */
  getModelInfo(model: string): {
    name: string;
    maxTokens: number;
    costPer1kTokens: number;
  } {
    const modelInfo: Record<
      string,
      { name: string; maxTokens: number; costPer1kTokens: number }
    > = {
      llama2: { name: "Llama 2", maxTokens: 4096, costPer1kTokens: 0 },
      "llama2:7b": { name: "Llama 2 7B", maxTokens: 4096, costPer1kTokens: 0 },
      "llama2:13b": {
        name: "Llama 2 13B",
        maxTokens: 4096,
        costPer1kTokens: 0,
      },
      "llama2:70b": {
        name: "Llama 2 70B",
        maxTokens: 4096,
        costPer1kTokens: 0,
      },
      mistral: { name: "Mistral", maxTokens: 8192, costPer1kTokens: 0 },
      "mistral:7b": { name: "Mistral 7B", maxTokens: 8192, costPer1kTokens: 0 },
      codellama: { name: "Code Llama", maxTokens: 16384, costPer1kTokens: 0 },
      "codellama:7b": {
        name: "Code Llama 7B",
        maxTokens: 16384,
        costPer1kTokens: 0,
      },
      "codellama:13b": {
        name: "Code Llama 13B",
        maxTokens: 16384,
        costPer1kTokens: 0,
      },
      "codellama:34b": {
        name: "Code Llama 34B",
        maxTokens: 16384,
        costPer1kTokens: 0,
      },
      "neural-chat": {
        name: "Neural Chat",
        maxTokens: 4096,
        costPer1kTokens: 0,
      },
      "orca-mini": { name: "Orca Mini", maxTokens: 2048, costPer1kTokens: 0 },
      vicuna: { name: "Vicuna", maxTokens: 4096, costPer1kTokens: 0 },
      "wizard-vicuna-uncensored": {
        name: "Wizard Vicuna Uncensored",
        maxTokens: 4096,
        costPer1kTokens: 0,
      },
      "nous-hermes": {
        name: "Nous Hermes",
        maxTokens: 4096,
        costPer1kTokens: 0,
      },
      "wizard-math": {
        name: "Wizard Math",
        maxTokens: 4096,
        costPer1kTokens: 0,
      },
      "wizard-coder": {
        name: "Wizard Coder",
        maxTokens: 8192,
        costPer1kTokens: 0,
      },
      "dolphin-phi": {
        name: "Dolphin Phi",
        maxTokens: 2048,
        costPer1kTokens: 0,
      },
      phi: { name: "Phi", maxTokens: 2048, costPer1kTokens: 0 },
      "phi:2.7b": { name: "Phi 2.7B", maxTokens: 2048, costPer1kTokens: 0 },
      "phi:3.5b": { name: "Phi 3.5B", maxTokens: 2048, costPer1kTokens: 0 },
      "phi:3.8b": { name: "Phi 3.8B", maxTokens: 2048, costPer1kTokens: 0 },
    };

    return (
      modelInfo[model] || {
        name: model,
        maxTokens: 4096,
        costPer1kTokens: 0,
      }
    );
  }

  /**
   * Calculate estimated cost (always 0 for local models)
   */
  calculateCost(
    usage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    },
    model: string
  ): number {
    return 0; // Local models are free
  }

  /**
   * Get model capabilities
   */
  getModelCapabilities(model: string): string[] {
    const capabilities: Record<string, string[]> = {
      llama2: ["text-generation", "general-purpose", "conversation"],
      "llama2:7b": ["text-generation", "general-purpose", "conversation"],
      "llama2:13b": ["text-generation", "general-purpose", "conversation"],
      "llama2:70b": [
        "text-generation",
        "general-purpose",
        "conversation",
        "advanced-reasoning",
      ],
      mistral: ["text-generation", "general-purpose", "efficient"],
      "mistral:7b": ["text-generation", "general-purpose", "efficient"],
      codellama: ["text-generation", "code-generation", "programming"],
      "codellama:7b": ["text-generation", "code-generation", "programming"],
      "codellama:13b": ["text-generation", "code-generation", "programming"],
      "codellama:34b": [
        "text-generation",
        "code-generation",
        "programming",
        "advanced",
      ],
      "neural-chat": ["text-generation", "conversation", "chat"],
      "orca-mini": ["text-generation", "conversation", "lightweight"],
      vicuna: ["text-generation", "conversation", "general-purpose"],
      "wizard-vicuna-uncensored": [
        "text-generation",
        "conversation",
        "uncensored",
      ],
      "nous-hermes": [
        "text-generation",
        "conversation",
        "instruction-following",
      ],
      "wizard-math": ["text-generation", "mathematics", "reasoning"],
      "wizard-coder": ["text-generation", "code-generation", "programming"],
      "dolphin-phi": ["text-generation", "conversation", "lightweight"],
      phi: ["text-generation", "general-purpose", "lightweight"],
      "phi:2.7b": ["text-generation", "general-purpose", "lightweight"],
      "phi:3.5b": ["text-generation", "general-purpose", "lightweight"],
      "phi:3.8b": ["text-generation", "general-purpose", "lightweight"],
    };

    return capabilities[model] || ["text-generation", "general-purpose"];
  }

  /**
   * Pull model from Ollama hub
   */
  async pullModel(model: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint}/api/pull`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: model }),
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model ${model}`);
      }

      this.logger.info(`Successfully pulled model: ${model}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to pull model ${model}:`, error as Error);
      return false;
    }
  }

  /**
   * Delete model from Ollama
   */
  async deleteModel(model: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint}/api/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: model }),
      });

      if (!response.ok) {
        throw new Error(`Failed to delete model ${model}`);
      }

      this.logger.info(`Successfully deleted model: ${model}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete model ${model}:`, error as Error);
      return false;
    }
  }
}
