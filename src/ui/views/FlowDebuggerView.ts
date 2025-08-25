import { ItemView, WorkspaceLeaf } from "obsidian";
import { ContextStore } from "../../core/context/ContextStore";
import { ToolRegistry } from "../../tools/ToolRegistry";
import { ModeSystem } from "../../ai/ModeSystem";

/**
 * 🧭 Flow Debugger View - Visualize Agent Orchestration และ Context Propagation
 */
export class FlowDebuggerView extends ItemView {
  private contextStore: ContextStore;
  private toolRegistry: ToolRegistry;
  private modeSystem: ModeSystem;
  private container!: HTMLElement;
  private mermaidContainer!: HTMLElement;
  private statsContainer!: HTMLElement;
  private autoRefreshInterval?: number;

  constructor(
    leaf: WorkspaceLeaf,
    contextStore: ContextStore,
    toolRegistry: ToolRegistry,
    modeSystem: ModeSystem
  ) {
    super(leaf);
    this.contextStore = contextStore;
    this.toolRegistry = toolRegistry;
    this.modeSystem = modeSystem;
  }

  getViewType(): string {
    return "ultima-orb-flow-debugger";
  }

  getDisplayText(): string {
    return "Flow Debugger";
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl("h4", { text: "Ultima-Orb Flow Debugger" });
    
    this.createMainContent(container as HTMLElement);
    this.startAutoRefresh();
  }

  async onClose(): Promise<void> {
    this.stopAutoRefresh();
  }

  private createMainContent(container: HTMLElement): void {
    // Create header with controls
    this.createHeader(container);
    
    // Create main content area
    this.container = container.createEl("div", { cls: "ultima-orb-flow-debugger-main" });
    
    // Create tabs
    this.createTabs();
  }

  private createHeader(container: HTMLElement): void {
    const header = container.createEl("div", { cls: "ultima-orb-flow-debugger-header" });
    
    // Refresh button
    const refreshBtn = header.createEl("button", { text: "Refresh", cls: "ultima-orb-btn" });
    refreshBtn.addEventListener("click", () => this.refreshData());
    
    // Auto-refresh toggle
    const autoRefreshBtn = header.createEl("button", { text: "Auto Refresh: ON", cls: "ultima-orb-btn" });
    autoRefreshBtn.addEventListener("click", () => this.toggleAutoRefresh());
    
    // Export button
    const exportBtn = header.createEl("button", { text: "Export", cls: "ultima-orb-btn" });
    exportBtn.addEventListener("click", () => this.exportDebugData());
  }

  private createTabs(): void {
    const tabContainer = this.container.createEl("div", { cls: "ultima-orb-tab-container" });
    
    // Tab buttons
    const flowTab = tabContainer.createEl("button", { text: "Flow Diagram", cls: "ultima-orb-tab-btn active" });
    const contextTab = tabContainer.createEl("button", { text: "Context Map", cls: "ultima-orb-tab-btn" });
    const toolsTab = tabContainer.createEl("button", { text: "Tool Stats", cls: "ultima-orb-tab-btn" });
    
    // Tab content
    const tabContent = this.container.createEl("div", { cls: "ultima-orb-tab-content" });
    
    // Flow diagram tab
    this.mermaidContainer = tabContent.createEl("div", { cls: "ultima-orb-tab-panel active" });
    
    // Context map tab
    this.statsContainer = tabContent.createEl("div", { cls: "ultima-orb-tab-panel" });
    
    // Tool stats tab
    const toolsContainer = tabContent.createEl("div", { cls: "ultima-orb-tab-panel" });
    
    // Tab switching
    flowTab.addEventListener("click", () => this.switchTab(0));
    contextTab.addEventListener("click", () => this.switchTab(1));
    toolsTab.addEventListener("click", () => this.switchTab(2));
    
    // Initial render
    this.renderFlowDiagram();
    this.renderContextMap();
    this.renderToolStats(toolsContainer);
  }

  private switchTab(index: number): void {
    const tabs = this.container.querySelectorAll(".ultima-orb-tab-btn");
    const panels = this.container.querySelectorAll(".ultima-orb-tab-panel");
    
    tabs.forEach((tab, i) => {
      if (i === index) {
        tab.addClass("active");
      } else {
        tab.removeClass("active");
      }
    });
    
    panels.forEach((panel, i) => {
      if (i === index) {
        panel.addClass("active");
      } else {
        panel.removeClass("active");
      }
    });
  }

  private renderFlowDiagram(): void {
    this.mermaidContainer.empty();
    
    // Create Mermaid.js diagram
    const diagram = `
      graph TD
        A[User Input] --> B[Context Store]
        B --> C[Mode System]
        C --> D[AI Orchestrator]
        D --> E[Provider Registry]
        E --> F[AI Response]
        F --> G[Tool Registry]
        G --> H[Context Update]
        H --> I[Response to User]
        
        B --> J[Context Boundary]
        C --> K[Mode Context]
        D --> L[Provider Selection]
        E --> M[Request Processing]
        G --> N[Tool Execution]
    `;
    
    const mermaidDiv = this.mermaidContainer.createEl("div", { cls: "mermaid" });
    mermaidDiv.textContent = diagram;
    
    // Initialize Mermaid.js if available
    if ((window as any).mermaid) {
      (window as any).mermaid.init();
    }
  }

  private renderContextMap(): void {
    this.statsContainer.empty();
    
    const stats = this.contextStore.getStats();
    
    // Context statistics
    const statsDiv = this.statsContainer.createEl("div", { cls: "ultima-orb-stats" });
    statsDiv.createEl("h3", { text: "Context Statistics" });
    statsDiv.createEl("p", { text: `Total Contexts: ${stats.totalContexts}` });
    statsDiv.createEl("p", { text: `Active Contexts: ${stats.activeContexts}` });
    statsDiv.createEl("p", { text: `Expired Contexts: ${stats.expiredContexts}` });
    
    // Context list
    const contextsDiv = this.statsContainer.createEl("div", { cls: "ultima-orb-contexts" });
    contextsDiv.createEl("h3", { text: "Active Contexts" });
    
    const contexts = this.contextStore.searchContexts({});
    contexts.forEach(context => {
      const contextEl = contextsDiv.createEl("div", { cls: "ultima-orb-context-item" });
      contextEl.createEl("strong", { text: context.id });
      contextEl.createEl("span", { text: `Source: ${context.source}` });
      contextEl.createEl("span", { text: `Scope: ${context.scope}` });
    });
  }

  private renderToolStats(container: HTMLElement): void {
    container.empty();
    
    const stats = this.toolRegistry.getToolStats();
    
    // Tool statistics
    const statsDiv = container.createEl("div", { cls: "ultima-orb-tool-stats" });
    statsDiv.createEl("h3", { text: "Tool Statistics" });
    statsDiv.createEl("p", { text: `Total Tools: ${stats.totalTools}` });
    statsDiv.createEl("p", { text: `Enabled Tools: ${stats.enabledTools}` });
    statsDiv.createEl("p", { text: `Total Executions: ${stats.totalExecutions}` });
    
    // Tool list
    const toolsDiv = container.createEl("div", { cls: "ultima-orb-tools" });
    toolsDiv.createEl("h3", { text: "Available Tools" });
    
    const tools = this.toolRegistry.getAllTools();
    tools.forEach(tool => {
      const toolEl = toolsDiv.createEl("div", { cls: "ultima-orb-tool-item" });
      toolEl.createEl("strong", { text: tool.label });
      toolEl.createEl("span", { text: tool.description || "" });
      toolEl.createEl("span", { text: `Type: ${tool.type}` });
    });
  }

  private refreshData(): void {
    this.renderFlowDiagram();
    this.renderContextMap();
    this.renderToolStats(this.statsContainer);
  }

  private startAutoRefresh(): void {
    this.autoRefreshInterval = window.setInterval(() => {
      this.refreshData();
    }, 5000); // Refresh every 5 seconds
  }

  private stopAutoRefresh(): void {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = undefined;
    }
  }

  private toggleAutoRefresh(): void {
    if (this.autoRefreshInterval) {
      this.stopAutoRefresh();
    } else {
      this.startAutoRefresh();
    }
  }

  private exportDebugData(): void {
    const data = {
      contexts: this.contextStore.exportState(),
      tools: this.toolRegistry.getAllTools(),
      modes: this.modeSystem.getAllModes(),
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `ultima-orb-debug-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
}
