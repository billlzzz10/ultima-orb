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
    const container = this.containerEl.children[1] as HTMLElement;
    container.innerHTML = "";
    const heading = document.createElement("h4");
    heading.textContent = "Tool Templates";
    container.appendChild(heading);

    this.createToolTemplateInterface(container);
  }

  private createToolTemplateInterface(container: HTMLElement): void {
    // Search and filter section
    const filterSection = document.createElement("div");
    filterSection.className = "filter-section";
    container.appendChild(filterSection);

    const filterHeading = document.createElement("h5");
    filterHeading.textContent = "Search & Filter";
    filterSection.appendChild(filterHeading);

    this.searchInput = document.createElement("input");
    this.searchInput.type = "text";
    this.searchInput.placeholder = "Search tools...";
    this.searchInput.className = "search-input";
    filterSection.appendChild(this.searchInput);

    this.categoryFilter = document.createElement("select");
    this.categoryFilter.className = "category-filter";
    filterSection.appendChild(this.categoryFilter);

    this.addOption(this.categoryFilter, "All Categories", "all");
    this.addOption(this.categoryFilter, "AI Tools", "ai");
    this.addOption(this.categoryFilter, "Integration Tools", "integration");
    this.addOption(this.categoryFilter, "Utility Tools", "utility");

    const searchButton = document.createElement("button");
    searchButton.textContent = "Search";
    searchButton.addEventListener("click", () => this.searchTools());
    filterSection.appendChild(searchButton);

    // Template container
    this.templateContainer = document.createElement("div");
    this.templateContainer.className = "template-container";
    container.appendChild(this.templateContainer);

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
    const template = document.createElement("div");
    template.className = "tool-template";
    this.templateContainer.appendChild(template);

    const nameEl = document.createElement("h6");
    nameEl.textContent = name;
    template.appendChild(nameEl);

    const categoryEl = document.createElement("span");
    categoryEl.textContent = category;
    categoryEl.className = "tool-category";
    template.appendChild(categoryEl);

    const descriptionEl = document.createElement("p");
    descriptionEl.textContent = description;
    template.appendChild(descriptionEl);

    const useButton = document.createElement("button");
    useButton.textContent = "Use Template";
    useButton.addEventListener("click", () => this.useToolTemplate(name));
    template.appendChild(useButton);
  }

  private async searchTools(): Promise<void> {
    const query = this.searchInput.value.trim();
    const category = this.categoryFilter.value;

    if (!query && category === "all") return;

    // TODO: implement search logic
  }

  private async useToolTemplate(name: string): Promise<void> {
    // TODO: implement template usage logic
  }

  async onClose(): Promise<void> {
    // Cleanup if needed
  }

  private addOption(select: HTMLSelectElement, text: string, value: string): void {
    const option = document.createElement("option");
    option.text = text;
    option.value = value;
    select.appendChild(option);
  }
}
