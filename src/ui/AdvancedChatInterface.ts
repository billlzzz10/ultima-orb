import { App, Modal, Notice } from "obsidian";
import { AIFeatures } from "../ai/AIFeatures";
import { AgentMode } from "../ai/AgentMode";
import { AtCommands } from "../ai/AtCommands";

/**
 * 🚀 Advanced Chat Interface - ฟีเจอร์ขั้นสูงจาก Continue + Cursor
 */
export class AdvancedChatInterface extends Modal {
  private app: App;
  private aiFeatures: AIFeatures;
  private agentMode: AgentMode;
  private atCommands: AtCommands;
  
  // UI Elements
  private messageInput: HTMLTextAreaElement;
  private chatContainer: HTMLDivElement;
  private modeSelector: HTMLSelectElement;
  private dragDropZone: HTMLDivElement;
  private fileList: HTMLDivElement;
  private contextPanel: HTMLDivElement;
  
  // State
  private isMaxMode: boolean = false;
  private attachedFiles: Array<{ name: string; content: string; type: string }> = [];
  private messages: Array<{ role: 'user' | 'ai'; content: string; timestamp: Date; mode?: string }> = [];

  constructor(app: App, aiFeatures: AIFeatures, agentMode: AgentMode, atCommands: AtCommands) {
    super(app);
    this.app = app;
    this.aiFeatures = aiFeatures;
    this.agentMode = agentMode;
    this.atCommands = atCommands;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("advanced-chat-interface");

    // Header
    const header = contentEl.createEl("div", { cls: "chat-header" });
    header.createEl("h2", { text: "🚀 Advanced AI Chat" });
    
    // Mode Selector
    const modeContainer = header.createEl("div", { cls: "mode-selector" });
    modeContainer.createEl("label", { text: "Mode:" });
    this.modeSelector = modeContainer.createEl("select", { cls: "mode-select" });
    
    const modes = [
      { value: "chat", label: "💬 Chat" },
      { value: "agent", label: "🤖 Agent" },
      { value: "max", label: "⚡ Max Mode" }
    ];
    
    modes.forEach(mode => {
      const option = this.modeSelector.createEl("option", { text: mode.label });
      option.value = mode.value;
    });

    // Main Content
    const mainContent = contentEl.createEl("div", { cls: "chat-main-content" });

    // Left Panel - Context & Files
    const leftPanel = mainContent.createEl("div", { cls: "chat-left-panel" });
    
    // Context Panel
    this.contextPanel = leftPanel.createEl("div", { cls: "context-panel" });
    this.contextPanel.createEl("h3", { text: "📋 Context" });
    
    // Drag & Drop Zone
    this.dragDropZone = leftPanel.createEl("div", { cls: "drag-drop-zone" });
    this.dragDropZone.createEl("h3", { text: "📁 Drop Files Here" });
    this.dragDropZone.createEl("p", { text: "Drag and drop files, URLs, or text" });
    
    // File List
    this.fileList = leftPanel.createEl("div", { cls: "file-list" });
    this.fileList.createEl("h3", { text: "📎 Attached Files" });

    // Right Panel - Chat
    const rightPanel = mainContent.createEl("div", { cls: "chat-right-panel" });
    
    // Chat Messages
    this.chatContainer = rightPanel.createEl("div", { cls: "chat-messages" });
    
    // Input Area
    const inputArea = rightPanel.createEl("div", { cls: "chat-input-area" });
    
    // Message Input
    this.messageInput = inputArea.createEl("textarea", {
      placeholder: "Type your message... Use @commands, drag files, or switch modes",
      cls: "chat-message-input"
    });

    // Buttons
    const buttonContainer = inputArea.createEl("div", { cls: "chat-buttons" });
    
    const sendBtn = buttonContainer.createEl("button", {
      text: "Send",
      cls: "chat-send-btn"
    });

    const clearBtn = buttonContainer.createEl("button", {
      text: "Clear",
      cls: "chat-clear-btn"
    });

    const maxModeBtn = buttonContainer.createEl("button", {
      text: "⚡ Max Mode",
      cls: "chat-max-mode-btn"
    });

    // Event Listeners
    this.setupEventListeners(sendBtn, clearBtn, maxModeBtn);
    this.setupDragAndDrop();
    
    // Focus input
    setTimeout(() => this.messageInput.focus(), 100);
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  /**
   * 🔧 Setup Event Listeners
   */
  private setupEventListeners(sendBtn: HTMLButtonElement, clearBtn: HTMLButtonElement, maxModeBtn: HTMLButtonElement): void {
    // Send button
    sendBtn.addEventListener("click", () => this.sendMessage());
    
    // Clear button
    clearBtn.addEventListener("click", () => this.clearChat());
    
    // Max Mode button
    maxModeBtn.addEventListener("click", () => this.toggleMaxMode());
    
    // Enter key
    this.messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Mode change
    this.modeSelector.addEventListener("change", () => {
      this.updateMode();
    });
  }

  /**
   * 📁 Setup Drag & Drop
   */
  private setupDragAndDrop(): void {
    this.dragDropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      this.dragDropZone.addClass("drag-over");
    });

    this.dragDropZone.addEventListener("dragleave", () => {
      this.dragDropZone.removeClass("drag-over");
    });

    this.dragDropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      this.dragDropZone.removeClass("drag-over");
      this.handleFileDrop(e);
    });

    // Click to add files
    this.dragDropZone.addEventListener("click", () => {
      this.showFileInput();
    });
  }

  /**
   * 📄 Handle File Drop
   */
  private handleFileDrop(e: DragEvent): void {
    const files = e.dataTransfer?.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      this.processFile(file);
    });
  }

  /**
   * 📄 Process File
   */
  private async processFile(file: File): Promise<void> {
    try {
      const content = await this.readFileContent(file);
      const fileInfo = {
        name: file.name,
        content: content,
        type: file.type || "text/plain"
      };

      this.attachedFiles.push(fileInfo);
      this.updateFileList();
      this.updateContext();
      
      new Notice(`📎 Added: ${file.name}`);
    } catch (error) {
      new Notice(`❌ Error reading file: ${error}`);
    }
  }

  /**
   * 📖 Read File Content
   */
  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /**
   * 📋 Show File Input
   */
  private showFileInput(): void {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.addEventListener("change", (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        Array.from(files).forEach(file => this.processFile(file));
      }
    });
    input.click();
  }

  /**
   * 📝 Update File List
   */
  private updateFileList(): void {
    this.fileList.empty();
    this.fileList.createEl("h3", { text: "📎 Attached Files" });
    
    this.attachedFiles.forEach((file, index) => {
      const fileEl = this.fileList.createEl("div", { cls: "file-item" });
      fileEl.createEl("span", { text: file.name, cls: "file-name" });
      
      const removeBtn = fileEl.createEl("button", {
        text: "×",
        cls: "file-remove-btn"
      });
      
      removeBtn.addEventListener("click", () => {
        this.attachedFiles.splice(index, 1);
        this.updateFileList();
        this.updateContext();
      });
    });
  }

  /**
   * 📋 Update Context
   */
  private updateContext(): void {
    this.contextPanel.empty();
    this.contextPanel.createEl("h3", { text: "📋 Context" });
    
    if (this.attachedFiles.length > 0) {
      const contextEl = this.contextPanel.createEl("div", { cls: "context-content" });
      contextEl.createEl("h4", { text: "Attached Files:" });
      
      this.attachedFiles.forEach(file => {
        const fileEl = contextEl.createEl("div", { cls: "context-file" });
        fileEl.createEl("strong", { text: file.name });
        fileEl.createEl("p", { text: file.content.substring(0, 100) + "..." });
      });
    }

    // Agent status
    const agentStatus = this.agentMode.getStatus();
    if (agentStatus.isActive) {
      const agentEl = this.contextPanel.createEl("div", { cls: "agent-status" });
      agentEl.createEl("h4", { text: "🤖 Agent Status" });
      agentEl.createEl("p", { text: `Task: ${agentStatus.currentTask}` });
      agentEl.createEl("p", { text: `Steps: ${agentStatus.stepCount}` });
    }

    // @ Commands stats
    const atStats = this.atCommands.getStats();
    const statsEl = this.contextPanel.createEl("div", { cls: "at-stats" });
    statsEl.createEl("h4", { text: "@ Commands" });
    statsEl.createEl("p", { text: `Tools: ${atStats.tools}, Documents: ${atStats.documents}` });
  }

  /**
   * 💬 Send Message
   */
  private async sendMessage(): Promise<void> {
    const message = this.messageInput.value.trim();
    if (!message) return;

    const mode = this.modeSelector.value;
    this.messageInput.value = "";

    // Add user message
    this.addMessage('user', message, mode);

    // Show loading
    const loadingEl = this.addMessage('ai', "🤔 Thinking...", mode);

    try {
      let response: string;

      // Process based on mode
      switch (mode) {
        case "agent":
          response = await this.processAgentMessage(message);
          break;
        
        case "max":
          response = await this.processMaxModeMessage(message);
          break;
        
        default:
          response = await this.processChatMessage(message);
      }

      // Update loading message
      loadingEl.textContent = response;
    } catch (error) {
      loadingEl.textContent = "❌ Error: Could not get response";
    }
  }

  /**
   * 💬 Process Chat Message
   */
  private async processChatMessage(message: string): Promise<string> {
    // Process @ commands
    const processedMessage = await this.atCommands.processAtCommand(message);
    
    // Add context from attached files
    let context = "";
    if (this.attachedFiles.length > 0) {
      context = "\n\nContext from attached files:\n" + 
        this.attachedFiles.map(file => `${file.name}:\n${file.content}`).join("\n\n");
    }

    return await this.aiFeatures.chatWithAI(processedMessage + context);
  }

  /**
   * 🤖 Process Agent Message
   */
  private async processAgentMessage(message: string): Promise<string> {
    const result = await this.agentMode.startAgentMode(message);
    return result || "Agent task completed.";
  }

  /**
   * ⚡ Process Max Mode Message
   */
  private async processMaxModeMessage(message: string): Promise<string> {
    // Max Mode - ใช้พลังสูงสุด
    const enhancedMessage = `[MAX MODE] ${message}\n\nPlease provide the most comprehensive, detailed, and helpful response possible. Include examples, explanations, and actionable insights.`;
    
    // Process @ commands
    const processedMessage = await this.atCommands.processAtCommand(enhancedMessage);
    
    // Add all context
    let context = "";
    if (this.attachedFiles.length > 0) {
      context = "\n\nContext from attached files:\n" + 
        this.attachedFiles.map(file => `${file.name}:\n${file.content}`).join("\n\n");
    }

    return await this.aiFeatures.chatWithAI(processedMessage + context);
  }

  /**
   * 💬 Add Message
   */
  private addMessage(role: 'user' | 'ai', content: string, mode?: string): HTMLDivElement {
    const messageEl = this.chatContainer.createEl("div", {
      cls: `chat-message ${role}-message`
    });

    const headerEl = messageEl.createEl("div", { cls: "message-header" });
    headerEl.createEl("span", {
      cls: "message-role",
      text: role === 'user' ? "👤 You" : "🤖 AI"
    });

    if (mode) {
      headerEl.createEl("span", {
        cls: "message-mode",
        text: mode === "max" ? "⚡ Max" : mode === "agent" ? "🤖 Agent" : "💬 Chat"
      });
    }

    const contentEl = messageEl.createEl("div", {
      cls: "message-content",
      text: content
    });

    // Scroll to bottom
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;

    return contentEl;
  }

  /**
   * 🗑️ Clear Chat
   */
  private clearChat(): void {
    this.messages = [];
    this.chatContainer.empty();
    new Notice("🗑️ Chat cleared");
  }

  /**
   * ⚡ Toggle Max Mode
   */
  private toggleMaxMode(): void {
    this.isMaxMode = !this.isMaxMode;
    if (this.isMaxMode) {
      this.modeSelector.value = "max";
      new Notice("⚡ Max Mode Activated!");
    } else {
      this.modeSelector.value = "chat";
      new Notice("💬 Normal Mode");
    }
    this.updateMode();
  }

  /**
   * 🔄 Update Mode
   */
  private updateMode(): void {
    const mode = this.modeSelector.value;
    this.isMaxMode = mode === "max";
    
    // Update UI based on mode
    this.messageInput.placeholder = mode === "max" 
      ? "⚡ MAX MODE: Type your message for maximum power..."
      : mode === "agent"
      ? "🤖 AGENT MODE: Describe the task for AI agent..."
      : "💬 Type your message... Use @commands, drag files, or switch modes";
  }
}
