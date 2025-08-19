// Type definitions for Obsidian API
declare module 'obsidian' {
  export interface App {
    vault: Vault;
    workspace: Workspace;
    loadData(): Promise<unknown>;
    saveData(data: unknown): Promise<void>;
    commands: CommandManager;
  }

  export interface Vault {
    getName(): string;
    cachedRead(file: TFile): Promise<string>;
  }

  export interface Workspace {
    getActiveFile(): TFile | null;
    getActiveViewOfType<T extends View>(type: string): T | null;
  }

  export interface TFile {
    path: string;
    name: string;
    basename: string;
    extension: string;
  }

  export interface View {
    editor?: Editor;
  }

  export interface Editor {
    getSelection(): string;
    getCursor(): { line: number; ch: number };
  }

  export interface CommandManager {
    addCommand(command: {
      id: string;
      name: string;
      callback: () => void;
    }): void;
  }

  export class Plugin {
    app: App;
    onload(): void | Promise<void>;
    onunload(): void | Promise<void>;
    addSettingTab(tab: SettingTab): void;
  }

  export class SettingTab {
    app: App;
    containerEl: HTMLElement;
    constructor(app: App, plugin: Plugin);
  }

  export class PluginSettingTab extends SettingTab {
    constructor(app: App, plugin: Plugin);
  }

  export class Setting {
    constructor(containerEl: HTMLElement);
    setName(name: string): Setting;
    setDesc(desc: string): Setting;
    addText(callback: (text: TextComponent) => void): Setting;
    addDropdown(callback: (dropdown: DropdownComponent) => void): Setting;
    addButton(callback: (button: ButtonComponent) => void): Setting;
  }

  export interface TextComponent {
    setPlaceholder(placeholder: string): TextComponent;
    setValue(value: string): TextComponent;
    onChange(callback: (value: string) => void): TextComponent;
    setDisabled(disabled: boolean): TextComponent;
  }

  export interface DropdownComponent {
    addOption(value: string, display: string): DropdownComponent;
    setValue(value: string): DropdownComponent;
    onChange(callback: (value: string) => void): DropdownComponent;
  }

  export interface ButtonComponent {
    setButtonText(text: string): ButtonComponent;
    onClick(callback: () => void): ButtonComponent;
  }

  export class Notice {
    constructor(message: string, timeout?: number);
  }

  export class WorkspaceLeaf {
    view: View;
  }
}
