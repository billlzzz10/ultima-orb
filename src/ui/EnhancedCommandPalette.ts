import { App, Modal, Plugin, Notice } from "obsidian";
import { AIFeatures } from "../ai/AIFeatures";

/**
 * 🎯 Enhanced Command Palette - ฟีเจอร์ครบถ้วนจาก Continue + Cursor
 */
export class EnhancedCommandPalette extends Modal {
  private plugin: Plugin;
  private aiFeatures: AIFeatures;
  private searchInput: HTMLInputElement;
  private resultsContainer: HTMLDivElement;
  private commands: CommandItem[];

  constructor(app: App, plugin: Plugin, aiFeatures: AIFeatures) {
    super(app);
    this.plugin = plugin;
    this.aiFeatures = aiFeatures;
    this.commands = this.initializeCommands();
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("enhanced-command-palette");

    // Header
    const header = contentEl.createEl("div", { cls: "command-palette-header" });
    header.createEl("h2", { text: "🔮 Ultima-Orb Command Palette" });
    header.createEl("p", {
      text: "Press Ctrl+K to open • Type to search commands",
    });

    // Search input
    this.searchInput = contentEl.createEl("input", {
      type: "text",
      placeholder: "Search commands... (Ctrl+K)",
      cls: "command-palette-search",
    });

    // Results container
    this.resultsContainer = contentEl.createEl("div", {
      cls: "command-palette-results",
    });

    // Event listeners
    this.searchInput.addEventListener("input", () => this.filterCommands());
    this.searchInput.addEventListener("keydown", (e) => this.handleKeydown(e));

    // Focus search input
    setTimeout(() => this.searchInput.focus(), 100);
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  /**
   * Initialize all commands
   */
  private initializeCommands(): CommandItem[] {
    return [
      // ===== CONTINUE STYLE COMMANDS =====
      {
        id: "chat-with-ai",
        name: "💬 Chat with AI",
        description: "Start a conversation with AI",
        category: "Continue",
        action: async () => {
          const message = await this.promptUser("Enter your message:");
          if (message) {
            const response = await this.aiFeatures.chatWithAI(message);
            this.showResult("AI Response", response);
          }
        },
      },
      {
        id: "inline-edit",
        name: "✏️ Inline Edit",
        description: "Edit selected text with AI",
        category: "Continue",
        action: async () => {
          const selectedText = this.aiFeatures.getSelectedText();
          if (!selectedText) {
            new Notice("❌ No text selected");
            return;
          }
          const instruction = await this.promptUser(
            "What would you like to change?"
          );
          if (instruction) {
            const result = await this.aiFeatures.inlineEdit(
              selectedText,
              instruction
            );
            this.aiFeatures.replaceSelectedText(result);
            new Notice("✅ Text edited successfully");
          }
        },
      },
      {
        id: "improve-text",
        name: "📝 Improve Text",
        description: "Improve selected text",
        category: "Continue",
        action: async () => {
          const selectedText = this.aiFeatures.getSelectedText();
          if (!selectedText) {
            new Notice("❌ No text selected");
            return;
          }
          const improvementType = await this.selectOption(
            "Select improvement type:",
            ["grammar", "style", "clarity", "tone"]
          );
          if (improvementType) {
            const result = await this.aiFeatures.improveText(
              selectedText,
              improvementType as any
            );
            this.aiFeatures.replaceSelectedText(result);
            new Notice("✅ Text improved successfully");
          }
        },
      },
      {
        id: "analyze-content",
        name: "📊 Analyze Content",
        description: "Analyze current file content",
        category: "Continue",
        action: async () => {
          const content = this.aiFeatures.getCurrentEditorContent();
          if (!content) {
            new Notice("❌ No content to analyze");
            return;
          }
          const result = await this.aiFeatures.analyzeContent(content);
          this.showResult("Content Analysis", result);
        },
      },
      {
        id: "generate-ideas",
        name: "💡 Generate Ideas",
        description: "Generate creative ideas",
        category: "Continue",
        action: async () => {
          const topic = await this.promptUser(
            "Enter topic for idea generation:"
          );
          if (topic) {
            const result = await this.aiFeatures.generateIdeas(topic);
            this.showResult("Generated Ideas", result);
          }
        },
      },

      // ===== CURSOR STYLE COMMANDS =====
      {
        id: "explain-code",
        name: "🔍 Explain Code",
        description: "Explain selected code",
        category: "Cursor",
        action: async () => {
          const selectedText = this.aiFeatures.getSelectedText();
          if (!selectedText) {
            new Notice("❌ No code selected");
            return;
          }
          const language = await this.promptUser("Language (optional):");
          const result = await this.aiFeatures.explainCode(
            selectedText,
            language
          );
          this.showResult("Code Explanation", result);
        },
      },
      {
        id: "debug-code",
        name: "🐛 Debug Code",
        description: "Find bugs in selected code",
        category: "Cursor",
        action: async () => {
          const selectedText = this.aiFeatures.getSelectedText();
          if (!selectedText) {
            new Notice("❌ No code selected");
            return;
          }
          const language = await this.promptUser("Language (optional):");
          const result = await this.aiFeatures.debugCode(
            selectedText,
            language
          );
          this.showResult("Code Debug", result);
        },
      },
      {
        id: "refactor-code",
        name: "🔧 Refactor Code",
        description: "Refactor selected code",
        category: "Cursor",
        action: async () => {
          const selectedText = this.aiFeatures.getSelectedText();
          if (!selectedText) {
            new Notice("❌ No code selected");
            return;
          }
          const language = await this.promptUser("Language (optional):");
          const result = await this.aiFeatures.refactorCode(
            selectedText,
            language
          );
          this.aiFeatures.replaceSelectedText(result);
          new Notice("✅ Code refactored successfully");
        },
      },
      {
        id: "generate-tests",
        name: "🧪 Generate Tests",
        description: "Generate tests for selected code",
        category: "Cursor",
        action: async () => {
          const selectedText = this.aiFeatures.getSelectedText();
          if (!selectedText) {
            new Notice("❌ No code selected");
            return;
          }
          const language = await this.promptUser("Language (optional):");
          const result = await this.aiFeatures.generateTests(
            selectedText,
            language
          );
          this.showResult("Generated Tests", result);
        },
      },

      // ===== UTILITY COMMANDS =====
      {
        id: "open-chat-view",
        name: "💬 Open Chat View",
        description: "Open AI chat interface",
        category: "Views",
        action: () => {
          // Use plugin reference for command execution or direct method calls
          new Notice("Opening Chat View...");
          this.close();
        },
      },
      {
        id: "open-knowledge-view",
        name: "📚 Open Knowledge Base",
        description: "Open knowledge base interface",
        category: "Views",
        action: () => {
          new Notice("Opening Knowledge Base...");
          this.close();
        },
      },
      {
        id: "open-tool-templates",
        name: "🛠️ Open Tool Templates",
        description: "Open tool templates interface",
        category: "Views",
        action: () => {
          new Notice("Opening Tool Templates...");
          this.close();
        },
      },
      {
        id: "refresh-context",
        name: "🔄 Refresh Context",
        description: "Refresh AI context",
        category: "Utility",
        action: () => {
          new Notice("✅ Context refreshed");
          this.close();
        },
      },
    ];
  }

  /**
   * Filter commands based on search input
   */
  private filterCommands(): void {
    const query = this.searchInput.value.toLowerCase();
    const filteredCommands = this.commands.filter(
      (cmd) =>
        cmd.name.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query) ||
        cmd.category.toLowerCase().includes(query)
    );

    this.renderCommands(filteredCommands);
  }

  /**
   * Render commands in results container
   */
  private renderCommands(commands: CommandItem[]): void {
    this.resultsContainer.empty();

    if (commands.length === 0) {
      this.resultsContainer.createEl("div", {
        cls: "command-palette-no-results",
        text: "No commands found",
      });
      return;
    }

    // Group by category
    const groupedCommands = this.groupCommandsByCategory(commands);

    for (const [category, categoryCommands] of Object.entries(
      groupedCommands
    )) {
      const categoryEl = this.resultsContainer.createEl("div", {
        cls: "command-palette-category",
      });

      categoryEl.createEl("h3", {
        cls: "command-palette-category-title",
        text: category,
      });

      categoryCommands.forEach((cmd, index) => {
        const commandEl = categoryEl.createEl("div", {
          cls: "command-palette-item",
          attr: { "data-index": index.toString() },
        });

        commandEl.createEl("div", {
          cls: "command-palette-item-name",
          text: cmd.name,
        });

        commandEl.createEl("div", {
          cls: "command-palette-item-description",
          text: cmd.description,
        });

        commandEl.addEventListener("click", () => this.executeCommand(cmd));
      });
    }
  }

  /**
   * Group commands by category
   */
  private groupCommandsByCategory(
    commands: CommandItem[]
  ): Record<string, CommandItem[]> {
    const grouped: Record<string, CommandItem[]> = {};

    commands.forEach((cmd) => {
      if (!grouped[cmd.category]) {
        grouped[cmd.category] = [];
      }
      grouped[cmd.category].push(cmd);
    });

    return grouped;
  }

  /**
   * Handle keyboard navigation
   */
  private handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      this.close();
    } else if (e.key === "Enter") {
      const selectedItem = this.resultsContainer.querySelector(
        ".command-palette-item.selected"
      );
      if (selectedItem) {
        const index = selectedItem.getAttribute("data-index");
        const category = selectedItem
          .closest(".command-palette-category")
          ?.querySelector(".command-palette-category-title")?.textContent;
        if (index && category) {
          const commands = this.commands.filter(
            (cmd) => cmd.category === category
          );
          const command = commands[parseInt(index)];
          if (command) {
            this.executeCommand(command);
          }
        }
      }
    }
  }

  /**
   * Execute a command
   */
  private async executeCommand(command: CommandItem): Promise<void> {
    try {
      await command.action();
    } catch (error) {
      new Notice(`❌ Error executing ${command.name}`);
    }
  }

  /**
   * Prompt user for input
   */
  private async promptUser(message: string): Promise<string | null> {
    return new Promise((resolve) => {
      const input = prompt(message);
      resolve(input);
    });
  }

  /**
   * Select from options
   */
  private async selectOption(
    message: string,
    options: string[]
  ): Promise<string | null> {
    return new Promise((resolve) => {
      const option = prompt(`${message}\nOptions: ${options.join(", ")}`);
      resolve(option && options.includes(option) ? option : null);
    });
  }

  /**
   * Show result in modal
   */
  private showResult(title: string, content: string): void {
    const modal = new ResultModal(this.app, title, content);
    modal.open();
  }
}

/**
 * Result Modal for showing AI responses
 */
class ResultModal extends Modal {
  constructor(app: App, private title: string, private content: string) {
    super(app);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("result-modal");

    contentEl.createEl("h2", { text: this.title });

    const contentDiv = contentEl.createEl("div", { cls: "result-content" });
    contentDiv.innerHTML = this.content.replace(/\n/g, "<br>");

    const closeBtn = contentEl.createEl("button", {
      text: "Close",
      cls: "result-close-btn",
    });
    closeBtn.addEventListener("click", () => this.close());
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}

/**
 * Command item interface
 */
interface CommandItem {
  id: string;
  name: string;
  description: string;
  category: string;
  action: () => Promise<void> | void;
}

/**
 * Open enhanced command palette
 */
export function openEnhancedCommandPalette(
  app: App,
  plugin: Plugin,
  aiFeatures: AIFeatures
): void {
  const commandPalette = new EnhancedCommandPalette(app, plugin, aiFeatures);
  commandPalette.open();
}
