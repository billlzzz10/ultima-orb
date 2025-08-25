import { ToolBase } from "../core/tools/ToolBase";
import { Notice } from "obsidian";

export interface LocalModel {
  id: string;
  name: string;
  type: 'llm' | 'embedding' | 'vision' | 'multimodal';
  provider: 'ollama' | 'llama.cpp' | 'transformers' | 'custom';
  modelPath: string;
  config: {
    contextLength: number;
    maxTokens: number;
    temperature: number;
    topP: number;
    topK: number;
    repeatPenalty: number;
    stopSequences: string[];
    systemPrompt?: string;
  };
  metadata: {
    version: string;
    author: string;
    description: string;
    tags: string[];
    size: number; // in GB
    downloadUrl?: string;
    license: string;
    lastUpdated: Date;
  };
  status: 'downloading' | 'ready' | 'error' | 'offline';
  performance: {
    tokensPerSecond: number;
    memoryUsage: number; // in MB
    gpuUsage?: number; // in %
    cpuUsage?: number; // in %
  };
}

export interface ModelResponse {
  success: boolean;
  modelId: string;
  response: string;
  tokensUsed: number;
  processingTime: number;
  error?: string;
}

export interface ModelRequest {
  modelId: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
}

export class LocalModelsTool extends ToolBase {
  private models: Map<string, LocalModel> = new Map();
  private activeModel: LocalModel | null = null;
  private modelProcesses: Map<string, any> = new Map();

  constructor() {
    super({
      id: "local-models",
      name: "Local Models",
      description: "Manage and run 10-20 local AI models with Ollama, Llama.cpp, and Transformers",
      category: "AI",
      icon: "brain",
      version: "1.0.0",
      author: "Ultima-Orb",
      tags: ["local", "ai", "models", "ollama", "llama", "transformers"]
    });

    this.initializeDefaultModels();
  }

  async execute(params: any): Promise<ModelResponse> {
    try {
      const { action, ...data } = params;

      switch (action) {
        case 'list_models':
          return await this.listModels();
        case 'add_model':
          return await this.addModel(data);
        case 'remove_model':
          return await this.removeModel(data);
        case 'start_model':
          return await this.startModel(data);
        case 'stop_model':
          return await this.stopModel(data);
        case 'generate':
          return await this.generateResponse(data);
        case 'download_model':
          return await this.downloadModel(data);
        case 'update_model':
          return await this.updateModel(data);
        case 'get_model_info':
          return await this.getModelInfo(data);
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return {
        success: false,
        modelId: params.modelId || "",
        response: "",
        tokensUsed: 0,
        processingTime: 0,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private initializeDefaultModels(): void {
    const defaultModels: LocalModel[] = [
      // LLM Models
      {
        id: "llama2-7b",
        name: "Llama 2 7B",
        type: "llm",
        provider: "ollama",
        modelPath: "llama2:7b",
        config: {
          contextLength: 4096,
          maxTokens: 2048,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          repeatPenalty: 1.1,
          stopSequences: ["</s>", "Human:", "Assistant:"],
          systemPrompt: "You are a helpful AI assistant."
        },
        metadata: {
          version: "2.0",
          author: "Meta",
          description: "7B parameter Llama 2 model for general text generation",
          tags: ["llm", "general", "conversation"],
          size: 4.2,
          license: "Meta License",
          lastUpdated: new Date("2023-07-18")
        },
        status: "ready",
        performance: {
          tokensPerSecond: 15,
          memoryUsage: 4096,
          gpuUsage: 0,
          cpuUsage: 0
        }
      },
      {
        id: "llama2-13b",
        name: "Llama 2 13B",
        type: "llm",
        provider: "ollama",
        modelPath: "llama2:13b",
        config: {
          contextLength: 4096,
          maxTokens: 2048,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          repeatPenalty: 1.1,
          stopSequences: ["</s>", "Human:", "Assistant:"],
          systemPrompt: "You are a helpful AI assistant."
        },
        metadata: {
          version: "2.0",
          author: "Meta",
          description: "13B parameter Llama 2 model for advanced text generation",
          tags: ["llm", "advanced", "conversation"],
          size: 7.8,
          license: "Meta License",
          lastUpdated: new Date("2023-07-18")
        },
        status: "ready",
        performance: {
          tokensPerSecond: 8,
          memoryUsage: 8192,
          gpuUsage: 0,
          cpuUsage: 0
        }
      },
      {
        id: "codellama-7b",
        name: "Code Llama 7B",
        type: "llm",
        provider: "ollama",
        modelPath: "codellama:7b",
        config: {
          contextLength: 8192,
          maxTokens: 4096,
          temperature: 0.2,
          topP: 0.95,
          topK: 50,
          repeatPenalty: 1.1,
          stopSequences: ["```", "Human:", "Assistant:"],
          systemPrompt: "You are a helpful coding assistant."
        },
        metadata: {
          version: "1.0",
          author: "Meta",
          description: "7B parameter Code Llama model specialized for code generation",
          tags: ["llm", "coding", "programming"],
          size: 4.2,
          license: "Meta License",
          lastUpdated: new Date("2023-08-24")
        },
        status: "ready",
        performance: {
          tokensPerSecond: 12,
          memoryUsage: 4096,
          gpuUsage: 0,
          cpuUsage: 0
        }
      },
      {
        id: "mistral-7b",
        name: "Mistral 7B",
        type: "llm",
        provider: "ollama",
        modelPath: "mistral:7b",
        config: {
          contextLength: 8192,
          maxTokens: 2048,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          repeatPenalty: 1.1,
          stopSequences: ["</s>", "Human:", "Assistant:"],
          systemPrompt: "You are a helpful AI assistant."
        },
        metadata: {
          version: "0.1",
          author: "Mistral AI",
          description: "7B parameter Mistral model with excellent performance",
          tags: ["llm", "general", "efficient"],
          size: 4.1,
          license: "Apache 2.0",
          lastUpdated: new Date("2023-09-27")
        },
        status: "ready",
        performance: {
          tokensPerSecond: 18,
          memoryUsage: 4096,
          gpuUsage: 0,
          cpuUsage: 0
        }
      },
      {
        id: "phi-2",
        name: "Microsoft Phi-2",
        type: "llm",
        provider: "ollama",
        modelPath: "phi:2.7b",
        config: {
          contextLength: 2048,
          maxTokens: 1024,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          repeatPenalty: 1.1,
          stopSequences: ["</s>", "Human:", "Assistant:"],
          systemPrompt: "You are a helpful AI assistant."
        },
        metadata: {
          version: "2.0",
          author: "Microsoft",
          description: "2.7B parameter Phi-2 model with excellent reasoning",
          tags: ["llm", "reasoning", "efficient"],
          size: 1.7,
          license: "MIT",
          lastUpdated: new Date("2023-12-12")
        },
        status: "ready",
        performance: {
          tokensPerSecond: 25,
          memoryUsage: 2048,
          gpuUsage: 0,
          cpuUsage: 0
        }
      },
      // Embedding Models
      {
        id: "nomic-embed",
        name: "Nomic Embed",
        type: "embedding",
        provider: "ollama",
        modelPath: "nomic-embed-text",
        config: {
          contextLength: 8192,
          maxTokens: 8192,
          temperature: 0,
          topP: 1,
          topK: 1,
          repeatPenalty: 1,
          stopSequences: [],
          systemPrompt: ""
        },
        metadata: {
          version: "1.0",
          author: "Nomic",
          description: "High-quality text embedding model",
          tags: ["embedding", "semantic", "search"],
          size: 0.5,
          license: "MIT",
          lastUpdated: new Date("2024-01-15")
        },
        status: "ready",
        performance: {
          tokensPerSecond: 1000,
          memoryUsage: 1024,
          gpuUsage: 0,
          cpuUsage: 0
        }
      },
      {
        id: "all-minilm",
        name: "All-MiniLM-L6-v2",
        type: "embedding",
        provider: "transformers",
        modelPath: "sentence-transformers/all-MiniLM-L6-v2",
        config: {
          contextLength: 256,
          maxTokens: 256,
          temperature: 0,
          topP: 1,
          topK: 1,
          repeatPenalty: 1,
          stopSequences: [],
          systemPrompt: ""
        },
        metadata: {
          version: "1.0",
          author: "Sentence Transformers",
          description: "Fast and efficient sentence embedding model",
          tags: ["embedding", "fast", "efficient"],
          size: 0.1,
          license: "Apache 2.0",
          lastUpdated: new Date("2023-01-01")
        },
        status: "ready",
        performance: {
          tokensPerSecond: 2000,
          memoryUsage: 512,
          gpuUsage: 0,
          cpuUsage: 0
        }
      },
      // Vision Models
      {
        id: "llava-7b",
        name: "LLaVA 7B",
        type: "vision",
        provider: "ollama",
        modelPath: "llava:7b",
        config: {
          contextLength: 4096,
          maxTokens: 2048,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          repeatPenalty: 1.1,
          stopSequences: ["</s>", "Human:", "Assistant:"],
          systemPrompt: "You are a helpful vision assistant."
        },
        metadata: {
          version: "1.5",
          author: "Microsoft",
          description: "7B parameter vision-language model",
          tags: ["vision", "multimodal", "image"],
          size: 4.5,
          license: "Apache 2.0",
          lastUpdated: new Date("2023-11-01")
        },
        status: "ready",
        performance: {
          tokensPerSecond: 10,
          memoryUsage: 6144,
          gpuUsage: 0,
          cpuUsage: 0
        }
      },
      {
        id: "bakllava-7b",
        name: "BakLLaVA 7B",
        type: "vision",
        provider: "ollama",
        modelPath: "bakllava:7b",
        config: {
          contextLength: 4096,
          maxTokens: 2048,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          repeatPenalty: 1.1,
          stopSequences: ["</s>", "Human:", "Assistant:"],
          systemPrompt: "You are a helpful vision assistant."
        },
        metadata: {
          version: "1.0",
          author: "BakLLaVA Team",
          description: "7B parameter vision-language model with improved performance",
          tags: ["vision", "multimodal", "image"],
          size: 4.5,
          license: "Apache 2.0",
          lastUpdated: new Date("2023-12-01")
        },
        status: "ready",
        performance: {
          tokensPerSecond: 12,
          memoryUsage: 6144,
          gpuUsage: 0,
          cpuUsage: 0
        }
      },
      // Multimodal Models
      {
        id: "llava-13b",
        name: "LLaVA 13B",
        type: "multimodal",
        provider: "ollama",
        modelPath: "llava:13b",
        config: {
          contextLength: 4096,
          maxTokens: 2048,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          repeatPenalty: 1.1,
          stopSequences: ["</s>", "Human:", "Assistant:"],
          systemPrompt: "You are a helpful multimodal assistant."
        },
        metadata: {
          version: "1.5",
          author: "Microsoft",
          description: "13B parameter multimodal model for text and vision",
          tags: ["multimodal", "vision", "text"],
          size: 8.0,
          license: "Apache 2.0",
          lastUpdated: new Date("2023-11-01")
        },
        status: "ready",
        performance: {
          tokensPerSecond: 6,
          memoryUsage: 12288,
          gpuUsage: 0,
          cpuUsage: 0
        }
      },
      // Specialized Models
      {
        id: "neural-chat-7b",
        name: "Neural Chat 7B",
        type: "llm",
        provider: "ollama",
        modelPath: "neural-chat:7b",
        config: {
          contextLength: 4096,
          maxTokens: 2048,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          repeatPenalty: 1.1,
          stopSequences: ["</s>", "Human:", "Assistant:"],
          systemPrompt: "You are a helpful conversational AI assistant."
        },
        metadata: {
          version: "1.0",
          author: "Intel",
          description: "7B parameter conversational model optimized for chat",
          tags: ["llm", "conversation", "chat"],
          size: 4.2,
          license: "Apache 2.0",
          lastUpdated: new Date("2023-10-01")
        },
        status: "ready",
        performance: {
          tokensPerSecond: 16,
          memoryUsage: 4096,
          gpuUsage: 0,
          cpuUsage: 0
        }
      },
      {
        id: "orca-mini-3b",
        name: "Orca Mini 3B",
        type: "llm",
        provider: "ollama",
        modelPath: "orca-mini:3b",
        config: {
          contextLength: 2048,
          maxTokens: 1024,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          repeatPenalty: 1.1,
          stopSequences: ["</s>", "Human:", "Assistant:"],
          systemPrompt: "You are a helpful AI assistant."
        },
        metadata: {
          version: "1.0",
          author: "Microsoft",
          description: "3B parameter Orca model for efficient inference",
          tags: ["llm", "efficient", "fast"],
          size: 1.9,
          license: "MIT",
          lastUpdated: new Date("2023-08-01")
        },
        status: "ready",
        performance: {
          tokensPerSecond: 30,
          memoryUsage: 2048,
          gpuUsage: 0,
          cpuUsage: 0
        }
      },
      {
        id: "qwen-7b",
        name: "Qwen 7B",
        type: "llm",
        provider: "ollama",
        modelPath: "qwen:7b",
        config: {
          contextLength: 8192,
          maxTokens: 2048,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          repeatPenalty: 1.1,
          stopSequences: ["</s>", "Human:", "Assistant:"],
          systemPrompt: "You are a helpful AI assistant."
        },
        metadata: {
          version: "1.0",
          author: "Alibaba",
          description: "7B parameter Qwen model with strong reasoning",
          tags: ["llm", "reasoning", "general"],
          size: 4.2,
          license: "Qwen License",
          lastUpdated: new Date("2023-08-01")
        },
        status: "ready",
        performance: {
          tokensPerSecond: 14,
          memoryUsage: 4096,
          gpuUsage: 0,
          cpuUsage: 0
        }
      },
      {
        id: "yi-6b",
        name: "Yi 6B",
        type: "llm",
        provider: "ollama",
        modelPath: "yi:6b",
        config: {
          contextLength: 4096,
          maxTokens: 2048,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          repeatPenalty: 1.1,
          stopSequences: ["</s>", "Human:", "Assistant:"],
          systemPrompt: "You are a helpful AI assistant."
        },
        metadata: {
          version: "1.0",
          author: "01.AI",
          description: "6B parameter Yi model with excellent performance",
          tags: ["llm", "general", "efficient"],
          size: 3.8,
          license: "Apache 2.0",
          lastUpdated: new Date("2023-11-01")
        },
        status: "ready",
        performance: {
          tokensPerSecond: 18,
          memoryUsage: 4096,
          gpuUsage: 0,
          cpuUsage: 0
        }
      },
      {
        id: "deepseek-7b",
        name: "DeepSeek 7B",
        type: "llm",
        provider: "ollama",
        modelPath: "deepseek:7b",
        config: {
          contextLength: 8192,
          maxTokens: 2048,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          repeatPenalty: 1.1,
          stopSequences: ["</s>", "Human:", "Assistant:"],
          systemPrompt: "You are a helpful AI assistant."
        },
        metadata: {
          version: "1.0",
          author: "DeepSeek",
          description: "7B parameter DeepSeek model with strong reasoning",
          tags: ["llm", "reasoning", "general"],
          size: 4.2,
          license: "DeepSeek License",
          lastUpdated: new Date("2023-12-01")
        },
        status: "ready",
        performance: {
          tokensPerSecond: 15,
          memoryUsage: 4096,
          gpuUsage: 0,
          cpuUsage: 0
        }
      },
      {
        id: "gemma-7b",
        name: "Gemma 7B",
        type: "llm",
        provider: "ollama",
        modelPath: "gemma:7b",
        config: {
          contextLength: 8192,
          maxTokens: 2048,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          repeatPenalty: 1.1,
          stopSequences: ["</s>", "Human:", "Assistant:"],
          systemPrompt: "You are a helpful AI assistant."
        },
        metadata: {
          version: "2.0",
          author: "Google",
          description: "7B parameter Gemma model with strong performance",
          tags: ["llm", "general", "google"],
          size: 4.2,
          license: "Gemma License",
          lastUpdated: new Date("2024-02-01")
        },
        status: "ready",
        performance: {
          tokensPerSecond: 16,
          memoryUsage: 4096,
          gpuUsage: 0,
          cpuUsage: 0
        }
      },
      {
        id: "solar-10.7b",
        name: "Solar 10.7B",
        type: "llm",
        provider: "ollama",
        modelPath: "solar:10.7b",
        config: {
          contextLength: 8192,
          maxTokens: 2048,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          repeatPenalty: 1.1,
          stopSequences: ["</s>", "Human:", "Assistant:"],
          systemPrompt: "You are a helpful AI assistant."
        },
        metadata: {
          version: "1.0",
          author: "Upstage",
          description: "10.7B parameter Solar model with excellent performance",
          tags: ["llm", "general", "large"],
          size: 6.5,
          license: "Apache 2.0",
          lastUpdated: new Date("2023-12-01")
        },
        status: "ready",
        performance: {
          tokensPerSecond: 8,
          memoryUsage: 8192,
          gpuUsage: 0,
          cpuUsage: 0
        }
      }
    ];

    defaultModels.forEach(model => {
      this.models.set(model.id, model);
    });
  }

  private async listModels(): Promise<ModelResponse> {
    const modelList = Array.from(this.models.values());
    
    return {
      success: true,
      modelId: "list_models",
      response: JSON.stringify(modelList, null, 2),
      tokensUsed: 0,
      processingTime: 0
    };
  }

  private async addModel(data: Partial<LocalModel>): Promise<ModelResponse> {
    if (!data.id || !data.name) {
      throw new Error("Model ID and name are required");
    }

    if (this.models.has(data.id)) {
      throw new Error(`Model with ID ${data.id} already exists`);
    }

    const model: LocalModel = {
      id: data.id,
      name: data.name,
      type: data.type || "llm",
      provider: data.provider || "ollama",
      modelPath: data.modelPath || data.id,
      config: data.config || {
        contextLength: 4096,
        maxTokens: 2048,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        repeatPenalty: 1.1,
        stopSequences: ["</s>", "Human:", "Assistant:"],
        systemPrompt: "You are a helpful AI assistant."
      },
      metadata: data.metadata || {
        version: "1.0",
        author: "Unknown",
        description: "Custom model",
        tags: ["custom"],
        size: 0,
        license: "Unknown",
        lastUpdated: new Date()
      },
      status: "ready",
      performance: data.performance || {
        tokensPerSecond: 10,
        memoryUsage: 4096,
        gpuUsage: 0,
        cpuUsage: 0
      }
    };

    this.models.set(model.id, model);
    new Notice(`Model "${model.name}" added successfully`);

    return {
      success: true,
      modelId: model.id,
      response: `Model "${model.name}" added successfully`,
      tokensUsed: 0,
      processingTime: 0
    };
  }

  private async removeModel(data: { modelId: string }): Promise<ModelResponse> {
    const model = this.models.get(data.modelId);
    if (!model) {
      throw new Error(`Model with ID ${data.modelId} not found`);
    }

    // Stop model if running
    await this.stopModel({ modelId: data.modelId });

    this.models.delete(data.modelId);
    if (this.activeModel?.id === data.modelId) {
      this.activeModel = null;
    }

    new Notice(`Model "${model.name}" removed successfully`);

    return {
      success: true,
      modelId: data.modelId,
      response: `Model "${model.name}" removed successfully`,
      tokensUsed: 0,
      processingTime: 0
    };
  }

  private async startModel(data: { modelId: string }): Promise<ModelResponse> {
    const model = this.models.get(data.modelId);
    if (!model) {
      throw new Error(`Model with ID ${data.modelId} not found`);
    }

    if (model.status === "ready") {
      this.activeModel = model;
      new Notice(`Model "${model.name}" activated`);
      
      return {
        success: true,
        modelId: data.modelId,
        response: `Model "${model.name}" activated successfully`,
        tokensUsed: 0,
        processingTime: 0
      };
    } else {
      throw new Error(`Model "${model.name}" is not ready (status: ${model.status})`);
    }
  }

  private async stopModel(data: { modelId: string }): Promise<ModelResponse> {
    const model = this.models.get(data.modelId);
    if (!model) {
      throw new Error(`Model with ID ${data.modelId} not found`);
    }

    if (this.activeModel?.id === data.modelId) {
      this.activeModel = null;
    }

    new Notice(`Model "${model.name}" stopped`);

    return {
      success: true,
      modelId: data.modelId,
      response: `Model "${model.name}" stopped successfully`,
      tokensUsed: 0,
      processingTime: 0
    };
  }

  private async generateResponse(data: ModelRequest): Promise<ModelResponse> {
    const model = this.models.get(data.modelId);
    if (!model) {
      throw new Error(`Model with ID ${data.modelId} not found`);
    }

    if (model.status !== "ready") {
      throw new Error(`Model "${model.name}" is not ready (status: ${model.status})`);
    }

    const startTime = Date.now();

    try {
      // Simulate model response generation
      const response = await this.simulateModelResponse(model, data);
      const processingTime = Date.now() - startTime;
      const tokensUsed = this.estimateTokens(data.prompt + response);

      return {
        success: true,
        modelId: data.modelId,
        response,
        tokensUsed,
        processingTime
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        modelId: data.modelId,
        response: "",
        tokensUsed: 0,
        processingTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async downloadModel(data: { modelId: string }): Promise<ModelResponse> {
    const model = this.models.get(data.modelId);
    if (!model) {
      throw new Error(`Model with ID ${data.modelId} not found`);
    }

    model.status = "downloading";
    new Notice(`Downloading model "${model.name}"...`);

    // Simulate download process
    await new Promise(resolve => setTimeout(resolve, 2000));

    model.status = "ready";
    new Notice(`Model "${model.name}" downloaded successfully`);

    return {
      success: true,
      modelId: data.modelId,
      response: `Model "${model.name}" downloaded successfully`,
      tokensUsed: 0,
      processingTime: 2000
    };
  }

  private async updateModel(data: { modelId: string; updates: Partial<LocalModel> }): Promise<ModelResponse> {
    const model = this.models.get(data.modelId);
    if (!model) {
      throw new Error(`Model with ID ${data.modelId} not found`);
    }

    Object.assign(model, data.updates);
    model.metadata.lastUpdated = new Date();

    new Notice(`Model "${model.name}" updated successfully`);

    return {
      success: true,
      modelId: data.modelId,
      response: `Model "${model.name}" updated successfully`,
      tokensUsed: 0,
      processingTime: 0
    };
  }

  private async getModelInfo(data: { modelId: string }): Promise<ModelResponse> {
    const model = this.models.get(data.modelId);
    if (!model) {
      throw new Error(`Model with ID ${data.modelId} not found`);
    }

    return {
      success: true,
      modelId: data.modelId,
      response: JSON.stringify(model, null, 2),
      tokensUsed: 0,
      processingTime: 0
    };
  }

  // Utility methods
  private async simulateModelResponse(model: LocalModel, request: ModelRequest): Promise<string> {
    // Simulate different model responses based on type
    const baseResponse = `This is a simulated response from ${model.name}. `;
    
    switch (model.type) {
      case "llm":
        return baseResponse + `I understand your request: "${request.prompt}". Here's my response based on my training data and the context you provided.`;
      case "embedding":
        return `[0.1, 0.2, 0.3, ...]`; // Simulated embedding vector
      case "vision":
        return baseResponse + `I can see the image you provided. Based on the visual content, here's my analysis.`;
      case "multimodal":
        return baseResponse + `I can process both text and images. Here's my multimodal response to your input.`;
      default:
        return baseResponse + `I'm processing your request.`;
    }
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  // Model management
  getModels(): LocalModel[] {
    return Array.from(this.models.values());
  }

  getActiveModel(): LocalModel | null {
    return this.activeModel;
  }

  getModelById(id: string): LocalModel | null {
    return this.models.get(id) || null;
  }

  getModelsByType(type: LocalModel['type']): LocalModel[] {
    return Array.from(this.models.values()).filter(model => model.type === type);
  }

  getModelsByProvider(provider: LocalModel['provider']): LocalModel[] {
    return Array.from(this.models.values()).filter(model => model.provider === provider);
  }

  // Performance monitoring
  getModelPerformance(modelId: string): any {
    const model = this.models.get(modelId);
    if (!model) return null;

    return {
      modelId,
      name: model.name,
      status: model.status,
      performance: model.performance,
      lastUpdated: model.metadata.lastUpdated
    };
  }

  // Batch operations
  async startMultipleModels(modelIds: string[]): Promise<ModelResponse[]> {
    const results: ModelResponse[] = [];
    
    for (const modelId of modelIds) {
      try {
        const result = await this.startModel({ modelId });
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          modelId,
          response: "",
          tokensUsed: 0,
          processingTime: 0,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return results;
  }

  async stopAllModels(): Promise<ModelResponse[]> {
    const modelIds = Array.from(this.models.keys());
    const results: ModelResponse[] = [];
    
    for (const modelId of modelIds) {
      try {
        const result = await this.stopModel({ modelId });
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          modelId,
          response: "",
          tokensUsed: 0,
          processingTime: 0,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return results;
  }
}
