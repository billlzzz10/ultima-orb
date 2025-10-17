import { App, Notice } from "obsidian";
import { AIFeatures } from "./AIFeatures";
import { evaluate } from "mathjs";

/**
 * @ Commands - เรียกใช้ tools และ documents
 */
export class AtCommands {
  private app: App;
  private aiFeatures: AIFeatures;
  private documents: Map<string, Document> = new Map();
  private tools: Map<string, Tool> = new Map();

  constructor(app: App, aiFeatures: AIFeatures) {
    this.app = app;
    this.aiFeatures = aiFeatures;
    this.initializeDefaultTools();
  }

  /**
   * 🔧 เริ่มต้น tools เริ่มต้น
   */
  private initializeDefaultTools(): void {
    // Tools เริ่มต้น
    this.registerTool("search", {
      name: "Search",
      description: "Search for information",
      execute: async (query: string) => {
        return await this.aiFeatures.chatWithAI(`Search for: ${query}`);
      },
    });

    this.registerTool("calculate", {
      name: "Calculate",
      description: "Perform calculations",
      execute: async (expression: string) => {
        try {
          const result = evaluate(expression);
          return `Result: ${result}`;
        } catch (error: any) {
          return `Error: ${error.message}`;
        }
      },
    });

    this.registerTool("translate", {
      name: "Translate",
      description: "Translate text",
      execute: async (text: string) => {
        return await this.aiFeatures.chatWithAI(`Translate this text: ${text}`);
      },
    });

    this.registerTool("summarize", {
      name: "Summarize",
      description: "Summarize content",
      execute: async (content: string) => {
        return await this.aiFeatures.chatWithAI(
          `Summarize this content: ${content}`
        );
      },
    });
  }

  /**
   * 📝 ลงทะเบียน Tool
   */
  registerTool(id: string, tool: Tool): void {
    this.tools.set(id, tool);
  }

  /**
   * 📄 ลงทะเบียน Document
   */
  registerDocument(id: string, document: Document): void {
    this.documents.set(id, document);
  }

  /**
   * 🔍 ประมวลผล @ Commands
   */
  async processAtCommand(message: string): Promise<string> {
    const atCommands = message.match(/@(\w+)(?:\s+(.+))?/g);

    if (!atCommands) {
      return message; // ไม่มี @ commands
    }

    let processedMessage = message;

    for (const command of atCommands) {
      const match = command.match(/@(\w+)(?:\s+(.+))?/);
      if (!match) continue;

      const [, commandName, args] = match;
      const result = await this.executeAtCommand(commandName, args || "");

      // แทนที่ command ด้วยผลลัพธ์
      processedMessage = processedMessage.replace(command, result);
    }

    return processedMessage;
  }

  /**
   * ⚡ ทำ @ Command
   */
  private async executeAtCommand(
    commandName: string,
    args: string
  ): Promise<string> {
    // ตรวจสอบ Tool
    if (this.tools.has(commandName)) {
      const tool = this.tools.get(commandName)!;
      try {
        return await tool.execute(args);
      } catch (error) {
        return `Error executing @${commandName}: ${error}`;
      }
    }

    // ตรวจสอบ Document
    if (this.documents.has(commandName)) {
      const document = this.documents.get(commandName)!;
      return `Document: ${document.name}\nContent: ${document.content}`;
    }

    // Special commands
    switch (commandName) {
      case "help":
        return this.getHelpText();

      case "list":
        return this.getListText();

      case "import":
        return await this.importDocument(args);

      case "url":
        return await this.importFromUrl(args);

      default:
        return `Unknown @ command: ${commandName}. Use @help for available commands.`;
    }
  }

  /**
   * 📚 นำเข้า Document
   */
  private async importDocument(content: string): Promise<string> {
    const id = `doc_${Date.now()}`;
    const document: Document = {
      id,
      name: `Imported Document ${id}`,
      content,
      type: "text",
      timestamp: new Date(),
    };

    this.documents.set(id, document);
    return `Document imported as @${id}`;
  }

  /**
   * 🌐 นำเข้าจาก URL
   */
  private async importFromUrl(url: string): Promise<string> {
    try {
      new Notice(`📥 Importing from URL: ${url}`);

      // จำลองการดึงข้อมูลจาก URL
      const content = await this.fetchUrlContent(url);

      const id = `url_${Date.now()}`;
      const document: Document = {
        id,
        name: `URL Document: ${url}`,
        content,
        type: "url",
        url,
        timestamp: new Date(),
      };

      this.documents.set(id, document);
      return `URL content imported as @${id}`;
    } catch (error) {
      return `Error importing from URL: ${error}`;
    }
  }

  /**
   * 🌐 ดึงข้อมูลจาก URL
   */
  private async fetchUrlContent(url: string): Promise<string> {
    // จำลองการดึงข้อมูล (ในความเป็นจริงควรใช้ fetch API)
    return `Content from ${url}\n\nThis is a simulated content fetch. In a real implementation, this would fetch the actual content from the URL.`;
  }

  /**
   * 📋 ข้อความช่วยเหลือ
   */
  private getHelpText(): string {
    return `Available @ Commands:

Tools:
${Array.from(this.tools.entries())
  .map(([id, tool]) => `@${id} - ${tool.description}`)
  .join("\n")}

Documents:
${Array.from(this.documents.entries())
  .map(([id, doc]) => `@${id} - ${doc.name}`)
  .join("\n")}

Special Commands:
@help - Show this help
@list - List all available commands
@import <content> - Import text as document
@url <url> - Import content from URL

Usage: @command_name [arguments]`;
  }

  /**
   * 📝 รายการ Commands
   */
  private getListText(): string {
    const tools = Array.from(this.tools.keys()).map((id) => `@${id}`);
    const documents = Array.from(this.documents.keys()).map((id) => `@${id}`);
    const special = ["@help", "@list", "@import", "@url"];

    return `Available Commands:

Tools: ${tools.join(", ")}
Documents: ${documents.join(", ")}
Special: ${special.join(", ")}`;
  }

  /**
   * 📊 สถิติ
   */
  getStats(): { tools: number; documents: number } {
    return {
      tools: this.tools.size,
      documents: this.documents.size,
    };
  }

  /**
   * 🗑️ ลบ Document
   */
  removeDocument(id: string): boolean {
    return this.documents.delete(id);
  }

  /**
   * 🗑️ ลบ Tool
   */
  removeTool(id: string): boolean {
    return this.tools.delete(id);
  }
}

/**
 * 📄 Document Interface
 */
interface Document {
  id: string;
  name: string;
  content: string;
  type: "text" | "url" | "file";
  url?: string;
  timestamp: Date;
}

/**
 * 🔧 Tool Interface
 */
interface Tool {
  name: string;
  description: string;
  execute: (args: string) => Promise<string>;
}
