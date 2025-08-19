import { App, Notice } from 'obsidian';
import { UltimaOrbPlugin } from '../../UltimaOrbPlugin';

/**
 * 💬 Chat View
 * หน้าสนทนากับ AI
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  provider?: string;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class ChatView {
  private plugin: UltimaOrbPlugin;
  private messages: ChatMessage[] = [];
  private messagesContainer!: HTMLElement;
  private inputContainer!: HTMLElement;
  private inputElement!: HTMLTextAreaElement;
  private sendButton!: HTMLButtonElement;
  private providerSelect!: HTMLSelectElement;
  private clearButton!: HTMLButtonElement;
  private isLoading: boolean = false;
  private containerEl: HTMLElement;

  constructor(plugin: UltimaOrbPlugin) {
    this.plugin = plugin;
    this.containerEl = document.createElement('div');
    this.containerEl.addClass('ultima-orb-chat-modal');
  }

  public open(): void {
    this.containerEl.empty();
    this.containerEl.addClass('ultima-orb-chat-modal');

    this.createHeader();
    this.createMessagesContainer();
    this.createInputArea();
    this.createFooter();

    // Load chat history
    this.loadChatHistory();

    // Add to document
    document.body.appendChild(this.containerEl);
  }

  public close(): void {
    if (this.containerEl.parentNode) {
      this.containerEl.parentNode.removeChild(this.containerEl);
    }
  }

  private createHeader(): void {
    const headerEl = this.containerEl.createEl('div', { cls: 'ultima-orb-chat-header' });
    
    const titleEl = headerEl.createEl('h2', { cls: 'ultima-orb-chat-title' });
    titleEl.setText('💬 AI Chat');

    const providerContainer = headerEl.createEl('div', { cls: 'ultima-orb-provider-container' });
    
    providerContainer.createEl('label', { text: 'AI Provider:' });
    
    this.providerSelect = providerContainer.createEl('select', { cls: 'ultima-orb-provider-select' });
    this.populateProviderSelect();
    
    this.providerSelect.addEventListener('change', () => {
      this.plugin.aiOrchestrator.setDefaultProvider(this.providerSelect.value);
    });
  }

  private createMessagesContainer(): void {
    this.messagesContainer = this.containerEl.createEl('div', { cls: 'ultima-orb-messages-container' });
  }

  private createInputArea(): void {
    this.inputContainer = this.containerEl.createEl('div', { cls: 'ultima-orb-input-container' });
    
    // Input field
    this.inputElement = this.inputContainer.createEl('textarea', { 
      cls: 'ultima-orb-chat-input',
      placeholder: 'พิมพ์ข้อความของคุณ... (Ctrl+Enter เพื่อส่ง)'
    });
    
    this.inputElement.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Send button
    this.sendButton = this.inputContainer.createEl('button', { 
      cls: 'ultima-orb-send-button',
      text: 'ส่ง'
    });
    
    this.sendButton.addEventListener('click', () => {
      this.sendMessage();
    });
  }

  private createFooter(): void {
    const footerEl = this.containerEl.createEl('div', { cls: 'ultima-orb-chat-footer' });
    
    // Clear chat button
    this.clearButton = footerEl.createEl('button', { 
      cls: 'ultima-orb-clear-button',
      text: 'ล้างประวัติ'
    });
    
    this.clearButton.addEventListener('click', () => {
      this.clearChat();
    });

    // Export chat button
    const exportButton = footerEl.createEl('button', { 
      cls: 'ultima-orb-export-button',
      text: 'ส่งออก'
    });
    
    exportButton.addEventListener('click', () => {
      this.exportChat();
    });
  }

  private populateProviderSelect(): void {
    const availableProviders = this.plugin.aiOrchestrator.getAvailableProviders();
    const defaultProvider = this.plugin.aiOrchestrator.getDefaultProvider();

    this.providerSelect.empty();

    availableProviders.forEach(provider => {
      const option = this.providerSelect.createEl('option', { value: provider });
      option.setText(this.getProviderDisplayName(provider));
      
      if (provider === defaultProvider) {
        option.selected = true;
      }
    });

    if (availableProviders.length === 0) {
      const option = this.providerSelect.createEl('option', { value: '' });
      option.setText('ไม่มี AI Provider ที่พร้อมใช้งาน');
      option.disabled = true;
    }
  }

  private getProviderDisplayName(provider: string): string {
    const displayNames: Record<string, string> = {
      'openai': 'OpenAI GPT',
      'claude': 'Anthropic Claude',
      'gemini': 'Google Gemini',
      'ollama': 'Ollama',
      'anythingllm': 'AnythingLLM'
    };
    return displayNames[provider] || provider;
  }

  private async sendMessage(): Promise<void> {
    const message = this.inputElement.value.trim();
    if (!message || this.isLoading) {
      return;
    }

    const selectedProvider = this.providerSelect.value;
    if (!selectedProvider) {
      new Notice('❌ กรุณาเลือก AI Provider');
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    this.addMessage(userMessage);
    this.inputElement.value = '';
    this.setLoading(true);

    try {
      // Send to AI
      const response = await this.plugin.aiOrchestrator.sendRequest({
        provider: selectedProvider,
        prompt: message
      });

      if (response.success && response.content) {
        // Add AI response
        const aiMessage: ChatMessage = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          provider: selectedProvider,
          model: response.model,
          usage: response.usage
        };

        this.addMessage(aiMessage);
      } else {
        // Show error
        const errorMessage: ChatMessage = {
          id: `msg_${Date.now()}_error`,
          role: 'assistant',
          content: `❌ เกิดข้อผิดพลาด: ${response.error || 'ไม่สามารถเชื่อมต่อกับ AI ได้'}`,
          timestamp: new Date(),
          provider: selectedProvider
        };

        this.addMessage(errorMessage);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: `❌ เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        provider: selectedProvider
      };

      this.addMessage(errorMessage);
    } finally {
      this.setLoading(false);
    }
  }

  private addMessage(message: ChatMessage): void {
    this.messages.push(message);
    this.renderMessage(message);
    this.saveChatHistory();
    this.scrollToBottom();
  }

  private renderMessage(message: ChatMessage): void {
    const messageEl = this.messagesContainer.createEl('div', { 
      cls: `ultima-orb-message ultima-orb-message-${message.role}` 
    });

    const headerEl = messageEl.createEl('div', { cls: 'ultima-orb-message-header' });
    
    const roleEl = headerEl.createEl('span', { cls: 'ultima-orb-message-role' });
    roleEl.setText(message.role === 'user' ? '👤 คุณ' : '🤖 AI');

    const timeEl = headerEl.createEl('span', { cls: 'ultima-orb-message-time' });
    timeEl.setText(message.timestamp.toLocaleTimeString());

    if (message.provider) {
      const providerEl = headerEl.createEl('span', { cls: 'ultima-orb-message-provider' });
      providerEl.setText(`(${this.getProviderDisplayName(message.provider)})`);
    }

    const contentEl = messageEl.createEl('div', { cls: 'ultima-orb-message-content' });
    
    if (message.role === 'assistant') {
      // Render markdown for AI responses
      this.renderMarkdown(contentEl, message.content);
    } else {
      contentEl.setText(message.content);
    }

    // Show usage info if available
    if (message.usage) {
      const usageEl = messageEl.createEl('div', { cls: 'ultima-orb-message-usage' });
      usageEl.innerHTML = `
        <small>
          Tokens: ${message.usage.totalTokens} 
          (Prompt: ${message.usage.promptTokens}, Completion: ${message.usage.completionTokens})
        </small>
      `;
    }
  }

  private renderMarkdown(container: HTMLElement, content: string): void {
    // Simple markdown rendering
    const htmlContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');

    container.innerHTML = htmlContent;
  }

  private setLoading(loading: boolean): void {
    this.isLoading = loading;
    this.sendButton.disabled = loading;
    this.sendButton.textContent = loading ? 'กำลังส่ง...' : 'ส่ง';
  }

  private scrollToBottom(): void {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  private async loadChatHistory(): Promise<void> {
    try {
      const history = await this.plugin.settings.get('chatHistory');
      if (history && Array.isArray(history)) {
        this.messages = history.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        this.messages.forEach(message => this.renderMessage(message));
        this.scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }

  private async saveChatHistory(): Promise<void> {
    try {
      const maxHistory = this.plugin.settings.getSync('maxChatHistory') || 100;
      
      // Keep only the latest messages
      if (this.messages.length > maxHistory) {
        this.messages = this.messages.slice(-maxHistory);
      }

      await this.plugin.settings.set('chatHistory', this.messages);
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }

  private async clearChat(): Promise<void> {
    if (confirm('คุณแน่ใจหรือไม่ที่จะล้างประวัติการสนทนาทั้งหมด?')) {
      this.messages = [];
      this.messagesContainer.empty();
      await this.plugin.settings.set('chatHistory', []);
      new Notice('✅ ล้างประวัติการสนทนาแล้ว');
    }
  }

  private exportChat(): void {
    try {
      const chatData = {
        timestamp: new Date().toISOString(),
        messages: this.messages,
        totalMessages: this.messages.length
      };

      const jsonData = JSON.stringify(chatData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `ultima-orb-chat-${new Date().toISOString().slice(0, 19)}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      new Notice('✅ ส่งออกประวัติการสนทนาแล้ว');
    } catch (error) {
      console.error('Failed to export chat:', error);
      new Notice('❌ ไม่สามารถส่งออกประวัติการสนทนาได้');
    }
  }

  public dispose(): void {
    this.close();
  }
}
