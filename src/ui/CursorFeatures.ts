import { App, Notice } from "obsidian";
import { AIOrchestrator } from "../ai/AIOrchestrator";

export class CursorFeatures {
  private app: App;
  private aiOrchestrator: AIOrchestrator;

  constructor(app: App, aiOrchestrator: AIOrchestrator) {
    this.app = app;
    this.aiOrchestrator = aiOrchestrator;
  }

  async plan(): Promise<void> {
    try {
      const activeFile = this.app.workspace.getActiveFile();
      if (!activeFile) {
        new Notice("No active file found");
        return;
      }

      const content = await this.app.vault.read(activeFile);
      const prompt = `Analyze this code and create a development plan:\n\n${content}`;
      
      const response = await this.aiOrchestrator.generateResponse(prompt);
      new Notice("Development plan generated!");
      
      // Create a new file with the plan
      const planFileName = `${activeFile.basename}_plan.md`;
      await this.app.vault.create(planFileName, response);
      
    } catch (error) {
      new Notice(`Error generating plan: ${(error as Error).message}`);
    }
  }

  async search(): Promise<void> {
    try {
      const activeFile = this.app.workspace.getActiveFile();
      if (!activeFile) {
        new Notice("No active file found");
        return;
      }

      const content = await this.app.vault.read(activeFile);
      const prompt = `Search and analyze this code for potential issues, improvements, and best practices:\n\n${content}`;
      
      const response = await this.aiOrchestrator.generateResponse(prompt);
      new Notice("Code analysis completed!");
      
      // Create a new file with the analysis
      const analysisFileName = `${activeFile.basename}_analysis.md`;
      await this.app.vault.create(analysisFileName, response);
      
    } catch (error) {
      new Notice(`Error analyzing code: ${(error as Error).message}`);
    }
  }

  async build(): Promise<void> {
    try {
      const activeFile = this.app.workspace.getActiveFile();
      if (!activeFile) {
        new Notice("No active file found");
        return;
      }

      const content = await this.app.vault.read(activeFile);
      const prompt = `Help me build and improve this code. Provide suggestions, refactoring ideas, and implementation guidance:\n\n${content}`;
      
      const response = await this.aiOrchestrator.generateResponse(prompt);
      new Notice("Build suggestions generated!");
      
      // Create a new file with the build suggestions
      const buildFileName = `${activeFile.basename}_build_suggestions.md`;
      await this.app.vault.create(buildFileName, response);
      
    } catch (error) {
      new Notice(`Error generating build suggestions: ${(error as Error).message}`);
    }
  }

  async doAnything(prompt: string): Promise<void> {
    try {
      if (!prompt.trim()) {
        new Notice("Please provide a prompt");
        return;
      }

      const response = await this.aiOrchestrator.generateResponse(prompt);
      new Notice("Task completed!");
      
      // Create a new file with the result
      const resultFileName = `ai_result_${Date.now()}.md`;
      await this.app.vault.create(resultFileName, response);
      
    } catch (error) {
      new Notice(`Error executing task: ${(error as Error).message}`);
    }
  }
}
