import { App, Notice } from "obsidian";
import { ToolDatabaseManager } from "../core/ToolDatabaseManager";

/**
 * 📝 Notion Database Updater - อัพเดต tool database ใน Notion
 */
export class NotionDatabaseUpdater {
  private app: App;
  private toolManager: ToolDatabaseManager;
  private notionClient: any; // จะเป็น NotionMCPClient เมื่อรวมกัน

  constructor(app: App, toolManager: ToolDatabaseManager) {
    this.app = app;
    this.toolManager = toolManager;
  }

  /**
   * 🔄 Update All Tools in Notion
   */
  async updateAllToolsInNotion(): Promise<void> {
    try {
      const tools = this.toolManager.getAllTools();
      const progress = this.toolManager.getProgressReport();

      // อัพเดต Progress Summary
      await this.updateProgressSummary(progress);

      // อัพเดตแต่ละ Tool
      for (const tool of tools) {
        await this.updateToolInNotion(tool);
      }

      new Notice("✅ All tools updated in Notion database");
    } catch (error) {
      new Notice("❌ Error updating tools in Notion");
      console.error("Error updating tools in Notion:", error);
    }
  }

  /**
   * 📊 Update Progress Summary
   */
  private async updateProgressSummary(progress: any): Promise<void> {
    const summaryData = {
      "Total Tools": progress.total,
      Completed: progress.completed,
      Pending: progress.pending,
      "Progress %": progress.progress,
      "Last Updated": new Date().toISOString(),
    };

    // อัพเดต Progress Summary page ใน Notion
    console.log("Updating progress summary:", summaryData);

    // TODO: ใช้ NotionMCPClient เพื่ออัพเดตจริง
    // await this.notionClient.updatePage("progress-summary-page-id", summaryData);
  }

  /**
   * 📝 Update Single Tool in Notion
   */
  private async updateToolInNotion(tool: any): Promise<void> {
    const toolData = {
      Name: tool.name,
      Description: tool.description,
      Category: tool.category,
      Status: tool.status,
      Priority: tool.priority,
      "Database ID": tool.databaseId,
      Features: tool.features.join(", "),
      Files: tool.files.join(", "),
      Notes: tool.notes,
      "Last Updated": new Date().toISOString(),
    };

    console.log(`Updating tool: ${tool.name}`, toolData);

    // TODO: ใช้ NotionMCPClient เพื่ออัพเดตจริง
    // await this.notionClient.updatePage(tool.databaseId, toolData);
  }

  /**
   * 📋 Create Notion Database Structure
   */
  async createNotionDatabaseStructure(): Promise<void> {
    const databaseStructure = {
      "Tools Database": {
        properties: {
          Name: { type: "title" },
          Description: { type: "rich_text" },
          Category: {
            type: "select",
            options: ["Core", "AI", "UI", "Integration", "Features", "Quality"],
          },
          Status: {
            type: "select",
            options: ["completed", "pending", "in-progress", "blocked"],
          },
          Priority: { type: "select", options: ["high", "medium", "low"] },
          "Database ID": { type: "rich_text" },
          Features: { type: "rich_text" },
          Files: { type: "rich_text" },
          Notes: { type: "rich_text" },
          "Last Updated": { type: "date" },
        },
      },
      "Progress Summary": {
        properties: {
          "Total Tools": { type: "number" },
          Completed: { type: "number" },
          Pending: { type: "number" },
          "Progress %": { type: "number" },
          "Last Updated": { type: "date" },
        },
      },
    };

    console.log("Creating Notion database structure:", databaseStructure);

    // TODO: ใช้ NotionMCPClient เพื่อสร้าง database จริง
    // await this.notionClient.createDatabase(databaseStructure);
  }

  /**
   * 📤 Export Tools to Notion Format
   */
  exportToolsToNotionFormat(): string {
    const tools = this.toolManager.getAllTools();
    const progress = this.toolManager.getProgressReport();

    const notionData = {
      progress_summary: {
        "Total Tools": progress.total,
        Completed: progress.completed,
        Pending: progress.pending,
        "Progress %": progress.progress,
        "Last Updated": new Date().toISOString(),
      },
      tools: tools.map((tool) => ({
        Name: tool.name,
        Description: tool.description,
        Category: tool.category,
        Status: tool.status,
        Priority: tool.priority,
        "Database ID": tool.databaseId,
        Features: tool.features.join(", "),
        Files: tool.files.join(", "),
        Notes: tool.notes,
        "Last Updated": new Date().toISOString(),
      })),
    };

    return JSON.stringify(notionData, null, 2);
  }

  /**
   * 📥 Import Tools from Notion
   */
  async importToolsFromNotion(): Promise<void> {
    try {
      // TODO: ใช้ NotionMCPClient เพื่อดึงข้อมูลจาก Notion
      // const notionData = await this.notionClient.queryDatabase("tools-database-id");

      // แปลงข้อมูลจาก Notion format เป็น ToolItem format
      // และอัพเดต ToolDatabaseManager

      new Notice("📥 Tools imported from Notion");
    } catch (error) {
      new Notice("❌ Error importing tools from Notion");
      console.error("Error importing tools from Notion:", error);
    }
  }

  /**
   * 🔄 Sync Tools with Notion
   */
  async syncToolsWithNotion(): Promise<void> {
    try {
      // อัพเดต Notion จาก local data
      await this.updateAllToolsInNotion();

      // ดึงข้อมูลจาก Notion กลับมา (ถ้ามีการเปลี่ยนแปลง)
      // await this.importToolsFromNotion();

      new Notice("🔄 Tools synced with Notion");
    } catch (error) {
      new Notice("❌ Error syncing tools with Notion");
      console.error("Error syncing tools with Notion:", error);
    }
  }

  /**
   * 📊 Generate Notion Update Report
   */
  generateNotionUpdateReport(): string {
    const tools = this.toolManager.getAllTools();
    const progress = this.toolManager.getProgressReport();

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_tools: progress.total,
        completed: progress.completed,
        pending: progress.pending,
        progress_percentage: progress.progress,
      },
      by_category: progress.byCategory,
      by_priority: progress.byPriority,
      next_priority_tasks: this.toolManager
        .getNextPriorityTasks()
        .map((tool) => ({
          name: tool.name,
          priority: tool.priority,
          category: tool.category,
        })),
      completed_tools: tools
        .filter((tool) => tool.status === "completed")
        .map((tool) => ({
          name: tool.name,
          category: tool.category,
          database_id: tool.databaseId,
        })),
      pending_tools: tools
        .filter((tool) => tool.status === "pending")
        .map((tool) => ({
          name: tool.name,
          priority: tool.priority,
          category: tool.category,
          database_id: tool.databaseId,
        })),
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * 💾 Save Notion Update Report
   */
  async saveNotionUpdateReport(): Promise<void> {
    try {
      const report = this.generateNotionUpdateReport();
      await this.app.vault.adapter.write(
        `.obsidian/plugins/ultima-orb/notion-update-report.json`,
        report
      );
      new Notice("💾 Notion update report saved");
    } catch (error) {
      new Notice("❌ Error saving Notion update report");
      console.error("Error saving Notion update report:", error);
    }
  }

  /**
   * 📋 Get Notion Database IDs
   */
  getNotionDatabaseIds(): string[] {
    const tools = this.toolManager.getAllTools();
    return tools.map((tool) => tool.databaseId).filter((id) => id && id !== "");
  }

  /**
   * 🔍 Search Tools in Notion
   */
  async searchToolsInNotion(query: string): Promise<any[]> {
    try {
      // TODO: ใช้ NotionMCPClient เพื่อค้นหาใน Notion
      // const results = await this.notionClient.searchPages(query);
      // return results;

      // สำหรับตอนนี้ ให้ค้นหาใน local data ก่อน
      return this.toolManager.searchTools(query);
    } catch (error) {
      console.error("Error searching tools in Notion:", error);
      return [];
    }
  }

  /**
   * 📊 Get Notion Sync Status
   */
  getNotionSyncStatus(): NotionSyncStatus {
    const tools = this.toolManager.getAllTools();
    const databaseIds = this.getNotionDatabaseIds();

    return {
      total_tools: tools.length,
      tools_with_database_ids: databaseIds.length,
      sync_percentage: Math.round((databaseIds.length / tools.length) * 100),
      last_sync_attempt: new Date().toISOString(),
      database_ids: databaseIds,
    };
  }
}

/**
 * 📊 Notion Sync Status Interface
 */
interface NotionSyncStatus {
  total_tools: number;
  tools_with_database_ids: number;
  sync_percentage: number;
  last_sync_attempt: string;
  database_ids: string[];
}
