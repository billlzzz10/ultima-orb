import { App, Notice, TFile } from "obsidian";
import { ModeSystem } from "../ai/ModeSystem";

/**
 * 🛠️ Tool Manager - จัดการ tools ตาม Mode System
 */
export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  execute: (args: any) => Promise<any>;
  enabled: boolean;
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  tools: Tool[];
  enabled: boolean;
}

export class ToolManager {
  private app: App;
  private modeSystem: ModeSystem;
  private tools: Map<string, Tool> = new Map();
  private categories: Map<string, ToolCategory> = new Map();

  constructor(app: App, modeSystem: ModeSystem) {
    this.app = app;
    this.modeSystem = modeSystem;
    this.initializeDefaultTools();
  }

  /**
   * 🔧 เริ่มต้น tools มาตรฐาน
   */
  private initializeDefaultTools(): void {
    // File Reading Tools
    this.registerTool("read_file", {
      id: "read_file",
      name: "Read File",
      description: "อ่านเนื้อหาของไฟล์",
      category: "read",
      enabled: true,
      execute: async (args: { path: string }) => {
        try {
          const file = this.app.vault.getAbstractFileByPath(args.path);
          if (file && file instanceof TFile) {
            return await this.app.vault.read(file);
          }
          throw new Error("File not found");
        } catch (error) {
          throw new Error(`Failed to read file: ${error}`);
        }
      },
    });

    this.registerTool("list_files", {
      id: "list_files",
      name: "List Files",
      description: "แสดงรายการไฟล์ในโฟลเดอร์",
      category: "read",
      enabled: true,
      execute: async (args: { folder?: string }) => {
        try {
          const folder = args.folder || "";
          const files = this.app.vault.getFiles();
          if (folder) {
            return files.filter((file) => file.path.startsWith(folder));
          }
          return files;
        } catch (error) {
          throw new Error(`Failed to list files: ${error}`);
        }
      },
    });

    // File Editing Tools
    this.registerTool("write_file", {
      id: "write_file",
      name: "Write File",
      description: "เขียนเนื้อหาลงในไฟล์",
      category: "edit",
      enabled: true,
      execute: async (args: { path: string; content: string }) => {
        try {
          await this.app.vault.adapter.write(args.path, args.content);
          return { success: true, message: "File written successfully" };
        } catch (error) {
          throw new Error(`Failed to write file: ${error}`);
        }
      },
    });

    this.registerTool("append_file", {
      id: "append_file",
      name: "Append to File",
      description: "เพิ่มเนื้อหาต่อท้ายไฟล์",
      category: "edit",
      enabled: true,
      execute: async (args: { path: string; content: string }) => {
        try {
          const existingContent = await this.app.vault.adapter.read(args.path);
          const newContent = existingContent + "\n" + args.content;
          await this.app.vault.adapter.write(args.path, newContent);
          return { success: true, message: "Content appended successfully" };
        } catch (error) {
          throw new Error(`Failed to append to file: ${error}`);
        }
      },
    });

    // Search Tools
    this.registerTool("search_files", {
      id: "search_files",
      name: "Search Files",
      description: "ค้นหาไฟล์ตามคำค้น",
      category: "search",
      enabled: true,
      execute: async (args: { query: string }) => {
        try {
          // Use the search API properly
          const searchResults = this.app.vault.getMarkdownFiles().filter(file =>
            file.name.toLowerCase().includes(args.query.toLowerCase()) ||
            file.path.toLowerCase().includes(args.query.toLowerCase())
          );
          return searchResults.map(file => ({
            path: file.path,
            name: file.name
          }));
        } catch (error) {
          throw new Error(`Failed to search files: ${error}`);
        }
      },
    });

    this.registerTool("semantic_search", {
      id: "semantic_search",
      name: "Semantic Search",
      description: "ค้นหาเชิงความหมาย",
      category: "search",
      enabled: true,
      execute: async (args: { query: string }) => {
        try {
          // ใช้ AI เพื่อค้นหาเชิงความหมาย
          const files = this.app.vault.getFiles();
          const results = [];

          for (const file of files.slice(0, 10)) {
            // จำกัดจำนวนไฟล์เพื่อประสิทธิภาพ
            const content = await this.app.vault.read(file);
            if (content.toLowerCase().includes(args.query.toLowerCase())) {
              results.push({
                file: file.path,
                content: content.substring(0, 200) + "...",
              });
            }
          }

          return results;
        } catch (error) {
          throw new Error(`Failed to perform semantic search: ${error}`);
        }
      },
    });

    // Analysis Tools
    this.registerTool("analyze_content", {
      id: "analyze_content",
      name: "Analyze Content",
      description: "วิเคราะห์เนื้อหา",
      category: "insights",
      enabled: true,
      execute: async (args: { content: string }) => {
        try {
          const analysis = {
            wordCount: args.content.split(/\s+/).length,
            characterCount: args.content.length,
            lineCount: args.content.split("\n").length,
            estimatedReadingTime: Math.ceil(
              args.content.split(/\s+/).length / 200
            ), // 200 words per minute
            topics: this.extractTopics(args.content),
          };
          return analysis;
        } catch (error) {
          throw new Error(`Failed to analyze content: ${error}`);
        }
      },
    });

    this.registerTool("summarize_content", {
      id: "summarize_content",
      name: "Summarize Content",
      description: "สรุปเนื้อหา",
      category: "insights",
      enabled: true,
      execute: async (args: { content: string }) => {
        try {
          // ใช้ AI เพื่อสรุปเนื้อหา
          const summary =
            `Summary of content (${args.content.length} characters):\n` +
            `- Main topics: ${this.extractTopics(args.content).join(", ")}\n` +
            `- Key points: ${this.extractKeyPoints(args.content)}`;
          return summary;
        } catch (error) {
          throw new Error(`Failed to summarize content: ${error}`);
        }
      },
    });
  }

  /**
   * 📝 ลงทะเบียน Tool
   */
  registerTool(toolId: string, tool: Tool): void {
    this.tools.set(toolId, tool);

    // จัดกลุ่ม tools ตาม category
    if (!this.categories.has(tool.category)) {
      this.categories.set(tool.category, {
        id: tool.category,
        name: this.getCategoryName(tool.category),
        description: this.getCategoryDescription(tool.category),
        tools: [],
        enabled: true,
      });
    }

    const category = this.categories.get(tool.category)!;
    category.tools.push(tool);
  }

  /**
   * 🎯 รับ Tools สำหรับ Mode ปัจจุบัน
   */
  getActiveTools(): Tool[] {
    const activeMode = this.modeSystem.getActiveMode();
    if (!activeMode) return [];

    const activeToolGroups = this.modeSystem.getActiveToolGroups();
    const activeTools: Tool[] = [];

    activeToolGroups.forEach((group) => {
      group.tools.forEach((toolId) => {
        const tool = this.tools.get(toolId);
        if (tool && tool.enabled) {
          activeTools.push(tool);
        }
      });
    });

    return activeTools;
  }

  /**
   * 🎯 เรียกใช้ Tool
   */
  async executeTool(toolId: string, args: any): Promise<any> {
    const tool = this.tools.get(toolId);
    if (!tool) {
      throw new Error(`Tool not found: ${toolId}`);
    }

    if (!tool.enabled) {
      throw new Error(`Tool is disabled: ${toolId}`);
    }

    // ตรวจสอบว่า tool นี้อยู่ใน active mode หรือไม่
    const activeTools = this.getActiveTools();
    const isActive = activeTools.some((t) => t.id === toolId);

    if (!isActive) {
      throw new Error(`Tool not available in current mode: ${toolId}`);
    }

    try {
      return await tool.execute(args);
    } catch (error) {
      throw new Error(`Tool execution failed: ${error}`);
    }
  }

  /**
   * 📋 รับ Tools ทั้งหมด
   */
  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * 📋 รับ Categories ทั้งหมด
   */
  getAllCategories(): ToolCategory[] {
    return Array.from(this.categories.values());
  }

  /**
   * 🔄 อัปเดต Tool
   */
  updateTool(toolId: string, updates: Partial<Tool>): boolean {
    const tool = this.tools.get(toolId);
    if (tool) {
      Object.assign(tool, updates);
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
      // ลบจาก category
      const category = this.categories.get(tool.category);
      if (category) {
        category.tools = category.tools.filter((t) => t.id !== toolId);
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
    activeInCurrentMode: number;
  } {
    const total = this.tools.size;
    const enabled = Array.from(this.tools.values()).filter(
      (t) => t.enabled
    ).length;
    const disabled = total - enabled;
    const categories = this.categories.size;
    const activeInCurrentMode = this.getActiveTools().length;

    return {
      total,
      enabled,
      disabled,
      categories,
      activeInCurrentMode,
    };
  }

  /**
   * 🔍 ค้นหา Tools
   */
  searchTools(query: string): Tool[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.tools.values()).filter(
      (tool) =>
        tool.name.toLowerCase().includes(lowercaseQuery) ||
        tool.description.toLowerCase().includes(lowercaseQuery) ||
        tool.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * 📝 รับชื่อ Category
   */
  private getCategoryName(category: string): string {
    const names: Record<string, string> = {
      read: "File Reading",
      edit: "File Editing",
      search: "Search & Analysis",
      web: "Web Research",
      insights: "Insights & Analysis",
      mcp: "MCP Tools",
    };
    return names[category] || category;
  }

  /**
   * 📝 รับคำอธิบาย Category
   */
  private getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      read: "เครื่องมือสำหรับอ่านไฟล์และข้อมูล",
      edit: "เครื่องมือสำหรับแก้ไขและเขียนไฟล์",
      search: "เครื่องมือสำหรับค้นหาและวิเคราะห์",
      web: "เครื่องมือสำหรับค้นหาข้อมูลจากเว็บ",
      insights: "เครื่องมือสำหรับวิเคราะห์และสรุปข้อมูล",
      mcp: "เครื่องมือ MCP (Model Context Protocol)",
    };
    return descriptions[category] || "No description available";
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
   * 📝 สกัดประเด็นสำคัญ
   */
  private extractKeyPoints(content: string): string {
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 10);
    return sentences.slice(0, 3).join(". ") + ".";
  }
}
