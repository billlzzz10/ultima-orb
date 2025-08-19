import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseProvider, ChatMessage, ChatResponse, ProviderConfig, ProviderStatus } from '../../../src/ai/providers/BaseProvider';

// Mock provider สำหรับทดสอบ
class MockProvider extends BaseProvider {
  constructor(config: ProviderConfig) {
    super(config);
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {
    return {
      content: `Mock response to: ${messages[messages.length - 1]?.content || 'empty message'}`,
      model: this.config.model || 'mock-model',
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30
      }
    };
  }

  async testConnection(): Promise<boolean> {
    return true;
  }

  async getAvailableModels(): Promise<string[]> {
    return ['mock-model-1', 'mock-model-2'];
  }
}

describe('BaseProvider', () => {
  let provider: MockProvider;
  let config: ProviderConfig;

  beforeEach(() => {
    config = {
      name: 'TestProvider',
      endpoint: 'http://localhost:8080',
      model: 'test-model',
      temperature: 0.8,
      maxTokens: 1000,
      timeout: 15000
    };
    provider = new MockProvider(config);
  });

  describe('Constructor', () => {
    it('should initialize with default values', () => {
      const defaultConfig: ProviderConfig = {
        name: 'DefaultProvider'
      };
      const defaultProvider = new MockProvider(defaultConfig);

      expect(defaultProvider.getConfig()).toEqual({
        name: 'DefaultProvider',
        temperature: 0.7,
        maxTokens: 2048,
        timeout: 30000
      });
    });

    it('should override defaults with provided config', () => {
      expect(provider.getConfig()).toEqual(config);
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      const newConfig = { temperature: 0.5, model: 'new-model' };
      provider.updateConfig(newConfig);

      const updatedConfig = provider.getConfig();
      expect(updatedConfig.temperature).toBe(0.5);
      expect(updatedConfig.model).toBe('new-model');
      expect(updatedConfig.maxTokens).toBe(1000); // unchanged
    });

    it('should get current configuration', () => {
      const currentConfig = provider.getConfig();
      expect(currentConfig).toEqual(config);
    });
  });

  describe('Status Management', () => {
    it('should have initial disconnected status', () => {
      const status = provider.getStatus();
      expect(status.connected).toBe(false);
      expect(status.error).toBeUndefined();
    });

    it('should update status correctly', () => {
      provider['updateStatus'](true, 'test-model');
      const status = provider.getStatus();
      expect(status.connected).toBe(true);
      expect(status.model).toBe('test-model');
      expect(status.lastChecked).toBeInstanceOf(Date);
    });

    it('should handle errors correctly', () => {
      const error = new Error('Test error');
      provider['handleError'](error);
      const status = provider.getStatus();
      expect(status.connected).toBe(false);
      expect(status.error).toBe('Test error');
    });
  });

  describe('Utility Methods', () => {
    it('should get provider name', () => {
      expect(provider.getName()).toBe('TestProvider');
    });

    it('should check if provider is ready', () => {
      expect(provider.isReady()).toBe(false);
      
      provider['updateStatus'](true);
      expect(provider.isReady()).toBe(true);
    });

    it('should create system message', () => {
      const message = provider['createSystemMessage']('Test system prompt');
      expect(message.role).toBe('system');
      expect(message.content).toBe('Test system prompt');
      expect(message.timestamp).toBeDefined();
    });

    it('should create user message', () => {
      const message = provider['createUserMessage']('Test user message');
      expect(message.role).toBe('user');
      expect(message.content).toBe('Test user message');
      expect(message.timestamp).toBeDefined();
    });

    it('should create assistant message', () => {
      const message = provider['createAssistantMessage']('Test assistant message');
      expect(message.role).toBe('assistant');
      expect(message.content).toBe('Test assistant message');
      expect(message.timestamp).toBeDefined();
    });
  });

  describe('Abstract Methods', () => {
    it('should implement chat method', async () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' }
      ];
      const response = await provider.chat(messages);
      
      expect(response.content).toContain('Hello');
      expect(response.model).toBe('test-model');
      expect(response.usage).toBeDefined();
    });

    it('should implement testConnection method', async () => {
      const isConnected = await provider.testConnection();
      expect(isConnected).toBe(true);
    });

    it('should implement getAvailableModels method', async () => {
      const models = await provider.getAvailableModels();
      expect(models).toEqual(['mock-model-1', 'mock-model-2']);
    });
  });
});
