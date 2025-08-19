import { BaseProvider, AIProviderConfig, AIResponse, AIRequest } from './BaseProvider';

export interface ClaudeConfig extends AIProviderConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
}

export class ClaudeProvider extends BaseProvider {
  private config: ClaudeConfig;
  private baseUrl = 'https://api.anthropic.com/v1/messages';

  constructor(config: ClaudeConfig) {
    super('Claude', config);
    this.config = {
      model: 'claude-3-sonnet-20240229',
      maxTokens: 4096,
      temperature: 0.7,
      topP: 1,
      topK: 1,
      ...config
    };
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          top_p: this.config.topP,
          top_k: this.config.topK,
          messages: [
            {
              role: 'user',
              content: request.prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        content: data.content[0].text,
        provider: this.name,
        model: this.config.model!,
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: data.usage?.input_tokens + data.usage?.output_tokens || 0
        },
        metadata: {
          id: data.id,
          type: data.type,
          role: data.role
        }
      };
    } catch (error) {
      throw new Error(`Claude provider error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.generateResponse({
        prompt: 'Hello, this is a test message.',
        context: 'Test connection'
      });
      return !!response.content;
    } catch (error) {
      return false;
    }
  }

  getCapabilities(): string[] {
    return [
      'text-generation',
      'conversation',
      'code-generation',
      'analysis',
      'creative-writing'
    ];
  }

  getSupportedModels(): string[] {
    return [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-2.1',
      'claude-2.0',
      'claude-instant-1.2'
    ];
  }
}
