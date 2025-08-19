import {
  BaseProvider,
  ProviderConfig,
  AIRequest,
  AIResponse,
  ProviderStatus,
} from "./BaseProvider";

/**
 * 🤖 Gemini Provider
 * สำหรับ Gemini Pro และ models อื่นๆ จาก Google
 */

interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
    safetyRatings?: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  promptFeedback?: {
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  };
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GeminiProvider extends BaseProvider {
  private readonly baseUrl = "https://generativelanguage.googleapis.com/v1beta";
  private readonly supportedModels = [
    "gemini-pro",
    "gemini-pro-vision",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
  ];

  constructor(config: ProviderConfig) {
    super({
      ...config,
      name: config.name || "Gemini",
      model: config.model || "gemini-pro",
    });
  }

  /**
   * Initialize Gemini provider
   */
  async initialize(): Promise<void> {
    try {
      if (!this.validateConfig()) {
        throw new Error("Invalid Gemini configuration");
      }

      // Test connection
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        throw new Error("Gemini API is not available");
      }

      this.isInitialized = true;
      this.logger.info("Gemini provider initialized successfully");
    } catch (error) {
      this.logger.error(
        "Failed to initialize Gemini provider:",
        error as Error
      );
      throw error;
    }
  }

  /**
   * Send request to Gemini API
   */
  async sendRequest(request: AIRequest): Promise<AIResponse> {
    if (!this.isInitialized) {
      throw new Error("Gemini provider not initialized");
    }

    if (!this.validateConfig()) {
      throw new Error("Invalid Gemini configuration");
    }

    const model = request.model || this.config.model || "gemini-pro";
    const contents = this.buildContents(request);

    const geminiRequest: GeminiRequest = {
      contents,
      generationConfig: {
        temperature: request.temperature || this.config.temperature,
        maxOutputTokens: request.maxTokens || this.config.maxTokens,
        topP: 0.8,
        topK: 40,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    };

    try {
      const response = await this.makeRequest(geminiRequest, model);
      return this.parseResponse(response);
    } catch (error) {
      this.logger.error("Gemini API request failed:", error as Error);
      throw error;
    }
  }

  /**
   * Check if Gemini provider is available
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

    return {
      name: this.config.name,
      isAvailable,
      isConfigured,
      lastUsed: new Date(),
      error: isAvailable ? undefined : "Gemini API not available",
    };
  }

  /**
   * Validate configuration
   */
  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.apiKey.startsWith("AIza"));
  }

  /**
   * Get supported models
   */
  getSupportedModels(): string[] {
    return [...this.supportedModels];
  }

  /**
   * Build contents for Gemini API
   */
  private buildContents(request: AIRequest): Array<{
    parts: Array<{ text: string }>;
  }> {
    const parts: Array<{ text: string }> = [];

    // Add system prompt if provided
    if (request.systemPrompt) {
      parts.push({ text: `System: ${request.systemPrompt}\n\n` });
    }

    // Add context if provided
    if (request.context) {
      parts.push({ text: `Context: ${request.context}\n\n` });
    }

    // Add attachments if provided
    if (request.attachments && request.attachments.length > 0) {
      const attachmentsText = request.attachments.join("\n\n");
      parts.push({ text: `Attachments:\n${attachmentsText}\n\n` });
    }

    // Add user prompt
    parts.push({ text: request.prompt });

    return [{ parts }];
  }

  /**
   * Make HTTP request to Gemini API
   */
  private async makeRequest(
    request: GeminiRequest,
    model: string
  ): Promise<GeminiResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(
        `${this.baseUrl}/models/${model}:generateContent?key=${this.config.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Gemini API error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(
          `Gemini API request timeout after ${this.config.timeout}ms`
        );
      }
      throw error;
    }
  }

  /**
   * Parse Gemini response
   */
  private parseResponse(response: GeminiResponse): AIResponse {
    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }

    const candidate = response.candidates[0];
    const content = candidate.content.parts.map((part) => part.text).join("");

    if (!content) {
      throw new Error("Empty response from Gemini API");
    }

    return {
      content,
      model: this.config.model || "gemini-pro",
      usage: response.usageMetadata
        ? {
            promptTokens: response.usageMetadata.promptTokenCount,
            completionTokens: response.usageMetadata.candidatesTokenCount,
            totalTokens: response.usageMetadata.totalTokenCount,
          }
        : undefined,
      metadata: {
        finishReason: candidate.finishReason,
        safetyRatings: candidate.safetyRatings,
        promptFeedback: response.promptFeedback,
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
      "gemini-pro": {
        name: "Gemini Pro",
        maxTokens: 30720,
        costPer1kTokens: 0.0005,
      },
      "gemini-pro-vision": {
        name: "Gemini Pro Vision",
        maxTokens: 30720,
        costPer1kTokens: 0.0005,
      },
      "gemini-1.5-pro": {
        name: "Gemini 1.5 Pro",
        maxTokens: 1048576,
        costPer1kTokens: 0.0035,
      },
      "gemini-1.5-flash": {
        name: "Gemini 1.5 Flash",
        maxTokens: 1048576,
        costPer1kTokens: 0.000175,
      },
    };

    return (
      modelInfo[model] || {
        name: model,
        maxTokens: 30720,
        costPer1kTokens: 0.0005,
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
      "gemini-pro": ["text-generation", "reasoning", "general-purpose"],
      "gemini-pro-vision": [
        "text-generation",
        "vision",
        "image-analysis",
        "multimodal",
      ],
      "gemini-1.5-pro": [
        "text-generation",
        "vision",
        "long-context",
        "advanced-reasoning",
      ],
      "gemini-1.5-flash": [
        "text-generation",
        "vision",
        "long-context",
        "fast",
        "efficient",
      ],
    };

    return capabilities[model] || ["text-generation", "general-purpose"];
  }
}
