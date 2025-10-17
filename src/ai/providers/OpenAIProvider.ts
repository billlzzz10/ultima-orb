import { App, Notice } from "obsidian";
import { FeatureManager } from "../../core/FeatureManager";

export interface OpenAIRequest {
  model: string;
  messages?: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  prompt?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message?: {
      role: string;
      content: string;
    };
    text?: string;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: Array<{
    id: string;
    object: string;
    created: number;
    allow_create_engine: boolean;
    allow_sampling: boolean;
    allow_logprobs: boolean;
    allow_search_indices: boolean;
    allow_view: boolean;
    allow_fine_tuning: boolean;
    organization: string;
    group: string | null;
    is_blocking: boolean;
  }>;
  root: string;
  parent: string | null;
}

export class OpenAIProvider {
  private app: App;
  private featureManager: FeatureManager;
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;
  private models: Map<string, OpenAIModel> = new Map();

  constructor(app: App, featureManager: FeatureManager) {
    this.app = app;
    this.featureManager = featureManager;
    this.baseUrl = "https://api.openai.com/v1";
    this.apiKey = "";
    this.defaultModel = "gpt-4";
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  setDefaultModel(model: string): void {
    this.defaultModel = model;
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }

  async listModels(): Promise<OpenAIModel[]> {
    try {
      const response = await this.makeRequest("/models");
      const models = response.data as OpenAIModel[];
      
      // Cache models
      models.forEach(model => {
        this.models.set(model.id, model);
      });
      
      return models;
    } catch (error) {
      new Notice(`Failed to list OpenAI models: ${error}`);
      return [];
    }
  }

  async chatCompletion(request: OpenAIRequest): Promise<OpenAIResponse> {
    if (!request.messages) {
      throw new Error("Messages are required for chat completion");
    }

    return await this.makeRequest("/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model: request.model || this.defaultModel,
        messages: request.messages,
        max_tokens: request.max_tokens || 1000,
        temperature: request.temperature || 0.7,
        top_p: request.top_p || 1,
        frequency_penalty: request.frequency_penalty || 0,
        presence_penalty: request.presence_penalty || 0,
        stream: request.stream || false
      })
    });
  }

  async textCompletion(request: OpenAIRequest): Promise<OpenAIResponse> {
    if (!request.prompt) {
      throw new Error("Prompt is required for text completion");
    }

    return await this.makeRequest("/completions", {
      method: "POST",
      body: JSON.stringify({
        model: request.model || this.defaultModel,
        prompt: request.prompt,
        max_tokens: request.max_tokens || 1000,
        temperature: request.temperature || 0.7,
        top_p: request.top_p || 1,
        frequency_penalty: request.frequency_penalty || 0,
        presence_penalty: request.presence_penalty || 0,
        stream: request.stream || false
      })
    });
  }

  async generateEmbeddings(text: string, model: string = "text-embedding-ada-002"): Promise<number[]> {
    const response = await this.makeRequest("/embeddings", {
      method: "POST",
      body: JSON.stringify({
        model: model,
        input: text
      })
    });

    return response.data[0].embedding;
  }

  async generateImage(prompt: string, size: string = "1024x1024", quality: string = "standard", n: number = 1): Promise<string[]> {
    const response = await this.makeRequest("/images/generations", {
      method: "POST",
      body: JSON.stringify({
        prompt: prompt,
        n: n,
        size: size,
        quality: quality
      })
    });

    return response.data.map((image: any) => image.url);
  }

  async editImage(image: File, prompt: string, mask?: File, n: number = 1, size: string = "1024x1024"): Promise<string[]> {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("prompt", prompt);
    formData.append("n", n.toString());
    formData.append("size", size);
    
    if (mask) {
      formData.append("mask", mask);
    }

    const response = await this.makeRequest("/images/edits", {
      method: "POST",
      body: formData,
      headers: {} // Let browser set content-type for FormData
    });

    return response.data.map((image: any) => image.url);
  }

  async createVariation(image: File, n: number = 1, size: string = "1024x1024"): Promise<string[]> {
    const formData = new FormData();
    formData.append("image", image);
    formData.append("n", n.toString());
    formData.append("size", size);

    const response = await this.makeRequest("/images/variations", {
      method: "POST",
      body: formData,
      headers: {} // Let browser set content-type for FormData
    });

    return response.data.map((image: any) => image.url);
  }

  async transcribeAudio(audio: File, model: string = "whisper-1", language?: string, prompt?: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", audio);
    formData.append("model", model);
    
    if (language) {
      formData.append("language", language);
    }
    
    if (prompt) {
      formData.append("prompt", prompt);
    }

    const response = await this.makeRequest("/audio/transcriptions", {
      method: "POST",
      body: formData,
      headers: {} // Let browser set content-type for FormData
    });

    return response.text;
  }

  async translateAudio(audio: File, model: string = "whisper-1", prompt?: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", audio);
    formData.append("model", model);
    
    if (prompt) {
      formData.append("prompt", prompt);
    }

    const response = await this.makeRequest("/audio/translations", {
      method: "POST",
      body: formData,
      headers: {} // Let browser set content-type for FormData
    });

    return response.text;
  }

  async moderateContent(input: string | string[]): Promise<any> {
    const response = await this.makeRequest("/moderations", {
      method: "POST",
      body: JSON.stringify({
        input: input
      })
    });

    return response;
  }

  async fineTune(trainingFile: string, validationFile?: string, model: string = "gpt-3.5-turbo"): Promise<any> {
    const body: any = {
      training_file: trainingFile,
      model: model
    };

    if (validationFile) {
      body.validation_file = validationFile;
    }

    return await this.makeRequest("/fine_tuning/jobs", {
      method: "POST",
      body: JSON.stringify(body)
    });
  }

  async listFineTunes(): Promise<any[]> {
    const response = await this.makeRequest("/fine_tuning/jobs");
    return response.data;
  }

  async getFineTune(fineTuneId: string): Promise<any> {
    return await this.makeRequest(`/fine_tuning/jobs/${fineTuneId}`);
  }

  async cancelFineTune(fineTuneId: string): Promise<any> {
    return await this.makeRequest(`/fine_tuning/jobs/${fineTuneId}/cancel`, {
      method: "POST"
    });
  }

  async listFiles(): Promise<any[]> {
    const response = await this.makeRequest("/files");
    return response.data;
  }

  async uploadFile(file: File, purpose: string = "fine-tune"): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", purpose);

    return await this.makeRequest("/files", {
      method: "POST",
      body: formData,
      headers: {} // Let browser set content-type for FormData
    });
  }

  async deleteFile(fileId: string): Promise<any> {
    return await this.makeRequest(`/files/${fileId}`, {
      method: "DELETE"
    });
  }

  async retrieveFile(fileId: string): Promise<any> {
    return await this.makeRequest(`/files/${fileId}`);
  }

  async downloadFile(fileId: string): Promise<string> {
    const response = await this.makeRequest(`/files/${fileId}/content`);
    return response;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${this.apiKey}`,
      ...options.headers as Record<string, string>
    };

    // Don't set Content-Type for FormData
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Handle different response types
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return await response.text();
    }
  }

  // Utility methods
  async testConnection(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        throw new Error("OpenAI API key not set");
      }
      await this.listModels();
      return true;
    } catch (error) {
      new Notice(`OpenAI connection test failed: ${error}`);
      return false;
    }
  }

  getApiKey(): string {
    return this.apiKey;
  }

  isConnected(): boolean {
    return !!this.apiKey;
  }

  getAvailableModels(): string[] {
    return Array.from(this.models.keys());
  }

  getModelInfo(modelId: string): OpenAIModel | undefined {
    return this.models.get(modelId);
  }

  // Cost estimation (approximate)
  estimateCost(model: string, inputTokens: number, outputTokens: number): number {
    const costs: Record<string, { input: number; output: number }> = {
      "gpt-4": { input: 0.03, output: 0.06 },
      "gpt-4-turbo": { input: 0.01, output: 0.03 },
      "gpt-3.5-turbo": { input: 0.0015, output: 0.002 },
      "text-embedding-ada-002": { input: 0.0001, output: 0 }
    };

    const cost = costs[model];
    if (!cost) {
      return 0;
    }

    return (inputTokens / 1000) * cost.input + (outputTokens / 1000) * cost.output;
  }
}
