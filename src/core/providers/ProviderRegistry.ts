import { App } from "obsidian";
import {
  AIProvider,
  AICapability,
  AIRequest,
  AIResponse,
  AsyncResult,
} from "../interfaces";

/**
 * 🏭 Provider Registry - จัดการ AI Providers และ Provider Abstraction
 */
export class ProviderRegistry {
  private app: App;
  private providers: Map<string, AIProvider> = new Map();
  private defaultProvider: string | null = null;
  private auditTrail: string[] = [];

  constructor(app: App) {
    this.app = app;
  }

  /**
   * 📝 ลงทะเบียน Provider
   */
  registerProvider(provider: AIProvider): boolean {
    try {
      // ตรวจสอบ provider ที่มีอยู่
      if (this.providers.has(provider.id)) {
        console.warn(`Provider ${provider.id} already exists, updating...`);
      }

      this.providers.set(provider.id, provider);
      this.auditTrail.push(`Registered provider: ${provider.id}`);

      // ตั้งเป็น default ถ้ายังไม่มี
      if (!this.defaultProvider) {
        this.defaultProvider = provider.id;
      }

      console.info(`✅ Provider registered: ${provider.id}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to register provider ${provider.id}:`, error);
      return false;
    }
  }

  /**
   * 📋 รับ Provider
   */
  getProvider(id: string): AIProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * 📊 รับ Providers ทั้งหมด
   */
  getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * 🔍 ค้นหา Providers ตาม Capability
   */
  findProvidersByCapability(capability: AICapability["type"]): AIProvider[] {
    return this.getAllProviders().filter((provider) =>
      provider.capabilities.some((cap) => cap.type === capability)
    );
  }

  /**
   * 🎯 ตั้ง Default Provider
   */
  setDefaultProvider(id: string): boolean {
    if (!this.providers.has(id)) {
      console.error(`Provider ${id} not found`);
      return false;
    }

    this.defaultProvider = id;
    this.auditTrail.push(`Set default provider: ${id}`);
    return true;
  }

  /**
   * 📋 รับ Default Provider
   */
  getDefaultProvider(): AIProvider | undefined {
    if (!this.defaultProvider) {
      return undefined;
    }
    return this.providers.get(this.defaultProvider);
  }

  /**
   * 🔄 ตรวจสอบ Provider Availability
   */
  async checkProviderAvailability(id: string): Promise<boolean> {
    const provider = this.providers.get(id);
    if (!provider) {
      return false;
    }

    try {
      return await provider.isAvailable();
    } catch (error) {
      console.error(`Failed to check availability for ${id}:`, error);
      return false;
    }
  }

  /**
   * 🧪 ทดสอบ Connection
   */
  async testProviderConnection(id: string): Promise<boolean> {
    const provider = this.providers.get(id);
    if (!provider) {
      return false;
    }

    try {
      return await provider.testConnection();
    } catch (error) {
      console.error(`Failed to test connection for ${id}:`, error);
      return false;
    }
  }

  /**
   * 🚀 ส่ง Request ไปยัง Provider
   */
  async sendRequest(request: AIRequest): AsyncResult<AIResponse> {
    const provider = this.providers.get(request.provider);
    if (!provider) {
      return {
        success: false,
        error: `Provider ${request.provider} not found`,
      };
    }

    try {
      // ตรวจสอบ availability
      const isAvailable = await provider.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: `Provider ${request.provider} is not available`,
        };
      }

      // ตรวจสอบ capabilities
      const hasCapability = provider.capabilities.some(
        (cap) => cap.type === "chat" && cap.models.includes(request.model)
      );

      if (!hasCapability) {
        return {
          success: false,
          error: `Provider ${request.provider} does not support model ${request.model}`,
        };
      }

      // ส่ง request
      const startTime = Date.now();
      const response = await this.executeProviderRequest(provider, request);
      const duration = Date.now() - startTime;

      this.auditTrail.push(
        `Request sent to ${request.provider} (${duration}ms)`
      );

      return {
        success: true,
        data: response,
        metadata: {
          provider: request.provider,
          model: request.model,
          duration,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      console.error(`Failed to send request to ${request.provider}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * 🚀 ส่ง Request ไปยัง Default Provider
   */
  async sendRequestToDefault(
    request: Omit<AIRequest, "provider">
  ): AsyncResult<AIResponse> {
    const defaultProvider = this.getDefaultProvider();
    if (!defaultProvider) {
      return {
        success: false,
        error: "No default provider set",
      };
    }

    const fullRequest: AIRequest = {
      ...request,
      provider: defaultProvider.id,
    };

    return this.sendRequest(fullRequest);
  }

  /**
   * 🔄 วนลูปส่ง Request ไปยัง Providers หลายตัว
   */
  async sendRequestToMultiple(
    request: Omit<AIRequest, "provider">,
    providerIds: string[]
  ): AsyncResult<AIResponse[]> {
    const results: AIResponse[] = [];
    const errors: string[] = [];

    for (const providerId of providerIds) {
      const fullRequest: AIRequest = {
        ...request,
        provider: providerId,
      };

      const result = await this.sendRequest(fullRequest);
      if (result.success && result.data) {
        results.push(result.data);
      } else {
        errors.push(`${providerId}: ${result.error}`);
      }
    }

    if (results.length === 0) {
      return {
        success: false,
        error: `All providers failed: ${errors.join(", ")}`,
      };
    }

    return {
      success: true,
      data: results,
      metadata: {
        successfulProviders: results.length,
        failedProviders: errors.length,
        errors,
      },
    };
  }

  /**
   * 🗑️ ลบ Provider
   */
  removeProvider(id: string): boolean {
    if (id === this.defaultProvider) {
      this.defaultProvider = null;
    }

    const removed = this.providers.delete(id);
    if (removed) {
      this.auditTrail.push(`Removed provider: ${id}`);
    }

    return removed;
  }

  /**
   * 📊 สถิติ Providers
   */
  getStats(): {
    totalProviders: number;
    availableProviders: number;
    defaultProvider: string | null;
    auditTrailLength: number;
  } {
    return {
      totalProviders: this.providers.size,
      availableProviders: 0, // จะต้องตรวจสอบ availability แยก
      defaultProvider: this.defaultProvider,
      auditTrailLength: this.auditTrail.length,
    };
  }

  /**
   * 📋 รับ Audit Trail
   */
  getAuditTrail(limit?: number): string[] {
    if (limit) {
      return this.auditTrail.slice(-limit);
    }
    return [...this.auditTrail];
  }

  /**
   * 💾 Export Provider Configurations
   */
  exportConfig(): Record<string, any> {
    const config: Record<string, any> = {
      defaultProvider: this.defaultProvider,
      providers: {},
    };

    for (const [id, provider] of this.providers.entries()) {
      config.providers[id] = {
        id: provider.id,
        name: provider.name,
        description: provider.description,
        capabilities: provider.capabilities,
      };
    }

    return config;
  }

  /**
   * 📥 Import Provider Configurations
   */
  importConfig(config: Record<string, any>): void {
    if (config.defaultProvider) {
      this.defaultProvider = config.defaultProvider;
    }

    // Note: ไม่สามารถ import providers ได้โดยตรง ต้องลงทะเบียนใหม่
    console.info(
      "Provider configurations imported. Providers need to be re-registered."
    );
  }

  // ===== PRIVATE METHODS =====

  /**
   * 🚀 Execute Provider Request
   */
  private async executeProviderRequest(
    provider: AIProvider,
    request: AIRequest
  ): Promise<AIResponse> {
    // ตรวจสอบว่า provider มี method สำหรับส่ง request หรือไม่
    if (typeof (provider as any).sendRequest === "function") {
      return await (provider as any).sendRequest(request);
    }

    // Fallback: ใช้ prompt ธรรมดา
    if (typeof (provider as any).chat === "function") {
      const response = await (provider as any).chat(request.prompt);
      return {
        content: response,
        metadata: {
          provider: provider.id,
          model: request.model,
        },
      };
    }

    throw new Error(
      `Provider ${provider.id} does not support request execution`
    );
  }
}

/**
 * 🏭 Provider Factory - สร้าง Providers มาตรฐาน
 */
export class ProviderFactory {
  /**
   * 🔧 สร้าง OpenAI Provider
   */
  static createOpenAIProvider(config: {
    apiKey: string;
    baseUrl?: string;
    models?: string[];
  }): AIProvider {
    return {
      id: "openai",
      name: "OpenAI",
      description: "OpenAI GPT models",
      capabilities: [
        {
          type: "chat",
          models: config.models || ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"],
          maxTokens: 4096,
          supportsStreaming: true,
        },
        {
          type: "embedding",
          models: ["text-embedding-ada-002"],
        },
      ],
      isAvailable: async () => {
        // ตรวจสอบ API key
        return !!config.apiKey;
      },
      testConnection: async () => {
        // ทดสอบ connection กับ OpenAI API
        try {
          // Implementation here
          return true;
        } catch (error) {
          return false;
        }
      },
    };
  }

  /**
   * 🔧 สร้าง Anthropic Provider
   */
  static createAnthropicProvider(config: {
    apiKey: string;
    models?: string[];
  }): AIProvider {
    return {
      id: "anthropic",
      name: "Anthropic",
      description: "Anthropic Claude models",
      capabilities: [
        {
          type: "chat",
          models: config.models || [
            "claude-3-sonnet",
            "claude-3-opus",
            "claude-3-haiku",
          ],
          maxTokens: 4096,
          supportsStreaming: true,
        },
      ],
      isAvailable: async () => {
        return !!config.apiKey;
      },
      testConnection: async () => {
        try {
          // Implementation here
          return true;
        } catch (error) {
          return false;
        }
      },
    };
  }

  /**
   * 🔧 สร้าง Local Provider (Ollama)
   */
  static createLocalProvider(config: {
    baseUrl: string;
    models?: string[];
  }): AIProvider {
    return {
      id: "local",
      name: "Local (Ollama)",
      description: "Local AI models via Ollama",
      capabilities: [
        {
          type: "chat",
          models: config.models || ["llama2", "mistral", "codellama"],
          maxTokens: 2048,
          supportsStreaming: true,
        },
      ],
      isAvailable: async () => {
        try {
          // ตรวจสอบ Ollama connection
          const response = await fetch(`${config.baseUrl}/api/tags`);
          return response.ok;
        } catch (error) {
          return false;
        }
      },
      testConnection: async () => {
        try {
          const response = await fetch(`${config.baseUrl}/api/tags`);
          return response.ok;
        } catch (error) {
          return false;
        }
      },
    };
  }
}
