import { App, Notice } from "obsidian";
import { FeatureManager } from "../core/FeatureManager";

export class ProductivityManager {
  private app: App;
  private featureManager: FeatureManager;

  constructor(app: App, featureManager: FeatureManager) {
    this.app = app;
    this.featureManager = featureManager;
  }

  async openKanbanBoard(): Promise<void> {
    new Notice("Opening Kanban board...");
  }

  async openCalendar(): Promise<void> {
    new Notice("Opening calendar...");
  }

  async cleanup(): Promise<void> {
    // Cleanup resources
  }
}
