import { ItemView, WorkspaceLeaf, TFile, Notice, TFolder } from "obsidian";
import { UltimaOrbPlugin } from "../../UltimaOrbPlugin";

export const KNOWLEDGE_VIEW_TYPE = "ultima-orb-knowledge-view";

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export class KnowledgeView extends ItemView {
  plugin: UltimaOrbPlugin;
  knowledgeContainer: HTMLElement;
  searchInput: HTMLInputElement;
  knowledgeItems: KnowledgeItem[] = [];
  filteredItems: KnowledgeItem[] = [];

  constructor(leaf: WorkspaceLeaf, plugin: UltimaOrbPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return KNOWLEDGE_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Ultima-Orb Knowledge";
  }

  getIcon(): string {
    return "book-open";
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl("h4", { text: "📚 Knowledge Base" });

    // Create knowledge interface
    this.createKnowledgeInterface(container);

    // Load existing knowledge
    await this.loadKnowledge();
  }

  async onClose(): Promise<void> {
    // Save knowledge
    await this.saveKnowledge();
  }

  private createKnowledgeInterface(container: HTMLElement): void {
    // Header with search and add button
    const header = container.createEl("div", { cls: "knowledge-header" });

    // Search input
    this.searchInput = header.createEl("input", {
      type: "text",
      placeholder: "🔍 Search knowledge...",
      cls: "knowledge-search",
    });
    this.searchInput.addEventListener("input", () => this.filterKnowledge());

    // Add knowledge button
    const addButton = header.createEl("button", {
      text: "➕ Add Knowledge",
      cls: "add-knowledge-btn",
    });
    addButton.onclick = () => this.showAddKnowledgeModal();

    // Import from vault button
    const importButton = header.createEl("button", {
      text: "📁 Import from Vault",
      cls: "import-knowledge-btn",
    });
    importButton.onclick = () => this.importFromVault();

    // Knowledge items container
    this.knowledgeContainer = container.createEl("div", {
      cls: "knowledge-items",
    });
  }

  private async loadKnowledge(): Promise<void> {
    try {
      const savedKnowledge = await this.plugin.loadData();
      this.knowledgeItems = savedKnowledge?.knowledgeItems || [];
      this.filteredItems = [...this.knowledgeItems];
      this.renderKnowledgeItems();
    } catch (error) {
      console.error("Failed to load knowledge:", error);
      this.knowledgeItems = [];
      this.filteredItems = [];
    }
  }

  private async saveKnowledge(): Promise<void> {
    try {
      await this.plugin.saveData({ knowledgeItems: this.knowledgeItems });
    } catch (error) {
      console.error("Failed to save knowledge:", error);
    }
  }

  private renderKnowledgeItems(): void {
    this.knowledgeContainer.empty();

    if (this.filteredItems.length === 0) {
      this.knowledgeContainer.createEl("div", {
        text: "No knowledge items found. Add some knowledge to get started!",
        cls: "no-knowledge-message",
      });
      return;
    }

    this.filteredItems.forEach((item) => {
      this.createKnowledgeItemElement(item);
    });
  }

  private createKnowledgeItemElement(item: KnowledgeItem): void {
    const itemEl = this.knowledgeContainer.createEl("div", {
      cls: "knowledge-item",
    });

    // Header
    const header = itemEl.createEl("div", { cls: "knowledge-item-header" });

    const title = header.createEl("h5", {
      text: item.title,
      cls: "knowledge-item-title",
    });

    const actions = header.createEl("div", { cls: "knowledge-item-actions" });

    // Edit button
    const editBtn = actions.createEl("button", {
      text: "✏️",
      cls: "edit-knowledge-btn",
    });
    editBtn.onclick = () => this.editKnowledgeItem(item);

    // Delete button
    const deleteBtn = actions.createEl("button", {
      text: "🗑️",
      cls: "delete-knowledge-btn",
    });
    deleteBtn.onclick = () => this.deleteKnowledgeItem(item.id);

    // Content preview
    const content = itemEl.createEl("div", {
      text:
        item.content.substring(0, 200) +
        (item.content.length > 200 ? "..." : ""),
      cls: "knowledge-item-content",
    });

    // Tags
    if (item.tags.length > 0) {
      const tagsContainer = itemEl.createEl("div", {
        cls: "knowledge-item-tags",
      });
      item.tags.forEach((tag) => {
        tagsContainer.createEl("span", {
          text: `#${tag}`,
          cls: "knowledge-tag",
        });
      });
    }

    // Metadata
    const metadata = itemEl.createEl("div", { cls: "knowledge-item-metadata" });
    metadata.createEl("span", {
      text: `Source: ${item.source}`,
      cls: "knowledge-source",
    });
    metadata.createEl("span", {
      text: `Updated: ${item.updatedAt.toLocaleDateString()}`,
      cls: "knowledge-date",
    });
  }

  private showAddKnowledgeModal(): void {
    const modal = new (this.app as any).Modal(this.app);
    modal.titleEl.setText("Add New Knowledge");
    modal.containerEl.addClass("knowledge-modal");

    const content = modal.contentEl.createEl("div", {
      cls: "knowledge-modal-content",
    });

    // Title input
    const titleLabel = content.createEl("label", { text: "Title:" });
    const titleInput = content.createEl("input", {
      type: "text",
      placeholder: "Enter knowledge title...",
      cls: "knowledge-input",
    });

    // Content textarea
    const contentLabel = content.createEl("label", { text: "Content:" });
    const contentTextarea = content.createEl("textarea", {
      placeholder: "Enter knowledge content...",
      cls: "knowledge-textarea",
    });

    // Tags input
    const tagsLabel = content.createEl("label", {
      text: "Tags (comma-separated):",
    });
    const tagsInput = content.createEl("input", {
      type: "text",
      placeholder: "tag1, tag2, tag3",
      cls: "knowledge-input",
    });

    // Source input
    const sourceLabel = content.createEl("label", { text: "Source:" });
    const sourceInput = content.createEl("input", {
      type: "text",
      placeholder: "Where did this knowledge come from?",
      cls: "knowledge-input",
    });

    // Buttons
    const buttons = content.createEl("div", { cls: "knowledge-modal-buttons" });

    const saveBtn = buttons.createEl("button", {
      text: "Save",
      cls: "save-knowledge-btn",
    });
    saveBtn.onclick = () => {
      const title = titleInput.value.trim();
      const content = contentTextarea.value.trim();
      const tags = tagsInput.value
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);
      const source = sourceInput.value.trim();

      if (title && content) {
        this.addKnowledgeItem({
          id: Date.now().toString(),
          title,
          content,
          tags,
          source: source || "Manual Entry",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        modal.close();
        new Notice("Knowledge item added successfully!");
      } else {
        new Notice("Please fill in title and content!");
      }
    };

    const cancelBtn = buttons.createEl("button", {
      text: "Cancel",
      cls: "cancel-knowledge-btn",
    });
    cancelBtn.onclick = () => modal.close();

    modal.open();
  }

  private async importFromVault(): Promise<void> {
    const modal = new (this.app as any).Modal(this.app);
    modal.titleEl.setText("Import Knowledge from Vault");
    modal.containerEl.addClass("knowledge-modal");

    const content = modal.contentEl.createEl("div", {
      cls: "knowledge-modal-content",
    });

    // File selector
    const fileLabel = content.createEl("label", {
      text: "Select file to import:",
    });
    const fileSelect = content.createEl("select", {
      cls: "knowledge-file-select",
    });

    // Get all markdown files
    const files = this.app.vault.getMarkdownFiles();
    files.forEach((file) => {
      const option = fileSelect.createEl("option", {
        text: file.path,
        value: file.path,
      });
    });

    // Import button
    const importBtn = content.createEl("button", {
      text: "Import",
      cls: "import-file-btn",
    });
    importBtn.onclick = async () => {
      const selectedPath = fileSelect.value;
      if (selectedPath) {
        try {
          const file = this.app.vault.getAbstractFileByPath(selectedPath);
          if (file instanceof TFile) {
            const content = await this.app.vault.read(file);
            const title = file.basename;

            this.addKnowledgeItem({
              id: Date.now().toString(),
              title,
              content,
              tags: ["imported", "vault"],
              source: `Vault: ${file.path}`,
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            modal.close();
            new Notice(`Imported knowledge from ${title}!`);
          }
        } catch (error) {
          new Notice("Failed to import file!");
          console.error("Import error:", error);
        }
      }
    };

    modal.open();
  }

  private addKnowledgeItem(item: KnowledgeItem): void {
    this.knowledgeItems.push(item);
    this.filteredItems = [...this.knowledgeItems];
    this.renderKnowledgeItems();
    this.saveKnowledge();
  }

  private editKnowledgeItem(item: KnowledgeItem): void {
    // Similar to add modal but pre-filled with item data
    const modal = new (this.app as any).Modal(this.app);
    modal.titleEl.setText("Edit Knowledge");
    modal.containerEl.addClass("knowledge-modal");

    const content = modal.contentEl.createEl("div", {
      cls: "knowledge-modal-content",
    });

    // Pre-fill inputs with existing data
    const titleInput = content.createEl("input", {
      type: "text",
      value: item.title,
      cls: "knowledge-input",
    });

    const contentTextarea = content.createEl("textarea", {
      value: item.content,
      cls: "knowledge-textarea",
    });

    const tagsInput = content.createEl("input", {
      type: "text",
      value: item.tags.join(", "),
      cls: "knowledge-input",
    });

    const sourceInput = content.createEl("input", {
      type: "text",
      value: item.source,
      cls: "knowledge-input",
    });

    // Save button
    const saveBtn = content.createEl("button", {
      text: "Update",
      cls: "save-knowledge-btn",
    });
    saveBtn.onclick = () => {
      const title = titleInput.value.trim();
      const content = contentTextarea.value.trim();
      const tags = tagsInput.value
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);
      const source = sourceInput.value.trim();

      if (title && content) {
        item.title = title;
        item.content = content;
        item.tags = tags;
        item.source = source;
        item.updatedAt = new Date();

        this.filteredItems = [...this.knowledgeItems];
        this.renderKnowledgeItems();
        this.saveKnowledge();
        modal.close();
        new Notice("Knowledge item updated successfully!");
      }
    };

    modal.open();
  }

  private deleteKnowledgeItem(id: string): void {
    this.knowledgeItems = this.knowledgeItems.filter((item) => item.id !== id);
    this.filteredItems = [...this.knowledgeItems];
    this.renderKnowledgeItems();
    this.saveKnowledge();
    new Notice("Knowledge item deleted!");
  }

  private filterKnowledge(): void {
    const searchTerm = this.searchInput.value.toLowerCase();
    this.filteredItems = this.knowledgeItems.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.content.toLowerCase().includes(searchTerm) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    );
    this.renderKnowledgeItems();
  }

  // Public methods for external access
  public getKnowledgeItems(): KnowledgeItem[] {
    return [...this.knowledgeItems];
  }

  public searchKnowledge(query: string): KnowledgeItem[] {
    const searchTerm = query.toLowerCase();
    return this.knowledgeItems.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.content.toLowerCase().includes(searchTerm) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    );
  }

  public async addKnowledgeFromText(
    title: string,
    content: string,
    tags: string[] = []
  ): Promise<void> {
    const item: KnowledgeItem = {
      id: Date.now().toString(),
      title,
      content,
      tags,
      source: "AI Generated",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.addKnowledgeItem(item);
  }
}
