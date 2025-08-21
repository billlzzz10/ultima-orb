// Type definitions for Obsidian API
declare module "obsidian" {
  export interface App {
    vault: Vault;
    workspace: Workspace;
    metadataCache: MetadataCache;
    dom: DOM;
    internalPlugins: any;
    plugins: PluginManager;
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
    write(file: TFile, data: string): Promise<void>;
    create(path: string, content: string): Promise<TFile>;
    modify(file: TFile, data: string): Promise<void>;
    delete(file: TFile): Promise<void>;
    getMarkdownFiles(): TFile[];
    getAbstractFileByPath(path: string): TAbstractFile | null;
    adapter: {
      read(path: string): Promise<string>;
      write(path: string, data: string): Promise<void>;
    };
    on(event: string, callback: Function): void;
    off(event: string, callback: Function): void;
  }

  export interface Workspace {
    getActiveFile(): TFile | null;
    getActiveViewOfType<T extends View>(type: string): T | null;
    getRightLeaf(active: boolean): WorkspaceLeaf;
    getLeftLeaf(active: boolean): WorkspaceLeaf;
    revealLeaf(leaf: WorkspaceLeaf): void;
    onLayoutReady(callback: Function): void;
  }

  export interface WorkspaceLeaf {
    view: View;
    setViewState(state: any): Promise<void>;
    openFile(file: TFile): Promise<void>;
  }

  export interface TFile extends TAbstractFile {
    path: string;
    name: string;
    basename: string;
    extension: string;
    stat: {
      size: number;
      mtime: number;
      ctime: number;
    };
  }

  export interface TAbstractFile {
    path: string;
    name: string;
    parent: TFolder | null;
    vault: Vault;
  }

  export interface TFolder extends TAbstractFile {
    children: TAbstractFile[];
  }

  export interface View {
    editor?: Editor;
    file?: TFile;
    containerEl: HTMLElement;
  }

  export interface MarkdownView extends View {
    editor: Editor;
    file: TFile;
    getMode(): string;
    setMode(mode: string): void;
  }

  export interface Editor {
    getSelection(): string;
    getValue(): string;
    setValue(value: string): void;
    getCursor(): { line: number; ch: number };
    setCursor(pos: { line: number; ch: number }): void;
    replaceSelection(replacement: string): void;
    replaceRange(
      replacement: string,
      from: { line: number; ch: number },
      to?: { line: number; ch: number }
    ): void;
    getLine(line: number): string;
    lineCount(): number;
    getRange(
      from: { line: number; ch: number },
      to: { line: number; ch: number }
    ): string;
  }

  export interface Command {
    id: string;
    name: string;
    icon?: string;
    callback?: () => void | Promise<void>;
    checkCallback?: (checking: boolean) => boolean | void;
    editorCallback?: (editor: Editor, view: MarkdownView) => void;
    hotkeys?: Array<{
      modifiers: Array<"Mod" | "Ctrl" | "Meta" | "Shift" | "Alt">;
      key: string;
    }>;
  }

  export interface CommandManager {
    addCommand(command: Command): void;
    removeCommand(id: string): void;
    executeCommandById(id: string): boolean;
  }

  export interface PluginManager {
    plugins: Record<string, any>;
    enablePlugin(id: string): Promise<void>;
    disablePlugin(id: string): Promise<void>;
  }

  export interface MetadataCache {
    getFileCache(file: TFile): any;
    getFirstLinkpathDest(linkpath: string, sourcePath: string): TFile | null;
  }

  export interface DOM {
    appContainerEl: HTMLElement;
    titleEl: HTMLElement;
  }

  export class Plugin {
    app: App;
    manifest: any;
    onload(): void | Promise<void>;
    onunload(): void | Promise<void>;
    addSettingTab(tab: SettingTab): void;
    addCommand(command: Command): void;
    loadData(): Promise<any>;
    saveData(data: any): Promise<void>;
    registerView(type: string, viewCreator: any): void;
    registerEvent(eventRef: any, callback: Function): void;
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
    addText(cb: (text: TextComponent) => any): Setting;
    addTextArea(cb: (text: TextAreaComponent) => any): Setting;
    addDropdown(cb: (dropdown: DropdownComponent) => any): Setting;
    addSlider(cb: (slider: SliderComponent) => any): Setting;
    addToggle(cb: (toggle: ToggleComponent) => any): Setting;
    addButton(cb: (button: ButtonComponent) => any): Setting;
  }

  export class TextComponent {
    setValue(value: string): this;
    getValue(): string;
    setPlaceholder(placeholder: string): this;
    onChange(callback: (value: string) => any): this;
    setDisabled(disabled: boolean): this;
  }

  export class TextAreaComponent {
    setValue(value: string): this;
    getValue(): string;
    setPlaceholder(placeholder: string): this;
    onChange(callback: (value: string) => any): this;
  }

  export class DropdownComponent {
    addOption(value: string, display: string): this;
    setValue(value: string): this;
    getValue(): string;
    clearOptions(): this;
    onChange(callback: (value: string) => any): this;
  }

  export class SliderComponent {
    setLimits(min: number, max: number, step: number): this;
    setValue(value: number): this;
    getValue(): number;
    setDynamicTooltip(): this;
    onChange(callback: (value: number) => any): this;
  }

  export class ToggleComponent {
    setValue(value: boolean): this;
    getValue(): boolean;
    onChange(callback: (value: boolean) => any): this;
  }

  export class ButtonComponent {
    setButtonText(text: string): this;
    setWarning(): this;
    setCta(): this;
    setDisabled(disabled: boolean): this;
    setClass(cls: string): this;
    onClick(callback: (evt: MouseEvent) => any): this;
  }

  export class ItemView {
    app: App;
    containerEl: HTMLElement;
    constructor(leaf: WorkspaceLeaf);
    getViewType(): string;
    getDisplayText(): string;
    onload(): void | Promise<void>;
    onunload(): void | Promise<void>;
  }

  export class Modal {
    app: App;
    containerEl: HTMLElement;
    constructor(app: App);
    open(): void;
    close(): void;
    onOpen(): void;
    onClose(): void;
  }

  export class Notice {
    constructor(message: string, timeout?: number);
    static show(message: string, timeout?: number): void;
  }

  export class SuggestModal<T> extends Modal {
    inputEl: HTMLInputElement;
    resultContainerEl: HTMLElement;
    getSuggestions(query: string): T[] | Promise<T[]>;
    renderSuggestion(item: T, el: HTMLElement): void;
    onChooseItem(item: T, evt: MouseEvent | KeyboardEvent): void;
  }

  export class FuzzySuggestModal<T> extends SuggestModal<T> {
    getItems(): T[];
    getItemText(item: T): string;
    onChooseItem(item: T, evt: MouseEvent | KeyboardEvent): void;
  }

  export class MarkdownRenderer {
    static render(
      app: App,
      el: HTMLElement,
      markdown: string,
      sourcePath: string,
      component: any
    ): Promise<void>;
  }

  export class MarkdownView {
    editor: Editor;
    file: TFile;
    getMode(): string;
    setMode(mode: string): void;
  }

  export class TAbstractFile {
    path: string;
    name: string;
    parent: TFolder | null;
    vault: Vault;
  }

  export class TFolder extends TAbstractFile {
    children: TAbstractFile[];
  }

  export class TFile extends TAbstractFile {
    extension: string;
    basename: string;
    stat: {
      size: number;
      mtime: number;
      ctime: number;
    };
  }

  // Event types
  export type EventRef = {
    id: string;
    callback: Function;
  };

  // Utility types
  export type Component = {
    addChild(child: Component): void;
    removeChild(child: Component): void;
    onload(): void;
    onunload(): void;
  };

  export type WorkspaceLeaf = {
    view: View;
    setViewState(state: any): Promise<void>;
    openFile(file: TFile): Promise<void>;
  };

  // DOM Element creation functions
  export interface DomElementInfo {
    type?: string;
    cls?: string;
    attr?: Record<string, string>;
    text?: string;
    style?: string;
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
}
