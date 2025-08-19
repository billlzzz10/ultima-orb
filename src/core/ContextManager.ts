import { App, TFile } from 'obsidian';

export interface ContextInfo {
  activeFile: TFile | null;
  selectedText: string;
  cursorPosition: { line: number; ch: number } | null;
  vault: string;
}

export class ContextManager {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  getActiveFile() {
    return this.app.workspace.getActiveFile();
  }

  getActiveEditor() {
    const view = this.app.workspace.getActiveViewOfType('markdown');
    return view?.editor;
  }

  async getActiveFileContent(): Promise<string> {
    const file = this.getActiveFile();
    if (file) {
      return await this.app.vault.cachedRead(file);
    }
    return '';
  }

  getSelectedText(): string {
    const editor = this.getActiveEditor();
    if (editor) {
      return editor.getSelection();
    }
    return '';
  }

  getCursorPosition() {
    const editor = this.getActiveEditor();
    if (editor) {
      return editor.getCursor();
    }
    return null;
  }

  getContext(): ContextInfo {
    return {
      activeFile: this.getActiveFile(),
      selectedText: this.getSelectedText(),
      cursorPosition: this.getCursorPosition(),
      vault: this.app.vault.getName()
    };
  }
}
