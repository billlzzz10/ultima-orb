import { Modal, App, Notice } from "obsidian";
import { AIOrchestrator } from "../ai/AIOrchestrator";

export class AdvancedChatInterface extends Modal {
  private aiOrchestrator: AIOrchestrator;
  private messageInput!: HTMLTextAreaElement;
  private chatContainer!: HTMLDivElement;
  private modeSelector!: HTMLSelectElement;
  private dragDropZone!: HTMLDivElement;
  private fileList!: HTMLDivElement;
  private contextPanel!: HTMLDivElement;

  constructor(app: App, aiOrchestrator: AIOrchestrator) {
    super(app);
    this.aiOrchestrator = aiOrchestrator;
  }

  onOpen(): void {
    const container = document.createElement("div");
    container.addClass("ultima-orb-advanced-chat");
    this.containerEl.appendChild(container);

    // Create header
    const header = container.createEl("div", { cls: "ultima-orb-chat-header" });
    header.createEl("h2", { text: "Advanced AI Chat" });

    // Create main content
    const mainContent = container.createEl("div", {
      cls: "ultima-orb-chat-main",
    });

    // Create left panel (context and files)
    const leftPanel = mainContent.createEl("div", {
      cls: "ultima-orb-chat-left-panel",
    });
    this.createContextPanel(leftPanel);
    this.createFileUploadZone(leftPanel);

    // Create right panel (chat)
    const rightPanel = mainContent.createEl("div", {
      cls: "ultima-orb-chat-right-panel",
    });
    this.createChatInterface(rightPanel);
  }

  onClose(): void {
    this.containerEl.empty();
  }

  private createContextPanel(container: HTMLElement): void {
    this.contextPanel = container.createEl("div", {
      cls: "ultima-orb-context-panel",
    });
    this.contextPanel.createEl("h3", { text: "Context" });

    const contextInput = this.contextPanel.createEl("textarea", {
      cls: "ultima-orb-context-input",
      placeholder: "Add context information...",
    });

    contextInput.addEventListener("input", () => {
      // Update context
    });
  }

  private createFileUploadZone(container: HTMLElement): void {
    this.dragDropZone = container.createEl("div", {
      cls: "ultima-orb-drag-drop-zone",
    });
    this.dragDropZone.createEl("h3", { text: "Files" });
    this.dragDropZone.createEl("p", {
      text: "Drag and drop files here or click to browse",
    });

    this.fileList = container.createEl("div", { cls: "ultima-orb-file-list" });

    this.dragDropZone.addEventListener("click", () => {
      // Open file browser
    });

    this.dragDropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      this.dragDropZone.addClass("ultima-orb-drag-over");
    });

    this.dragDropZone.addEventListener("dragleave", () => {
      this.dragDropZone.removeClass("ultima-orb-drag-over");
    });

    this.dragDropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      this.dragDropZone.removeClass("ultima-orb-drag-over");
      // Handle file drop
    });
  }

  private createChatInterface(container: HTMLElement): void {
    // Create mode selector
    const modeContainer = container.createEl("div", {
      cls: "ultima-orb-mode-container",
    });
    modeContainer.createEl("label", { text: "AI Mode:" });

    this.modeSelector = modeContainer.createEl("select", {
      cls: "ultima-orb-mode-selector",
    });
    this.modeSelector.createEl("option", { value: "ask", text: "Ask" });
    this.modeSelector.createEl("option", { value: "write", text: "Write" });
    this.modeSelector.createEl("option", { value: "learn", text: "Learn" });
    this.modeSelector.createEl("option", {
      value: "research",
      text: "Research",
    });
    this.modeSelector.createEl("option", { value: "code", text: "Code" });

    // Create chat container
    this.chatContainer = container.createEl("div", {
      cls: "ultima-orb-chat-messages",
    });

    // Create input area
    const inputArea = container.createEl("div", {
      cls: "ultima-orb-chat-input-area",
    });

    this.messageInput = inputArea.createEl("textarea", {
      cls: "ultima-orb-message-input",
      placeholder: "Type your message here...",
    });

    const sendButton = inputArea.createEl("button", {
      cls: "ultima-orb-send-button",
      text: "Send",
    });

    // Add event listeners
    sendButton.addEventListener("click", () => this.sendMessage());
    this.messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Add welcome message
    this.addMessage(
      "assistant",
      "Hello! I'm your advanced AI assistant. How can I help you today?"
    );
  }

  private async sendMessage(): Promise<void> {
    const message = this.messageInput.value.trim();
    if (!message) return;

    // Add user message
    this.addMessage("user", message);
    this.messageInput.value = "";

    // Show loading
    const loadingId = this.addMessage("assistant", "Thinking...");

    try {
      // Get AI response
      const response = await this.aiOrchestrator.generateResponse(message);

      // Update loading message with response
      this.updateMessage(loadingId, "assistant", response);
    } catch (error) {
      this.updateMessage(
        loadingId,
        "assistant",
        "Sorry, I encountered an error. Please try again."
      );
      console.error("Chat error:", error);
    }
  }

  private addMessage(role: "user" | "assistant", content: string): string {
    const messageId = `msg-${Date.now()}`;
    const messageEl = this.chatContainer.createEl("div", {
      cls: `ultima-orb-message ultima-orb-message-${role}`,
      attr: { "data-message-id": messageId },
    });

    messageEl.createEl("div", {
      cls: "ultima-orb-message-content",
      text: content,
    });

    return messageId;
  }

  private updateMessage(
    messageId: string,
    role: "user" | "assistant",
    content: string
  ): void {
    const messageEl = this.chatContainer.querySelector(
      `[data-message-id="${messageId}"]`
    );
    if (messageEl) {
      const contentEl = messageEl.querySelector(".ultima-orb-message-content");
      if (contentEl) {
        contentEl.textContent = content;
      }
    }
  }
}
