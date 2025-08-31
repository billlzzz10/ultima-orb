import { ItemView, WorkspaceLeaf } from "obsidian";
import { UltimaOrbPlugin } from "../../UltimaOrbPlugin";

export const SIDEBAR_VIEW_TYPE = "ultima-orb-sidebar";

export class SidebarView extends ItemView {
  plugin: UltimaOrbPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: UltimaOrbPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return SIDEBAR_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Ultima-Orb Sidebar";
  }

  getIcon(): string {
    return "brain";
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1] as HTMLElement;
    container.innerHTML = "";
    const heading = document.createElement("h4");
    heading.textContent = "Ultima-Orb Sidebar";
    container.appendChild(heading);

    // Create sidebar content
    this.createSidebarContent(container);
  }

  private createSidebarContent(container: HTMLElement): void {
    // AI Status
    const statusSection = document.createElement("div");
    statusSection.className = "sidebar-section";
    container.appendChild(statusSection);

    const statusHeading = document.createElement("h5");
    statusHeading.textContent = "AI Status";
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

    // Quick Actions
    const actionsSection = document.createElement("div");
    actionsSection.className = "sidebar-section";
    container.appendChild(actionsSection);

    const actionsHeading = document.createElement("h5");
    actionsHeading.textContent = "Quick Actions";
    actionsSection.appendChild(actionsHeading);

    const chatButton = document.createElement("button");
    chatButton.textContent = "Open Chat";
    chatButton.addEventListener("click", () => {
      this.plugin.openChatView();
    });
    actionsSection.appendChild(chatButton);

    const settingsButton = document.createElement("button");
    settingsButton.textContent = "Settings";
    settingsButton.addEventListener("click", () => {
      this.plugin.openSettings();
    });
    actionsSection.appendChild(settingsButton);

    // Mode Info
    const modeSection = document.createElement("div");
    modeSection.className = "sidebar-section";
    container.appendChild(modeSection);

    const modeHeading = document.createElement("h5");
    modeHeading.textContent = "Current Mode";
    modeSection.appendChild(modeHeading);

    const modeInfo = document.createElement("div");
    modeInfo.className = "mode-info";
    modeSection.appendChild(modeInfo);

    const currentMode = this.plugin.getModeSystem().getActiveMode();
    const modeName = document.createElement("span");
    modeName.textContent = currentMode?.name || "Default";
    modeInfo.appendChild(modeName);

    // Tools Status
    const toolsSection = document.createElement("div");
    toolsSection.className = "sidebar-section";
    container.appendChild(toolsSection);

    const toolsHeading = document.createElement("h5");
    toolsHeading.textContent = "Available Tools";
    toolsSection.appendChild(toolsHeading);

    const toolsList = document.createElement("div");
    toolsList.className = "tools-list";
    toolsSection.appendChild(toolsList);

    const feature1 = document.createElement("div");
    feature1.textContent = "• AI Features";
    feature1.className = "tool-item";
    toolsList.appendChild(feature1);

    const feature2 = document.createElement("div");
    feature2.textContent = "• Agent Mode";
    feature2.className = "tool-item";
    toolsList.appendChild(feature2);

    const feature3 = document.createElement("div");
    feature3.textContent = "• Cursor Features";
    feature3.className = "tool-item";
    toolsList.appendChild(feature3);
  }

  async onClose(): Promise<void> {
    // Cleanup if needed
  }
}
