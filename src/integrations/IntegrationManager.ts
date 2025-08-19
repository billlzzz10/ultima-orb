import { App, Notice } from "obsidian";
import { FeatureManager } from "../core/FeatureManager";
import { UltimaOrbSettings } from "../../main";

export class IntegrationManager {
  private app: App;
  private featureManager: FeatureManager;
  private settings: UltimaOrbSettings;

  constructor(
    app: App,
    featureManager: FeatureManager,
    settings: UltimaOrbSettings
  ) {
    this.app = app;
    this.featureManager = featureManager;
    this.settings = settings;
  }

  async syncWithGitHub(): Promise<void> {
    if (this.settings.enableGitHub) {
      new Notice("Syncing with GitHub...");
    } else {
      new Notice("GitHub integration is disabled");
    }
  }

  async syncWithNotion(): Promise<void> {
    if (this.settings.enableNotion) {
      new Notice("Syncing with Notion...");
    } else {
      new Notice("Notion integration is disabled");
    }
  }

  async cleanup(): Promise<void> {
    // Cleanup resources
  }
}
