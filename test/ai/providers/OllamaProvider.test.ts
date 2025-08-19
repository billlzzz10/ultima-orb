import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OllamaProvider } from '../../../src/ai/providers/OllamaProvider';
import { ProviderConfig, ChatMessage } from '../../../src/ai/providers/BaseProvider';
import { Logger } from '../../../src/services/Logger';

// Mock fetch globally
global.fetch = vi.fn();

describe('OllamaProvider', () => {
  let provider: OllamaProvider;
  let logger: Logger;
  let config: ProviderConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    
    logger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      log: vi.fn()
    } as unknown as Logger;

    config = {
      name: 'Ollama',
      endpoint: 'http://localhost:11434',
      model: 'llama2',
      temperature: 0.7,
      maxTokens: 2048,
      timeout: 30000
    };

    provider = new OllamaProvider(config, logger);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(provider.getName()).toBe('Ollama');
      expect(provider.getConfig().endpoint).toBe('http://localhost:11434');
      expect(provider.getConfig().model).toBe('llama2');
    });

    it('should have default values when not provided', () => {
      const minimalConfig: ProviderConfig = {
        name: 'Ollama'
      };
      const minimalProvider = new OllamaProvider(minimalConfig, logger);
      
      expect(minimalProvider.getConfig().endpoint).toBe('http://localhost:11434');
      expect(minimalProvider.getConfig().model).toBe('llama2');
    });
  });

  describe('testConnection', () => {
    it('should return true when connection is successful', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          models: [
            { name: 'llama2', modified_at: '2024-01-01', size: 1000000 }
          ]
        })
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const result = await provider.testConnection();

      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/tags',
        expect.objectContaining({
          method: 'GET',
          signal: expect.any(AbortSignal)
        })
      );
      expect(logger.info).toHaveBeenCalledWith('Ollama connection test successful');
    });

    it('should return false when HTTP request fails', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const result = await provider.testConnection();

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        'Ollama connection test failed:',
        expect.any(Error)
      );
    });

    it('should return false when network error occurs', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));

      const result = await provider.testConnection();

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        'Ollama connection test failed:',
        expect.any(Error)
      );
    });

    it('should warn when configured model is not available', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          models: [
            { name: 'other-model', modified_at: '2024-01-01', size: 1000000 }
          ]
        })
      };
      (fetch as any).mockResolvedValue(mockResponse);

      await provider.testConnection();

      expect(logger.warn).toHaveBeenCalledWith(
        "Configured model 'llama2' not found. Available models:",
        ['other-model']
      );
    });
  });

  describe('getAvailableModels', () => {
    it('should return list of available models', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          models: [
            { name: 'llama2', modified_at: '2024-01-01', size: 1000000 },
            { name: 'mistral', modified_at: '2024-01-01', size: 2000000 }
          ]
        })
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const models = await provider.getAvailableModels();

      expect(models).toEqual(['llama2', 'mistral']);
    });

    it('should return empty array when request fails', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));

      const models = await provider.getAvailableModels();

      expect(models).toEqual([]);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to get available models:',
        expect.any(Error)
      );
    });
  });

  describe('chat', () => {
    beforeEach(() => {
      // Set provider as connected
      provider['updateStatus'](true, 'llama2');
    });

    it('should send chat request successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          model: 'llama2',
          created_at: '2024-01-01T00:00:00Z',
          message: {
            role: 'assistant',
            content: 'Hello! How can I help you today?'
          },
          done: true,
          total_duration: 1000,
          prompt_eval_count: 50,
          eval_count: 25
        })
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' }
      ];

      const response = await provider.chat(messages);

      expect(response.content).toBe('Hello! How can I help you today?');
      expect(response.model).toBe('llama2');
      expect(response.usage).toEqual({
        prompt_tokens: 50,
        completion_tokens: 25,
        total_tokens: 75
      });
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/chat',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"model":"llama2"')
        })
      );
    });

    it('should throw error when provider is not connected', async () => {
      provider['updateStatus'](false);

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' }
      ];

      await expect(provider.chat(messages)).rejects.toThrow(
        'Ollama provider is not connected. Please test connection first.'
      );
    });

    it('should handle HTTP error responses', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        text: vi.fn().mockResolvedValue('Internal Server Error')
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' }
      ];

      await expect(provider.chat(messages)).rejects.toThrow(
        'Ollama API error: 500 - Internal Server Error'
      );
    });

    it('should handle network errors', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' }
      ];

      await expect(provider.chat(messages)).rejects.toThrow('Network error');
    });

    it('should include correct request parameters', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          model: 'llama2',
          message: { role: 'assistant', content: 'Response' },
          done: true
        })
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const messages: ChatMessage[] = [
        { role: 'system', content: 'You are helpful' },
        { role: 'user', content: 'Hello' }
      ];

      await provider.chat(messages);

      const callArgs = (fetch as any).mock.calls[0];
      const requestBody = JSON.parse(callArgs[1].body);

      expect(requestBody.model).toBe('llama2');
      expect(requestBody.messages).toHaveLength(2);
      expect(requestBody.stream).toBe(false);
      expect(requestBody.options.temperature).toBe(0.7);
      expect(requestBody.options.num_predict).toBe(2048);
    });
  });

  describe('getModelInfo', () => {
    it('should return model info when model exists', async () => {
      // Mock getAvailableModels to return the model
      vi.spyOn(provider, 'getAvailableModels').mockResolvedValue(['llama2']);
      
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          name: 'llama2',
          modified_at: '2024-01-01',
          size: 1000000
        })
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const modelInfo = await provider.getModelInfo('llama2');

      expect(modelInfo).toEqual({
        name: 'llama2',
        modified_at: '2024-01-01',
        size: 1000000
      });
    });

    it('should return null when model does not exist', async () => {
      // Mock getAvailableModels to not include the model
      vi.spyOn(provider, 'getAvailableModels').mockResolvedValue(['other-model']);

      const modelInfo = await provider.getModelInfo('nonexistent-model');

      expect(modelInfo).toBeNull();
    });
  });

  describe('isModelReady', () => {
    it('should return true when model is ready', async () => {
      vi.spyOn(provider, 'getModelInfo').mockResolvedValue({
        name: 'llama2',
        modified_at: '2024-01-01',
        size: 1000000
      });

      const isReady = await provider.isModelReady('llama2');

      expect(isReady).toBe(true);
    });

    it('should return false when model is not ready', async () => {
      vi.spyOn(provider, 'getModelInfo').mockResolvedValue(null);

      const isReady = await provider.isModelReady('nonexistent-model');

      expect(isReady).toBe(false);
    });
  });

  describe('getSystemInfo', () => {
    it('should return system information', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          models: [
            { name: 'llama2', size: 1000000 },
            { name: 'mistral', size: 2000000 }
          ]
        })
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const systemInfo = await provider.getSystemInfo();

      expect(systemInfo).toEqual({
        version: 'Ollama API',
        models: 2,
        totalSize: 3000000
      });
    });

    it('should return null when request fails', async () => {
      (fetch as any).mockRejectedValue(new Error('Network error'));

      const systemInfo = await provider.getSystemInfo();

      expect(systemInfo).toBeNull();
    });
  });
});
