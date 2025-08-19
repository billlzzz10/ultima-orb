import { App, Modal, Editor, MarkdownView } from "obsidian";
import { UltimaOrbPlugin } from "../UltimaOrbPlugin";
import { AICommands, AICommand } from "../automation/AICommands";

export class CommandPalette extends Modal {
  plugin: UltimaOrbPlugin;
  aiCommands: AICommands;
  searchInput: HTMLInputElement;
  resultsContainer: HTMLElement;
  commands: AICommand[] = [];
  filteredCommands: AICommand[] = [];
  selectedIndex: number = 0;

  constructor(app: App, plugin: UltimaOrbPlugin) {
    super(app);
    this.plugin = plugin;
    this.aiCommands = new AICommands(plugin);
    this.commands = this.aiCommands.getCommands();
    this.filteredCommands = [...this.commands];
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("ultima-orb-command-palette");

    // Header
    const header = contentEl.createEl("div", { cls: "command-palette-header" });
    header.createEl("h2", {
      text: "🚀 Ultima-Orb Commands",
      cls: "command-palette-title",
    });

    // Search input
    this.searchInput = header.createEl("input", {
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

    // Focus on search input
    this.searchInput.focus();

    // Initial render
    this.renderCommands();
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  private filterCommands(): void {
    const searchTerm = this.searchInput.value.toLowerCase();

    if (searchTerm === "") {
      this.filteredCommands = [...this.commands];
    } else {
      this.filteredCommands = this.commands.filter(
        (cmd) =>
          cmd.name.toLowerCase().includes(searchTerm) ||
          cmd.description.toLowerCase().includes(searchTerm) ||
          cmd.category.toLowerCase().includes(searchTerm)
      );
    }

    this.selectedIndex = 0;
    this.renderCommands();
  }

  private renderCommands(): void {
    this.resultsContainer.empty();

    if (this.filteredCommands.length === 0) {
      this.resultsContainer.createEl("div", {
        text: "No commands found",
        cls: "no-commands-message",
      });
      return;
    }

    // Group commands by category
    const categories = this.groupCommandsByCategory();

    categories.forEach(({ category, commands }) => {
      // Category header
      const categoryHeader = this.resultsContainer.createEl("div", {
        cls: "command-category-header",
      });
      categoryHeader.createEl("h3", {
        text: this.getCategoryDisplayName(category),
        cls: "category-title",
      });

      // Commands in category
      commands.forEach((command, index) => {
        const commandEl = this.resultsContainer.createEl("div", {
          cls: `command-item ${this.selectedIndex === index ? "selected" : ""}`,
        });

        // Command icon and name
        const commandHeader = commandEl.createEl("div", {
          cls: "command-header",
        });
        commandHeader.createEl("span", {
          text: command.icon,
          cls: "command-icon",
        });
        commandHeader.createEl("span", {
          text: command.name,
          cls: "command-name",
        });

        // Shortcut
        if (command.shortcut) {
          commandHeader.createEl("span", {
            text: command.shortcut,
            cls: "command-shortcut",
          });
        }

        // Description
        commandEl.createEl("div", {
          text: command.description,
          cls: "command-description",
        });

        // Click handler
        commandEl.addEventListener("click", () => this.executeCommand(command));
      });
    });
  }

  private groupCommandsByCategory(): Array<{
    category: string;
    commands: AICommand[];
  }> {
    const categories = new Map<string, AICommand[]>();

    this.filteredCommands.forEach((command) => {
      if (!categories.has(command.category)) {
        categories.set(command.category, []);
      }
      categories.get(command.category)!.push(command);
    });

    return Array.from(categories.entries()).map(([category, commands]) => ({
      category,
      commands,
    }));
  }

  private getCategoryDisplayName(category: string): string {
    const displayNames: Record<string, string> = {
      writing: "✏️ Writing & Content",
      code: "💻 Code & Development",
      analysis: "📊 Analysis & Insights",
      creative: "🎨 Creative & Ideas",
      integration: "🔗 Integrations",
    };
    return displayNames[category] || category;
  }

  private handleKeydown(e: KeyboardEvent): void {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.selectedIndex = Math.min(
          this.selectedIndex + 1,
          this.filteredCommands.length - 1
        );
        this.renderCommands();
        break;
      case "ArrowUp":
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.renderCommands();
        break;
      case "Enter":
        e.preventDefault();
        if (this.filteredCommands[this.selectedIndex]) {
          this.executeCommand(this.filteredCommands[this.selectedIndex]);
        }
        break;
      case "Escape":
        this.close();
        break;
    }
  }

  private async executeCommand(command: AICommand): Promise<void> {
    try {
      const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (!activeView) {
        new Notice("Please open a markdown file to use this command");
        return;
      }

      const editor = activeView.editor;

      // Show loading state
      new Notice(`Executing: ${command.name}...`);

      // Execute command
      await command.execute(this.app, editor, this.plugin);

      // Close palette
      this.close();
    } catch (error) {
      new Notice(`Failed to execute command: ${error.message}`);
    }
  }

  // Public methods
  public open(): void {
    this.open();
  }

  public getCommands(): AICommand[] {
    return [...this.commands];
  }

  public getCommandsByCategory(category: string): AICommand[] {
    return this.commands.filter((cmd) => cmd.category === category);
  }
}

// Global command palette instance
let globalCommandPalette: CommandPalette | null = null;

export function openCommandPalette(app: App, plugin: UltimaOrbPlugin): void {
  if (globalCommandPalette) {
    globalCommandPalette.close();
  }

  globalCommandPalette = new CommandPalette(app, plugin);
  globalCommandPalette.open();
}

export function closeCommandPalette(): void {
  if (globalCommandPalette) {
    globalCommandPalette.close();
    globalCommandPalette = null;
  }
}
