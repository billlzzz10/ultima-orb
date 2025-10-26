import { TFile, Editor, Notice, App } from "obsidian";
import { ToolBase } from "../core/tools/ToolBase";

export interface ScriptContext {
  file: TFile;
  editor: Editor;
  app: App;
  moment: any;
  user: any;
  metadataCache: any;
  vault: any;
  workspace: any;
}

export interface ScriptResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

export class AdvancedScriptingTool extends ToolBase {
  private scripts: Map<string, string> = new Map();
  private executionHistory: ScriptResult[] = [];
  protected app: App;
  protected moment: any;

  constructor(app: App) {
    super({
      id: "advanced-scripting",
      name: "Advanced Scripting",
      description:
        "Templater-like scripting with dynamic templates and user functions",
      category: "Development",
      icon: "code-glyph",
      version: "1.0.0",
      author: "Ultima-Orb",
      tags: ["scripting", "templates", "automation", "development"],
    });

    this.app = app;
    // Initialize moment if available
    this.moment = (window as any).moment || null;
  }

  async execute(context: ScriptContext): Promise<ScriptResult> {
    const startTime = Date.now();

    try {
      // Get script content from current file
      const scriptContent = await this.getScriptContent(context.file);

      // Parse and execute script
      const result = await this.executeScript(scriptContent, context);

      const executionTime = Date.now() - startTime;

      const scriptResult: ScriptResult = {
        success: true,
        output: result,
        executionTime,
      };

      this.executionHistory.push(scriptResult);
      return scriptResult;
    } catch (error) {
      const executionTime = Date.now() - startTime;

      const scriptResult: ScriptResult = {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : String(error),
        executionTime,
      };

      this.executionHistory.push(scriptResult);
      return scriptResult;
    }
  }

  private async getScriptContent(file: TFile): Promise<string> {
    return await this.app.vault.read(file);
  }

  private async executeScript(
    scriptContent: string,
    context: ScriptContext
  ): Promise<string> {
    // Parse template variables
    const processedScript = await this.processTemplateVariables(
      scriptContent,
      context
    );

    // Execute JavaScript code
    return await this.executeJavaScript(processedScript, context);
  }

  private async processTemplateVariables(
    script: string,
    context: ScriptContext
  ): Promise<string> {
    // Replace template variables with actual values
    let processed = script;

    // Date/time variables
    processed = processed.replace(
      /\{\{date\}\}/g,
      new Date().toLocaleDateString()
    );
    processed = processed.replace(
      /\{\{time\}\}/g,
      new Date().toLocaleTimeString()
    );
    processed = processed.replace(
      /\{\{datetime\}\}/g,
      new Date().toISOString()
    );

    // File variables
    processed = processed.replace(/\{\{filename\}\}/g, context.file.basename);
    processed = processed.replace(/\{\{filepath\}\}/g, context.file.path);
    processed = processed.replace(/\{\{extension\}\}/g, context.file.extension);

    // User variables
    processed = processed.replace(
      /\{\{user\}\}/g,
      context.user?.name || "Unknown"
    );

    return processed;
  }

  private async executeJavaScript(
    script: string,
    context: ScriptContext
  ): Promise<string> {
    // Create a safe execution environment
    const sandbox = {
      file: context.file,
      editor: context.editor,
      app: context.app,
      moment: context.moment,
      user: context.user,
      metadataCache: context.metadataCache,
      vault: context.vault,
      workspace: context.workspace,
      console: console,
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      Promise,
      Date,
      Math,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      RegExp,
      Error,
      Map,
      Set,
      WeakMap,
      WeakSet,
      Symbol,
      Proxy,
      Reflect,
      Intl,
      Atomics,
      DataView,
      ArrayBuffer,
      SharedArrayBuffer,
      Float32Array,
      Float64Array,
      Int8Array,
      Int16Array,
      Int32Array,
      Uint8Array,
      Uint16Array,
      Uint32Array,
      Uint8ClampedArray,
    };

    // Execute script in sandbox
    const result = new Function(
      ...Object.keys(sandbox),
      `return (async () => { ${script} })()`
    );
    return await result(...Object.values(sandbox));
  }

  // Template management
  async saveTemplate(name: string, content: string): Promise<void> {
    this.scripts.set(name, content);
    new Notice(`Template "${name}" saved successfully`);
  }

  async loadTemplate(name: string): Promise<string | null> {
    return this.scripts.get(name) || null;
  }

  async listTemplates(): Promise<string[]> {
    return Array.from(this.scripts.keys());
  }

  async deleteTemplate(name: string): Promise<boolean> {
    const deleted = this.scripts.delete(name);
    if (deleted) {
      new Notice(`Template "${name}" deleted successfully`);
    }
    return deleted;
  }

  // Execution history
  getExecutionHistory(): ScriptResult[] {
    return [...this.executionHistory];
  }

  clearExecutionHistory(): void {
    this.executionHistory = [];
  }

  // Utility functions for scripts
  getUtilityFunctions() {
    return {
      // File operations
      createFile: async (path: string, content: string) => {
        return await this.app.vault.create(path, content);
      },

      modifyFile: async (file: TFile, content: string) => {
        return await this.app.vault.modify(file, content);
      },

      deleteFile: async (file: TFile) => {
        return await this.app.vault.delete(file);
      },

      // Search operations
      searchFiles: async (query: string) => {
        return await this.app.vault
          .getMarkdownFiles()
          .filter((file) =>
            file.basename.toLowerCase().includes(query.toLowerCase())
          );
      },

      // Metadata operations
      getMetadata: (file: TFile) => {
        return this.app.metadataCache.getFileCache(file)?.frontmatter;
      },

      setMetadata: async (file: TFile, metadata: any) => {
        const content = await this.app.vault.read(file);
        const frontmatter = `---\n${Object.entries(metadata)
          .map(([k, v]) => `${k}: ${v}`)
          .join("\n")}\n---\n`;
        const newContent =
          frontmatter + content.replace(/^---[\s\S]*?---\n/, "");
        await this.app.vault.modify(file, newContent);
      },

      // Date utilities
      formatDate: (date: Date, format: string) => {
        if (this.moment) {
          return this.moment(date).format(format);
        }
        return date.toLocaleDateString();
      },

      // String utilities
      slugify: (text: string) => {
        return text
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      },

      // Array utilities
      shuffle: <T>(array: T[]): T[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const temp = shuffled[i];
          if (shuffled[j] !== undefined && temp !== undefined) {
            shuffled[i] = shuffled[j]!;
            shuffled[j] = temp;
          }
        }
        return shuffled;
      },

      // Math utilities
      random: (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      },

      // Network utilities
      fetchData: async (url: string) => {
        const response = await fetch(url);
        return await response.json();
      },
    };
  }
}
