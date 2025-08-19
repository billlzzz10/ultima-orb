import { App, Editor, MarkdownView, Notice, Modal, Setting } from "obsidian";
import { AIFeatures } from "../ai/AIFeatures";

/**
 * 🎯 Continue + Cursor Features - ฟีเจอร์หลักที่ใช้งานได้จริง
 */
export class ContinueCursorFeatures {
  private app: App;
  private aiFeatures: AIFeatures;

  constructor(app: App, aiFeatures: AIFeatures) {
    this.app = app;
    this.aiFeatures = aiFeatures;
  }

  // ===== CONTINUE FEATURES =====

  /**
   * 💬 Chat Interface (Continue Style)
   */
  async openChatInterface(): Promise<void> {
    const modal = new ChatInterfaceModal(this.app, this.aiFeatures);
    modal.open();
  }

  /**
   * ✏️ Inline Edit (Continue Style)
   */
  async inlineEdit(): Promise<void> {
    const selectedText = this.aiFeatures.getSelectedText();
    if (!selectedText) {
      new Notice("❌ No text selected");
      return;
    }

    const modal = new InlineEditModal(this.app, this.aiFeatures, selectedText);
    modal.open();
  }

  /**
   * 📝 Improve Text (Continue Style)
   */
  async improveText(): Promise<void> {
    const selectedText = this.aiFeatures.getSelectedText();
    if (!selectedText) {
      new Notice("❌ No text selected");
      return;
    }

    const modal = new ImproveTextModal(this.app, this.aiFeatures, selectedText);
    modal.open();
  }

  /**
   * 📊 Analyze Content (Continue Style)
   */
  async analyzeContent(): Promise<void> {
    const content = this.aiFeatures.getCurrentEditorContent();
    if (!content) {
      new Notice("❌ No content to analyze");
      return;
    }

    const modal = new AnalyzeContentModal(this.app, this.aiFeatures, content);
    modal.open();
  }

  /**
   * 💡 Generate Ideas (Continue Style)
   */
  async generateIdeas(): Promise<void> {
    const modal = new GenerateIdeasModal(this.app, this.aiFeatures);
    modal.open();
  }

  // ===== CURSOR FEATURES =====

  /**
   * 🔍 Explain Code (Cursor Style)
   */
  async explainCode(): Promise<void> {
    const selectedText = this.aiFeatures.getSelectedText();
    if (!selectedText) {
      new Notice("❌ No code selected");
      return;
    }

    const modal = new ExplainCodeModal(this.app, this.aiFeatures, selectedText);
    modal.open();
  }

  /**
   * 🐛 Debug Code (Cursor Style)
   */
  async debugCode(): Promise<void> {
    const selectedText = this.aiFeatures.getSelectedText();
    if (!selectedText) {
      new Notice("❌ No code selected");
      return;
    }

    const modal = new DebugCodeModal(this.app, this.aiFeatures, selectedText);
    modal.open();
  }

  /**
   * 🔧 Refactor Code (Cursor Style)
   */
  async refactorCode(): Promise<void> {
    const selectedText = this.aiFeatures.getSelectedText();
    if (!selectedText) {
      new Notice("❌ No code selected");
      return;
    }

    const modal = new RefactorCodeModal(
      this.app,
      this.aiFeatures,
      selectedText
    );
    modal.open();
  }

  /**
   * 🧪 Generate Tests (Cursor Style)
   */
  async generateTests(): Promise<void> {
    const selectedText = this.aiFeatures.getSelectedText();
    if (!selectedText) {
      new Notice("❌ No code selected");
      return;
    }

    const modal = new GenerateTestsModal(
      this.app,
      this.aiFeatures,
      selectedText
    );
    modal.open();
  }

  /**
   * 🚀 Code Completion (Cursor Style)
   */
  async codeCompletion(): Promise<void> {
    const modal = new CodeCompletionModal(this.app, this.aiFeatures);
    modal.open();
  }
}

// ===== MODAL COMPONENTS =====

/**
 * 💬 Chat Interface Modal
 */
class ChatInterfaceModal extends Modal {
  private aiFeatures: AIFeatures;
  private messageInput: HTMLTextAreaElement;
  private chatContainer: HTMLDivElement;
  private messages: Array<{ role: "user" | "ai"; content: string }> = [];

  constructor(app: App, aiFeatures: AIFeatures) {
    super(app);
    this.aiFeatures = aiFeatures;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("chat-interface-modal");

    // Header
    contentEl.createEl("h2", { text: "💬 AI Chat Interface" });

    // Chat container
    this.chatContainer = contentEl.createEl("div", { cls: "chat-messages" });

    // Message input
    const inputContainer = contentEl.createEl("div", {
      cls: "chat-input-container",
    });
    this.messageInput = inputContainer.createEl("textarea", {
      placeholder: "Type your message...",
      cls: "chat-message-input",
    });

    // Send button
    const sendBtn = inputContainer.createEl("button", {
      text: "Send",
      cls: "chat-send-btn",
    });

    // Event listeners
    sendBtn.addEventListener("click", () => this.sendMessage());
    this.messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Focus input
    setTimeout(() => this.messageInput.focus(), 100);
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  private async sendMessage(): Promise<void> {
    const message = this.messageInput.value.trim();
    if (!message) return;

    // Add user message
    this.addMessage("user", message);
    this.messageInput.value = "";

    // Show loading
    const loadingEl = this.addMessage("ai", "🤔 Thinking...");

    try {
      // Get AI response
      const response = await this.aiFeatures.chatWithAI(message);

      // Update loading message with response
      loadingEl.textContent = response;
    } catch (error) {
      loadingEl.textContent = "❌ Error: Could not get response";
    }
  }

  private addMessage(role: "user" | "ai", content: string): HTMLDivElement {
    const messageEl = this.chatContainer.createEl("div", {
      cls: `chat-message ${role}-message`,
    });

    const roleEl = messageEl.createEl("div", {
      cls: "chat-message-role",
      text: role === "user" ? "👤 You" : "🤖 AI",
    });

    const contentEl = messageEl.createEl("div", {
      cls: "chat-message-content",
      text: content,
    });

    // Scroll to bottom
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;

    return contentEl;
  }
}

/**
 * ✏️ Inline Edit Modal
 */
class InlineEditModal extends Modal {
  private aiFeatures: AIFeatures;
  private originalText: string;
  private instructionInput: HTMLTextAreaElement;
  private resultContainer: HTMLDivElement;

  constructor(app: App, aiFeatures: AIFeatures, originalText: string) {
    super(app);
    this.aiFeatures = aiFeatures;
    this.originalText = originalText;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("inline-edit-modal");

    contentEl.createEl("h2", { text: "✏️ Inline Edit" });

    // Original text
    contentEl.createEl("h3", { text: "Original Text:" });
    contentEl.createEl("div", {
      cls: "original-text",
      text: this.originalText,
    });

    // Instruction input
    contentEl.createEl("h3", { text: "Edit Instruction:" });
    this.instructionInput = contentEl.createEl("textarea", {
      placeholder: "What would you like to change?",
      cls: "instruction-input",
    });

    // Buttons
    const buttonContainer = contentEl.createEl("div", {
      cls: "button-container",
    });

    const editBtn = buttonContainer.createEl("button", {
      text: "Edit",
      cls: "primary-btn",
    });

    const cancelBtn = buttonContainer.createEl("button", {
      text: "Cancel",
      cls: "secondary-btn",
    });

    // Result container
    this.resultContainer = contentEl.createEl("div", {
      cls: "result-container",
    });

    // Event listeners
    editBtn.addEventListener("click", () => this.performEdit());
    cancelBtn.addEventListener("click", () => this.close());
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  private async performEdit(): Promise<void> {
    const instruction = this.instructionInput.value.trim();
    if (!instruction) return;

    try {
      const result = await this.aiFeatures.inlineEdit(
        this.originalText,
        instruction
      );

      this.resultContainer.empty();
      this.resultContainer.createEl("h3", { text: "Edited Text:" });
      this.resultContainer.createEl("div", {
        cls: "edited-text",
        text: result,
      });

      const applyBtn = this.resultContainer.createEl("button", {
        text: "Apply to Editor",
        cls: "apply-btn",
      });

      applyBtn.addEventListener("click", () => {
        this.aiFeatures.replaceSelectedText(result);
        new Notice("✅ Text edited successfully");
        this.close();
      });
    } catch (error) {
      new Notice("❌ Error editing text");
    }
  }
}

/**
 * 📝 Improve Text Modal
 */
class ImproveTextModal extends Modal {
  private aiFeatures: AIFeatures;
  private originalText: string;
  private improvementType: string = "grammar";

  constructor(app: App, aiFeatures: AIFeatures, originalText: string) {
    super(app);
    this.aiFeatures = aiFeatures;
    this.originalText = originalText;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("improve-text-modal");

    contentEl.createEl("h2", { text: "📝 Improve Text" });

    // Original text
    contentEl.createEl("h3", { text: "Original Text:" });
    contentEl.createEl("div", {
      cls: "original-text",
      text: this.originalText,
    });

    // Improvement type selection
    contentEl.createEl("h3", { text: "Improvement Type:" });
    const typeContainer = contentEl.createEl("div", { cls: "type-container" });

    const types = ["grammar", "style", "clarity", "tone"];
    types.forEach((type) => {
      const label = typeContainer.createEl("label", { cls: "type-option" });
      const radio = label.createEl("input", {
        type: "radio",
        name: "improvement-type",
        value: type,
      });
      if (type === "grammar") radio.checked = true;
      label.createEl("span", {
        text: type.charAt(0).toUpperCase() + type.slice(1),
      });

      radio.addEventListener("change", () => {
        this.improvementType = type;
      });
    });

    // Buttons
    const buttonContainer = contentEl.createEl("div", {
      cls: "button-container",
    });

    const improveBtn = buttonContainer.createEl("button", {
      text: "Improve",
      cls: "primary-btn",
    });

    const cancelBtn = buttonContainer.createEl("button", {
      text: "Cancel",
      cls: "secondary-btn",
    });

    // Event listeners
    improveBtn.addEventListener("click", () => this.performImprovement());
    cancelBtn.addEventListener("click", () => this.close());
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  private async performImprovement(): Promise<void> {
    try {
      const result = await this.aiFeatures.improveText(
        this.originalText,
        this.improvementType as any
      );

      const resultModal = new ResultModal(this.app, "Improved Text", result);
      resultModal.open();

      this.close();
    } catch (error) {
      new Notice("❌ Error improving text");
    }
  }
}

/**
 * 📊 Analyze Content Modal
 */
class AnalyzeContentModal extends Modal {
  private aiFeatures: AIFeatures;
  private content: string;

  constructor(app: App, aiFeatures: AIFeatures, content: string) {
    super(app);
    this.aiFeatures = aiFeatures;
    this.content = content;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("analyze-content-modal");

    contentEl.createEl("h2", { text: "📊 Content Analysis" });

    // Content preview
    contentEl.createEl("h3", { text: "Content Preview:" });
    const previewEl = contentEl.createEl("div", {
      cls: "content-preview",
      text:
        this.content.substring(0, 200) +
        (this.content.length > 200 ? "..." : ""),
    });

    // Analyze button
    const analyzeBtn = contentEl.createEl("button", {
      text: "Analyze Content",
      cls: "primary-btn",
    });

    analyzeBtn.addEventListener("click", () => this.performAnalysis());
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  private async performAnalysis(): Promise<void> {
    try {
      const result = await this.aiFeatures.analyzeContent(this.content);
      const resultModal = new ResultModal(this.app, "Content Analysis", result);
      resultModal.open();
      this.close();
    } catch (error) {
      new Notice("❌ Error analyzing content");
    }
  }
}

/**
 * 💡 Generate Ideas Modal
 */
class GenerateIdeasModal extends Modal {
  private aiFeatures: AIFeatures;
  private topicInput: HTMLInputElement;
  private countInput: HTMLInputElement;

  constructor(app: App, aiFeatures: AIFeatures) {
    super(app);
    this.aiFeatures = aiFeatures;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("generate-ideas-modal");

    contentEl.createEl("h2", { text: "💡 Generate Ideas" });

    // Topic input
    contentEl.createEl("label", { text: "Topic:" });
    this.topicInput = contentEl.createEl("input", {
      type: "text",
      placeholder: "Enter topic for idea generation",
      cls: "topic-input",
    });

    // Count input
    contentEl.createEl("label", { text: "Number of ideas:" });
    this.countInput = contentEl.createEl("input", {
      type: "number",
      value: "5",
      min: "1",
      max: "20",
      cls: "count-input",
    });

    // Generate button
    const generateBtn = contentEl.createEl("button", {
      text: "Generate Ideas",
      cls: "primary-btn",
    });

    generateBtn.addEventListener("click", () => this.generateIdeas());
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  private async generateIdeas(): Promise<void> {
    const topic = this.topicInput.value.trim();
    const count = parseInt(this.countInput.value) || 5;

    if (!topic) {
      new Notice("❌ Please enter a topic");
      return;
    }

    try {
      const result = await this.aiFeatures.generateIdeas(topic, count);
      const resultModal = new ResultModal(this.app, "Generated Ideas", result);
      resultModal.open();
      this.close();
    } catch (error) {
      new Notice("❌ Error generating ideas");
    }
  }
}

/**
 * 🔍 Explain Code Modal
 */
class ExplainCodeModal extends Modal {
  private aiFeatures: AIFeatures;
  private code: string;
  private languageInput: HTMLInputElement;

  constructor(app: App, aiFeatures: AIFeatures, code: string) {
    super(app);
    this.aiFeatures = aiFeatures;
    this.code = code;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("explain-code-modal");

    contentEl.createEl("h2", { text: "🔍 Explain Code" });

    // Code preview
    contentEl.createEl("h3", { text: "Code:" });
    contentEl.createEl("pre", {
      cls: "code-preview",
      text: this.code,
    });

    // Language input
    contentEl.createEl("label", { text: "Language (optional):" });
    this.languageInput = contentEl.createEl("input", {
      type: "text",
      placeholder: "e.g., JavaScript, Python, TypeScript",
      cls: "language-input",
    });

    // Explain button
    const explainBtn = contentEl.createEl("button", {
      text: "Explain Code",
      cls: "primary-btn",
    });

    explainBtn.addEventListener("click", () => this.explainCode());
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  private async explainCode(): Promise<void> {
    try {
      const language = this.languageInput.value.trim();
      const result = await this.aiFeatures.explainCode(this.code, language);
      const resultModal = new ResultModal(this.app, "Code Explanation", result);
      resultModal.open();
      this.close();
    } catch (error) {
      new Notice("❌ Error explaining code");
    }
  }
}

/**
 * 🐛 Debug Code Modal
 */
class DebugCodeModal extends Modal {
  private aiFeatures: AIFeatures;
  private code: string;
  private languageInput: HTMLInputElement;

  constructor(app: App, aiFeatures: AIFeatures, code: string) {
    super(app);
    this.aiFeatures = aiFeatures;
    this.code = code;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("debug-code-modal");

    contentEl.createEl("h2", { text: "🐛 Debug Code" });

    // Code preview
    contentEl.createEl("h3", { text: "Code:" });
    contentEl.createEl("pre", {
      cls: "code-preview",
      text: this.code,
    });

    // Language input
    contentEl.createEl("label", { text: "Language (optional):" });
    this.languageInput = contentEl.createEl("input", {
      type: "text",
      placeholder: "e.g., JavaScript, Python, TypeScript",
      cls: "language-input",
    });

    // Debug button
    const debugBtn = contentEl.createEl("button", {
      text: "Debug Code",
      cls: "primary-btn",
    });

    debugBtn.addEventListener("click", () => this.debugCode());
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  private async debugCode(): Promise<void> {
    try {
      const language = this.languageInput.value.trim();
      const result = await this.aiFeatures.debugCode(this.code, language);
      const resultModal = new ResultModal(this.app, "Code Debug", result);
      resultModal.open();
      this.close();
    } catch (error) {
      new Notice("❌ Error debugging code");
    }
  }
}

/**
 * 🔧 Refactor Code Modal
 */
class RefactorCodeModal extends Modal {
  private aiFeatures: AIFeatures;
  private code: string;
  private languageInput: HTMLInputElement;

  constructor(app: App, aiFeatures: AIFeatures, code: string) {
    super(app);
    this.aiFeatures = aiFeatures;
    this.code = code;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("refactor-code-modal");

    contentEl.createEl("h2", { text: "🔧 Refactor Code" });

    // Code preview
    contentEl.createEl("h3", { text: "Original Code:" });
    contentEl.createEl("pre", {
      cls: "code-preview",
      text: this.code,
    });

    // Language input
    contentEl.createEl("label", { text: "Language (optional):" });
    this.languageInput = contentEl.createEl("input", {
      type: "text",
      placeholder: "e.g., JavaScript, Python, TypeScript",
      cls: "language-input",
    });

    // Refactor button
    const refactorBtn = contentEl.createEl("button", {
      text: "Refactor Code",
      cls: "primary-btn",
    });

    refactorBtn.addEventListener("click", () => this.refactorCode());
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  private async refactorCode(): Promise<void> {
    try {
      const language = this.languageInput.value.trim();
      const result = await this.aiFeatures.refactorCode(this.code, language);

      const resultModal = new ResultModal(this.app, "Refactored Code", result);
      resultModal.open();

      this.close();
    } catch (error) {
      new Notice("❌ Error refactoring code");
    }
  }
}

/**
 * 🧪 Generate Tests Modal
 */
class GenerateTestsModal extends Modal {
  private aiFeatures: AIFeatures;
  private code: string;
  private languageInput: HTMLInputElement;

  constructor(app: App, aiFeatures: AIFeatures, code: string) {
    super(app);
    this.aiFeatures = aiFeatures;
    this.code = code;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("generate-tests-modal");

    contentEl.createEl("h2", { text: "🧪 Generate Tests" });

    // Code preview
    contentEl.createEl("h3", { text: "Code:" });
    contentEl.createEl("pre", {
      cls: "code-preview",
      text: this.code,
    });

    // Language input
    contentEl.createEl("label", { text: "Language (optional):" });
    this.languageInput = contentEl.createEl("input", {
      type: "text",
      placeholder: "e.g., JavaScript, Python, TypeScript",
      cls: "language-input",
    });

    // Generate button
    const generateBtn = contentEl.createEl("button", {
      text: "Generate Tests",
      cls: "primary-btn",
    });

    generateBtn.addEventListener("click", () => this.generateTests());
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  private async generateTests(): Promise<void> {
    try {
      const language = this.languageInput.value.trim();
      const result = await this.aiFeatures.generateTests(this.code, language);
      const resultModal = new ResultModal(this.app, "Generated Tests", result);
      resultModal.open();
      this.close();
    } catch (error) {
      new Notice("❌ Error generating tests");
    }
  }
}

/**
 * 🚀 Code Completion Modal
 */
class CodeCompletionModal extends Modal {
  private aiFeatures: AIFeatures;
  private contextInput: HTMLTextAreaElement;

  constructor(app: App, aiFeatures: AIFeatures) {
    super(app);
    this.aiFeatures = aiFeatures;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("code-completion-modal");

    contentEl.createEl("h2", { text: "🚀 Code Completion" });

    // Context input
    contentEl.createEl("label", { text: "Describe what you want to code:" });
    this.contextInput = contentEl.createEl("textarea", {
      placeholder: "Describe the functionality you want to implement...",
      cls: "context-input",
    });

    // Generate button
    const generateBtn = contentEl.createEl("button", {
      text: "Generate Code",
      cls: "primary-btn",
    });

    generateBtn.addEventListener("click", () => this.generateCode());
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  private async generateCode(): Promise<void> {
    const context = this.contextInput.value.trim();
    if (!context) {
      new Notice("❌ Please describe what you want to code");
      return;
    }

    try {
      const result = await this.aiFeatures.chatWithAI(
        `Generate code for: ${context}. Please provide complete, working code with comments.`
      );
      const resultModal = new ResultModal(this.app, "Generated Code", result);
      resultModal.open();
      this.close();
    } catch (error) {
      new Notice("❌ Error generating code");
    }
  }
}

/**
 * 📄 Result Modal
 */
class ResultModal extends Modal {
  private title: string;
  private content: string;

  constructor(app: App, title: string, content: string) {
    super(app);
    this.title = title;
    this.content = content;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("result-modal");

    contentEl.createEl("h2", { text: this.title });

    const contentDiv = contentEl.createEl("div", { cls: "result-content" });
    contentDiv.innerHTML = this.content.replace(/\n/g, "<br>");

    const closeBtn = contentEl.createEl("button", {
      text: "Close",
      cls: "close-btn",
    });
    closeBtn.addEventListener("click", () => this.close());
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
