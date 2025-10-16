import {
  BaseProvider,
  ProviderConfig,
  AIRequest,
  AIResponse,
  ProviderStatus,
} from "./BaseProvider";

/**
 * 🤖 Claude Provider
 * สำหรับ Claude 3 Sonnet, Claude 3 Haiku และ models อื่นๆ จาก Anthropic
 */

interface ClaudeRequest {
  model: string;
  max_tokens: number;
  messages: Array<{
    role: "user" | "assistant";
    content:
      | string
      | Array<{
          type: "text";
          text: string;
        }>;
  }>;
  system?: string;
  temperature?: number;
  stream?: boolean;
}

interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: "text";
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence?: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class ClaudeProvider extends BaseProvider {
  private readonly baseUrl = "https://api.anthropic.com/v1";
  private readonly supportedModels = [
    "claude-3-haiku-20240307",
    "claude-3-sonnet-20240229",
    "claude-3-opus-20240229",
    "claude-2.1",
    "claude-2.0",
    "claude-instant-1.2",
  ];

  constructor(config: ProviderConfig) {
    super({
      ...config,
      name: config.name || "Claude",
      model: config.model || "claude-3-sonnet-20240229",
    });
  }

  /**
   * Initialize Claude provider
   */
  async initialize(): Promise<void> {
    try {
      if (!this.validateConfig()) {
        throw new Error("Invalid Claude configuration");
      }

      // Test connection
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        throw new Error("Claude API is not available");
      }

      this.isInitialized = true;
      this.logger.info("Claude provider initialized successfully");
    } catch (error) {
      this.logger.error(
        "Failed to initialize Claude provider:",
        error as Error
      );
      throw error;
    }
  }

  /**
   * Send request to Claude API
   */
  async sendRequest(request: AIRequest): Promise<AIResponse> {
    if (!this.isInitialized) {
      throw new Error("Claude provider not initialized");
    }

    if (!this.validateConfig()) {
      throw new Error("Invalid Claude configuration");
    }

    const model =
      request.model || this.config.model || "claude-3-sonnet-20240229";
    const messages = this.buildMessages(request);
    const systemPrompt = this.buildSystemPrompt(request);

    const claudeRequest: ClaudeRequest = {
      model,
      max_tokens: request.maxTokens || this.config.maxTokens || 2048,
      messages,
      stream: false,
    };

    const temperature = request.temperature || this.config.temperature;
    if (temperature) {
      claudeRequest.temperature = temperature;
    }

    if (systemPrompt) {
      claudeRequest.system = systemPrompt;
    }

    try {
      const response = await this.makeRequest(claudeRequest);
      return this.parseResponse(response);
    } catch (error) {
      this.logger.error("Claude API request failed:", error as Error);
      throw error;
    }
  }

  /**
   * Check if Claude provider is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      return await this.testConnection();
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
      status.error = "Claude API not available";
    }

    return status;
  }

  /**
   * Validate configuration
   */
  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.apiKey.startsWith("sk-ant-"));
  }

  /**
   * Get supported models
   */
  getSupportedModels(): string[] {
    return [...this.supportedModels];
  }

  /**
   * Build messages for Claude API
   */
  private buildMessages(
    request: AIRequest
  ): Array<{ role: "user" | "assistant"; content: string }> {
    const messages: Array<{ role: "user" | "assistant"; content: string }> = [];

    // Add context and attachments to user message
    let userContent = request.prompt;

    if (request.context) {
      userContent = `Context: ${request.context}\n\n${userContent}`;
    }

    if (request.attachments && request.attachments.length > 0) {
      const attachmentsText = request.attachments.join("\n\n");
      userContent = `Attachments:\n${attachmentsText}\n\n${userContent}`;
    }

    messages.push({
      role: "user",
      content: userContent,
    });

    return messages;
  }

  /**
   * Build system prompt
   */
  private buildSystemPrompt(request: AIRequest): string | undefined {
    if (request.systemPrompt) {
      return request.systemPrompt;
    }
    return undefined;
  }

  /**
   * Make HTTP request to Claude API
   */
  private async makeRequest(request: ClaudeRequest): Promise<ClaudeResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.config.apiKey!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Claude API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          `Claude API request timeout after ${this.config.timeout}ms`
        );
      }
      throw error;
    }
  }

  /**
   * Parse Claude response
   */
  private parseResponse(response: ClaudeResponse): AIResponse {
    if (!response.content || response.content.length === 0) {
      throw new Error("No response from Claude API");
    }

    // Extract text content from response
    const textContent = response.content
      .filter((item) => item.type === "text")
      .map((item) => item.text)
      .join("");

    if (!textContent) {
      throw new Error("Empty response from Claude API");
    }

    const aiResponse: AIResponse = {
      content: textContent,
      model: response.model,
      metadata: {
        id: response.id,
        stopReason: response.stop_reason,
      },
    };

    if (response.usage) {
      aiResponse.usage = {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens:
          response.usage.input_tokens + response.usage.output_tokens,
      };
    }

    if (response.stop_sequence && aiResponse.metadata) {
      aiResponse.metadata.stopSequence = response.stop_sequence;
    }

    return aiResponse;
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
      "claude-3-haiku-20240307": {
        name: "Claude 3 Haiku",
        maxTokens: 200000,
        costPer1kTokens: 0.00025,
      },
      "claude-3-sonnet-20240229": {
        name: "Claude 3 Sonnet",
        maxTokens: 200000,
        costPer1kTokens: 0.003,
      },
      "claude-3-opus-20240229": {
        name: "Claude 3 Opus",
        maxTokens: 200000,
        costPer1kTokens: 0.015,
      },
      "claude-2.1": {
        name: "Claude 2.1",
        maxTokens: 100000,
        costPer1kTokens: 0.008,
      },
      "claude-2.0": {
        name: "Claude 2.0",
        maxTokens: 100000,
        costPer1kTokens: 0.008,
      },
      "claude-instant-1.2": {
        name: "Claude Instant 1.2",
        maxTokens: 100000,
        costPer1kTokens: 0.00163,
      },
    };

    return (
      modelInfo[model] || {
        name: model,
        maxTokens: 100000,
        costPer1kTokens: 0.003,
      }
    );
  }

  /**
   * Calculate estimated cost
   */
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
    return Math.round(totalCost * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get model capabilities
   */
  getModelCapabilities(model: string): string[] {
    const capabilities: Record<string, string[]> = {
      "claude-3-haiku-20240307": ["fast", "efficient", "general-purpose"],
      "claude-3-sonnet-20240229": ["balanced", "reliable", "general-purpose"],
      "claude-3-opus-20240229": ["most-capable", "complex-tasks", "research"],
      "claude-2.1": ["reliable", "general-purpose"],
      "claude-2.0": ["reliable", "general-purpose"],
      "claude-instant-1.2": ["fast", "efficient", "simple-tasks"],
    };

    return capabilities[model] || ["general-purpose"];
  }
}
