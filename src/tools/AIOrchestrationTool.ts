import { ToolBase, ToolMetadata, ToolResult } from "../core/tools/ToolBase";
import { App } from "obsidian";
import { AzureOpenAIProvider } from "../ai/providers/AzureOpenAIProvider";
import { OpenAIProvider } from "../ai/providers/OpenAIProvider";
import { ClaudeProvider } from "../ai/providers/ClaudeProvider";
import { GeminiProvider } from "../ai/providers/GeminiProvider";
import { OllamaProvider } from "../ai/providers/OllamaProvider";
import {
  BaseProvider,
  AIRequest,
  AIResponse,
} from "../ai/providers/BaseProvider";

/**
 * 🎭 AI Orchestration Tool - จัดการ AI providers หลายตัว
 */
export class AIOrchestrationTool extends ToolBase {
  private app: App;
  private providers: Map<string, BaseProvider> = new Map();
  private defaultProvider: string = "azure-openai";
  private costTracker: Map<string, { tokens: number; cost: number }> =
    new Map();

  constructor(app: App) {
    super({
      id: "ai-orchestration",
      name: "AI Orchestration",
      description:
        "จัดการ AI providers หลายตัว พร้อม fallback และ cost tracking",
      category: "AI",
      icon: "🎭",
      version: "1.0.0",
      author: "Ultima-Orb Team",
      tags: ["ai", "orchestration", "providers", "fallback", "cost-tracking"],
    });
    this.app = app;
    this.initializeProviders();
  }

  /**
   * 🔧 เริ่มต้น providers ทั้งหมด
   */
  private async initializeProviders(): Promise<void> {
    // Azure OpenAI
    const azureProvider = new AzureOpenAIProvider(
      "4Jgj78ZoDBR6xP8LQmImm1r1RV3OpJ310vef9icSsetzZhicRrPkJQQJ99BHACHYHv6XJ3w3AAAAACOGZ5gC",
      "https://billl-mer7xd8i-eastus2.services.ai.azure.com/models/chat/completions?api-version=2024-05-01-preview",
      "llama-scout-instruct"
    );
    await azureProvider.initialize();
    this.providers.set("azure-openai", azureProvider);

    // Ollama (Local)
    const ollamaProvider = new OllamaProvider({
      name: "ollama",
      endpoint: "http://localhost:11434",
      model: "llama2",
    });
    await ollamaProvider.initialize();
    this.providers.set("ollama", ollamaProvider);

    // เพิ่ม providers อื่นๆ ตามต้องการ
    console.info(
      "AI Orchestration Tool initialized with providers:",
      Array.from(this.providers.keys())
    );
  }

  /**
   * 🎯 Execute tool
   */
  async execute(params: {
    prompt: string;
    provider?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    useFallback?: boolean;
  }): Promise<ToolResult> {
    try {
      const {
        prompt,
        provider = this.defaultProvider,
        model,
        temperature = 0.7,
        maxTokens = 2048,
        systemPrompt,
        useFallback = true,
      } = params;

      // สร้าง AI request
      const request: AIRequest = {
        prompt,
        model,
        temperature,
        maxTokens,
        systemPrompt,
      };

      // ลองใช้ provider ที่เลือก
      let response: AIResponse;
      let usedProvider = provider;

      try {
        const selectedProvider = this.providers.get(provider);
        if (!selectedProvider) {
          throw new Error(`Provider '${provider}' not found`);
        }

        response = await selectedProvider.sendRequest(request);
        this.trackUsage(provider, response.usage?.totalTokens || 0);
      } catch (error) {
        if (useFallback) {
          // ใช้ fallback provider
          const fallbackProvider = this.getFallbackProvider(provider);
          if (fallbackProvider) {
            console.warn(
              `Provider '${provider}' failed, using fallback: ${fallbackProvider.getName()}`
            );
            response = await fallbackProvider.sendRequest(request);
            usedProvider = fallbackProvider.getName();
            this.trackUsage(usedProvider, response.usage?.totalTokens || 0);
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }

      return {
        success: true,
        data: {
          content: response.content,
          provider: usedProvider,
          model: response.model,
          usage: response.usage,
          metadata: response.metadata,
        },
        message: `Generated response using ${usedProvider}`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to generate AI response",
        timestamp: new Date(),
      };
    }
  }

  /**
   * 🔄 เลือก fallback provider
   */
  private getFallbackProvider(failedProvider: string): BaseProvider | null {
    const fallbackOrder = [
      "azure-openai",
      "ollama",
      "openai",
      "claude",
      "gemini",
    ];
    const failedIndex = fallbackOrder.indexOf(failedProvider);

    for (let i = failedIndex + 1; i < fallbackOrder.length; i++) {
      const provider = this.providers.get(fallbackOrder[i]);
      if (provider && provider.isConfigured()) {
        return provider;
      }
    }

    return null;
  }

  /**
   * 📊 ติดตามการใช้งาน
   */
  private trackUsage(provider: string, tokens: number): void {
    const current = this.costTracker.get(provider) || { tokens: 0, cost: 0 };
    current.tokens += tokens;

    // คำนวณค่าใช้จ่าย (ประมาณการ)
    const costPerToken = this.getCostPerToken(provider);
    current.cost += tokens * costPerToken;

    this.costTracker.set(provider, current);
  }

  /**
   * 💰 รับค่าใช้จ่ายต่อ token
   */
  private getCostPerToken(provider: string): number {
    const costs: Record<string, number> = {
      "azure-openai": 0.000002, // $0.002 per 1K tokens
      openai: 0.000003, // $0.003 per 1K tokens
      claude: 0.000008, // $0.008 per 1K tokens
      gemini: 0.000001, // $0.001 per 1K tokens
      ollama: 0, // Free (local)
    };

    return costs[provider] || 0;
  }

  /**
   * 📈 รับรายงานการใช้งาน
   */
  async getUsageReport(): Promise<ToolResult> {
    const report = {
      providers: Array.from(this.providers.keys()),
      usage: Object.fromEntries(this.costTracker),
      totalTokens: Array.from(this.costTracker.values()).reduce(
        (sum, usage) => sum + usage.tokens,
        0
      ),
      totalCost: Array.from(this.costTracker.values()).reduce(
        (sum, usage) => sum + usage.cost,
        0
      ),
    };

    return {
      success: true,
      data: report,
      message: "Usage report generated successfully",
      timestamp: new Date(),
    };
  }

  /**
   * 🔍 ทดสอบ providers
   */
  async testProviders(): Promise<ToolResult> {
    const results: Record<string, boolean> = {};

    for (const [name, provider] of this.providers) {
      try {
        const isAvailable = await provider.isAvailable();
        results[name] = isAvailable;
      } catch (error) {
        results[name] = false;
      }
    }

    return {
      success: true,
      data: results,
      message: "Provider tests completed",
      timestamp: new Date(),
    };
  }

  /**
   * ⚙️ เปลี่ยน default provider
   */
  setDefaultProvider(provider: string): ToolResult {
    if (this.providers.has(provider)) {
      this.defaultProvider = provider;
      return {
        success: true,
        data: { defaultProvider: provider },
        message: `Default provider changed to ${provider}`,
        timestamp: new Date(),
      };
    } else {
      return {
        success: false,
        error: `Provider '${provider}' not found`,
        message: "Failed to change default provider",
        timestamp: new Date(),
      };
    }
  }

  /**
   * 📋 รับรายการ providers ที่ใช้ได้
   */
  getAvailableProviders(): ToolResult {
    const available = Array.from(this.providers.entries())
      .filter(([_, provider]) => provider.isConfigured())
      .map(([name, provider]) => ({
        name,
        model: provider.getCurrentModel(),
        status: "available",
      }));

    return {
      success: true,
      data: available,
      message: `Found ${available.length} available providers`,
      timestamp: new Date(),
    };
  }

  /**
   * 🎨 สร้างภาพด้วย multimodal model
   */
  async generateImage(
    prompt: string,
    options?: {
      provider?: string;
      size?: "1024x1024" | "1792x1024" | "1024x1792";
      quality?: "standard" | "hd";
      style?: "vivid" | "natural";
    }
  ): Promise<ToolResult> {
    try {
      const provider = options?.provider || "azure-openai";
      const selectedProvider = this.providers.get(provider);

      if (!selectedProvider) {
        throw new Error(`Provider '${provider}' not found`);
      }

      // ตรวจสอบว่า provider รองรับการสร้างภาพ
      if (selectedProvider instanceof AzureOpenAIProvider) {
        const response = await selectedProvider.generateImage(prompt, {
          size: options?.size,
          quality: options?.quality,
          style: options?.style,
        });

        return {
          success: true,
          data: {
            imageUrl: response.content,
            provider,
            metadata: response.metadata,
          },
          message: `Image generated using ${provider}`,
          timestamp: new Date(),
        };
      } else {
        throw new Error(
          `Provider '${provider}' does not support image generation`
        );
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to generate image",
        timestamp: new Date(),
      };
    }
  }

  /**
   * 🔍 วิเคราะห์ภาพ
   */
  async analyzeImage(
    imageUrl: string,
    prompt: string,
    provider?: string
  ): Promise<ToolResult> {
    try {
      const selectedProvider = this.providers.get(provider || "azure-openai");

      if (!selectedProvider) {
        throw new Error(`Provider '${provider}' not found`);
      }

      if (selectedProvider instanceof AzureOpenAIProvider) {
        const response = await selectedProvider.analyzeImage(imageUrl, prompt);

        return {
          success: true,
          data: {
            analysis: response.content,
            provider: selectedProvider.getName(),
            metadata: response.metadata,
          },
          message: `Image analyzed using ${selectedProvider.getName()}`,
          timestamp: new Date(),
        };
      } else {
        throw new Error(
          `Provider '${provider}' does not support image analysis`
        );
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to analyze image",
        timestamp: new Date(),
      };
    }
  }

  /**
   * 📝 รับ metadata ของ tool
   */
  getMetadata(): ToolMetadata {
    return {
      id: "ai-orchestration",
      name: "AI Orchestration",
      description:
        "จัดการ AI providers หลายตัว พร้อม fallback และ cost tracking",
      version: "1.0.0",
      author: "Ultima-Orb Team",
      category: "AI",
      tags: ["ai", "orchestration", "providers", "fallback", "cost-tracking"],
      icon: "🎭",
      commands: [
        {
          name: "generate",
          description: "สร้างข้อความด้วย AI",
          parameters: {
            prompt: {
              type: "string",
              required: true,
              description: "ข้อความที่ต้องการสร้าง",
            },
            provider: {
              type: "string",
              required: false,
              description: "AI provider ที่ต้องการใช้",
            },
            model: {
              type: "string",
              required: false,
              description: "โมเดลที่ต้องการใช้",
            },
            temperature: {
              type: "number",
              required: false,
              description: "อุณหภูมิ (0-2)",
            },
            maxTokens: {
              type: "number",
              required: false,
              description: "จำนวน token สูงสุด",
            },
            systemPrompt: {
              type: "string",
              required: false,
              description: "System prompt",
            },
            useFallback: {
              type: "boolean",
              required: false,
              description: "ใช้ fallback provider หรือไม่",
            },
          },
        },
        {
          name: "generateImage",
          description: "สร้างภาพด้วย AI",
          parameters: {
            prompt: {
              type: "string",
              required: true,
              description: "คำอธิบายภาพที่ต้องการสร้าง",
            },
            provider: {
              type: "string",
              required: false,
              description: "AI provider ที่ต้องการใช้",
            },
            size: { type: "string", required: false, description: "ขนาดภาพ" },
            quality: {
              type: "string",
              required: false,
              description: "คุณภาพภาพ",
            },
            style: { type: "string", required: false, description: "สไตล์ภาพ" },
          },
        },
        {
          name: "analyzeImage",
          description: "วิเคราะห์ภาพด้วย AI",
          parameters: {
            imageUrl: {
              type: "string",
              required: true,
              description: "URL ของภาพ",
            },
            prompt: {
              type: "string",
              required: true,
              description: "คำถามเกี่ยวกับภาพ",
            },
            provider: {
              type: "string",
              required: false,
              description: "AI provider ที่ต้องการใช้",
            },
          },
        },
        {
          name: "getUsageReport",
          description: "รับรายงานการใช้งาน",
          parameters: {},
        },
        {
          name: "testProviders",
          description: "ทดสอบ providers ทั้งหมด",
          parameters: {},
        },
        {
          name: "setDefaultProvider",
          description: "ตั้งค่า default provider",
          parameters: {
            provider: {
              type: "string",
              required: true,
              description: "ชื่อ provider",
            },
          },
        },
        {
          name: "getAvailableProviders",
          description: "รับรายการ providers ที่ใช้ได้",
          parameters: {},
        },
      ],
    };
  }
}
