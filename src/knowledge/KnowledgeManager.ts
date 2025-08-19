import { App, Notice, TFile } from "obsidian";
import { FeatureManager } from "../core/FeatureManager";

export class KnowledgeManager {
  private app: App;
  private featureManager: FeatureManager;
  private indexedFiles: Set<string> = new Set();

  constructor(app: App, featureManager: FeatureManager) {
    this.app = app;
    this.featureManager = featureManager;
  }

  async search(query: string): Promise<void> {
    new Notice(`Searching for: ${query}`);
  }

  async indexCurrentFile(): Promise<void> {
    const activeFile = this.app.workspace.getActiveFile();
    if (activeFile) {
      await this.indexFile(activeFile);
    }
  }

  async indexFile(file: TFile): Promise<void> {
    this.indexedFiles.add(file.path);
    new Notice(`Indexed: ${file.name}`);
  }

  async updateIndex(file: TFile): Promise<void> {
    await this.indexFile(file);
  }

  async removeFromIndex(file: TFile): Promise<void> {
    this.indexedFiles.delete(file.path);
    new Notice(`Removed from index: ${file.name}`);
  }

  async cleanup(): Promise<void> {
    this.indexedFiles.clear();
  }
}
