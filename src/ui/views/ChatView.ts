import { ItemView, WorkspaceLeaf, Notice } from "obsidian";
import { AIOrchestrator } from "../../ai/AIOrchestrator";
import { ModeSystem } from "../../ai/ModeSystem";

export const CHAT_VIEW_TYPE = "ultima-orb-chat";

export class ChatView extends ItemView {
  private aiOrchestrator: AIOrchestrator;
  private modeSystem: ModeSystem;
  private chatContainer!: HTMLElement;
  private messageContainer!: HTMLElement;
  private inputContainer!: HTMLElement;
  private messageInput!: HTMLTextAreaElement;
  private sendButton!: HTMLButtonElement;
  private modeSelector!: HTMLSelectElement;

  constructor(leaf: WorkspaceLeaf, aiOrchestrator: AIOrchestrator) {
    super(leaf);
    this.aiOrchestrator = aiOrchestrator;
    this.modeSystem = aiOrchestrator.getModeSystem();
  }

  getViewType(): string {
    return CHAT_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Ultima-Orb Chat";
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl("h4", { text: "Ultima-Orb AI Chat" });

    this.createChatInterface(container as HTMLElement);
  }

  async onClose(): Promise<void> {
    // Cleanup if needed
  }

  private createChatInterface(container: HTMLElement): void {
    // Create mode selector
    this.createModeSelector(container);

    // Create chat container
    this.chatContainer = container.createEl("div", {
      cls: "ultima-orb-chat-container",
    });

    // Create message container
    this.messageContainer = this.chatContainer.createEl("div", {
      cls: "ultima-orb-message-container",
    });

    // Create input container
    this.inputContainer = this.chatContainer.createEl("div", {
      cls: "ultima-orb-input-container",
    });

    // Create message input
    this.messageInput = this.inputContainer.createEl("textarea", {
      cls: "ultima-orb-message-input",
      placeholder: "Type your message here...",
    });

    // Create send button
    this.sendButton = this.inputContainer.createEl("button", {
      cls: "ultima-orb-send-button",
      text: "Send",
    });

    // Add event listeners
    this.sendButton.addEventListener("click", () => this.sendMessage());
    this.messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Set initial welcome message
    this.updateWelcomeMessage();
  }

  private createModeSelector(container: HTMLElement): void {
    const modeContainer = container.createEl("div", {
      cls: "ultima-orb-mode-container",
    });

    modeContainer.createEl("label", {
      cls: "ultima-orb-mode-label",
      text: "AI Mode:",
    });

    this.modeSelector = modeContainer.createEl("select", {
      cls: "ultima-orb-mode-selector",
    });

    this.populateModeSelector();

    this.modeSelector.addEventListener("change", (e) => {
      const target = e.target as HTMLSelectElement;
      this.switchMode(target.value);
    });
  }

  private populateModeSelector(): void {
    this.modeSelector.empty();

    const modes = this.modeSystem.getAllModes();
    const activeMode = this.modeSystem.getActiveMode();

    modes.forEach((mode) => {
      const option = this.modeSelector.createEl("option", {
        value: mode.id,
        text: mode.label,
      });

      if (mode.id === activeMode?.id) {
        option.selected = true;
      }
    });
  }

  private switchMode(modeId: string): void {
    this.modeSystem.setActiveMode(modeId);
    this.updateWelcomeMessage();
    new Notice(`Switched to ${this.modeSystem.getActiveMode()?.label} mode`);
  }

  private updateWelcomeMessage(): void {
    const activeMode = this.modeSystem.getActiveMode();
    const welcomeMessage =
      activeMode?.description || "How can I help you today?";

    this.messageContainer.empty();
    this.addMessage("assistant", welcomeMessage);
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
    const messageEl = this.messageContainer.createEl("div", {
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
    const messageEl = this.messageContainer.querySelector(
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
