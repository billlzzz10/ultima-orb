import { ItemView, WorkspaceLeaf, Notice } from "obsidian";
import { AIOrchestrator } from "../../ai/AIOrchestrator";
import { ModeSystem } from "../../ai/ModeSystem";

export const CHAT_VIEW_TYPE = "ultima-orb-chat";

export class ChatView extends ItemView {
  private aiOrchestrator: AIOrchestrator;
  private modeSystem: ModeSystem;
  private messageInput!: HTMLTextAreaElement;
  private chatContainer!: HTMLDivElement;

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

  getIcon(): string {
    return "message-circle";
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    if (container) {
      container.empty();
    }
    if (container) {
      container.createEl("h4", { text: "Ultima-Orb AI Chat" });
    }

    if (container instanceof HTMLElement) {
      this.createChatInterface(container);
    } else {
      console.error("ChatView: container is not an HTMLElement");
    }
  }

  private createChatInterface(container: HTMLElement): void {
    // Mode selector
    const modeSelector = container.createEl("select", { cls: "mode-selector" });
    const modes = this.modeSystem.getAllModes();

    modes.forEach((mode) => {
      const option = modeSelector.createEl("option", { text: mode.name });
      option.value = mode.id;
      if (mode.id === this.modeSystem.getActiveMode()?.id) {
        option.selected = true;
      }
    });

    modeSelector.addEventListener("change", (e) => {
      const target = e.target as HTMLSelectElement;
      this.modeSystem.setActiveMode(target.value);
      new Notice(`Switched to ${this.modeSystem.getActiveMode()?.name} mode`);
    });

    // Chat container
    this.chatContainer = container.createEl("div", { cls: "chat-container" });

    // Message input
    const inputContainer = container.createEl("div", {
      cls: "input-container",
    });
    this.messageInput = inputContainer.createEl("textarea", {
      placeholder: "Type your message...",
      cls: "message-input",
    });

    // Send button
    const sendButton = inputContainer.createEl("button", { text: "Send" });
    sendButton.addEventListener("click", () => this.sendMessage());
  }

  private async sendMessage(): Promise<void> {
    const message = this.messageInput.value.trim();
    if (!message) return;

    // Add user message to chat
    this.addMessageToChat("user", message);
    this.messageInput.value = "";

    try {
      // Get AI response
      const response = await this.aiOrchestrator.generateResponse(message);
      this.addMessageToChat("ai", response);
    } catch (error) {
      this.addMessageToChat(
        "error",
        "Sorry, I encountered an error. Please try again."
      );
    }
  }

  private addMessageToChat(
    sender: "user" | "ai" | "error",
    message: string
  ): void {
    const messageEl = this.chatContainer.createEl("div", {
      cls: `chat-message ${sender}-message`,
    });

    const senderEl = messageEl.createEl("div", {
      text: sender === "user" ? "You" : sender === "ai" ? "AI" : "Error",
      cls: "message-sender",
    });

    const contentEl = messageEl.createEl("div", {
      text: message,
      cls: "message-content",
    });
  }

  public open(): void {
    // Open chat view
    const leaf = this.app.workspace.getRightLeaf(false);
    if (leaf) {
      leaf.setViewState({ type: CHAT_VIEW_TYPE, active: true });
      this.app.workspace.revealLeaf(leaf);
    }
  }

  async onClose(): Promise<void> {
    // Cleanup if needed
  }
}
