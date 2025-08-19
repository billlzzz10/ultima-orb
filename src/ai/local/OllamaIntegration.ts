import { App, Notice } from "obsidian";
import { FeatureManager } from "../../core/FeatureManager";

export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
  digest: string;
  details: {
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaResponse {
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

export interface OllamaRequest {
  model: string;
  prompt: string;
  system?: string;
  template?: string;
  context?: number[];
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repeat_penalty?: number;
    seed?: number;
    num_predict?: number;
    stop?: string[];
  };
  stream?: boolean;
}

export class OllamaIntegration {
  private app: App;
  private featureManager: FeatureManager;
  private baseUrl: string;
  private defaultModel: string;

  constructor(app: App, featureManager: FeatureManager) {
    this.app = app;
    this.featureManager = featureManager;
    this.baseUrl = "http://localhost:11434";
    this.defaultModel = "llama2";
  }

  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error("Error listing Ollama models:", error);
      new Notice("Error connecting to Ollama. Make sure it's running.");
      return [];
    }
  }

  async generateText(request: OllamaRequest): Promise<OllamaResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error generating text with Ollama:", error);
      throw error;
    }
  }

  async generateTextStream(
    request: OllamaRequest,
    onChunk: (chunk: OllamaResponse) => void
  ): Promise<void> {
    try {
      const streamRequest = { ...request, stream: true };
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(streamRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim()) {
            try {
              const chunk = JSON.parse(line) as OllamaResponse;
              onChunk(chunk);
            } catch (parseError) {
              console.warn("Error parsing Ollama response chunk:", parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in Ollama text stream:", error);
      throw error;
    }
  }

  async chat(
    messages: Array<{ role: string; content: string }>
  ): Promise<string> {
    try {
      const request: OllamaRequest = {
        model: this.defaultModel,
        prompt: messages.map((m) => `${m.role}: ${m.content}`).join("\n"),
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
      };

      const response = await this.generateText(request);
      return response.response;
    } catch (error) {
      console.error("Error in Ollama chat:", error);
      throw error;
    }
  }

  async codeCompletion(prompt: string, language: string): Promise<string> {
    try {
      const systemPrompt = `You are a helpful coding assistant. Generate code in ${language}. Only return the code, no explanations.`;

      const request: OllamaRequest = {
        model: this.defaultModel,
        prompt: prompt,
        system: systemPrompt,
        options: {
          temperature: 0.3,
          top_p: 0.9,
        },
      };

      const response = await this.generateText(request);
      return response.response;
    } catch (error) {
      console.error("Error in Ollama code completion:", error);
      throw error;
    }
  }

  async textSummarization(text: string): Promise<string> {
    try {
      const prompt = `Please summarize the following text:\n\n${text}`;

      const request: OllamaRequest = {
        model: this.defaultModel,
        prompt: prompt,
        options: {
          temperature: 0.5,
          top_p: 0.9,
        },
      };

      const response = await this.generateText(request);
      return response.response;
    } catch (error) {
      console.error("Error in Ollama text summarization:", error);
      throw error;
    }
  }

  async translation(text: string, targetLanguage: string): Promise<string> {
    try {
      const prompt = `Translate the following text to ${targetLanguage}:\n\n${text}`;

      const request: OllamaRequest = {
        model: this.defaultModel,
        prompt: prompt,
        options: {
          temperature: 0.3,
          top_p: 0.9,
        },
      };

      const response = await this.generateText(request);
      return response.response;
    } catch (error) {
      console.error("Error in Ollama translation:", error);
      throw error;
    }
  }

  async questionAnswering(question: string, context: string): Promise<string> {
    try {
      const prompt = `Context: ${context}\n\nQuestion: ${question}\n\nAnswer:`;

      const request: OllamaRequest = {
        model: this.defaultModel,
        prompt: prompt,
        options: {
          temperature: 0.3,
          top_p: 0.9,
        },
      };

      const response = await this.generateText(request);
      return response.response;
    } catch (error) {
      console.error("Error in Ollama question answering:", error);
      throw error;
    }
  }

  async sentimentAnalysis(text: string): Promise<string> {
    try {
      const prompt = `Analyze the sentiment of the following text and return only: positive, negative, or neutral:\n\n${text}`;

      const request: OllamaRequest = {
        model: this.defaultModel,
        prompt: prompt,
        options: {
          temperature: 0.1,
          top_p: 0.9,
        },
      };

      const response = await this.generateText(request);
      return response.response.trim().toLowerCase();
    } catch (error) {
      console.error("Error in Ollama sentiment analysis:", error);
      throw error;
    }
  }

  async namedEntityRecognition(text: string): Promise<string> {
    try {
      const prompt = `Extract named entities from the following text. Return them in JSON format with categories (PERSON, ORGANIZATION, LOCATION, DATE, etc.):\n\n${text}`;

      const request: OllamaRequest = {
        model: this.defaultModel,
        prompt: prompt,
        options: {
          temperature: 0.1,
          top_p: 0.9,
        },
      };

      const response = await this.generateText(request);
      return response.response;
    } catch (error) {
      console.error("Error in Ollama named entity recognition:", error);
      throw error;
    }
  }

  async textClassification(
    text: string,
    categories: string[]
  ): Promise<string> {
    try {
      const prompt = `Classify the following text into one of these categories: ${categories.join(
        ", "
      )}\n\nText: ${text}\n\nCategory:`;

      const request: OllamaRequest = {
        model: this.defaultModel,
        prompt: prompt,
        options: {
          temperature: 0.1,
          top_p: 0.9,
        },
      };

      const response = await this.generateText(request);
      return response.response.trim();
    } catch (error) {
      console.error("Error in Ollama text classification:", error);
      throw error;
    }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.defaultModel,
          prompt: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.embedding;
    } catch (error) {
      console.error("Error generating embeddings with Ollama:", error);
      throw error;
    }
  }

  async pullModel(modelName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: modelName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      new Notice(`Pulling model ${modelName}...`);

      // Handle streaming response for pull progress
      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          console.log("Pull progress:", chunk);
        }
      }

      new Notice(`Model ${modelName} pulled successfully`);
    } catch (error) {
      console.error("Error pulling Ollama model:", error);
      new Notice(`Error pulling model ${modelName}`);
      throw error;
    }
  }

  async deleteModel(modelName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: modelName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      new Notice(`Model ${modelName} deleted successfully`);
    } catch (error) {
      console.error("Error deleting Ollama model:", error);
      new Notice(`Error deleting model ${modelName}`);
      throw error;
    }
  }

  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  setDefaultModel(model: string): void {
    this.defaultModel = model;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }

  async testConnection(): Promise<boolean> {
    try {
      const models = await this.listModels();
      return models.length >= 0; // If we can list models, connection is working
    } catch (error) {
      return false;
    }
  }
}
