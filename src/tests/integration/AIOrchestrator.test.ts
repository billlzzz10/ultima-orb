import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AIOrchestrator } from '../../ai/AIOrchestrator';
import { Logger } from '../../services/Logger';
import { EventsBus } from '../../services/EventsBus';
import { CredentialManager } from '../../services/CredentialManager';
import { OllamaProvider } from '../../ai/providers/OllamaProvider';
import { ClaudeProvider } from '../../ai/providers/ClaudeProvider';
import { OpenAIProvider } from '../../ai/providers/OpenAIProvider';
import { GeminiProvider } from '../../ai/providers/GeminiProvider';
import { AnythingLLMProvider } from '../../ai/providers/AnythingLLMProvider';

// Mock external dependencies
vi.mock('../../services/Logger');
vi.mock('../../services/EventsBus');
vi.mock('../../services/CredentialManager');

describe('AIOrchestrator Integration Tests', () => {
  let orchestrator: AIOrchestrator;
  let mockLogger: any;
  let mockEventsBus: any;
  let mockCredentialManager: any;

  beforeEach(() => {
    // Setup mocks
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    };

    mockEventsBus = {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn()
    };

    mockCredentialManager = {
      getCredential: vi.fn(),
      setCredential: vi.fn(),
      hasCredential: vi.fn()
    };

    // Mock the service constructors
    (Logger as any).mockImplementation(() => mockLogger);
    (EventsBus as any).mockImplementation(() => mockEventsBus);
    (CredentialManager as any).mockImplementation(() => mockCredentialManager);

    orchestrator = new AIOrchestrator();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Provider Registration', () => {
    it('should register all AI providers successfully', () => {
      const providers = orchestrator.getAvailableProviders();
      
      expect(providers).toContain('ollama');
      expect(providers).toContain('claude');
      expect(providers).toContain('openai');
      expect(providers).toContain('gemini');
      expect(providers).toContain('anythingllm');
      expect(providers).toHaveLength(5);
    });

    it('should return provider instances correctly', () => {
      const ollamaProvider = orchestrator.getProvider('ollama');
      const claudeProvider = orchestrator.getProvider('claude');
      const openaiProvider = orchestrator.getProvider('openai');
      const geminiProvider = orchestrator.getProvider('gemini');
      const anythingllmProvider = orchestrator.getProvider('anythingllm');

      expect(ollamaProvider).toBeInstanceOf(OllamaProvider);
      expect(claudeProvider).toBeInstanceOf(ClaudeProvider);
      expect(openaiProvider).toBeInstanceOf(OpenAIProvider);
      expect(geminiProvider).toBeInstanceOf(GeminiProvider);
      expect(anythingllmProvider).toBeInstanceOf(AnythingLLMProvider);
    });

    it('should return null for non-existent provider', () => {
      const provider = orchestrator.getProvider('nonexistent');
      expect(provider).toBeNull();
    });
  });

  describe('Provider Configuration', () => {
    it('should configure provider settings correctly', () => {
      const config = {
        apiKey: 'test-key',
        model: 'test-model',
        temperature: 0.8
      };

      orchestrator.configureProvider('claude', config);
      const provider = orchestrator.getProvider('claude') as ClaudeProvider;
      
      expect(provider).toBeDefined();
      expect(mockCredentialManager.setCredential).toHaveBeenCalledWith('claude', config);
    });

    it('should handle configuration for non-existent provider', () => {
      const config = { apiKey: 'test' };
      
      expect(() => {
        orchestrator.configureProvider('nonexistent', config);
      }).not.toThrow();
      
      expect(mockLogger.warn).toHaveBeenCalledWith('Provider nonexistent not found');
    });
  });

  describe('Smart Provider Selection', () => {
    beforeEach(() => {
      // Mock provider capabilities
      const mockProviders = {
        ollama: { getCapabilities: () => ['text-generation', 'local'] },
        claude: { getCapabilities: () => ['text-generation', 'analysis'] },
        openai: { getCapabilities: () => ['text-generation', 'code-generation'] },
        gemini: { getCapabilities: () => ['text-generation', 'multimodal'] },
        anythingllm: { getCapabilities: () => ['text-generation', 'knowledge-base'] }
      };

      vi.spyOn(orchestrator, 'getProvider').mockImplementation((name: string) => 
        mockProviders[name as keyof typeof mockProviders] as any
      );
    });

    it('should select provider based on capabilities', () => {
      const selectedProvider = orchestrator.selectProvider(['analysis']);
      expect(selectedProvider).toBe('claude');
    });

    it('should select provider based on model preference', () => {
      const selectedProvider = orchestrator.selectProvider([], 'gpt-4');
      expect(selectedProvider).toBe('openai');
    });

    it('should fallback to default provider when no match', () => {
      const selectedProvider = orchestrator.selectProvider(['nonexistent-capability']);
      expect(selectedProvider).toBe('ollama'); // Default fallback
    });

    it('should prioritize local providers when requested', () => {
      const selectedProvider = orchestrator.selectProvider(['local']);
      expect(selectedProvider).toBe('ollama');
    });
  });

  describe('Load Balancing', () => {
    it('should distribute requests across available providers', () => {
      const providers = ['ollama', 'claude', 'openai'];
      const selections = [];

      for (let i = 0; i < 9; i++) {
        selections.push(orchestrator.selectProvider([]));
      }

      const ollamaCount = selections.filter(p => p === 'ollama').length;
      const claudeCount = selections.filter(p => p === 'claude').length;
      const openaiCount = selections.filter(p => p === 'openai').length;

      // Should be roughly distributed
      expect(ollamaCount).toBeGreaterThan(0);
      expect(claudeCount).toBeGreaterThan(0);
      expect(openaiCount).toBeGreaterThan(0);
    });

    it('should avoid failed providers in load balancing', () => {
      // Mock a failed provider
      orchestrator.markProviderFailed('claude');
      
      const selections = [];
      for (let i = 0; i < 10; i++) {
        selections.push(orchestrator.selectProvider([]));
      }

      const claudeCount = selections.filter(p => p === 'claude').length;
      expect(claudeCount).toBe(0); // Should not select failed provider
    });
  });

  describe('Fallback Mechanism', () => {
    it('should fallback to next available provider on failure', async () => {
      // Mock provider failures
      const mockProvider = {
        generateResponse: vi.fn().mockRejectedValue(new Error('Provider failed')),
        testConnection: vi.fn().mockResolvedValue(false)
      };

      vi.spyOn(orchestrator, 'getProvider').mockReturnValue(mockProvider as any);

      const result = await orchestrator.generateResponseWithFallback('test prompt');
      
      expect(result).toBeDefined();
      expect(mockLogger.warn).toHaveBeenCalledWith('Provider ollama failed, trying fallback');
    });

    it('should return error when all providers fail', async () => {
      // Mock all providers to fail
      const mockProvider = {
        generateResponse: vi.fn().mockRejectedValue(new Error('All providers failed')),
        testConnection: vi.fn().mockResolvedValue(false)
      };

      vi.spyOn(orchestrator, 'getProvider').mockReturnValue(mockProvider as any);

      const result = await orchestrator.generateResponseWithFallback('test prompt');
      
      expect(result.error).toBeDefined();
      expect(result.error).toContain('All providers failed');
    });
  });

  describe('Provider Health Monitoring', () => {
    it('should monitor provider health status', async () => {
      const healthStatus = await orchestrator.getProviderHealth();
      
      expect(healthStatus).toBeDefined();
      expect(typeof healthStatus).toBe('object');
      
      // Should have status for each provider
      expect(healthStatus.ollama).toBeDefined();
      expect(healthStatus.claude).toBeDefined();
      expect(healthStatus.openai).toBeDefined();
      expect(healthStatus.gemini).toBeDefined();
      expect(healthStatus.anythingllm).toBeDefined();
    });

    it('should update provider status on failure', () => {
      orchestrator.markProviderFailed('claude');
      
      const status = orchestrator.getProviderStatus('claude');
      expect(status.failed).toBe(true);
      expect(status.lastFailure).toBeDefined();
    });

    it('should reset provider status after recovery period', () => {
      orchestrator.markProviderFailed('claude');
      
      // Simulate time passing
      const originalDate = Date.now;
      Date.now = vi.fn(() => originalDate() + 60000); // 1 minute later
      
      const status = orchestrator.getProviderStatus('claude');
      expect(status.failed).toBe(false);
      
      Date.now = originalDate; // Restore
    });
  });

  describe('Performance Optimization', () => {
    it('should cache provider responses for similar requests', async () => {
      const prompt = 'test prompt';
      
      // First request
      await orchestrator.generateResponseWithFallback(prompt);
      
      // Second request with same prompt
      await orchestrator.generateResponseWithFallback(prompt);
      
      // Should use cache for second request
      expect(mockLogger.debug).toHaveBeenCalledWith('Using cached response for prompt');
    });

    it('should handle concurrent requests efficiently', async () => {
      const promises = [];
      const prompt = 'concurrent test';
      
      // Create multiple concurrent requests
      for (let i = 0; i < 5; i++) {
        promises.push(orchestrator.generateResponseWithFallback(prompt));
      }
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network timeout');
      const mockProvider = {
        generateResponse: vi.fn().mockRejectedValue(networkError),
        testConnection: vi.fn().mockResolvedValue(false)
      };

      vi.spyOn(orchestrator, 'getProvider').mockReturnValue(mockProvider as any);

      const result = await orchestrator.generateResponseWithFallback('test');
      
      expect(result.error).toBeDefined();
      expect(mockLogger.error).toHaveBeenCalledWith('Network error:', networkError);
    });

    it('should handle rate limiting errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimitError';
      
      const mockProvider = {
        generateResponse: vi.fn().mockRejectedValue(rateLimitError),
        testConnection: vi.fn().mockResolvedValue(true)
      };

      vi.spyOn(orchestrator, 'getProvider').mockReturnValue(mockProvider as any);

      const result = await orchestrator.generateResponseWithFallback('test');
      
      expect(result.error).toBeDefined();
      expect(mockLogger.warn).toHaveBeenCalledWith('Rate limit hit for provider');
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('Invalid API key');
      authError.name = 'AuthenticationError';
      
      const mockProvider = {
        generateResponse: vi.fn().mockRejectedValue(authError),
        testConnection: vi.fn().mockResolvedValue(false)
      };

      vi.spyOn(orchestrator, 'getProvider').mockReturnValue(mockProvider as any);

      const result = await orchestrator.generateResponseWithFallback('test');
      
      expect(result.error).toBeDefined();
      expect(mockLogger.error).toHaveBeenCalledWith('Authentication failed for provider');
    });
  });

  describe('Memory Management', () => {
    it('should clear old cache entries', () => {
      // Fill cache with old entries
      const oldDate = Date.now() - 3600000; // 1 hour ago
      
      // Simulate old cache entries
      const cache = new Map();
      cache.set('old-key', {
        response: 'old response',
        timestamp: oldDate
      });
      
      // Mock cache and trigger cleanup
      (orchestrator as any).responseCache = cache;
      orchestrator.cleanupCache();
      
      expect(cache.size).toBe(0);
    });

    it('should limit cache size', () => {
      const cache = new Map();
      
      // Add more entries than max cache size
      for (let i = 0; i < 1000; i++) {
        cache.set(`key-${i}`, {
          response: `response-${i}`,
          timestamp: Date.now()
        });
      }
      
      (orchestrator as any).responseCache = cache;
      orchestrator.cleanupCache();
      
      expect(cache.size).toBeLessThanOrEqual(100); // Max cache size
    });
  });
});
