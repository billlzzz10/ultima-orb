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
    const container = this.containerEl.children[1] as HTMLElement;
    container.innerHTML = "";
    const heading = document.createElement("h4");
    heading.textContent = "Ultima-Orb AI Chat";
    container.appendChild(heading);

    this.createChatInterface(container);
  }

  private createChatInterface(container: HTMLElement): void {
    // Mode selector
    const modeSelector = document.createElement("select");
    modeSelector.className = "mode-selector";
    container.appendChild(modeSelector);
    const modes = this.modeSystem.getAllModes();

    modes.forEach((mode) => {
      const option = document.createElement("option");
      option.text = mode.name;
      option.value = mode.id;
      if (mode.id === this.modeSystem.getActiveMode()?.id) {
        option.selected = true;
      }
      modeSelector.appendChild(option);
    });

    modeSelector.addEventListener("change", (e) => {
      const target = e.target as HTMLSelectElement;
      this.modeSystem.setActiveMode(target.value);
      new Notice(`Switched to ${this.modeSystem.getActiveMode()?.name} mode`);
    });

    // Chat container
    this.chatContainer = document.createElement("div");
    this.chatContainer.className = "chat-container";
    container.appendChild(this.chatContainer);

    // Message input
    const inputContainer = document.createElement("div");
    inputContainer.className = "input-container";
    container.appendChild(inputContainer);

    this.messageInput = document.createElement("textarea");
    this.messageInput.placeholder = "Type your message...";
    this.messageInput.className = "message-input";
    inputContainer.appendChild(this.messageInput);

    // Send button
    const sendButton = document.createElement("button");
    sendButton.textContent = "Send";
    sendButton.addEventListener("click", () => this.sendMessage());
    inputContainer.appendChild(sendButton);
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
    const messageEl = document.createElement("div");
    messageEl.className = `chat-message ${sender}-message`;
    this.chatContainer.appendChild(messageEl);

    const senderEl = document.createElement("div");
    senderEl.textContent = sender === "user" ? "You" : sender === "ai" ? "AI" : "Error";
    senderEl.className = "message-sender";
    messageEl.appendChild(senderEl);

    const contentEl = document.createElement("div");
    contentEl.textContent = message;
    contentEl.className = "message-content";
    messageEl.appendChild(contentEl);
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
