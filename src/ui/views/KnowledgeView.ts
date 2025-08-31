import { ItemView, WorkspaceLeaf } from "obsidian";
import { AIOrchestrator } from "../../ai/AIOrchestrator";

export const KNOWLEDGE_VIEW_TYPE = "ultima-orb-knowledge";

export class KnowledgeView extends ItemView {
  private aiOrchestrator: AIOrchestrator;
  private knowledgeContainer!: HTMLElement;
  private searchInput!: HTMLInputElement;

  constructor(leaf: WorkspaceLeaf, aiOrchestrator: AIOrchestrator) {
    super(leaf);
    this.aiOrchestrator = aiOrchestrator;
  }

  getViewType(): string {
    return KNOWLEDGE_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Knowledge Base";
  }

  getIcon(): string {
    return "book-open";
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1] as HTMLElement;
    container.innerHTML = "";
    const heading = document.createElement("h4");
    heading.textContent = "Knowledge Base";
    container.appendChild(heading);

    this.createKnowledgeInterface(container);
  }

  private createKnowledgeInterface(container: HTMLElement): void {
    // Search section
    const searchSection = document.createElement("div");
    searchSection.className = "search-section";
    container.appendChild(searchSection);

    const searchHeading = document.createElement("h5");
    searchHeading.textContent = "Search Knowledge";
    searchSection.appendChild(searchHeading);

    this.searchInput = document.createElement("input");
    this.searchInput.type = "text";
    this.searchInput.placeholder = "Search knowledge base...";
    this.searchInput.className = "search-input";
    searchSection.appendChild(this.searchInput);

    const searchButton = document.createElement("button");
    searchButton.textContent = "Search";
    searchButton.addEventListener("click", () => this.searchKnowledge());
    searchSection.appendChild(searchButton);

    // Knowledge container
    this.knowledgeContainer = document.createElement("div");
    this.knowledgeContainer.className = "knowledge-container";
    container.appendChild(this.knowledgeContainer);
    
    // Add some sample knowledge items
    this.addKnowledgeItem("AI Basics", "Introduction to artificial intelligence concepts");
    this.addKnowledgeItem("Machine Learning", "Fundamentals of machine learning algorithms");
    this.addKnowledgeItem("Deep Learning", "Neural networks and deep learning techniques");
  }

  private addKnowledgeItem(title: string, description: string): void {
    const item = document.createElement("div");
    item.className = "knowledge-item";
    this.knowledgeContainer.appendChild(item);

    const titleEl = document.createElement("h6");
    titleEl.textContent = title;
    item.appendChild(titleEl);

    const descEl = document.createElement("p");
    descEl.textContent = description;
    item.appendChild(descEl);

    const viewButton = document.createElement("button");
    viewButton.textContent = "View";
    viewButton.addEventListener("click", () => this.viewKnowledge(title));
    item.appendChild(viewButton);
  }

  private async searchKnowledge(): Promise<void> {
    const query = this.searchInput.value.trim();
    if (!query) return;

    // TODO: implement search logic
  }

  private async viewKnowledge(title: string): Promise<void> {
    // TODO: implement view logic
  }

  async onClose(): Promise<void> {
    // Cleanup if needed
  }
}
