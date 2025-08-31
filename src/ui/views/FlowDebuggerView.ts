import { ItemView, WorkspaceLeaf } from "obsidian";
import { AIOrchestrator } from "../../ai/AIOrchestrator";

export const FLOW_DEBUGGER_VIEW_TYPE = "ultima-orb-flow-debugger";

export class FlowDebuggerView extends ItemView {
  private aiOrchestrator: AIOrchestrator;

  constructor(leaf: WorkspaceLeaf, aiOrchestrator: AIOrchestrator) {
    super(leaf);
    this.aiOrchestrator = aiOrchestrator;
  }

  getViewType(): string {
    return FLOW_DEBUGGER_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Flow Debugger";
  }

  getIcon(): string {
    return "bug";
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl("h4", { text: "AI Flow Debugger" });

    this.createFlowDebuggerInterface(container as HTMLElement);
  }

  private createFlowDebuggerInterface(container: HTMLElement): void {
    // Flow status
    const statusSection = container.createEl("div", { cls: "status-section" });
    statusSection.createEl("h5", { text: "Flow Status" });

    const statusItem = statusSection.createEl("div", { cls: "status-item" });
    statusItem.createEl("span", { text: "AI Orchestrator: " });
    statusItem.createEl("span", { text: "✅ Active", cls: "status-active" });

    // Mode info
    const modeSection = container.createEl("div", { cls: "mode-section" });
    modeSection.createEl("h5", { text: "Current Mode" });

    const modeInfo = modeSection.createEl("div", { cls: "mode-info" });
    const currentMode = this.aiOrchestrator.getModeSystem().getActiveMode();
    modeInfo.createEl("span", { text: currentMode?.name || "Default" });

    // Debug controls
    const controlsSection = container.createEl("div", {
      cls: "controls-section",
    });
    controlsSection.createEl("h5", { text: "Debug Controls" });

    const debugButton = controlsSection.createEl("button", {
      text: "Debug Flow",
    });
    debugButton.addEventListener("click", () => this.debugFlow());
  }

  private async debugFlow(): Promise<void> {
    // Debug flow logic
    console.info("Debugging AI flow...");
  }

  async onClose(): Promise<void> {
    // Cleanup if needed
  }
}
