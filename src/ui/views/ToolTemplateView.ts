import { ItemView, WorkspaceLeaf } from "obsidian";
import { AIOrchestrator } from "../../ai/AIOrchestrator";

export const TOOL_TEMPLATE_VIEW_TYPE = "ultima-orb-tool-template";

export class ToolTemplateView extends ItemView {
  private aiOrchestrator: AIOrchestrator;
  private templateContainer!: HTMLElement;
  private searchInput!: HTMLInputElement;
  private categoryFilter!: HTMLSelectElement;

  constructor(leaf: WorkspaceLeaf, aiOrchestrator: AIOrchestrator) {
    super(leaf);
    this.aiOrchestrator = aiOrchestrator;
  }

  getViewType(): string {
    return TOOL_TEMPLATE_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Tool Templates";
  }

  getIcon(): string {
    return "wrench";
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    if (container) {
      container.empty();
      container.createEl("h4", { text: "Tool Templates" });
      this.createToolTemplateInterface(container as HTMLElement);
    }
  }

  private createToolTemplateInterface(container: HTMLElement): void {
    // Search and filter section
    const filterSection = container.createEl("div", { cls: "filter-section" });
    filterSection.createEl("h5", { text: "Search & Filter" });

    this.searchInput = filterSection.createEl("input", {
      type: "text",
      placeholder: "Search tools...",
      cls: "search-input",
    });

    this.categoryFilter = filterSection.createEl("select", {
      cls: "category-filter",
    });
    this.categoryFilter.createEl("option", {
      text: "All Categories",
      value: "all",
    });
    this.categoryFilter.createEl("option", { text: "AI Tools", value: "ai" });
    this.categoryFilter.createEl("option", {
      text: "Integration Tools",
      value: "integration",
    });
    this.categoryFilter.createEl("option", {
      text: "Utility Tools",
      value: "utility",
    });

    const searchButton = filterSection.createEl("button", { text: "Search" });
    searchButton.addEventListener("click", () => this.searchTools());

    // Template container
    this.templateContainer = container.createEl("div", {
      cls: "template-container",
    });

    // Add some sample tool templates
    this.addToolTemplate("AI Chat", "ai", "Interactive AI chat interface");
    this.addToolTemplate(
      "Code Generator",
      "ai",
      "Generate code from descriptions"
    );
    this.addToolTemplate("Notion Sync", "integration", "Sync data with Notion");
    this.addToolTemplate(
      "File Processor",
      "utility",
      "Process and analyze files"
    );
  }

  private addToolTemplate(
    name: string,
    category: string,
    description: string
  ): void {
    const template = this.templateContainer.createEl("div", {
      cls: "tool-template",
    });
    template.createEl("h6", { text: name });
    template.createEl("span", { text: category, cls: "tool-category" });
    template.createEl("p", { text: description });

    const useButton = template.createEl("button", { text: "Use Template" });
    useButton.addEventListener("click", () => this.useToolTemplate(name));
  }

  private async searchTools(): Promise<void> {
    const query = this.searchInput.value.trim();
    const category = this.categoryFilter.value;

    if (!query && category === "all") return;

    // Search logic here
    console.info("Searching tools:", { query, category });
  }

  private async useToolTemplate(name: string): Promise<void> {
    // Use template logic here
    console.info("Using tool template:", name);
  }

  async onClose(): Promise<void> {
    // Cleanup if needed
  }
}
