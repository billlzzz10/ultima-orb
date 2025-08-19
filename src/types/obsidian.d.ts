// Type definitions for Obsidian API
declare module "obsidian" {
  export interface App {
    vault: Vault;
    workspace: Workspace;
    metadataCache: any;
    dom: any;
    internalPlugins: any;
    plugins: any;
    commands: CommandManager;
    hotkeyManager: any;
    scope: any;
    keymap: any;
    settings: any;
    viewRegistry: any;
    view: any;
    lastActiveTime: number;
    isMobile: boolean;
    saveData(): Promise<void>;
    loadData(): Promise<any>;
  }

  export interface Vault {
    getName(): string;
    cachedRead(file: TFile): Promise<string>;
    read(file: TFile): Promise<string>;
    getMarkdownFiles(): TFile[];
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
    stat: {
      size: number;
      mtime: number;
    };
  }

  export interface View {
    editor?: Editor;
  }

  export interface Editor {
    getSelection(): string;
    getCursor(): { line: number; ch: number };
    replaceRange(
      replacement: string,
      from: { line: number; ch: number },
      to?: { line: number; ch: number }
    ): void;
  }

  export interface Command {
    id: string;
    name: string;
    icon?: string;
    callback?: () => void | Promise<void>;
    checkCallback?: (checking: boolean) => boolean | void;
    editorCallback?: (editor: any, view: any) => void;
    hotkeys?: Array<{
      modifiers: Array<"Mod" | "Ctrl" | "Meta" | "Shift" | "Alt">;
      key: string;
    }>;
  }

  export interface CommandManager {
    addCommand(command: Command): void;
  }

  export class Plugin {
    app: App;
    onload(): void | Promise<void>;
    onunload(): void | Promise<void>;
    addSettingTab(tab: SettingTab): void;
    addCommand(command: Command): void;
    loadData(): Promise<any>;
    saveData(data: any): Promise<void>;
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
    addToggle(callback: (toggle: ToggleComponent) => void): Setting;
    addSlider(callback: (slider: SliderComponent) => void): Setting;
  }

  export interface TextComponent {
    setPlaceholder(placeholder: string): TextComponent;
    setValue(value: string): TextComponent;
    getValue(): string;
    onChange(callback: (value: string) => void): TextComponent;
    setDisabled(disabled: boolean): TextComponent;
  }

  export interface DropdownComponent {
    addOption(value: string, display: string): DropdownComponent;
    setValue(value: string): DropdownComponent;
    getValue(): string;
    clearOptions(): DropdownComponent;
    onChange(callback: (value: string) => void): DropdownComponent;
  }

  export interface ButtonComponent {
    setButtonText(text: string): ButtonComponent;
    onClick(callback: () => void): ButtonComponent;
  }

  export interface ToggleComponent {
    setValue(value: boolean): ToggleComponent;
    onChange(callback: (value: boolean) => void): ToggleComponent;
    getValue(): boolean;
  }

  export interface SliderComponent {
    setLimits(min: number, max: number, step: number): SliderComponent;
    setValue(value: number): SliderComponent;
    setDynamicTooltip(): SliderComponent;
    onChange(callback: (value: number) => void): SliderComponent;
    getValue(): number;
  }

  export class Notice {
    constructor(message: string, timeout?: number);
  }

  export class WorkspaceLeaf {
    view: View;
  }

  // Additional types for UI components
  export interface DomElementInfo {
    type: string;
    cls?: string;
    attr?: Record<string, string>;
    text?: string;
  }

  export function createEl<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    o?: DomElementInfo | string
  ): HTMLElementTagNameMap[K];

  export function createDiv(o?: DomElementInfo | string): HTMLDivElement;
  export function createSpan(o?: DomElementInfo | string): HTMLSpanElement;
  // UI Component creation functions
  export function createButton(containerEl: HTMLElement): ButtonComponent;
  export function createInput(containerEl: HTMLElement): TextComponent;
  export function createSelect(containerEl: HTMLElement): DropdownComponent;
  export function createTextArea(containerEl: HTMLElement): TextComponent;

  // ButtonComponent methods
  export interface ButtonComponent {
    setButtonText(text: string): ButtonComponent;
    setClass(cls: string): ButtonComponent;
    setWarning(): ButtonComponent;
    onClick(callback: () => void): ButtonComponent;
  }

  // TextComponent methods
  export interface TextComponent {
    setValue(value: string): TextComponent;
    setPlaceholder(placeholder: string): TextComponent;
    setClass(cls: string): TextComponent;
    onChange(callback: (value: string) => void): TextComponent;
    getValue(): string;
  }

  // DropdownComponent methods
  export interface DropdownComponent {
    addOption(value: string, display: string): DropdownComponent;
    setValue(value: string): DropdownComponent;
    setClass(cls: string): DropdownComponent;
    onChange(callback: (value: string) => void): DropdownComponent;
    getValue(): string;
  }
}
