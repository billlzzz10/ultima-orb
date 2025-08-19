import { App, ItemView, WorkspaceLeaf } from "obsidian";
import { FeatureManager } from "../../core/FeatureManager";
import { UltimaOrbPlugin } from "../../../main";

export const SIDEBAR_VIEW_TYPE = "ultima-orb-sidebar";

export class SidebarView extends ItemView {
  private app: App;
  private featureManager: FeatureManager;
  private plugin: UltimaOrbPlugin;

  constructor(
    app: App,
    featureManager: FeatureManager,
    plugin: UltimaOrbPlugin,
    leaf?: WorkspaceLeaf
  ) {
    super(leaf);
    this.app = app;
    this.featureManager = featureManager;
    this.plugin = plugin;
  }

  getViewType(): string {
    return SIDEBAR_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Ultima-Orb Sidebar";
  }

  getIcon(): string {
    return "settings";
  }

  async onOpen() {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl("h4", { text: "Ultima-Orb Sidebar" });
    this.createSidebarInterface(container);
  }

  private createSidebarInterface(container: HTMLElement) {
    // Quick Actions
    const quickActions = container.createDiv("ultima-orb-quick-actions");
    quickActions.createEl("h5", { text: "Quick Actions" });

    const chatButton = quickActions.createEl("button", {
      text: "Open Chat",
      cls: "ultima-orb-sidebar-button",
    });
    chatButton.addEventListener("click", () => this.plugin.openChatView());

    const settingsButton = quickActions.createEl("button", {
      text: "Settings",
      cls: "ultima-orb-sidebar-button",
    });
    settingsButton.addEventListener("click", () => this.app.setting.open());

    // Feature Status
    const featureStatus = container.createDiv("ultima-orb-feature-status");
    featureStatus.createEl("h5", { text: "Feature Status" });

    const statusList = featureStatus.createEl("ul", {
      cls: "ultima-orb-status-list",
    });

    const features = [
      { name: "AI Chat", enabled: this.plugin.settings.enableChatView },
      {
        name: "Advanced Features",
        enabled: this.plugin.settings.enableAdvancedFeatures,
      },
      {
        name: "GitHub Integration",
        enabled: this.plugin.settings.enableGitHub,
      },
      {
        name: "Notion Integration",
        enabled: this.plugin.settings.enableNotion,
      },
      { name: "Ollama", enabled: this.plugin.settings.enableOllama },
      { name: "RAG", enabled: this.plugin.settings.enableRAG },
    ];

    features.forEach((feature) => {
      const li = statusList.createEl("li");
      li.createEl("span", { text: feature.name });
      li.createEl("span", {
        text: feature.enabled ? "✅" : "❌",
        cls: "ultima-orb-status-indicator",
      });
    });
  }

  async onClose() {
    // Cleanup
  }
}
