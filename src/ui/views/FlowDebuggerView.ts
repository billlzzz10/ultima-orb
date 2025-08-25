import { ItemView, WorkspaceLeaf } from "obsidian";
import { ContextStore } from "../../core/context/ContextStore";
import { ToolRegistry } from "../../tools/ToolRegistry";
import { ModeSystem } from "../../ai/ModeSystem";

/**
 * 🧭 Flow Debugger View - Visualize Agent Orchestration และ Context Propagation
 */
export class FlowDebuggerView extends ItemView {
  public static readonly VIEW_TYPE = "ultima-orb-flow-debugger";
  public static readonly VIEW_TITLE = "Flow Debugger";

  private app: App;
  private contextStore: ContextStore;
  private toolRegistry: ToolRegistry;
  private modeSystem: ModeSystem;
  private container: HTMLElement;
  private mermaidContainer: HTMLElement;
  private statsContainer: HTMLElement;
  private refreshInterval: NodeJS.Timeout | null = null;

  constructor(
    leaf: WorkspaceLeaf,
    app: App,
    contextStore: ContextStore,
    toolRegistry: ToolRegistry,
    modeSystem: ModeSystem
  ) {
    super(leaf);
    this.app = app;
    this.contextStore = contextStore;
    this.toolRegistry = toolRegistry;
    this.modeSystem = modeSystem;
  }

  /**
   * 📋 รับ View Type
   */
  getViewType(): string {
    return FlowDebuggerView.VIEW_TYPE;
  }

  /**
   * 📝 รับ Display Text
   */
  getDisplayText(): string {
    return FlowDebuggerView.VIEW_TITLE;
  }

  /**
   * 🔧 รับ Icon
   */
  getIcon(): string {
    return "bug";
  }

  /**
   * 🎨 สร้าง UI
   */
  async onOpen(): Promise<void> {
    this.container = this.containerEl.children[1] as HTMLElement;
    this.container.empty();
    this.container.addClass("ultima-orb-flow-debugger");

    // สร้าง Header
    this.createHeader();

    // สร้าง Main Content
    this.createMainContent();

    // เริ่ม Auto Refresh
    this.startAutoRefresh();
  }

  /**
   * 🚪 ปิด View
   */
  async onClose(): Promise<void> {
    this.stopAutoRefresh();
  }

  /**
   * 🎨 สร้าง Header
   */
  private createHeader(): void {
    const header = this.container.createDiv("ultima-orb-flow-debugger-header");

    // Title
    const title = header.createEl("h2", { text: "🧭 Flow Debugger" });

    // Controls
    const controls = header.createDiv("ultima-orb-flow-debugger-controls");

    // Refresh Button
    const refreshBtn = controls.createEl("button", {
      text: "🔄 Refresh",
      cls: "ultima-orb-btn ultima-orb-btn-primary",
    });
    refreshBtn.addEventListener("click", () => this.refreshView());

    // Auto Refresh Toggle
    const autoRefreshToggle = controls.createEl("button", {
      text: "⏸️ Pause Auto Refresh",
      cls: "ultima-orb-btn ultima-orb-btn-secondary",
    });
    autoRefreshToggle.addEventListener("click", () =>
      this.toggleAutoRefresh(autoRefreshToggle)
    );

    // Export Button
    const exportBtn = controls.createEl("button", {
      text: "📤 Export",
      cls: "ultima-orb-btn ultima-orb-btn-secondary",
    });
    exportBtn.addEventListener("click", () => this.exportDebugData());
  }

  /**
   * 🎨 สร้าง Main Content
   */
  private createMainContent(): void {
    const mainContent = this.container.createDiv(
      "ultima-orb-flow-debugger-main"
    );

    // สร้าง Tabs
    const tabs = mainContent.createDiv("ultima-orb-flow-debugger-tabs");

    // Flow Diagram Tab
    const flowTab = tabs.createEl("button", {
      text: "🔀 Flow Diagram",
      cls: "ultima-orb-tab active",
    });

    // Context Map Tab
    const contextTab = tabs.createEl("button", {
      text: "🧠 Context Map",
      cls: "ultima-orb-tab",
    });

    // Tool Stats Tab
    const statsTab = tabs.createEl("button", {
      text: "📊 Tool Stats",
      cls: "ultima-orb-tab",
    });

    // สร้าง Content Areas
    const contentArea = mainContent.createDiv(
      "ultima-orb-flow-debugger-content"
    );

    // Flow Diagram Container
    this.mermaidContainer = contentArea.createDiv("ultima-orb-flow-diagram");
    this.mermaidContainer.style.display = "block";

    // Context Map Container
    const contextContainer = contentArea.createDiv("ultima-orb-context-map");
    contextContainer.style.display = "none";

    // Stats Container
    this.statsContainer = contentArea.createDiv("ultima-orb-tool-stats");
    this.statsContainer.style.display = "none";

    // Tab Event Listeners
    flowTab.addEventListener("click", () => {
      this.showTab("flow", flowTab, contextTab, statsTab);
      this.mermaidContainer.style.display = "block";
      contextContainer.style.display = "none";
      this.statsContainer.style.display = "none";
      this.renderFlowDiagram();
    });

    contextTab.addEventListener("click", () => {
      this.showTab("context", flowTab, contextTab, statsTab);
      this.mermaidContainer.style.display = "none";
      contextContainer.style.display = "block";
      this.statsContainer.style.display = "none";
      this.renderContextMap(contextContainer);
    });

    statsTab.addEventListener("click", () => {
      this.showTab("stats", flowTab, contextTab, statsTab);
      this.mermaidContainer.style.display = "none";
      contextContainer.style.display = "none";
      this.statsContainer.style.display = "block";
      this.renderToolStats();
    });

    // แสดง Flow Diagram เป็นค่าเริ่มต้น
    this.renderFlowDiagram();
  }

  /**
   * 🔄 Refresh View
   */
  private refreshView(): void {
    this.renderFlowDiagram();
    this.renderToolStats();
    new Notice("🔄 Flow Debugger refreshed");
  }

  /**
   * ⏸️ Toggle Auto Refresh
   */
  private toggleAutoRefresh(button: HTMLButtonElement): void {
    if (this.refreshInterval) {
      this.stopAutoRefresh();
      button.setText("▶️ Start Auto Refresh");
      button.removeClass("ultima-orb-btn-warning");
      button.addClass("ultima-orb-btn-success");
    } else {
      this.startAutoRefresh();
      button.setText("⏸️ Pause Auto Refresh");
      button.removeClass("ultima-orb-btn-success");
      button.addClass("ultima-orb-btn-warning");
    }
  }

  /**
   * ▶️ Start Auto Refresh
   */
  private startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      this.refreshView();
    }, 5000); // Refresh ทุก 5 วินาที
  }

  /**
   * ⏸️ Stop Auto Refresh
   */
  private stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * 📤 Export Debug Data
   */
  private exportDebugData(): void {
    const debugData = {
      timestamp: new Date().toISOString(),
      contextStore: this.contextStore.exportState(),
      toolStats: this.toolRegistry.getToolStats(),
      modeSystem: {
        activeMode: this.modeSystem.getActiveMode(),
        allModes: this.modeSystem.getAllModes(),
      },
      auditTrail: this.contextStore.getAuditTrail(100),
    };

    const dataStr = JSON.stringify(debugData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `ultima-orb-debug-${Date.now()}.json`;
    link.click();

    new Notice("📤 Debug data exported");
  }

  /**
   * 🔀 Render Flow Diagram
   */
  private renderFlowDiagram(): void {
    this.mermaidContainer.empty();

    const mermaidCode = this.generateMermaidFlowDiagram();

    // สร้าง Mermaid Diagram
    const diagramContainer = this.mermaidContainer.createDiv("mermaid");
    diagramContainer.textContent = mermaidCode;

    // Render Mermaid (ถ้ามี)
    if (typeof (window as any).mermaid !== "undefined") {
      (window as any).mermaid.init();
    } else {
      // Fallback: แสดงเป็น text
      const fallbackContainer = this.mermaidContainer.createDiv(
        "ultima-orb-mermaid-fallback"
      );
      fallbackContainer.innerHTML = `<pre>${mermaidCode}</pre>`;
    }
  }

  /**
   * 🧠 Render Context Map
   */
  private renderContextMap(container: HTMLElement): void {
    container.empty();

    const stats = this.contextStore.getStats();
    const contexts = this.contextStore.searchContexts({ limit: 50 });

    // Context Stats
    const statsSection = container.createDiv("ultima-orb-context-stats");
    statsSection.innerHTML = `
      <h3>📊 Context Statistics</h3>
      <div class="ultima-orb-stats-grid">
        <div class="ultima-orb-stat-item">
          <span class="ultima-orb-stat-label">Total Contexts:</span>
          <span class="ultima-orb-stat-value">${stats.totalContexts}</span>
        </div>
        <div class="ultima-orb-stat-item">
          <span class="ultima-orb-stat-label">Active Contexts:</span>
          <span class="ultima-orb-stat-value">${stats.activeContexts}</span>
        </div>
        <div class="ultima-orb-stat-item">
          <span class="ultima-orb-stat-label">Expired Contexts:</span>
          <span class="ultima-orb-stat-value">${stats.expiredContexts}</span>
        </div>
        <div class="ultima-orb-stat-item">
          <span class="ultima-orb-stat-label">Session Active:</span>
          <span class="ultima-orb-stat-value">${
            stats.sessionContext ? "Yes" : "No"
          }</span>
        </div>
      </div>
    `;

    // Context List
    const contextList = container.createDiv("ultima-orb-context-list");
    contextList.innerHTML = "<h3>🧠 Active Contexts</h3>";

    contexts.forEach((context) => {
      const contextItem = contextList.createDiv("ultima-orb-context-item");
      contextItem.innerHTML = `
        <div class="ultima-orb-context-header">
          <span class="ultima-orb-context-id">${context.id}</span>
          <span class="ultima-orb-context-scope">${context.scope}</span>
          <span class="ultima-orb-context-source">${context.source}</span>
          <span class="ultima-orb-context-priority">${context.priority}</span>
        </div>
        <div class="ultima-orb-context-payload">
          <pre>${JSON.stringify(context.payload, null, 2)}</pre>
        </div>
        <div class="ultima-orb-context-meta">
          <span>Created: ${new Date(context.createdAt).toLocaleString()}</span>
          ${
            context.expiresAt
              ? `<span>Expires: ${new Date(
                  context.expiresAt
                ).toLocaleString()}</span>`
              : ""
          }
        </div>
      `;
    });
  }

  /**
   * 📊 Render Tool Stats
   */
  private renderToolStats(): void {
    this.statsContainer.empty();

    const stats = this.toolRegistry.getToolStats();
    const tools = this.toolRegistry.getAllTools();

    // Tool Statistics
    const statsSection = this.statsContainer.createDiv(
      "ultima-orb-tool-stats-section"
    );
    statsSection.innerHTML = `
      <h3>📊 Tool Statistics</h3>
      <div class="ultima-orb-stats-grid">
        <div class="ultima-orb-stat-item">
          <span class="ultima-orb-stat-label">Total Tools:</span>
          <span class="ultima-orb-stat-value">${stats.totalTools}</span>
        </div>
        <div class="ultima-orb-stat-item">
          <span class="ultima-orb-stat-label">Enabled Tools:</span>
          <span class="ultima-orb-stat-value">${stats.enabledTools}</span>
        </div>
        <div class="ultima-orb-stat-item">
          <span class="ultima-orb-stat-label">Total Executions:</span>
          <span class="ultima-orb-stat-value">${stats.totalExecutions}</span>
        </div>
        <div class="ultima-orb-stat-item">
          <span class="ultima-orb-stat-label">Last Execution:</span>
          <span class="ultima-orb-stat-value">${
            stats.lastExecution
              ? new Date(stats.lastExecution).toLocaleString()
              : "Never"
          }</span>
        </div>
      </div>
    `;

    // Tool List
    const toolList = this.statsContainer.createDiv("ultima-orb-tool-list");
    toolList.innerHTML = "<h3>🛠️ Available Tools</h3>";

    tools.forEach((tool) => {
      const toolItem = toolList.createDiv("ultima-orb-tool-item");
      toolItem.innerHTML = `
        <div class="ultima-orb-tool-header">
          <span class="ultima-orb-tool-id">${tool.id}</span>
          <span class="ultima-orb-tool-type">${tool.type}</span>
          <span class="ultima-orb-tool-status">${
            tool.enabled ? "✅ Enabled" : "❌ Disabled"
          }</span>
        </div>
        <div class="ultima-orb-tool-description">${
          tool.description || "No description"
        }</div>
        <div class="ultima-orb-tool-tags">
          ${
            tool.tags
              ?.map((tag) => `<span class="ultima-orb-tag">${tag}</span>`)
              .join("") || ""
          }
        </div>
      `;
    });
  }

  /**
   * 🔀 Generate Mermaid Flow Diagram
   */
  private generateMermaidFlowDiagram(): string {
    const activeMode = this.modeSystem.getActiveMode();
    const activeTools = this.modeSystem.getActiveTools();
    const contextStats = this.contextStore.getStats();

    return `
graph TD
    %% User Input
    A[👤 User Input] --> B[🧠 Context Store]
    
    %% Context Processing
    B --> C{📊 Context Available?}
    C -->|Yes| D[🔍 Context Search]
    C -->|No| E[🆕 Create Context]
    
    %% Mode System
    D --> F[🎯 Mode System]
    E --> F
    F --> G[🎭 Active Mode: ${activeMode?.id || "None"}]
    
    %% Tool Selection
    G --> H[🛠️ Tool Registry]
    H --> I{🔧 Tools Available?}
    I -->|Yes| J[📋 Available Tools: ${activeTools.length}]
    I -->|No| K[⚠️ No Tools Available]
    
    %% AI Processing
    J --> L[🤖 AI Orchestrator]
    K --> L
    L --> M[💬 Generate Response]
    
    %% Output
    M --> N[📤 Response Output]
    M --> O[📝 Update Context]
    
    %% Audit Trail
    O --> P[📋 Audit Trail]
    P --> Q[💾 Save State]
    
    %% Styling
    classDef userNode fill:#e1f5fe
    classDef contextNode fill:#f3e5f5
    classDef modeNode fill:#e8f5e8
    classDef toolNode fill:#fff3e0
    classDef aiNode fill:#fce4ec
    classDef outputNode fill:#f1f8e9
    
    class A userNode
    class B,C,D,E contextNode
    class F,G modeNode
    class H,I,J,K toolNode
    class L,M aiNode
    class N,O,P,Q outputNode
    `;
  }

  /**
   * 📑 Show Tab
   */
  private showTab(activeTab: string, ...tabs: HTMLButtonElement[]): void {
    tabs.forEach((tab) => {
      tab.removeClass("active");
    });

    const activeButton = tabs.find((tab) =>
      tab.textContent?.toLowerCase().includes(activeTab)
    );
    if (activeButton) {
      activeButton.addClass("active");
    }
  }
}
