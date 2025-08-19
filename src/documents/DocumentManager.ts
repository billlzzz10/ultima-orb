import { App, Notice } from "obsidian";
import { FeatureManager } from "../core/FeatureManager";

export class DocumentManager {
  private app: App;
  private featureManager: FeatureManager;

  constructor(app: App, featureManager: FeatureManager) {
    this.app = app;
    this.featureManager = featureManager;
  }

  async processDocument(): Promise<void> {
    new Notice("Processing document...");
  }

  async cleanup(): Promise<void> {
    // Cleanup resources
  }
}
