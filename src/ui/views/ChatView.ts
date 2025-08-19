import { App, ItemView, WorkspaceLeaf, Notice } from "obsidian";
import { FeatureManager } from "../../core/FeatureManager";
import { AIOrchestrator } from "../../ai/AIOrchestrator";

export const CHAT_VIEW_TYPE = "ultima-orb-chat";

export class ChatView extends ItemView {
  private app: App;
  private featureManager: FeatureManager;
  private aiOrchestrator: AIOrchestrator;
  private chatContainer: HTMLElement;
  private messageContainer: HTMLElement;
  private inputContainer: HTMLElement;
  private messageInput: HTMLTextAreaElement;
  private sendButton: HTMLButtonElement;
  private messages: Array<{ role: "user" | "assistant"; content: string; timestamp: Date }> = [];

  constructor(
    app: App,
    featureManager: FeatureManager,
    aiOrchestrator: AIOrchestrator,
    leaf?: WorkspaceLeaf
  ) {
    super(leaf);
    this.app = app;
    this.featureManager = featureManager;
    this.aiOrchestrator = aiOrchestrator;
  }

  getViewType(): string {
    return CHAT_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Ultima-Orb Chat";
  }

  getIcon(): string {
    return "message-circle";
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl("h4", { text: "Ultima-Orb AI Chat" });

    this.createChatInterface(container);
    this.loadChatHistory();
  }

  private createChatInterface(container: HTMLElement) {
    // Create main chat container
    this.chatContainer = container.createDiv("ultima-orb-chat-container");
    
    // Create message container
    this.messageContainer = this.chatContainer.createDiv("ultima-orb-message-container");
    
    // Create input container
    this.inputContainer = this.chatContainer.createDiv("ultima-orb-input-container");
    
    // Create message input
    this.messageInput = this.inputContainer.createEl("textarea", {
      placeholder: "Type your message here...",
      cls: "ultima-orb-message-input"
    });
    
    // Create send button
    this.sendButton = this.inputContainer.createEl("button", {
      text: "Send",
      cls: "ultima-orb-send-button"
    });
    
    // Add event listeners
    this.messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    this.sendButton.addEventListener("click", () => {
      this.sendMessage();
    });
    
    // Add welcome message
    this.addMessage("assistant", "Hello! I'm Ultima-Orb AI Assistant. How can I help you today?");
  }

  private async sendMessage() {
    const message = this.messageInput.value.trim();
    if (!message) return;
    
    // Add user message
    this.addMessage("user", message);
    this.messageInput.value = "";
    
    // Show typing indicator
    const typingIndicator = this.addTypingIndicator();
    
    try {
      // Get AI response
      const response = await this.aiOrchestrator.chat(message);
      
      // Remove typing indicator
      typingIndicator.remove();
      
      // Add AI response
      this.addMessage("assistant", response);
      
    } catch (error) {
      // Remove typing indicator
      typingIndicator.remove();
      
      // Show error message
      this.addMessage("assistant", "Sorry, I encountered an error. Please try again.");
      new Notice(`Chat error: ${error}`);
    }
  }

  private addMessage(role: "user" | "assistant", content: string) {
    const message = {
      role,
      content,
      timestamp: new Date()
    };
    
    this.messages.push(message);
    this.renderMessage(message);
    this.saveChatHistory();
  }

  private renderMessage(message: { role: "user" | "assistant"; content: string; timestamp: Date }) {
    const messageEl = this.messageContainer.createDiv(`ultima-orb-message ultima-orb-message-${message.role}`);
    
    // Create message header
    const headerEl = messageEl.createDiv("ultima-orb-message-header");
    headerEl.createEl("span", {
      text: message.role === "user" ? "You" : "Ultima-Orb AI",
      cls: "ultima-orb-message-author"
    });
    headerEl.createEl("span", {
      text: message.timestamp.toLocaleTimeString(),
      cls: "ultima-orb-message-time"
    });
    
    // Create message content
    const contentEl = messageEl.createDiv("ultima-orb-message-content");
    contentEl.createEl("div", {
      text: message.content,
      cls: "ultima-orb-message-text"
    });
    
    // Scroll to bottom
    this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
  }

  private addTypingIndicator(): HTMLElement {
    const typingEl = this.messageContainer.createDiv("ultima-orb-message ultima-orb-message-assistant ultima-orb-typing");
    
    const headerEl = typingEl.createDiv("ultima-orb-message-header");
    headerEl.createEl("span", {
      text: "Ultima-Orb AI",
      cls: "ultima-orb-message-author"
    });
    
    const contentEl = typingEl.createDiv("ultima-orb-message-content");
    const typingText = contentEl.createEl("div", {
      text: "Typing",
      cls: "ultima-orb-typing-text"
    });
    
    // Add animated dots
    let dots = 0;
    const interval = setInterval(() => {
      dots = (dots + 1) % 4;
      typingText.setText("Typing" + ".".repeat(dots));
    }, 500);
    
    // Store interval for cleanup
    (typingEl as any).interval = interval;
    
    return typingEl;
  }

  private loadChatHistory() {
    try {
      const history = localStorage.getItem("ultima-orb-chat-history");
      if (history) {
        this.messages = JSON.parse(history);
        this.messages.forEach(message => this.renderMessage(message));
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  }

  private saveChatHistory() {
    try {
      localStorage.setItem("ultima-orb-chat-history", JSON.stringify(this.messages));
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  }

  async onClose() {
    // Cleanup
    this.messages = [];
  }
}
