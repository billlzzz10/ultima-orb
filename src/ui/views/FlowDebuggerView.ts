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
    const container = this.containerEl.children[1] as HTMLElement;
    container.innerHTML = "";
    const heading = document.createElement("h4");
    heading.textContent = "AI Flow Debugger";
    container.appendChild(heading);

    this.createFlowDebuggerInterface(container);
  }

  private createFlowDebuggerInterface(container: HTMLElement): void {
    // Flow status
    const statusSection = document.createElement("div");
    statusSection.className = "status-section";
    container.appendChild(statusSection);

    const statusHeading = document.createElement("h5");
    statusHeading.textContent = "Flow Status";
    statusSection.appendChild(statusHeading);

    const statusItem = document.createElement("div");
    statusItem.className = "status-item";
    statusSection.appendChild(statusItem);

    const statusLabel = document.createElement("span");
    statusLabel.textContent = "AI Orchestrator: ";
    statusItem.appendChild(statusLabel);

    const statusValue = document.createElement("span");
    statusValue.textContent = "✅ Active";
    statusValue.className = "status-active";
    statusItem.appendChild(statusValue);

    // Mode info
    const modeSection = document.createElement("div");
    modeSection.className = "mode-section";
    container.appendChild(modeSection);

    const modeHeading = document.createElement("h5");
    modeHeading.textContent = "Current Mode";
    modeSection.appendChild(modeHeading);

    const modeInfo = document.createElement("div");
    modeInfo.className = "mode-info";
    modeSection.appendChild(modeInfo);
    const currentMode = this.aiOrchestrator.getModeSystem().getActiveMode();
    const modeName = document.createElement("span");
    modeName.textContent = currentMode?.name || "Default";
    modeInfo.appendChild(modeName);

    // Debug controls
    const controlsSection = document.createElement("div");
    controlsSection.className = "controls-section";
    container.appendChild(controlsSection);

    const controlsHeading = document.createElement("h5");
    controlsHeading.textContent = "Debug Controls";
    controlsSection.appendChild(controlsHeading);

    const debugButton = document.createElement("button");
    debugButton.textContent = "Debug Flow";
    debugButton.addEventListener("click", () => this.debugFlow());
    controlsSection.appendChild(debugButton);
  }

  private async debugFlow(): Promise<void> {
    // TODO: implement debug flow logic
  }

  async onClose(): Promise<void> {
    // Cleanup if needed
  }
}
