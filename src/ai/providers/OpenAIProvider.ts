import { BaseProvider, AIProviderConfig, AIResponse, AIRequest } from './BaseProvider';

export interface OpenAIConfig extends AIProviderConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  organization?: string;
}

export class OpenAIProvider extends BaseProvider {
  private config: OpenAIConfig;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(config: OpenAIConfig) {
    super('OpenAI', config);
    this.config = {
      model: 'gpt-4',
      maxTokens: 4096,
      temperature: 0.7,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      ...config
    };
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      };

      if (this.config.organization) {
        headers['OpenAI-Organization'] = this.config.organization;
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: request.prompt
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          top_p: this.config.topP,
          frequency_penalty: this.config.frequencyPenalty,
          presence_penalty: this.config.presencePenalty,
          stream: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || ''}`);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0].message.content,
        provider: this.name,
        model: this.config.model!,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        },
        metadata: {
          id: data.id,
          finishReason: data.choices[0].finish_reason,
          index: data.choices[0].index
        }
      };
    } catch (error) {
      throw new Error(`OpenAI provider error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      'creative-writing',
      'function-calling',
      'vision',
      'fine-tuning'
    ];
  }

  getSupportedModels(): string[] {
    return [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-4-turbo-preview',
      'gpt-4-vision-preview',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'text-davinci-003',
      'text-curie-001',
      'text-babbage-001',
      'text-ada-001'
    ];
  }
}
