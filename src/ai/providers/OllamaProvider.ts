import { BaseProvider, ChatMessage, ChatResponse, ProviderConfig } from './BaseProvider';
import { Logger } from '../../services/Logger';

interface OllamaRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  stream?: boolean;
  options?: {
    temperature?: number;
    num_predict?: number;
    top_k?: number;
    top_p?: number;
    repeat_penalty?: number;
  };
}

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: 'assistant';
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

export class OllamaProvider extends BaseProvider {
  private logger: Logger;

  constructor(config: ProviderConfig, logger: Logger) {
    super({
      endpoint: 'http://localhost:11434',
      model: 'llama2',
      ...config,
      name: config.name || 'Ollama'
    });
    this.logger = logger;
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    if (!this.status.connected) {
      throw new Error('Ollama provider is not connected. Please test connection first.');
    }

    const requestBody: OllamaRequest = {
      model: this.config.model || 'llama2',
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      stream: false,
      options: {
        temperature: this.config.temperature,
        num_predict: this.config.maxTokens,
        top_k: 40,
        top_p: 0.9,
        repeat_penalty: 1.1
      }
    };

    try {
      this.logger.debug('Sending request to Ollama:', {
        model: requestBody.model,
        messageCount: messages.length
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout || 30000);
      
      try {
        const response = await fetch(`${this.config.endpoint}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      const ollamaResponse: OllamaResponse = await response.json();

      const chatResponse: ChatResponse = {
        content: ollamaResponse.message.content,
        model: ollamaResponse.model,
        usage: {
          prompt_tokens: ollamaResponse.prompt_eval_count || 0,
          completion_tokens: ollamaResponse.eval_count || 0,
          total_tokens: (ollamaResponse.prompt_eval_count || 0) + (ollamaResponse.eval_count || 0)
        },
        metadata: {
          total_duration: ollamaResponse.total_duration,
          load_duration: ollamaResponse.load_duration,
          prompt_eval_duration: ollamaResponse.prompt_eval_duration,
          eval_duration: ollamaResponse.eval_duration
        }
      };

      this.logger.debug('Received response from Ollama:', {
        model: chatResponse.model,
        contentLength: chatResponse.content.length,
        totalTokens: chatResponse.usage?.total_tokens
      });

      return chatResponse;
    } catch (error) {
      this.handleError(error);
      this.logger.error('Ollama chat request failed:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      this.logger.debug('Testing Ollama connection...');

      // Test basic connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(`${this.config.endpoint}/api/tags`, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const models: { models: OllamaModel[] } = await response.json();
        
        // Check if the configured model is available
        const configuredModel = this.config.model || 'llama2';
        const modelExists = models.models.some(model => model.name === configuredModel);
        
        if (!modelExists) {
          this.logger.warn(`Configured model '${configuredModel}' not found. Available models:`, 
            models.models.map(m => m.name));
        }

        this.updateStatus(true, configuredModel);
        this.logger.info('Ollama connection test successful');
        return true;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Connection timeout');
        }
        throw error;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const models: { models: OllamaModel[] } = await response.json();
      
      // Check if the configured model is available
      const configuredModel = this.config.model || 'llama2';
      const modelExists = models.models.some(model => model.name === configuredModel);
      
      if (!modelExists) {
        this.logger.warn(`Configured model '${configuredModel}' not found. Available models:`, 
          models.models.map(m => m.name));
      }

      this.updateStatus(true, configuredModel);
      this.logger.info('Ollama connection test successful');
      return true;
    } catch (error) {
      this.handleError(error);
      this.logger.error('Ollama connection test failed:', error);
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(`${this.config.endpoint}/api/tags`, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: { models: OllamaModel[] } = await response.json();
        return data.models.map(model => model.name);
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
    } catch (error) {
      this.logger.error('Failed to get available models:', error);
      return [];
    }
  }

  /**
   * ดึงข้อมูล model ที่ระบุ
   */
  async getModelInfo(modelName: string): Promise<OllamaModel | null> {
    try {
      const models = await this.getAvailableModels();
      if (!models.includes(modelName)) {
        return null;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(`${this.config.endpoint}/api/show`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: modelName }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to get model info for ${modelName}:`, error);
      return null;
    }
  }

  /**
   * ตรวจสอบว่า model พร้อมใช้งานหรือไม่
   */
  async isModelReady(modelName: string): Promise<boolean> {
    try {
      const modelInfo = await this.getModelInfo(modelName);
      return modelInfo !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * ดึงข้อมูลการใช้งานของ Ollama
   */
  async getSystemInfo(): Promise<{
    version: string;
    models: number;
    totalSize: number;
  } | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(`${this.config.endpoint}/api/tags`, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: { models: OllamaModel[] } = await response.json();
        const totalSize = data.models.reduce((sum, model) => sum + model.size, 0);

        return {
          version: 'Ollama API', // Ollama doesn't expose version in tags endpoint
          models: data.models.length,
          totalSize
        };
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: { models: OllamaModel[] } = await response.json();
      const totalSize = data.models.reduce((sum, model) => sum + model.size, 0);

      return {
        version: 'Ollama API', // Ollama doesn't expose version in tags endpoint
        models: data.models.length,
        totalSize
      };
    } catch (error) {
      this.logger.error('Failed to get system info:', error);
      return null;
    }
  }
}
