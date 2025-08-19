import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ChatView } from '../../ui/ChatView';
import { AIOrchestrator } from '../../ai/AIOrchestrator';
import { Logger } from '../../services/Logger';

// Mock dependencies
vi.mock('../../ai/AIOrchestrator');
vi.mock('../../services/Logger');

describe('ChatView Component Tests', () => {
  let chatView: ChatView;
  let mockContainer: HTMLElement;
  let mockAIOrchestrator: any;
  let mockLogger: any;

  beforeEach(() => {
    // Create mock container
    mockContainer = document.createElement('div');
    document.body.appendChild(mockContainer);

    // Setup mocks
    mockAIOrchestrator = {
      generateResponse: vi.fn(),
      getAvailableProviders: vi.fn().mockReturnValue(['ollama', 'claude', 'openai']),
      getProvider: vi.fn()
    };

    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    };

    // Mock constructors
    (AIOrchestrator as any).mockImplementation(() => mockAIOrchestrator);
    (Logger as any).mockImplementation(() => mockLogger);

    chatView = new ChatView(mockContainer, mockAIOrchestrator, mockLogger);
  });

  afterEach(() => {
    document.body.removeChild(mockContainer);
    vi.clearAllMocks();
  });

  describe('UI Initialization', () => {
    it('should initialize chat interface correctly', () => {
      const messagesContainer = mockContainer.querySelector('.ultima-orb-messages-container');
      const inputContainer = mockContainer.querySelector('.ultima-orb-input-container');
      const providerSelect = mockContainer.querySelector('.ultima-orb-provider-select');

      expect(messagesContainer).toBeDefined();
      expect(inputContainer).toBeDefined();
      expect(providerSelect).toBeDefined();
    });

    it('should set default provider to ollama', () => {
      const providerSelect = mockContainer.querySelector('.ultima-orb-provider-select') as HTMLSelectElement;
      expect(providerSelect.value).toBe('ollama');
    });

    it('should populate provider options', () => {
      const providerSelect = mockContainer.querySelector('.ultima-orb-provider-select') as HTMLSelectElement;
      const options = Array.from(providerSelect.options).map(option => option.value);
      
      expect(options).toContain('ollama');
      expect(options).toContain('claude');
      expect(options).toContain('openai');
    });
  });

  describe('Message Management', () => {
    it('should add user message correctly', () => {
      const testMessage = 'Hello, AI!';
      chatView.addUserMessage(testMessage);

      const messages = chatView.getMessages();
      const userMessage = messages.find(msg => msg.role === 'user');

      expect(userMessage).toBeDefined();
      expect(userMessage?.content).toBe(testMessage);
      expect(userMessage?.timestamp).toBeDefined();
    });

    it('should add assistant message correctly', () => {
      const testResponse = 'Hello! How can I help you?';
      chatView.addAssistantMessage(testResponse);

      const messages = chatView.getMessages();
      const assistantMessage = messages.find(msg => msg.role === 'assistant');

      expect(assistantMessage).toBeDefined();
      expect(assistantMessage?.content).toBe(testResponse);
      expect(assistantMessage?.timestamp).toBeDefined();
    });

    it('should add system message correctly', () => {
      const systemMessage = 'System notification';
      chatView.addSystemMessage(systemMessage);

      const messages = chatView.getMessages();
      const sysMessage = messages.find(msg => msg.role === 'system');

      expect(sysMessage).toBeDefined();
      expect(sysMessage?.content).toBe(systemMessage);
    });

    it('should maintain message order', () => {
      chatView.addUserMessage('First message');
      chatView.addAssistantMessage('First response');
      chatView.addUserMessage('Second message');

      const messages = chatView.getMessages();
      
      expect(messages[0].role).toBe('user');
      expect(messages[0].content).toBe('First message');
      expect(messages[1].role).toBe('assistant');
      expect(messages[1].content).toBe('First response');
      expect(messages[2].role).toBe('user');
      expect(messages[2].content).toBe('Second message');
    });
  });

  describe('Message Rendering', () => {
    it('should render user messages with correct styling', () => {
      chatView.addUserMessage('Test user message');
      
      const userMessageEl = mockContainer.querySelector('.ultima-orb-message-user');
      expect(userMessageEl).toBeDefined();
      expect(userMessageEl?.textContent).toContain('Test user message');
    });

    it('should render assistant messages with correct styling', () => {
      chatView.addAssistantMessage('Test assistant message');
      
      const assistantMessageEl = mockContainer.querySelector('.ultima-orb-message-assistant');
      expect(assistantMessageEl).toBeDefined();
      expect(assistantMessageEl?.textContent).toContain('Test assistant message');
    });

    it('should render system messages with correct styling', () => {
      chatView.addSystemMessage('Test system message');
      
      const systemMessageEl = mockContainer.querySelector('.ultima-orb-message-system');
      expect(systemMessageEl).toBeDefined();
      expect(systemMessageEl?.textContent).toContain('Test system message');
    });

    it('should format markdown content correctly', () => {
      const markdownContent = '**Bold text** and *italic text*';
      chatView.addAssistantMessage(markdownContent);
      
      const messageEl = mockContainer.querySelector('.ultima-orb-message-assistant');
      expect(messageEl?.innerHTML).toContain('<strong>Bold text</strong>');
      expect(messageEl?.innerHTML).toContain('<em>italic text</em>');
    });

    it('should handle code blocks correctly', () => {
      const codeContent = '```javascript\nconsole.log("Hello");\n```';
      chatView.addAssistantMessage(codeContent);
      
      const codeBlock = mockContainer.querySelector('.ultima-orb-code-block');
      expect(codeBlock).toBeDefined();
      expect(codeBlock?.textContent).toContain('console.log("Hello");');
    });
  });

  describe('Input Handling', () => {
    it('should handle input changes correctly', () => {
      const inputField = mockContainer.querySelector('.ultima-orb-input-field') as HTMLTextAreaElement;
      const sendButton = mockContainer.querySelector('.ultima-orb-send-button') as HTMLButtonElement;
      
      // Initially send button should be disabled
      expect(sendButton.disabled).toBe(true);
      
      // Type in input field
      inputField.value = 'Test message';
      inputField.dispatchEvent(new Event('input'));
      
      // Send button should be enabled
      expect(sendButton.disabled).toBe(false);
    });

    it('should handle empty input correctly', () => {
      const inputField = mockContainer.querySelector('.ultima-orb-input-field') as HTMLTextAreaElement;
      const sendButton = mockContainer.querySelector('.ultima-orb-send-button') as HTMLButtonElement;
      
      // Type then clear input
      inputField.value = 'Test message';
      inputField.dispatchEvent(new Event('input'));
      expect(sendButton.disabled).toBe(false);
      
      inputField.value = '';
      inputField.dispatchEvent(new Event('input'));
      expect(sendButton.disabled).toBe(true);
    });

    it('should handle Enter key to send message', () => {
      const inputField = mockContainer.querySelector('.ultima-orb-input-field') as HTMLTextAreaElement;
      
      inputField.value = 'Test message';
      inputField.dispatchEvent(new Event('input'));
      
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false });
      inputField.dispatchEvent(enterEvent);
      
      expect(mockAIOrchestrator.generateResponse).toHaveBeenCalled();
    });

    it('should not send on Shift+Enter', () => {
      const inputField = mockContainer.querySelector('.ultima-orb-input-field') as HTMLTextAreaElement;
      
      inputField.value = 'Test message';
      inputField.dispatchEvent(new Event('input'));
      
      const shiftEnterEvent = new KeyboardEvent('keydown', { key: 'Enter', shiftKey: true });
      inputField.dispatchEvent(shiftEnterEvent);
      
      expect(mockAIOrchestrator.generateResponse).not.toHaveBeenCalled();
    });
  });

  describe('Message Sending', () => {
    it('should send message when send button is clicked', async () => {
      const inputField = mockContainer.querySelector('.ultima-orb-input-field') as HTMLTextAreaElement;
      const sendButton = mockContainer.querySelector('.ultima-orb-send-button') as HTMLButtonElement;
      
      inputField.value = 'Test message';
      inputField.dispatchEvent(new Event('input'));
      
      mockAIOrchestrator.generateResponse.mockResolvedValue({
        content: 'Test response',
        metadata: {}
      });
      
      sendButton.click();
      
      expect(mockAIOrchestrator.generateResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: 'Test message',
          provider: 'ollama'
        })
      );
    });

    it('should show typing indicator while waiting for response', async () => {
      const inputField = mockContainer.querySelector('.ultima-orb-input-field') as HTMLTextAreaElement;
      const sendButton = mockContainer.querySelector('.ultima-orb-send-button') as HTMLButtonElement;
      
      inputField.value = 'Test message';
      inputField.dispatchEvent(new Event('input'));
      
      // Mock delayed response
      mockAIOrchestrator.generateResponse.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ content: 'Response', metadata: {} }), 100))
      );
      
      sendButton.click();
      
      // Should show typing indicator
      const typingIndicator = mockContainer.querySelector('.ultima-orb-typing-indicator');
      expect(typingIndicator).toBeDefined();
    });

    it('should handle AI response errors gracefully', async () => {
      const inputField = mockContainer.querySelector('.ultima-orb-input-field') as HTMLTextAreaElement;
      const sendButton = mockContainer.querySelector('.ultima-orb-send-button') as HTMLButtonElement;
      
      inputField.value = 'Test message';
      inputField.dispatchEvent(new Event('input'));
      
      mockAIOrchestrator.generateResponse.mockRejectedValue(new Error('AI Error'));
      
      sendButton.click();
      
      // Wait for error handling
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const errorMessage = mockContainer.querySelector('.ultima-orb-message-error');
      expect(errorMessage).toBeDefined();
      expect(errorMessage?.textContent).toContain('Error');
    });
  });

  describe('Provider Switching', () => {
    it('should change provider when dropdown is changed', () => {
      const providerSelect = mockContainer.querySelector('.ultima-orb-provider-select') as HTMLSelectElement;
      
      providerSelect.value = 'claude';
      providerSelect.dispatchEvent(new Event('change'));
      
      expect(chatView.getCurrentProvider()).toBe('claude');
    });

    it('should update provider programmatically', () => {
      chatView.setProvider('openai');
      expect(chatView.getCurrentProvider()).toBe('openai');
      
      const providerSelect = mockContainer.querySelector('.ultima-orb-provider-select') as HTMLSelectElement;
      expect(providerSelect.value).toBe('openai');
    });
  });

  describe('Chat History', () => {
    it('should clear chat history correctly', () => {
      chatView.addUserMessage('Message 1');
      chatView.addAssistantMessage('Response 1');
      chatView.addUserMessage('Message 2');
      
      expect(chatView.getMessages()).toHaveLength(3);
      
      const clearButton = mockContainer.querySelector('.ultima-orb-clear-button') as HTMLButtonElement;
      clearButton.click();
      
      expect(chatView.getMessages()).toHaveLength(0);
    });

    it('should maintain conversation context', () => {
      chatView.addUserMessage('What is AI?');
      chatView.addAssistantMessage('AI is artificial intelligence.');
      chatView.addUserMessage('Tell me more about it.');
      
      const context = chatView.getConversationContext();
      expect(context).toContain('What is AI?');
      expect(context).toContain('AI is artificial intelligence.');
      expect(context).toContain('Tell me more about it.');
    });
  });

  describe('UI Responsiveness', () => {
    it('should handle window resize correctly', () => {
      const messagesContainer = mockContainer.querySelector('.ultima-orb-messages-container') as HTMLElement;
      
      // Simulate window resize
      window.dispatchEvent(new Event('resize'));
      
      // Should trigger scroll to bottom
      expect(messagesContainer.scrollTop).toBe(messagesContainer.scrollHeight);
    });

    it('should scroll to bottom when new message is added', () => {
      const messagesContainer = mockContainer.querySelector('.ultima-orb-messages-container') as HTMLElement;
      const originalScrollTop = messagesContainer.scrollTop;
      
      chatView.addUserMessage('New message');
      
      expect(messagesContainer.scrollTop).toBeGreaterThan(originalScrollTop);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const inputField = mockContainer.querySelector('.ultima-orb-input-field') as HTMLTextAreaElement;
      const sendButton = mockContainer.querySelector('.ultima-orb-send-button') as HTMLButtonElement;
      
      inputField.value = 'Test message';
      inputField.dispatchEvent(new Event('input'));
      
      mockAIOrchestrator.generateResponse.mockRejectedValue(new Error('Network error'));
      
      sendButton.click();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const errorMessage = mockContainer.querySelector('.ultima-orb-message-error');
      expect(errorMessage).toBeDefined();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle invalid provider selection', () => {
      expect(() => {
        chatView.setProvider('invalid-provider');
      }).not.toThrow();
      
      expect(mockLogger.warn).toHaveBeenCalledWith('Invalid provider: invalid-provider');
    });
  });

  describe('Memory Management', () => {
    it('should clean up event listeners on destroy', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      
      chatView.destroy();
      
      expect(removeEventListenerSpy).toHaveBeenCalled();
    });

    it('should clear container on destroy', () => {
      chatView.addUserMessage('Test message');
      expect(mockContainer.children.length).toBeGreaterThan(0);
      
      chatView.destroy();
      expect(mockContainer.children.length).toBe(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const inputField = mockContainer.querySelector('.ultima-orb-input-field') as HTMLTextAreaElement;
      const sendButton = mockContainer.querySelector('.ultima-orb-send-button') as HTMLButtonElement;
      const providerSelect = mockContainer.querySelector('.ultima-orb-provider-select') as HTMLSelectElement;
      
      expect(inputField.getAttribute('aria-label')).toBeDefined();
      expect(sendButton.getAttribute('aria-label')).toBeDefined();
      expect(providerSelect.getAttribute('aria-label')).toBeDefined();
    });

    it('should support keyboard navigation', () => {
      const inputField = mockContainer.querySelector('.ultima-orb-input-field') as HTMLTextAreaElement;
      const sendButton = mockContainer.querySelector('.ultima-orb-send-button') as HTMLButtonElement;
      
      inputField.focus();
      expect(document.activeElement).toBe(inputField);
      
      sendButton.focus();
      expect(document.activeElement).toBe(sendButton);
    });
  });
});
