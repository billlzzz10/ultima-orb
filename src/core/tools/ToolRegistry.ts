import { App, Notice } from "obsidian";
import {
  ToolManifest,
  ToolInput,
  ToolOutput,
  AsyncResult,
  ValidationResult,
  AuditHook,
} from "../interfaces";

/**
 * 🛠️ Tool Registry - จัดการ tools แบบ declarative
 */
export class ToolRegistry {
  private app: App;
  private tools: Map<string, ToolManifest> = new Map();
  private categories: Map<string, string[]> = new Map();
  private auditHook?: AuditHook;
  private executionCount: Map<string, number> = new Map();
  private lastExecution: Map<string, number> = new Map();

  constructor(app: App) {
    this.app = app;
    this.initializeDefaultTools();
  }

  /**
   * 🔧 เริ่มต้น tools มาตรฐาน
   */
  private initializeDefaultTools(): void {
    // File System Tools
    this.registerTool({
      id: "read_file",
      type: "utility",
      label: "Read File",
      description: "อ่านเนื้อหาของไฟล์",
      version: "1.0.0",
      inputs: {
        path: {
          type: "string",
          required: true,
          description: "Path ของไฟล์ที่ต้องการอ่าน",
        },
      },
      outputs: {
        content: {
          type: "string",
          description: "เนื้อหาของไฟล์",
        },
        metadata: {
          type: "object",
          description: "ข้อมูลเพิ่มเติมของไฟล์",
        },
      },
      execute: async ({ path }) => {
        try {
          const file = this.app.vault.getAbstractFileByPath(path);
          if (!file) {
            throw new Error(`File not found: ${path}`);
          }

          const content = await this.app.vault.read(file);
          const metadata = {
            path: file.path,
            name: file.name,
            size: file.stat.size,
            modified: file.stat.mtime,
          };

          return { content, metadata };
        } catch (error) {
          throw new Error(`Failed to read file: ${error}`);
        }
      },
      tags: ["file", "read"],
      enabled: true,
      mobileOptimized: true,
    });

    this.registerTool({
      id: "write_file",
      type: "utility",
      label: "Write File",
      description: "เขียนเนื้อหาลงในไฟล์",
      version: "1.0.0",
      inputs: {
        path: {
          type: "string",
          required: true,
          description: "Path ของไฟล์ที่ต้องการเขียน",
        },
        content: {
          type: "string",
          required: true,
          description: "เนื้อหาที่ต้องการเขียน",
        },
        append: {
          type: "boolean",
          required: false,
          defaultValue: false,
          description: "เพิ่มต่อท้ายไฟล์หรือเขียนทับ",
        },
      },
      outputs: {
        success: {
          type: "boolean",
          description: "สถานะการเขียนไฟล์",
        },
        message: {
          type: "string",
          description: "ข้อความแสดงผล",
        },
      },
      execute: async ({ path, content, append = false }) => {
        try {
          if (append) {
            const existingContent = await this.app.vault.adapter.read(path);
            content = existingContent + "\n" + content;
          }

          await this.app.vault.adapter.write(path, content);
          return { success: true, message: "File written successfully" };
        } catch (error) {
          throw new Error(`Failed to write file: ${error}`);
        }
      },
      tags: ["file", "write"],
      enabled: true,
      mobileOptimized: true,
    });

    // Search Tools
    this.registerTool({
      id: "search_files",
      type: "utility",
      label: "Search Files",
      description: "ค้นหาไฟล์ตามคำค้น",
      version: "1.0.0",
      inputs: {
        query: {
          type: "string",
          required: true,
          description: "คำค้นที่ต้องการค้นหา",
        },
        folder: {
          type: "string",
          required: false,
          description: "โฟลเดอร์ที่ต้องการค้นหา",
        },
        limit: {
          type: "number",
          required: false,
          defaultValue: 10,
          description: "จำนวนผลลัพธ์สูงสุด",
        },
      },
      outputs: {
        results: {
          type: "array",
          description: "รายการไฟล์ที่พบ",
        },
        count: {
          type: "number",
          description: "จำนวนไฟล์ที่พบ",
        },
      },
      execute: async ({ query, folder, limit = 10 }) => {
        try {
          const files = this.app.vault.getFiles();
          let filteredFiles = files;

          if (folder) {
            filteredFiles = files.filter((file) =>
              file.path.startsWith(folder)
            );
          }

          const results = [];
          for (const file of filteredFiles.slice(0, limit)) {
            const content = await this.app.vault.read(file);
            if (content.toLowerCase().includes(query.toLowerCase())) {
              results.push({
                path: file.path,
                name: file.name,
                size: file.stat.size,
                snippet: content.substring(0, 200) + "...",
              });
            }
          }

          return { results, count: results.length };
        } catch (error) {
          throw new Error(`Failed to search files: ${error}`);
        }
      },
      tags: ["search", "file"],
      enabled: true,
      mobileOptimized: true,
    });

    // Analysis Tools
    this.registerTool({
      id: "analyze_content",
      type: "utility",
      label: "Analyze Content",
      description: "วิเคราะห์เนื้อหา",
      version: "1.0.0",
      inputs: {
        content: {
          type: "string",
          required: true,
          description: "เนื้อหาที่ต้องการวิเคราะห์",
        },
      },
      outputs: {
        analysis: {
          type: "object",
          description: "ผลการวิเคราะห์",
        },
      },
      execute: async ({ content }) => {
        try {
          const words = content.split(/\s+/);
          const sentences = content
            .split(/[.!?]+/)
            .filter((s) => s.trim().length > 0);
          const paragraphs = content
            .split(/\n\s*\n/)
            .filter((p) => p.trim().length > 0);

          const analysis = {
            wordCount: words.length,
            characterCount: content.length,
            sentenceCount: sentences.length,
            paragraphCount: paragraphs.length,
            estimatedReadingTime: Math.ceil(words.length / 200), // 200 words per minute
            averageWordsPerSentence: words.length / sentences.length,
            topics: this.extractTopics(content),
            readability: this.calculateReadability(content),
          };

          return { analysis };
        } catch (error) {
          throw new Error(`Failed to analyze content: ${error}`);
        }
      },
      tags: ["analysis", "content"],
      enabled: true,
      mobileOptimized: true,
    });

    // MCP Tools
    this.registerTool({
      id: "mcp_notion_sync",
      type: "mcp",
      label: "Notion Sync",
      description: "ซิงค์ข้อมูลกับ Notion",
      version: "1.0.0",
      inputs: {
        databaseId: {
          type: "string",
          required: true,
          description: "ID ของ Notion database",
        },
        token: {
          type: "string",
          required: true,
          description: "Notion API token",
        },
      },
      outputs: {
        syncedPages: {
          type: "array",
          description: "รายการหน้าที่ซิงค์แล้ว",
        },
      },
      execute: async ({ databaseId, token }) => {
        try {
          // ใช้ MCP client สำหรับ Notion
          const response = await fetch(
            `https://api.notion.com/v1/databases/${databaseId}/query`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Notion-Version": "2022-06-28",
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Notion API error: ${response.status}`);
          }

          const data = await response.json();
          return { syncedPages: data.results };
        } catch (error) {
          throw new Error(`Failed to sync with Notion: ${error}`);
        }
      },
      tags: ["mcp", "notion", "sync"],
      enabled: true,
      requiresAuth: true,
      rateLimit: {
        requests: 10,
        window: 60, // 10 requests per minute
      },
    });
  }

  /**
   * 📝 ลงทะเบียน Tool
   */
  registerTool(manifest: ToolManifest): void {
    // ตรวจสอบ validation
    const validation = this.validateToolManifest(manifest);
    if (!validation.isValid) {
      throw new Error(`Invalid tool manifest: ${validation.errors.join(", ")}`);
    }

    this.tools.set(manifest.id, manifest);

    // จัดกลุ่มตาม tags
    if (manifest.tags) {
      manifest.tags.forEach((tag) => {
        if (!this.categories.has(tag)) {
          this.categories.set(tag, []);
        }
        this.categories.get(tag)!.push(manifest.id);
      });
    }

    console.log(`✅ Tool registered: ${manifest.id}`);
  }

  /**
   * 🎯 เรียกใช้ Tool
   */
  async executeTool(
    toolId: string,
    params: Record<string, any>
  ): AsyncResult<any> {
    const tool = this.tools.get(toolId);
    if (!tool) {
      return { success: false, error: `Tool not found: ${toolId}` };
    }

    if (!tool.enabled) {
      return { success: false, error: `Tool is disabled: ${toolId}` };
    }

    // ตรวจสอบ rate limit
    if (tool.rateLimit) {
      const canExecute = this.checkRateLimit(toolId, tool.rateLimit);
      if (!canExecute) {
        return {
          success: false,
          error: `Rate limit exceeded for tool: ${toolId}`,
        };
      }
    }

    const startTime = Date.now();

    try {
      // ตรวจสอบ parameters
      const validation = this.validateToolParams(tool, params);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Invalid parameters: ${validation.errors.join(", ")}`,
        };
      }

      // เรียกใช้ tool
      const result = await tool.execute(params);

      // บันทึก audit
      const duration = Date.now() - startTime;
      this.recordExecution(toolId, duration);

      if (this.auditHook) {
        this.auditHook.onToolExecution(toolId, params, result, duration);
      }

      return { success: true, data: result };
    } catch (error) {
      const duration = Date.now() - startTime;

      if (this.auditHook) {
        this.auditHook.onError(error as Error, { toolId, params, duration });
      }

      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * 📋 รับ Tools ทั้งหมด
   */
  getAllTools(): ToolManifest[] {
    return Array.from(this.tools.values());
  }

  /**
   * 📋 รับ Tools ตาม Category
   */
  getToolsByCategory(category: string): ToolManifest[] {
    const toolIds = this.categories.get(category) || [];
    return toolIds.map((id) => this.tools.get(id)!).filter(Boolean);
  }

  /**
   * 🔍 ค้นหา Tools
   */
  searchTools(query: string): ToolManifest[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.tools.values()).filter(
      (tool) =>
        tool.label.toLowerCase().includes(lowercaseQuery) ||
        tool.description?.toLowerCase().includes(lowercaseQuery) ||
        tool.tags?.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * 🔄 อัปเดต Tool
   */
  updateTool(toolId: string, updates: Partial<ToolManifest>): boolean {
    const tool = this.tools.get(toolId);
    if (tool) {
      const updatedTool = { ...tool, ...updates };
      this.tools.set(toolId, updatedTool);
      return true;
    }
    return false;
  }

  /**
   * 🗑️ ลบ Tool
   */
  removeTool(toolId: string): boolean {
    const tool = this.tools.get(toolId);
    if (tool) {
      // ลบจาก categories
      if (tool.tags) {
        tool.tags.forEach((tag) => {
          const category = this.categories.get(tag);
          if (category) {
            const index = category.indexOf(toolId);
            if (index > -1) {
              category.splice(index, 1);
            }
          }
        });
      }

      return this.tools.delete(toolId);
    }
    return false;
  }

  /**
   * 📊 สถิติ Tools
   */
  getToolStats(): {
    total: number;
    enabled: number;
    disabled: number;
    categories: number;
    executions: Record<string, number>;
  } {
    const total = this.tools.size;
    const enabled = Array.from(this.tools.values()).filter(
      (t) => t.enabled
    ).length;
    const disabled = total - enabled;
    const categories = this.categories.size;
    const executions = Object.fromEntries(this.executionCount);

    return {
      total,
      enabled,
      disabled,
      categories,
      executions,
    };
  }

  /**
   * 🔧 Set Audit Hook
   */
  setAuditHook(hook: AuditHook): void {
    this.auditHook = hook;
  }

  // ===== PRIVATE METHODS =====

  /**
   * ✅ ตรวจสอบ Tool Manifest
   */
  private validateToolManifest(manifest: ToolManifest): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!manifest.id) {
      errors.push("Tool ID is required");
    }

    if (!manifest.label) {
      errors.push("Tool label is required");
    }

    if (!manifest.execute || typeof manifest.execute !== "function") {
      errors.push("Tool execute function is required");
    }

    if (manifest.version && !manifest.version.match(/^\d+\.\d+\.\d+$/)) {
      warnings.push("Version should follow semver format");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * ✅ ตรวจสอบ Tool Parameters
   */
  private validateToolParams(
    tool: ToolManifest,
    params: Record<string, any>
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // ตรวจสอบ required inputs
    for (const [key, input] of Object.entries(tool.inputs)) {
      if (input.required && !(key in params)) {
        errors.push(`Required parameter missing: ${key}`);
      }
    }

    // ตรวจสอบ validation rules
    for (const [key, input] of Object.entries(tool.inputs)) {
      if (key in params) {
        const value = params[key];

        if (input.validation) {
          if (
            input.validation.min !== undefined &&
            value < input.validation.min
          ) {
            errors.push(
              `Parameter ${key} is below minimum value: ${input.validation.min}`
            );
          }

          if (
            input.validation.max !== undefined &&
            value > input.validation.max
          ) {
            errors.push(
              `Parameter ${key} is above maximum value: ${input.validation.max}`
            );
          }

          if (
            input.validation.pattern &&
            !new RegExp(input.validation.pattern).test(value)
          ) {
            errors.push(
              `Parameter ${key} does not match pattern: ${input.validation.pattern}`
            );
          }

          if (input.validation.enum && !input.validation.enum.includes(value)) {
            errors.push(
              `Parameter ${key} must be one of: ${input.validation.enum.join(
                ", "
              )}`
            );
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * ⏱️ ตรวจสอบ Rate Limit
   */
  private checkRateLimit(
    toolId: string,
    rateLimit: { requests: number; window: number }
  ): boolean {
    const now = Date.now();
    const windowStart = now - rateLimit.window * 1000;

    const lastExec = this.lastExecution.get(toolId) || 0;
    if (lastExec < windowStart) {
      // Reset counter if window has passed
      this.executionCount.set(toolId, 1);
      this.lastExecution.set(toolId, now);
      return true;
    }

    const currentCount = this.executionCount.get(toolId) || 0;
    if (currentCount >= rateLimit.requests) {
      return false;
    }

    this.executionCount.set(toolId, currentCount + 1);
    this.lastExecution.set(toolId, now);
    return true;
  }

  /**
   * 📝 บันทึกการเรียกใช้
   */
  private recordExecution(toolId: string, duration: number): void {
    const currentCount = this.executionCount.get(toolId) || 0;
    this.executionCount.set(toolId, currentCount + 1);
  }

  /**
   * 🔍 สกัดหัวข้อจากเนื้อหา
   */
  private extractTopics(content: string): string[] {
    const words = content.toLowerCase().split(/\s+/);
    const wordCount: Record<string, number> = {};

    words.forEach((word) => {
      if (word.length > 3) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * 📊 คำนวณความอ่านง่าย
   */
  private calculateReadability(content: string): number {
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const words = content.split(/\s+/);
    const syllables = this.countSyllables(content);

    if (sentences.length === 0 || words.length === 0) {
      return 0;
    }

    // Flesch Reading Ease
    const fleschScore =
      206.835 -
      1.015 * (words.length / sentences.length) -
      84.6 * (syllables / words.length);
    return Math.max(0, Math.min(100, fleschScore));
  }

  /**
   * 🔤 นับพยางค์
   */
  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;

    words.forEach((word) => {
      const syllables = word.match(/[aeiouy]+/g);
      count += syllables ? syllables.length : 1;
    });

    return count;
  }
}
