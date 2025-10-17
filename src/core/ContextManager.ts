import { App, TFile } from "obsidian";
import { Logger } from "../services/Logger";

/**
 * 📄 Context Manager
 * จัดการ Context ของไฟล์ที่เปิด, ไฟล์ที่แนบ, และข้อมูลแวดล้อม
 */

export interface FileContext {
  file: TFile;
  content: string;
  path: string;
  name: string;
  extension: string;
  size: number;
  modified: Date;
  tags: string[];
  frontmatter: Record<string, unknown>;
}

export interface ContextData {
  activeFile: FileContext | null;
  attachedFiles: FileContext[];
  vaultFiles: TFile[];
  selectedText: string;
  cursorPosition: { line: number; ch: number } | null;
  metadata: Record<string, unknown>;
}

export class ContextManager {
  private app: App;
  private logger: Logger;
  private contextData: ContextData;

  constructor(app: App) {
    this.app = app;
    this.logger = new Logger();
    this.contextData = {
      activeFile: null,
      attachedFiles: [],
      vaultFiles: [],
      selectedText: "",
      cursorPosition: null,
      metadata: {},
    };
  }

  /**
   * Initialize context manager
   */
  async initialize(): Promise<void> {
    this.logger.info("Initializing Context Manager...");
    await this.refreshContext();
  }

  /**
   * Refresh context data
   */
  async refreshContext(): Promise<void> {
    try {
      // Get active file
      const activeFile = this.app.workspace.getActiveFile();
      if (activeFile) {
        this.contextData.activeFile = await this.getFileContext(activeFile);
      }

      // Get vault files
      this.contextData.vaultFiles = this.app.vault.getMarkdownFiles();

      this.logger.info("Context refreshed successfully");
    } catch (error) {
      this.logger.error("Error refreshing context:", error as Error);
    }
  }

  /**
   * Get file context
   */
  async getFileContext(file: TFile): Promise<FileContext> {
    try {
      const content = await this.app.vault.read(file);
      const frontmatter =
        this.app.metadataCache.getFileCache(file)?.frontmatter || {};
      const tags =
        this.app.metadataCache.getFileCache(file)?.tags?.map((t: any) => t.tag) ||
        [];

      return {
        file,
        content,
        path: file.path,
        name: file.name,
        extension: file.extension,
        size: file.stat.size,
        modified: new Date(file.stat.mtime),
        tags,
        frontmatter,
      };
    } catch (error) {
      this.logger.error(
        `Error getting file context for ${file.path}:`,
        error as Error
      );
      throw error;
    }
  }

  /**
   * Get current context data
   */
  getContextData(): ContextData {
    return { ...this.contextData };
  }

  /**
   * Get active file context
   */
  getActiveFileContext(): FileContext | null {
    return this.contextData.activeFile;
  }

  /**
   * Get attached files
   */
  getAttachedFiles(): FileContext[] {
    return [...this.contextData.attachedFiles];
  }

  /**
   * Add attached file
   */
  async addAttachedFile(file: TFile): Promise<void> {
    const fileContext = await this.getFileContext(file);
    this.contextData.attachedFiles.push(fileContext);
    this.logger.info(`Added attached file: ${file.path}`);
  }

  /**
   * Remove attached file
   */
  removeAttachedFile(filePath: string): void {
    this.contextData.attachedFiles = this.contextData.attachedFiles.filter(
      (f) => f.path !== filePath
    );
    this.logger.info(`Removed attached file: ${filePath}`);
  }

  /**
   * Set selected text
   */
  setSelectedText(text: string): void {
    this.contextData.selectedText = text;
  }

  /**
   * Set cursor position
   */
  setCursorPosition(position: { line: number; ch: number } | null): void {
    this.contextData.cursorPosition = position;
  }

  /**
   * Add metadata
   */
  addMetadata(key: string, value: unknown): void {
    this.contextData.metadata[key] = value;
  }

  /**
   * Get metadata
   */
  getMetadata(key: string): unknown {
    return this.contextData.metadata[key];
  }

  /**
   * Clear context
   */
  clearContext(): void {
    this.contextData = {
      activeFile: null,
      attachedFiles: [],
      vaultFiles: [],
      selectedText: "",
      cursorPosition: null,
      metadata: {},
    };
    this.logger.info("Context cleared");
  }
}
