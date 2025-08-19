import { BaseProvider, AIProviderConfig, AIResponse, AIRequest } from './BaseProvider';

export interface GeminiConfig extends AIProviderConfig {
  apiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  candidateCount?: number;
}

export class GeminiProvider extends BaseProvider {
  private config: GeminiConfig;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(config: GeminiConfig) {
    super('Gemini', config);
    this.config = {
      model: 'gemini-pro',
      maxTokens: 4096,
      temperature: 0.7,
      topP: 1,
      topK: 1,
      candidateCount: 1,
      ...config
    };
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    try {
      const modelUrl = `${this.baseUrl}/${this.config.model}:generateContent?key=${this.config.apiKey}`;
      
      const response = await fetch(modelUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: request.prompt
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: this.config.maxTokens,
            temperature: this.config.temperature,
            topP: this.config.topP,
            topK: this.config.topK,
            candidateCount: this.config.candidateCount
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorData.error?.message || ''}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('No response generated from Gemini API');
      }

      const candidate = data.candidates[0];
      const content = candidate.content?.parts?.[0]?.text || '';

      return {
        content,
        provider: this.name,
        model: this.config.model!,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0
        },
        metadata: {
          finishReason: candidate.finishReason,
          safetyRatings: candidate.safetyRatings,
          index: candidate.index
        }
      };
    } catch (error) {
      throw new Error(`Gemini provider error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      'multimodal',
      'reasoning'
    ];
  }

  getSupportedModels(): string[] {
    return [
      'gemini-pro',
      'gemini-pro-vision',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.0-pro',
      'gemini-1.0-pro-vision'
    ];
  }
}
