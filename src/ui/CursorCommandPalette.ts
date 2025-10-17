import { App, Modal, Notice } from "obsidian";
import { CursorFeatures } from "../ai/CursorFeatures";

/**
 * 🚀 Cursor Command Palette - ฟีเจอร์ขั้นสูงจาก Cursor
 */
export class CursorCommandPalette extends Modal {
  private cursorFeatures: CursorFeatures;

  // UI Elements
  private searchInput!: HTMLInputElement;
  private commandList!: HTMLDivElement;
  contentEl!: HTMLElement;
  private selectedIndex: number = 0;
  private filteredCommands: CommandItem[] = [];

  constructor(app: App, cursorFeatures: CursorFeatures) {
    super(app);
    this.cursorFeatures = cursorFeatures;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("cursor-command-palette");

    // Header
    contentEl.createEl("h2", { text: "🚀 Cursor Command Palette" });
    contentEl.createEl("p", { text: "Plan • Search • Build • Anything" });

    // Search Input
    this.searchInput = contentEl.createEl("input", {
      type: "text",
      placeholder: "Search Cursor commands... (Plan, Search, Build, Anything)",
      cls: "cursor-search-input",
    });

    // Command List
    this.commandList = contentEl.createEl("div", {
      cls: "cursor-command-list",
    });

    // Event Listeners
    this.setupEventListeners();

    // Initialize commands
    this.filteredCommands = this.getAllCommands();
    this.renderCommands();

    // Focus search
    setTimeout(() => this.searchInput.focus(), 100);
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  /**
   * 🔧 Setup Event Listeners
   */
  private setupEventListeners(): void {
    // Search input
    this.searchInput.addEventListener("input", () => {
      this.filterCommands();
    });

    // Keyboard navigation
    this.searchInput.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          this.selectNext();
          break;
        case "ArrowUp":
          e.preventDefault();
          this.selectPrevious();
          break;
        case "Enter":
          e.preventDefault();
          this.executeSelectedCommand();
          break;
        case "Escape":
          this.close();
          break;
      }
    });
  }

  /**
   * 🔍 Filter Commands
   */
  private filterCommands(): void {
    const query = this.searchInput.value.toLowerCase();

    if (!query) {
      this.filteredCommands = this.getAllCommands();
    } else {
      this.filteredCommands = this.getAllCommands().filter(
        (command) =>
          command.name.toLowerCase().includes(query) ||
          command.description.toLowerCase().includes(query) ||
          command.category.toLowerCase().includes(query)
      );
    }

    this.selectedIndex = 0;
    this.renderCommands();
  }

  /**
   * 📋 Get All Commands
   */
  private getAllCommands(): CommandItem[] {
    return [
      // ===== PLAN FEATURES =====
      {
        id: "plan-task",
        name: "📋 Plan Task",
        description: "Create detailed project plan",
        category: "Plan",
        action: async () => {
          const task = await this.promptUser("Describe the task to plan:");
          if (task) {
            const result = await this.cursorFeatures.planTask(task);
            this.showResult("Project Plan", result);
          }
        },
      },

      // ===== BUILD FEATURES =====
      {
        id: "build-project",
        name: "🏗️ Build Project",
        description: "Generate complete project structure",
        category: "Build",
        action: async () => {
          const description = await this.promptUser(
            "Describe the project to build:"
          );
          if (description) {
            const language =
              (await this.promptUser(
                "Programming language (default: TypeScript):"
              )) || "TypeScript";
            const result = await this.cursorFeatures.buildProject(
              description,
              language
            );
            this.showResult("Project Build", result);
          }
        },
      },

      // ===== SEARCH FEATURES =====
      {
        id: "search-codebase",
        name: "🔍 Search Codebase",
        description: "Search for code patterns and solutions",
        category: "Search",
        action: async () => {
          const query = await this.promptUser("What are you searching for?");
          if (query) {
            const context = await this.promptUser("Context (optional):");
            const result = await this.cursorFeatures.searchCodebase(
              query,
              context
            );
            this.showResult("Codebase Search", result);
          }
        },
      },

      // ===== ANYTHING FEATURES =====
      {
        id: "do-anything",
        name: "🎯 Do Anything",
        description: "Advanced AI assistant for any task",
        category: "Anything",
        action: async () => {
          const request = await this.promptUser(
            "What would you like me to do?"
          );
          if (request) {
            const result = await this.cursorFeatures.doAnything(request);
            this.showResult("AI Assistant", result);
          }
        },
      },

      // ===== CODE REVIEW FEATURES =====
      {
        id: "review-code",
        name: "🔧 Review Code",
        description: "Comprehensive code review and analysis",
        category: "Code Quality",
        action: async () => {
          const code = await this.promptUser("Paste code to review:");
          if (code) {
            const language =
              (await this.promptUser("Language (default: TypeScript):")) ||
              "TypeScript";
            const result = await this.cursorFeatures.reviewCode(code, language);
            this.showResult("Code Review", result);
          }
        },
      },

      {
        id: "generate-tests",
        name: "🧪 Generate Tests",
        description: "Create comprehensive test suite",
        category: "Code Quality",
        action: async () => {
          const code = await this.promptUser("Paste code to test:");
          if (code) {
            const language =
              (await this.promptUser("Language (default: TypeScript):")) ||
              "TypeScript";
            const framework =
              (await this.promptUser("Framework (default: Jest):")) || "Jest";
            const result = await this.cursorFeatures.generateTests(
              code,
              language,
              framework
            );
            this.showResult("Generated Tests", result);
          }
        },
      },

      {
        id: "generate-docs",
        name: "📚 Generate Documentation",
        description: "Create comprehensive documentation",
        category: "Code Quality",
        action: async () => {
          const code = await this.promptUser("Paste code to document:");
          if (code) {
            const type =
              (await this.promptUser(
                "Documentation type (API/README/Inline):"
              )) || "README";
            const result = await this.cursorFeatures.generateDocumentation(
              code,
              type as any
            );
            this.showResult("Documentation", result);
          }
        },
      },

      // ===== REFACTORING FEATURES =====
      {
        id: "refactor-code",
        name: "🔄 Refactor Code",
        description: "Improve code structure and quality",
        category: "Refactoring",
        action: async () => {
          const code = await this.promptUser("Paste code to refactor:");
          if (code) {
            const goals = await this.promptUser(
              "Refactoring goals (comma-separated):"
            );
            const goalsList = goals
              ? goals.split(",").map((g) => g.trim())
              : ["improve readability"];
            const result = await this.cursorFeatures.refactorCode(
              code,
              goalsList
            );
            this.showResult("Refactored Code", result);
          }
        },
      },

      {
        id: "optimize-performance",
        name: "🚀 Optimize Performance",
        description: "Improve code performance",
        category: "Refactoring",
        action: async () => {
          const code = await this.promptUser("Paste code to optimize:");
          if (code) {
            const language =
              (await this.promptUser("Language (default: TypeScript):")) ||
              "TypeScript";
            const result = await this.cursorFeatures.optimizePerformance(
              code,
              language
            );
            this.showResult("Performance Optimization", result);
          }
        },
      },

      {
        id: "security-audit",
        name: "🔒 Security Audit",
        description: "Security analysis and recommendations",
        category: "Security",
        action: async () => {
          const code = await this.promptUser("Paste code for security audit:");
          if (code) {
            const language =
              (await this.promptUser("Language (default: TypeScript):")) ||
              "TypeScript";
            const result = await this.cursorFeatures.securityAudit(
              code,
              language
            );
            this.showResult("Security Audit", result);
          }
        },
      },

      {
        id: "improve-style",
        name: "🎨 Improve Code Style",
        description: "Enhance code formatting and style",
        category: "Code Quality",
        action: async () => {
          const code = await this.promptUser("Paste code to style:");
          if (code) {
            const language =
              (await this.promptUser("Language (default: TypeScript):")) ||
              "TypeScript";
            const style =
              (await this.promptUser("Style (default: modern):")) || "modern";
            const result = await this.cursorFeatures.improveCodeStyle(
              code,
              language,
              style
            );
            this.showResult("Improved Code Style", result);
          }
        },
      },

      // ===== INTEGRATION FEATURES =====
      {
        id: "create-integration",
        name: "🔗 Create Integration",
        description: "Build service integrations",
        category: "Integration",
        action: async () => {
          const service1 = await this.promptUser("First service:");
          if (service1) {
            const service2 = await this.promptUser("Second service:");
            if (service2) {
              const purpose = await this.promptUser("Integration purpose:");
              if (purpose) {
                const result = await this.cursorFeatures.createIntegration(
                  service1,
                  service2,
                  purpose
                );
                this.showResult("Integration Plan", result);
              }
            }
          }
        },
      },

      // ===== ANALYTICS FEATURES =====
      {
        id: "analyze-data",
        name: "📊 Analyze Data",
        description: "Data analysis and insights",
        category: "Analytics",
        action: async () => {
          const data = await this.promptUser("Paste data to analyze:");
          if (data) {
            const analysisType = await this.promptUser("Analysis type:");
            if (analysisType) {
              const result = await this.cursorFeatures.analyzeData(
                data,
                analysisType
              );
              this.showResult("Data Analysis", result);
            }
          }
        },
      },

      // ===== AI MODEL FEATURES =====
      {
        id: "train-ai-model",
        name: "🤖 Train AI Model",
        description: "Create AI model training plan",
        category: "AI/ML",
        action: async () => {
          const description = await this.promptUser("Model purpose:");
          if (description) {
            const dataType = await this.promptUser("Data type:");
            if (dataType) {
              const result = await this.cursorFeatures.trainAIModel(
                description,
                dataType
              );
              this.showResult("AI Model Training Plan", result);
            }
          }
        },
      },
    ];
  }

  /**
   * 🎨 Render Commands
   */
  private renderCommands(): void {
    this.commandList.empty();

    if (this.filteredCommands.length === 0) {
      this.commandList.createEl("div", {
        cls: "no-results",
        text: "No commands found",
      });
      return;
    }

    this.filteredCommands.forEach((command, index) => {
      const commandEl = this.commandList.createEl("div", {
        cls: `cursor-command-item ${
          index === this.selectedIndex ? "selected" : ""
        }`,
      });

      const headerEl = commandEl.createEl("div", { cls: "command-header" });
      headerEl.createEl("span", { text: command.name, cls: "command-name" });
      headerEl.createEl("span", {
        text: command.category,
        cls: "command-category",
      });

      commandEl.createEl("div", {
        text: command.description,
        cls: "command-description",
      });

      // Click handler
      commandEl.addEventListener("click", () => {
        this.selectedIndex = index;
        this.executeSelectedCommand();
      });

      // Hover handler
      commandEl.addEventListener("mouseenter", () => {
        this.selectedIndex = index;
        this.updateSelection();
      });
    });
  }

  /**
   * 🔄 Update Selection
   */
  private updateSelection(): void {
    const items = this.commandList.querySelectorAll(".cursor-command-item");
    items.forEach((item, index) => {
      item.classList.toggle("selected", index === this.selectedIndex);
    });
  }

  /**
   * ⬇️ Select Next
   */
  private selectNext(): void {
    this.selectedIndex = Math.min(
      this.selectedIndex + 1,
      this.filteredCommands.length - 1
    );
    this.updateSelection();
  }

  /**
   * ⬆️ Select Previous
   */
  private selectPrevious(): void {
    this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
    this.updateSelection();
  }

  /**
   * ⚡ Execute Selected Command
   */
  private async executeSelectedCommand(): Promise<void> {
    if (this.filteredCommands.length === 0) return;

    const command = this.filteredCommands[this.selectedIndex];
    if (!command) return;

    try {
      await command.action();
    } catch (error) {
      new Notice(`❌ Error executing ${command.name}: ${error}`);
    }
  }

  /**
   * 💬 Prompt User
   */
  private async promptUser(message: string): Promise<string> {
    return new Promise((resolve) => {
      const input = prompt(message);
      resolve(input || "");
    });
  }

  /**
   * 📄 Show Result
   */
  private showResult(title: string, content: string): void {
    const resultModal = new ResultModal(this.app, title, content);
    resultModal.open();
  }
}

/**
 * 📄 Result Modal
 */
class ResultModal extends Modal {
  private title: string;
  private content: string;
  contentEl!: HTMLElement;

  constructor(app: App, title: string, content: string) {
    super(app);
    this.title = title;
    this.content = content;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("cursor-result-modal");

    contentEl.createEl("h2", { text: this.title });

    const contentDiv = contentEl.createEl("div", { cls: "result-content" });
    contentDiv.innerText = this.content;

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

/**
 * 📋 Command Item Interface
 */
interface CommandItem {
  id: string;
  name: string;
  description: string;
  category: string;
  action: () => Promise<void>;
}
