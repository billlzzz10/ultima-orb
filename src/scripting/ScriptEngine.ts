import { App, Notice, TFile } from "obsidian";
import { FeatureManager } from "../core/FeatureManager";

export interface ScriptContext {
  app: App;
  file: TFile;
  content: string;
  variables: Record<string, any>;
  functions: Record<string, Function>;
}

export interface ScriptResult {
  success: boolean;
  output: string;
  error?: string;
  variables?: Record<string, any>;
}

export class ScriptEngine {
  private app: App;
  private featureManager: FeatureManager;
  private scriptLibrary: Map<string, string> = new Map();
  private customFunctions: Map<string, Function> = new Map();

  constructor(app: App, featureManager: FeatureManager) {
    this.app = app;
    this.featureManager = featureManager;
    this.initializeBuiltInFunctions();
  }

  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private initializeBuiltInFunctions(): void {
    // Date/Time Functions
    this.customFunctions.set("now", () => new Date());
    this.customFunctions.set(
      "today",
      () => new Date().toISOString().split("T")[0]
    );
    this.customFunctions.set("formatDate", (date: Date, format: string) => {
      // Implementation for date formatting
      return date.toLocaleDateString();
    });

    // File Operations
    this.customFunctions.set(
      "createFile",
      async (path: string, content: string) => {
        try {
          await this.app.vault.create(path, content);
          return true;
        } catch (error) {
          console.error("Error creating file:", error);
          return false;
        }
      }
    );

    this.customFunctions.set("readFile", async (path: string) => {
      try {
        const file = this.app.vault.getAbstractFileByPath(path);
        if (file instanceof TFile) {
          return await this.app.vault.read(file);
        }
        return null;
      } catch (error) {
        console.error("Error reading file:", error);
        return null;
      }
    });

    this.customFunctions.set(
      "appendToFile",
      async (path: string, content: string) => {
        try {
          const file = this.app.vault.getAbstractFileByPath(path);
          if (file instanceof TFile) {
            const existingContent = await this.app.vault.read(file);
            await this.app.vault.modify(file, existingContent + "\n" + content);
            return true;
          }
          return false;
        } catch (error) {
          console.error("Error appending to file:", error);
          return false;
        }
      }
    );

    // API Functions
    this.customFunctions.set(
      "fetch",
      async (url: string, options?: RequestInit) => {
        try {
          const response = await fetch(url, options);
          return await response.json();
        } catch (error) {
          console.error("Error fetching:", error);
          return null;
        }
      }
    );

    // User Input Functions
    this.customFunctions.set("prompt", async (message: string) => {
      // Implementation for user prompt
      return prompt(message);
    });

    this.customFunctions.set("confirm", async (message: string) => {
      // Implementation for user confirmation
      return confirm(message);
    });

    // Utility Functions
    this.customFunctions.set("random", (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    });

    this.customFunctions.set(
      "replace",
      (text: string, search: string, replace: string) => {
        const safeSearch = this.escapeRegExp(search);
        return text.replace(new RegExp(safeSearch, "g"), replace);
      }
    );

    this.customFunctions.set("split", (text: string, delimiter: string) => {
      return text.split(delimiter);
    });

    this.customFunctions.set("join", (array: string[], delimiter: string) => {
      return array.join(delimiter);
    });
  }

  async executeScript(
    script: string,
    context: ScriptContext
  ): Promise<ScriptResult> {
    try {
      // Create a safe execution environment
      const sandbox = this.createSandbox(context);

      // Execute the script
      const result = await this.executeInSandbox(script, sandbox);

      return {
        success: true,
        output: result.output,
        variables: result.variables,
      };
    } catch (error) {
      console.error("CAUGHT IN EXECUTESCRIPT", error);
      return {
        success: false,
        output: "",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private createSandbox(context: ScriptContext): any {
    return {
      // Obsidian APIs
      app: context.app,
      file: context.file,
      content: context.content,

      // Built-in functions
      ...Object.fromEntries(this.customFunctions),

      // User variables
      ...context.variables,

      // Utility functions
      log: (message: any) => console.info(message),
      notice: (message: string) => new Notice(message),

      // Async support
      async: true,

      // Security restrictions are handled in executeInSandbox
    };
  }

  private async executeInSandbox(
    script: string,
    sandbox: any
  ): Promise<{ output: string; variables: Record<string, any> }> {
    // Create a function from the script
    const functionBody = `
      const eval = undefined;
      const Function = undefined;
      const setTimeout = undefined;
      const setInterval = undefined;

      let output = "";
      let variables = {};
      
      // Capture console.info output
      const originalLog = console.info;
      console.info = (...args) => {
        output += args.join(" ") + "\\n";
        originalLog.apply(console, args);
      };
      
      // Execute the script
      ${script}
      
      return { output, variables };
    `;

    const func = new Function(...Object.keys(sandbox), functionBody);
    const result = await func(...Object.values(sandbox));

    return result;
  }

  async executeTemplateScript(
    template: string,
    context: ScriptContext
  ): Promise<string> {
    // Replace template variables with script execution
    const scriptPattern = /\{\{([^}]+)\}\}/g;
    let result = template;

    for (const match of template.matchAll(scriptPattern)) {
      const script = match[1] ? match[1].trim() : "";
      if (!script) continue;
      const scriptResult = await this.executeScript(script, context);

      if (scriptResult.success) {
        result = result.replace(match[0], scriptResult.output);
      } else {
        result = result.replace(match[0], `[ERROR: ${scriptResult.error}]`);
      }
    }

    return result;
  }

  addCustomFunction(name: string, func: Function): void {
    this.customFunctions.set(name, func);
  }

  removeCustomFunction(name: string): boolean {
    return this.customFunctions.delete(name);
  }

  getCustomFunctions(): string[] {
    return Array.from(this.customFunctions.keys());
  }

  saveScript(name: string, script: string): void {
    this.scriptLibrary.set(name, script);
  }

  loadScript(name: string): string | undefined {
    return this.scriptLibrary.get(name);
  }

  getScriptNames(): string[] {
    return Array.from(this.scriptLibrary.keys());
  }

  deleteScript(name: string): boolean {
    return this.scriptLibrary.delete(name);
  }

  // Advanced features
  async executeWithLoop(
    script: string,
    context: ScriptContext,
    iterations: number
  ): Promise<ScriptResult[]> {
    const results: ScriptResult[] = [];

    for (let i = 0; i < iterations; i++) {
      const loopContext = {
        ...context,
        variables: {
          ...context.variables,
          loopIndex: i,
          loopCount: iterations,
        },
      };

      const result = await this.executeScript(script, loopContext);
      results.push(result);
    }

    return results;
  }

  async executeWithCondition(
    script: string,
    context: ScriptContext,
    condition: string
  ): Promise<ScriptResult> {
    const conditionResult = await this.executeScript(condition, context);

    if (
      conditionResult.success &&
      conditionResult.output.toLowerCase() === "true"
    ) {
      return await this.executeScript(script, context);
    } else {
      return {
        success: true,
        output: "",
        variables: context.variables,
      };
    }
  }

  // Error handling
  validateScript(script: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for dangerous patterns
    const dangerousPatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /setTimeout\s*\(/,
      /setInterval\s*\(/,
      /document\./,
      /window\./,
      /localStorage\./,
      /sessionStorage\./,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(script)) {
        errors.push(`Dangerous pattern detected: ${pattern.source}`);
      }
    }

    // Check for syntax errors
    try {
      new Function(script);
    } catch (error) {
      errors.push(
        `Syntax error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
