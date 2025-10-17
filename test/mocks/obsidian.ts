// Mock for the 'obsidian' package
export class Notice {
  constructor(message: string) {
    console.log(`🔔 Notification: ${message}`);
  }
}

export class App {
  vault = {
    create: (path: string, content: string) => Promise.resolve(),
    read: (file: any) => Promise.resolve(""),
    modify: (file: any, content: string) => Promise.resolve(),
    getAbstractFileByPath: (path: string) => ({ path }),
  };
  workspace = {
    getRightLeaf: (split: boolean) => ({}),
  };
  settings = {
    open: () => {},
    openTabById: (id: string) => {},
  };
}

export class Modal {
  constructor(app: App) {}
  open() {}
  close() {}
}

export class Plugin {
  constructor(app: App, manifest: any) {}
}

export class PluginSettingTab {
  constructor(app: App, plugin: Plugin) {}
}

export class TFile {
  path: string;
  constructor() {
    this.path = "";
  }
}

export const editor = {
  getSelection: () => "selected text",
  replaceSelection: (text: string) => {},
};

export const MarkdownView = {

};