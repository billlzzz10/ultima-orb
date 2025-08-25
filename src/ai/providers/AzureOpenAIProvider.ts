import {
  BaseProvider,
  AIRequest,
  AIResponse,
  AIError,
  ProviderStatus,
} from "./BaseProvider";

/**
 * 🔮 Azure OpenAI Provider - เชื่อมต่อกับ Azure OpenAI Service
 */
export class AzureOpenAIProvider extends BaseProvider {
  private apiKey: string;
  private endpoint: string;
  private model: string;
  private apiVersion: string;

  constructor(
    apiKey: string,
    endpoint: string,
    model: string = "llama-scout-instruct",
    apiVersion: string = "2024-05-01-preview"
  ) {
    super({
      name: "azure-openai",
      apiKey,
      endpoint,
      model,
    });
    this.apiKey = apiKey;
    this.endpoint = endpoint;
    this.model = model;
    this.apiVersion = apiVersion;
  }

  /**
   * 🚀 ส่งคำขอไปยัง Azure OpenAI
   */
  async generateText(request: AIRequest): Promise<AIResponse> {
    try {
      const url = `${this.endpoint}`;

      const headers = {
        "Content-Type": "application/json",
        "api-key": this.apiKey,
      };

      const body = {
        messages: [
          {
            role: "system",
            content: request.systemPrompt || "You are a helpful AI assistant.",
          },
          {
            role: "user",
            content: request.prompt,
          },
        ],
        model: this.model,
        max_tokens: request.maxTokens || 2048,
        temperature: request.temperature || 0.7,
        top_p: request.topP || 1.0,
        frequency_penalty: request.frequencyPenalty || 0.0,
        presence_penalty: request.presencePenalty || 0.0,
      };

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AIError(
          `Azure OpenAI API Error: ${response.status} ${response.statusText}`,
          errorData
        );
      }

      const data = await response.json();

      const content = data.choices[0]?.message?.content || "";
      return {
        content,
        text: content,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        model: this.model,
        provider: "azure-openai",
        metadata: {
          finishReason: data.choices[0]?.finish_reason,
          responseId: data.id,
        },
      };
    } catch (error) {
      if (error instanceof AIError) {
        throw error;
      }
      throw new AIError(
        `Azure OpenAI request failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * 🖼️ สร้างภาพด้วย Azure OpenAI (สำหรับ multimodal models)
   */
  async generateImage(
    prompt: string,
    options?: {
      size?: "1024x1024" | "1792x1024" | "1024x1792";
      quality?: "standard" | "hd";
      style?: "vivid" | "natural";
    }
  ): Promise<AIResponse> {
    try {
      const url = `${this.endpoint.replace(
        "/chat/completions",
        "/images/generations"
      )}`;

      const headers = {
        "Content-Type": "application/json",
        "api-key": this.apiKey,
      };

      const body = {
        prompt,
        n: 1,
        size: options?.size || "1024x1024",
        quality: options?.quality || "standard",
        style: options?.style || "vivid",
      };

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AIError(
          `Azure OpenAI Image API Error: ${response.status} ${response.statusText}`,
          errorData
        );
      }

      const data = await response.json();

      const content = data.data[0]?.url || "";
      return {
        content,
        text: content,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
        model: this.model,
        provider: "azure-openai",
        metadata: {
          imageUrl: data.data[0]?.url,
          revisedPrompt: data.data[0]?.revised_prompt,
        },
      };
    } catch (error) {
      if (error instanceof AIError) {
        throw error;
      }
      throw new AIError(
        `Azure OpenAI image generation failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * 🔍 วิเคราะห์ภาพด้วย multimodal model
   */
  async analyzeImage(imageUrl: string, prompt: string): Promise<AIResponse> {
    try {
      const url = `${this.endpoint}`;

      const headers = {
        "Content-Type": "application/json",
        "api-key": this.apiKey,
      };

      const body = {
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        model: this.model,
        max_tokens: 2048,
        temperature: 0.7,
      };

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new AIError(
          `Azure OpenAI Vision API Error: ${response.status} ${response.statusText}`,
          errorData
        );
      }

      const data = await response.json();

      const content = data.choices[0]?.message?.content || "";
      return {
        content,
        text: content,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        model: this.model,
        provider: "azure-openai",
        metadata: {
          finishReason: data.choices[0]?.finish_reason,
          responseId: data.id,
        },
      };
    } catch (error) {
      if (error instanceof AIError) {
        throw error;
      }
      throw new AIError(
        `Azure OpenAI image analysis failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * 🔧 Initialize provider
   */
  async initialize(): Promise<void> {
    this.isInitialized = true;
    this.logger.info("Azure OpenAI provider initialized");
  }

  /**
   * 📤 Send request to AI provider
   */
  async sendRequest(request: AIRequest): Promise<AIResponse> {
    return this.generateText(request);
  }

  /**
   * ✅ Check if provider is available
   */
  async isAvailable(): Promise<boolean> {
    return this.testConnection();
  }

  /**
   * 📊 Get provider status
   */
  async getStatus(): Promise<ProviderStatus> {
    const isAvailable = await this.isAvailable();
    return {
      name: this.getName(),
      isAvailable,
      isConfigured: this.validateConfig(),
      lastUsed: new Date(),
    };
  }

  /**
   * ✅ Validate configuration
   */
  validateConfig(): boolean {
    return !!(this.apiKey && this.endpoint && this.model);
  }

  /**
   * 📋 Get supported models
   */
  getSupportedModels(): string[] {
    return [
      "llama-scout-instruct",
      "hi-4-multimodal",
      "gpt-4",
      "gpt-4-turbo",
      "gpt-35-turbo",
    ];
  }

  /**
   * ✅ ทดสอบการเชื่อมต่อ
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateText({
        prompt: "Hello, this is a test message.",
        maxTokens: 10,
      });
      return (response.text || response.content || "").length > 0;
    } catch (error) {
      console.error("Azure OpenAI connection test failed:", error);
      return false;
    }
  }

  /**
   * 📊 รับข้อมูลการใช้งาน
   */
  getUsageInfo(): {
    provider: string;
    model: string;
    endpoint: string;
    apiVersion: string;
  } {
    return {
      provider: "azure-openai",
      model: this.model,
      endpoint: this.endpoint,
      apiVersion: this.apiVersion,
    };
  }
}
