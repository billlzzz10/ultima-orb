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
    const container = this.containerEl.children[1];
    if (container) {
      container.empty();
      container.createEl("h4", { text: "Ultima-Orb Sidebar" });
      this.createSidebarContent(container as HTMLElement);
    }
  }

  private createSidebarContent(container: HTMLElement): void {
    // AI Status
    const statusSection = container.createEl("div", { cls: "sidebar-section" });
    statusSection.createEl("h5", { text: "AI Status" });
    
    const statusItem = statusSection.createEl("div", { cls: "status-item" });
    statusItem.createEl("span", { text: "AI Orchestrator: " });
    statusItem.createEl("span", { text: "✅ Active", cls: "status-active" });

    // Quick Actions
    const actionsSection = container.createEl("div", { cls: "sidebar-section" });
    actionsSection.createEl("h5", { text: "Quick Actions" });

    const chatButton = actionsSection.createEl("button", { text: "Open Chat" });
    chatButton.addEventListener("click", () => {
      this.plugin.openChatView();
    });

    const settingsButton = actionsSection.createEl("button", { text: "Settings" });
    settingsButton.addEventListener("click", () => {
      this.plugin.openSettings();
    });

    // Mode Info
    const modeSection = container.createEl("div", { cls: "sidebar-section" });
    modeSection.createEl("h5", { text: "Current Mode" });
    
    const modeInfo = modeSection.createEl("div", { cls: "mode-info" });
    const currentMode = this.plugin.getModeSystem().getActiveMode();
    modeInfo.createEl("span", { text: currentMode?.name || "Default" });

    // Tools Status
    const toolsSection = container.createEl("div", { cls: "sidebar-section" });
    toolsSection.createEl("h5", { text: "Available Tools" });
    
    const toolsList = toolsSection.createEl("div", { cls: "tools-list" });
    toolsList.createEl("div", { text: "• AI Features", cls: "tool-item" });
    toolsList.createEl("div", { text: "• Agent Mode", cls: "tool-item" });
    toolsList.createEl("div", { text: "• Cursor Features", cls: "tool-item" });
  }

  async onClose(): Promise<void> {
    // Cleanup if needed
  }
}
