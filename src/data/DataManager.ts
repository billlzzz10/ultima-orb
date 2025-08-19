import { App, Notice } from "obsidian";
import { FeatureManager } from "../core/FeatureManager";

export class DataManager {
  private app: App;
  private featureManager: FeatureManager;

  constructor(app: App, featureManager: FeatureManager) {
    this.app = app;
    this.featureManager = featureManager;
  }

  async processData(): Promise<void> {
    new Notice("Processing data...");
  }

  async cleanup(): Promise<void> {
    // Cleanup resources
  }
}
