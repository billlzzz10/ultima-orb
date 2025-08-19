import { App, Notice } from "obsidian";
import { FeatureManager } from "../core/FeatureManager";
import { AIOrchestrator } from "../ai/AIOrchestrator";

export class AgentManager {
  private app: App;
  private featureManager: FeatureManager;
  private aiOrchestrator: AIOrchestrator;
  private isAgentModeActive: boolean = false;
  private isFlowModeActive: boolean = false;

  constructor(app: App, featureManager: FeatureManager, aiOrchestrator: AIOrchestrator) {
    this.app = app;
    this.featureManager = featureManager;
    this.aiOrchestrator = aiOrchestrator;
  }

  async toggleAgentMode(): Promise<void> {
    this.isAgentModeActive = !this.isAgentModeActive;
    const status = this.isAgentModeActive ? "enabled" : "disabled";
    new Notice(`Agent Mode ${status}`);
  }

  async startFlowMode(): Promise<void> {
    this.isFlowModeActive = true;
    new Notice("Agent Flow Mode started");
  }

  async stopFlowMode(): Promise<void> {
    this.isFlowModeActive = false;
    new Notice("Agent Flow Mode stopped");
  }

  isAgentModeEnabled(): boolean {
    return this.isAgentModeActive;
  }

  isFlowModeEnabled(): boolean {
    return this.isFlowModeActive;
  }

  async cleanup(): Promise<void> {
    this.isAgentModeActive = false;
    this.isFlowModeActive = false;
  }
}
