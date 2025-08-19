import { BaseProvider, AIProviderConfig, AIResponse, AIRequest } from './BaseProvider';

export interface AnythingLLMConfig extends AIProviderConfig {
  baseUrl: string;
  apiKey?: string;
  workspaceId?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
}

export interface AnythingLLMWorkspace {
  id: string;
  name: string;
  description?: string;
  documents: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnythingLLMDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  processed: boolean;
}

export interface AnythingLLMChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export class AnythingLLMProvider extends BaseProvider {
  private config: AnythingLLMConfig;
  private baseUrl: string;

  constructor(config: AnythingLLMConfig) {
    super('AnythingLLM', config);
    this.config = {
      model: 'llama2',
      maxTokens: 4096,
      temperature: 0.7,
      topP: 1,
      topK: 1,
      ...config
    };
    this.baseUrl = config.baseUrl.endsWith('/') ? config.baseUrl.slice(0, -1) : config.baseUrl;
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      // Build the request payload
      const payload: any = {
        message: request.prompt,
        mode: 'chat',
        model: this.config.model,
        temperature: this.config.temperature,
        top_p: this.config.topP,
        top_k: this.config.topK,
        max_tokens: this.config.maxTokens
      };

      // Add workspace context if available
      if (this.config.workspaceId) {
        payload.workspaceId = this.config.workspaceId;
      }

      // Add conversation context if available
      if (request.context) {
        payload.context = request.context;
      }

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`AnythingLLM API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.response || data.message || data.content,
        provider: this.name,
        model: this.config.model!,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        },
        metadata: {
          workspaceId: this.config.workspaceId,
          sources: data.sources || [],
          confidence: data.confidence
        }
      };
    } catch (error) {
      throw new Error(`AnythingLLM provider error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create a new workspace
  async createWorkspace(name: string, description?: string): Promise<AnythingLLMWorkspace> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/api/workspace`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          description
        })
      });

      if (!response.ok) {
        throw new Error(`AnythingLLM API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to create AnythingLLM workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Upload a document to a workspace
  async uploadDocument(workspaceId: string, file: File, options?: {
    chunkSize?: number;
    overlap?: number;
  }): Promise<AnythingLLMDocument> {
    try {
      const headers: Record<string, string> = {};

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('workspaceId', workspaceId);
      
      if (options?.chunkSize) {
        formData.append('chunkSize', options.chunkSize.toString());
      }
      if (options?.overlap) {
        formData.append('overlap', options.overlap.toString());
      }

      const response = await fetch(`${this.baseUrl}/api/workspace/${workspaceId}/upload`, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        throw new Error(`AnythingLLM API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Chat with a specific workspace
  async chatWithWorkspace(workspaceId: string, message: string, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<AIResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const payload = {
        message,
        workspaceId,
        model: options?.model || this.config.model,
        temperature: options?.temperature || this.config.temperature,
        max_tokens: options?.maxTokens || this.config.maxTokens
      };

      const response = await fetch(`${this.baseUrl}/api/workspace/${workspaceId}/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`AnythingLLM API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.response || data.message,
        provider: this.name,
        model: options?.model || this.config.model!,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        },
        metadata: {
          workspaceId,
          sources: data.sources || [],
          confidence: data.confidence
        }
      };
    } catch (error) {
      throw new Error(`Failed to chat with workspace: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // List all workspaces
  async listWorkspaces(): Promise<AnythingLLMWorkspace[]> {
    try {
      const headers: Record<string, string> = {};

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/api/workspace`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`AnythingLLM API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.workspaces || data;
    } catch (error) {
      throw new Error(`Failed to list workspaces: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get documents in a workspace
  async getWorkspaceDocuments(workspaceId: string): Promise<AnythingLLMDocument[]> {
    try {
      const headers: Record<string, string> = {};

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/api/workspace/${workspaceId}/documents`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`AnythingLLM API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.documents || data;
    } catch (error) {
      throw new Error(`Failed to get workspace documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete a document from a workspace
  async deleteDocument(workspaceId: string, documentId: string): Promise<void> {
    try {
      const headers: Record<string, string> = {};

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/api/workspace/${workspaceId}/document/${documentId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`AnythingLLM API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update workspace settings
  async updateWorkspaceSettings(workspaceId: string, settings: {
    name?: string;
    description?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<AnythingLLMWorkspace> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/api/workspace/${workspaceId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error(`AnythingLLM API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to update workspace settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get chat history for a workspace
  async getChatHistory(workspaceId: string, limit?: number): Promise<AnythingLLMChatMessage[]> {
    try {
      const headers: Record<string, string> = {};

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      let url = `${this.baseUrl}/api/workspace/${workspaceId}/chat/history`;
      if (limit) {
        url += `?limit=${limit}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`AnythingLLM API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.history || data;
    } catch (error) {
      throw new Error(`Failed to get chat history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Semantic search in a workspace
  async semanticSearch(workspaceId: string, query: string, limit?: number): Promise<any[]> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const payload: any = {
        query,
        workspaceId
      };

      if (limit) {
        payload.limit = limit;
      }

      const response = await fetch(`${this.baseUrl}/api/workspace/${workspaceId}/search`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`AnythingLLM API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.results || data;
    } catch (error) {
      throw new Error(`Failed to perform semantic search: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const workspaces = await this.listWorkspaces();
      return Array.isArray(workspaces); // If we can list workspaces, connection is working
    } catch (error) {
      return false;
    }
  }

  getCapabilities(): string[] {
    return [
      'text-generation',
      'conversation',
      'document-analysis',
      'semantic-search',
      'knowledge-base',
      'local-ai'
    ];
  }

  getSupportedModels(): string[] {
    return [
      'llama2',
      'llama2-uncensored',
      'codellama',
      'mistral',
      'vicuna',
      'wizard-vicuna-uncensored',
      'nous-hermes-llama2',
      'phind-codellama',
      'mpt-7b',
      'mpt-7b-instruct',
      'gpt4all',
      'gpt4all-j',
      'orca-mini',
      'chronos-hermes',
      'fimbulvetr',
      'gpt4-x-vicuna',
      'stable-vicuna',
      'wizardlm-uncensored',
      'samantha-vicuna',
      'bloomz',
      'flan-t5-xxl',
      'flan-alpaca',
      'dolly-v2-3b',
      'dolly-v2-7b',
      'dolly-v2-12b',
      'stablelm-tuned-alpha-3b',
      'stablelm-tuned-alpha-7b',
      'openassistant-sft-1-pythia-12b',
      'openassistant-sft-4-pythia-12b',
      'openassistant-sft-7-pythia-12b',
      'redpajama-incite-base-3b-v1',
      'redpajama-incite-base-7b-v1',
      'redpajama-incite-instruct-3b-v1',
      'redpajama-incite-instruct-7b-v1',
      'oasst-sft-1-pythia-12b',
      'oasst-sft-4-pythia-12b',
      'oasst-sft-7-pythia-12b',
      'oasst-sft-7-llama-30b-xor',
      'fastchat-t5-3b',
      'claude-instant-v1',
      'claude-v1',
      'claude-v2',
      'gpt-3.5-turbo',
      'gpt-4',
      'gpt-4-32k',
      'text-embedding-ada-002',
      'text-davinci-003',
      'text-curie-001',
      'text-babbage-001',
      'text-ada-001',
      'text-davinci-001',
      'davinci-instruct-beta',
      'davinci',
      'curie-instruct-beta',
      'curie',
      'babbage',
      'ada',
      'code-davinci-002',
      'code-cushman-001'
    ];
  }
}
