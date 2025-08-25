import { App, Modal, Notice } from "obsidian";
import { ToolDatabaseManager } from "../core/ToolDatabaseManager";
import { NotionDatabaseUpdater } from "../integrations/NotionDatabaseUpdater";

/**
 * 🛠️ Tool Database Dashboard - แสดงสถานะและจัดการ tools
 */
export class ToolDatabaseDashboard extends Modal {
  private toolManager: ToolDatabaseManager;
  private notionUpdater: NotionDatabaseUpdater;
  contentEl!: HTMLElement;

  constructor(
    app: App,
    toolManager: ToolDatabaseManager,
    notionUpdater: NotionDatabaseUpdater
  ) {
    super(app);
    this.toolManager = toolManager;
    this.notionUpdater = notionUpdater;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.addClass("tool-database-dashboard");

    // Header
    contentEl.createEl("h2", { text: "🛠️ Tool Database Dashboard" });
    contentEl.createEl("p", { text: "จัดการและติดตามความคืบหน้าของ tools" });

    // Progress Overview
    this.createProgressOverview(contentEl);

    // Tools List
    this.createToolsList(contentEl);

    // Actions
    this.createActions(contentEl);
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  /**
   * 📊 Create Progress Overview
   */
  private createProgressOverview(container: HTMLElement): void {
    const progress = this.toolManager.getProgressReport();

    const overviewSection = container.createEl("div", {
      cls: "progress-overview",
    });
    overviewSection.createEl("h3", { text: "📊 Progress Overview" });

    // Main Progress
    const mainProgress = overviewSection.createEl("div", {
      cls: "main-progress",
    });
    mainProgress.createEl("div", {
      text: `Overall Progress: ${progress.progress}%`,
      cls: "progress-percentage",
    });

    const progressBar = mainProgress.createEl("div", { cls: "progress-bar" });
    const progressFill = progressBar.createEl("div", {
      cls: "progress-fill",
    });
    progressFill.style.width = `${progress.progress}%`;

    // Stats Grid
    const statsGrid = overviewSection.createEl("div", { cls: "stats-grid" });

    const statItems = [
      { label: "Total Tools", value: progress.total, icon: "🛠️" },
      { label: "Completed", value: progress.completed, icon: "✅" },
      { label: "Pending", value: progress.pending, icon: "⏳" },
      { label: "Progress", value: `${progress.progress}%`, icon: "📈" },
    ];

    statItems.forEach((stat) => {
      const statCard = statsGrid.createEl("div", { cls: "stat-card" });
      statCard.createEl("div", { text: stat.icon, cls: "stat-icon" });
      statCard.createEl("div", {
        text: stat.value.toString(),
        cls: "stat-value",
      });
      statCard.createEl("div", { text: stat.label, cls: "stat-label" });
    });

    // Category Progress
    const categorySection = overviewSection.createEl("div", {
      cls: "category-progress",
    });
    categorySection.createEl("h4", { text: "Progress by Category" });

    progress.byCategory.forEach((category) => {
      const categoryItem = categorySection.createEl("div", {
        cls: "category-item",
      });
      categoryItem.createEl("span", {
        text: category.category,
        cls: "category-name",
      });
      categoryItem.createEl("span", {
        text: `${category.completed}/${category.total}`,
        cls: "category-stats",
      });
      categoryItem.createEl("span", {
        text: `${category.progress}%`,
        cls: "category-progress",
      });
    });
  }

  /**
   * 📋 Create Tools List
   */
  private createToolsList(container: HTMLElement): void {
    const tools = this.toolManager.getAllTools();

    const toolsSection = container.createEl("div", { cls: "tools-list" });
    toolsSection.createEl("h3", { text: "📋 Tools List" });

    // Filter Controls
    const filterControls = toolsSection.createEl("div", {
      cls: "filter-controls",
    });

    const statusFilter = filterControls.createEl("select", {
      cls: "status-filter",
    });
    statusFilter.createEl("option", { text: "All Status", value: "all" });
    statusFilter.createEl("option", { text: "Completed", value: "completed" });
    statusFilter.createEl("option", { text: "Pending", value: "pending" });
    statusFilter.createEl("option", {
      text: "In Progress",
      value: "in-progress",
    });

    const categoryFilter = filterControls.createEl("select", {
      cls: "category-filter",
    });
    categoryFilter.createEl("option", { text: "All Categories", value: "all" });
    const categories = [...new Set(tools.map((tool) => tool.category))];
    categories.forEach((category) => {
      categoryFilter.createEl("option", { text: category, value: category });
    });

    // Tools Grid
    const toolsGrid = toolsSection.createEl("div", { cls: "tools-grid" });

    tools.forEach((tool) => {
      const toolCard = toolsGrid.createEl("div", {
        cls: `tool-card ${tool.status}`,
      });

      // Tool Header
      const toolHeader = toolCard.createEl("div", { cls: "tool-header" });
      toolHeader.createEl("h4", { text: tool.name, cls: "tool-name" });

      const statusBadge = toolHeader.createEl("span", {
        text: tool.status,
        cls: `status-badge ${tool.status}`,
      });

      const priorityBadge = toolHeader.createEl("span", {
        text: tool.priority,
        cls: `priority-badge ${tool.priority}`,
      });

      // Tool Content
      const toolContent = toolCard.createEl("div", { cls: "tool-content" });
      toolContent.createEl("p", {
        text: tool.description,
        cls: "tool-description",
      });

      const categorySpan = toolContent.createEl("span", {
        text: `Category: ${tool.category}`,
        cls: "tool-category",
      });

      // Tool Features
      if (tool.features.length > 0) {
        const featuresList = toolContent.createEl("div", {
          cls: "tool-features",
        });
        featuresList.createEl("strong", { text: "Features:" });
        const featuresUl = featuresList.createEl("ul");
        tool.features.forEach((feature) => {
          featuresUl.createEl("li", { text: feature });
        });
      }

      // Tool Files
      if (tool.files.length > 0) {
        const filesList = toolContent.createEl("div", { cls: "tool-files" });
        filesList.createEl("strong", { text: "Files:" });
        const filesUl = filesList.createEl("ul");
        tool.files.forEach((file) => {
          filesUl.createEl("li", { text: file });
        });
      }

      // Tool Notes
      if (tool.notes) {
        toolContent.createEl("div", {
          text: tool.notes,
          cls: "tool-notes",
        });
      }

      // Tool Actions
      const toolActions = toolCard.createEl("div", { cls: "tool-actions" });

      if (tool.status === "pending") {
        const completeBtn = toolActions.createEl("button", {
          text: "✅ Mark Complete",
          cls: "action-btn complete-btn",
        });
        completeBtn.addEventListener("click", () => {
          this.toolManager.markToolCompleted(tool.id);
          this.refreshDashboard();
        });
      }

      const editBtn = toolActions.createEl("button", {
        text: "📝 Edit",
        cls: "action-btn edit-btn",
      });
      editBtn.addEventListener("click", () => {
        this.editTool(tool);
      });

      const viewBtn = toolActions.createEl("button", {
        text: "👁️ View",
        cls: "action-btn view-btn",
      });
      viewBtn.addEventListener("click", () => {
        this.viewToolDetails(tool);
      });
    });
  }

  /**
   * ⚙️ Create Actions
   */
  private createActions(container: HTMLElement): void {
    const actionsSection = container.createEl("div", {
      cls: "dashboard-actions",
    });
    actionsSection.createEl("h3", { text: "⚙️ Actions" });

    const actionsGrid = actionsSection.createEl("div", { cls: "actions-grid" });

    // Export Actions
    const exportActions = actionsGrid.createEl("div", { cls: "action-group" });
    exportActions.createEl("h4", { text: "Export" });

    const exportJsonBtn = exportActions.createEl("button", {
      text: "📤 Export to JSON",
      cls: "action-btn export-btn",
    });
    exportJsonBtn.addEventListener("click", () => {
      this.exportToolsToJson();
    });

    const exportNotionBtn = exportActions.createEl("button", {
      text: "📤 Export to Notion Format",
      cls: "action-btn export-btn",
    });
    exportNotionBtn.addEventListener("click", () => {
      this.exportToolsToNotionFormat();
    });

    // Notion Actions
    const notionActions = actionsGrid.createEl("div", { cls: "action-group" });
    notionActions.createEl("h4", { text: "Notion Integration" });

    const syncNotionBtn = notionActions.createEl("button", {
      text: "🔄 Sync with Notion",
      cls: "action-btn sync-btn",
    });
    syncNotionBtn.addEventListener("click", () => {
      this.syncWithNotion();
    });

    const updateNotionBtn = notionActions.createEl("button", {
      text: "📝 Update Notion Database",
      cls: "action-btn update-btn",
    });
    updateNotionBtn.addEventListener("click", () => {
      this.updateNotionDatabase();
    });

    // Management Actions
    const managementActions = actionsGrid.createEl("div", {
      cls: "action-group",
    });
    managementActions.createEl("h4", { text: "Management" });

    const saveBtn = managementActions.createEl("button", {
      text: "💾 Save to File",
      cls: "action-btn save-btn",
    });
    saveBtn.addEventListener("click", () => {
      this.saveToolsToFile();
    });

    const loadBtn = managementActions.createEl("button", {
      text: "📂 Load from File",
      cls: "action-btn load-btn",
    });
    loadBtn.addEventListener("click", () => {
      this.loadToolsFromFile();
    });

    const reportBtn = managementActions.createEl("button", {
      text: "📊 Generate Report",
      cls: "action-btn report-btn",
    });
    reportBtn.addEventListener("click", () => {
      this.generateReport();
    });
  }

  /**
   * 🔄 Refresh Dashboard
   */
  private refreshDashboard(): void {
    this.onClose();
    this.onOpen();
  }

  /**
   * 📝 Edit Tool
   */
  private editTool(tool: any): void {
    // TODO: สร้าง Edit Tool Modal
    new Notice(`📝 Edit tool: ${tool.name}`);
  }

  /**
   * 👁️ View Tool Details
   */
  private viewToolDetails(tool: any): void {
    // TODO: สร้าง Tool Details Modal
    new Notice(`👁️ View tool details: ${tool.name}`);
  }

  /**
   * 📤 Export Tools to JSON
   */
  private exportToolsToJson(): void {
    const jsonData = this.toolManager.exportTools();
    // TODO: สร้าง download หรือ copy to clipboard
    console.log("Export JSON:", jsonData);
    new Notice("📤 Tools exported to JSON");
  }

  /**
   * 📤 Export Tools to Notion Format
   */
  private exportToolsToNotionFormat(): void {
    const notionData = this.notionUpdater.exportToolsToNotionFormat();
    // TODO: สร้าง download หรือ copy to clipboard
    console.log("Export Notion Format:", notionData);
    new Notice("📤 Tools exported to Notion format");
  }

  /**
   * 🔄 Sync with Notion
   */
  private async syncWithNotion(): Promise<void> {
    await this.notionUpdater.syncToolsWithNotion();
  }

  /**
   * 📝 Update Notion Database
   */
  private async updateNotionDatabase(): Promise<void> {
    await this.notionUpdater.updateAllToolsInNotion();
  }

  /**
   * 💾 Save Tools to File
   */
  private async saveToolsToFile(): Promise<void> {
    await this.toolManager.saveToolsToFile();
  }

  /**
   * 📂 Load Tools from File
   */
  private async loadToolsFromFile(): Promise<void> {
    await this.toolManager.loadToolsFromFile();
    this.refreshDashboard();
  }

  /**
   * 📊 Generate Report
   */
  private generateReport(): void {
    const report = this.notionUpdater.generateNotionUpdateReport();
    // TODO: สร้าง download หรือ copy to clipboard
    console.log("Generate Report:", report);
    new Notice("📊 Report generated");
  }
}
