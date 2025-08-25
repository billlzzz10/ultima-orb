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
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl("h4", { text: "Knowledge Base" });

    this.createKnowledgeInterface(container as HTMLElement);
  }

  private createKnowledgeInterface(container: HTMLElement): void {
    // Search section
    const searchSection = container.createEl("div", { cls: "search-section" });
    searchSection.createEl("h5", { text: "Search Knowledge" });
    
    this.searchInput = searchSection.createEl("input", {
      type: "text",
      placeholder: "Search knowledge base...",
      cls: "search-input"
    });

    const searchButton = searchSection.createEl("button", { text: "Search" });
    searchButton.addEventListener("click", () => this.searchKnowledge());

    // Knowledge container
    this.knowledgeContainer = container.createEl("div", { cls: "knowledge-container" });
    
    // Add some sample knowledge items
    this.addKnowledgeItem("AI Basics", "Introduction to artificial intelligence concepts");
    this.addKnowledgeItem("Machine Learning", "Fundamentals of machine learning algorithms");
    this.addKnowledgeItem("Deep Learning", "Neural networks and deep learning techniques");
  }

  private addKnowledgeItem(title: string, description: string): void {
    const item = this.knowledgeContainer.createEl("div", { cls: "knowledge-item" });
    item.createEl("h6", { text: title });
    item.createEl("p", { text: description });
    
    const viewButton = item.createEl("button", { text: "View" });
    viewButton.addEventListener("click", () => this.viewKnowledge(title));
  }

  private async searchKnowledge(): Promise<void> {
    const query = this.searchInput.value.trim();
    if (!query) return;

    // Search logic here
    console.log("Searching for:", query);
  }

  private async viewKnowledge(title: string): Promise<void> {
    // View knowledge logic here
    console.log("Viewing knowledge:", title);
  }

  async onClose(): Promise<void> {
    // Cleanup if needed
  }
}
