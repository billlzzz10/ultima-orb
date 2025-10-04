import { ToolBase, ToolMetadata, ToolResult } from "../core/tools/ToolBase";
import { App } from "obsidian";
import { APIManagerTool } from "./APIManagerTool";

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: "on_create" | "on_update" | "on_schedule" | "manual";
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

export interface AutomationCondition {
  field: string;
  operator:
    | "equals"
    | "not_equals"
    | "contains"
    | "not_contains"
    | "greater_than"
    | "less_than"
    | "is_empty"
    | "is_not_empty";
  value?: any;
}

export interface AutomationAction {
  type:
    | "update_property"
    | "add_tag"
    | "create_page"
    | "send_notification"
    | "export_data"
    | "sync_to_obsidian";
  target: string;
  value?: any;
  parameters?: Record<string, any>;
}

export interface SyncConfig {
  id: string;
  sourceDatabase: string;
  targetFolder: string;
  syncDirection: "notion_to_obsidian" | "obsidian_to_notion" | "bidirectional";
  propertyMapping: Record<string, string>;
  syncSchedule: "manual" | "hourly" | "daily" | "weekly";
  lastSync?: string;
  enabled: boolean;
}

export class NotionDataAutomationTool extends ToolBase {
  private app: App;
  private apiManager: APIManagerTool;
  private notionBaseUrl = "https://api.notion.com/v1";
  private automationRules: AutomationRule[] = [];
  private syncConfigs: SyncConfig[] = [];

  constructor(app: App, apiManager: APIManagerTool) {
    super({
      id: "notion-data-automation",
      name: "Notion Data Automation",
      description: "จัดการข้อมูล Notion แบบอัตโนมัติ พร้อม sync กับ Obsidian",
      category: "Automation",
      icon: "⚡",
      version: "1.0.0",
      author: "Ultima-Orb Team",
      tags: ["automation", "notion", "sync", "data-management", "workflow"],
      commands: [
        {
          name: "create_automation_rule",
          description: "สร้างกฎการทำงานอัตโนมัติ",
          parameters: {
            name: {
              type: "string",
              required: true,
              description: "ชื่อกฎการทำงาน",
            },
            trigger: {
              type: "string",
              required: true,
              description:
                "ตัวกระตุ้น: on_create, on_update, on_schedule, manual",
            },
            conditions: {
              type: "array",
              required: false,
              description: "เงื่อนไขการทำงาน",
            },
            actions: {
              type: "array",
              required: true,
              description: "การดำเนินการเมื่อเงื่อนไขเป็นจริง",
            },
          },
        },
        {
          name: "setup_sync",
          description: "ตั้งค่าการซิงค์ข้อมูลกับ Obsidian",
          parameters: {
            sourceDatabase: {
              type: "string",
              required: true,
              description: "ID ของ Notion database ต้นทาง",
            },
            targetFolder: {
              type: "string",
              required: true,
              description: "โฟลเดอร์เป้าหมายใน Obsidian",
            },
            syncDirection: {
              type: "string",
              required: true,
              description:
                "ทิศทางการซิงค์: notion_to_obsidian, obsidian_to_notion, bidirectional",
            },
            propertyMapping: {
              type: "object",
              required: false,
              description: "การจับคู่ properties ระหว่าง Notion และ Obsidian",
            },
          },
        },
        {
          name: "run_automation",
          description: "รันกฎการทำงานอัตโนมัติ",
          parameters: {
            ruleId: {
              type: "string",
              required: false,
              description: "ID ของกฎที่ต้องการรัน (ถ้าไม่ระบุจะรันทั้งหมด)",
            },
            force: {
              type: "boolean",
              required: false,
              description: "บังคับรันแม้เงื่อนไขไม่ตรง",
            },
          },
        },
        {
          name: "sync_data",
          description: "ซิงค์ข้อมูลตามการตั้งค่า",
          parameters: {
            configId: {
              type: "string",
              required: false,
              description: "ID ของการตั้งค่าซิงค์ (ถ้าไม่ระบุจะซิงค์ทั้งหมด)",
            },
            direction: {
              type: "string",
              required: false,
              description: "ทิศทางการซิงค์เฉพาะครั้งนี้",
            },
          },
        },
        {
          name: "export_automation_data",
          description: "ส่งออกข้อมูลการทำงานอัตโนมัติ",
          parameters: {
            format: {
              type: "string",
              required: false,
              description: "รูปแบบการส่งออก: json, csv, markdown",
            },
            includeHistory: {
              type: "boolean",
              required: false,
              description: "รวมประวัติการทำงาน",
            },
          },
        },
      ],
    });
    this.app = app;
    this.apiManager = apiManager;
    this.loadAutomationData();
  }

  async execute(params: {
    action: string;
    name?: string;
    trigger?: AutomationRule["trigger"];
    conditions?: AutomationCondition[];
    actions?: AutomationAction[];
    sourceDatabase?: string;
    targetFolder?: string;
    syncDirection?: SyncConfig["syncDirection"];
    propertyMapping?: Record<string, string>;
    ruleId?: string;
    force?: boolean;
    configId?: string;
    direction?: SyncConfig["syncDirection"];
    format?: "json" | "csv" | "markdown";
    includeHistory?: boolean;
  }): Promise<ToolResult> {
    try {
      switch (params.action) {
        case "create_automation_rule":
          return await this.createAutomationRule(
            params.name!,
            params.trigger!,
            params.conditions,
            params.actions!
          );

        case "setup_sync":
          return await this.setupSync(
            params.sourceDatabase!,
            params.targetFolder!,
            params.syncDirection!,
            params.propertyMapping
          );

        case "run_automation":
          return await this.runAutomation(params.ruleId, params.force);

        case "sync_data":
          return await this.syncData(params.configId, params.direction);

        case "export_automation_data":
          return await this.exportAutomationData(
            params.format,
            params.includeHistory
          );

        default:
          return {
            success: false,
            error: `Unknown action: ${params.action}`,
            message: "ไม่รู้จักการดำเนินการที่ระบุ",
            timestamp: new Date(),
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "เกิดข้อผิดพลาดในการดำเนินการ",
        timestamp: new Date(),
      };
    }
  }

  private async createAutomationRule(
    name: string,
    trigger: AutomationRule["trigger"],
    conditions?: AutomationCondition[],
    actions?: AutomationAction[]
  ): Promise<ToolResult> {
    if (!name || !trigger || !actions) {
      return {
        success: false,
        error: "Missing required parameters: name, trigger, and actions are required.",
        timestamp: new Date(),
      };
    }
    try {
      const rule: AutomationRule = {
        id: this.generateId(),
        name,
        description: `กฎการทำงานอัตโนมัติสำหรับ ${name}`,
        trigger,
        conditions: conditions || [],
        actions: actions || [],
        enabled: true,
        lastRun: undefined,
        nextRun: this.calculateNextRun(trigger),
      };

      this.automationRules.push(rule);
      await this.saveAutomationData();

      return {
        success: true,
        data: rule,
        message: `สร้างกฎการทำงาน "${name}" สำเร็จ`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "เกิดข้อผิดพลาดในการสร้างกฎการทำงาน",
        timestamp: new Date(),
      };
    }
  }

  private async setupSync(
    sourceDatabase: string,
    targetFolder: string,
    syncDirection: SyncConfig["syncDirection"],
    propertyMapping?: Record<string, string>
  ): Promise<ToolResult> {
    try {
      const config: SyncConfig = {
        id: `sync_${Date.now()}`,
        sourceDatabase,
        targetFolder,
        syncDirection,
        propertyMapping: propertyMapping || {
          title: "title",
          status: "status",
          priority: "priority",
          due_date: "due_date",
        },
        syncSchedule: "daily",
        lastSync: undefined,
        enabled: true,
      };

      this.syncConfigs.push(config);
      await this.saveAutomationData();

      return {
        success: true,
        data: config,
        message: `ตั้งค่าการซิงค์สำเร็จ: ${sourceDatabase} → ${targetFolder}`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "เกิดข้อผิดพลาดในการตั้งค่าการซิงค์",
        timestamp: new Date(),
      };
    }
  }

  private async runAutomation(
    ruleId?: string,
    force?: boolean
  ): Promise<ToolResult> {
    try {
      const rulesToRun = ruleId
        ? this.automationRules.filter((rule) => rule.id === ruleId)
        : this.automationRules.filter((rule) => rule.enabled);

      const results: Array<{
        ruleId: string;
        ruleName: string;
        success: boolean;
        message?: string;
        error?: string;
        executedAt: string;
      }> = [];

      for (const rule of rulesToRun) {
        try {
          const shouldRun = force || this.shouldRunRule(rule);

          if (shouldRun) {
            const result = await this.executeRule(rule);
            results.push({
              ruleId: rule.id,
              ruleName: rule.name,
              success: result.success,
              message: result.message,
              executedAt: new Date().toISOString(),
            });

            rule.lastRun = new Date().toISOString();
            rule.nextRun = this.calculateNextRun(rule.trigger);
          }
        } catch (error) {
          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            success: false,
            error: error instanceof Error ? error.message : String(error),
            executedAt: new Date().toISOString(),
          });
        }
      }

      await this.saveAutomationData();

      return {
        success: true,
        data: {
          totalRules: rulesToRun.length,
          executedRules: results.length,
          results,
        },
        message: `รันกฎการทำงานสำเร็จ ${results.length} กฎ`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "เกิดข้อผิดพลาดในการรันกฎการทำงาน",
        timestamp: new Date(),
      };
    }
  }

  private async syncData(
    configId?: string,
    direction?: SyncConfig["syncDirection"]
  ): Promise<ToolResult> {
    try {
      const configsToSync = configId
        ? this.syncConfigs.filter((config) => config.id === configId)
        : this.syncConfigs.filter((config) => config.enabled);

      const results: Array<{
        configId: string;
        targetFolder: string;
        direction?: SyncConfig["syncDirection"];
        success: boolean;
        message?: string;
        error?: string;
        syncedAt: string;
      }> = [];

      for (const config of configsToSync) {
        try {
          const syncDirection = direction || config.syncDirection;
          const result = await this.performSync(config, syncDirection);

          results.push({
            configId: config.sourceDatabase,
            targetFolder: config.targetFolder,
            direction: syncDirection,
            success: result.success,
            message: result.message,
            syncedAt: new Date().toISOString(),
          });

          config.lastSync = new Date().toISOString();
        } catch (error) {
          results.push({
            configId: config.sourceDatabase,
            targetFolder: config.targetFolder,
            success: false,
            error: error instanceof Error ? error.message : String(error),
            syncedAt: new Date().toISOString(),
          });
        }
      }

      await this.saveAutomationData();

      return {
        success: true,
        data: {
          totalConfigs: configsToSync.length,
          syncedConfigs: results.length,
          results,
        },
        message: `ซิงค์ข้อมูลสำเร็จ ${results.length} การตั้งค่า`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "เกิดข้อผิดพลาดในการซิงค์ข้อมูล",
        timestamp: new Date(),
      };
    }
  }

  private async exportAutomationData(
    format?: "json" | "csv" | "markdown",
    includeHistory?: boolean
  ): Promise<ToolResult> {
    try {
      const exportData = {
        automationRules: this.automationRules,
        syncConfigs: this.syncConfigs,
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      };

      let content: string;
      let filename: string;

      switch (format) {
        case "csv":
          content = this.convertToCSV(exportData);
          filename = `automation-data-${
            new Date().toISOString().split("T")[0]
          }.csv`;
          break;
        case "markdown":
          content = this.convertToMarkdown(exportData);
          filename = `automation-data-${
            new Date().toISOString().split("T")[0]
          }.md`;
          break;
        default:
          content = JSON.stringify(exportData, null, 2);
          filename = `automation-data-${
            new Date().toISOString().split("T")[0]
          }.json`;
      }

      const filePath = `Automation Exports/${filename}`;
      await this.ensureFolderExists("Automation Exports");
      await this.app.vault.create(filePath, content);

      return {
        success: true,
        data: {
          filename,
          filePath,
          format: format || "json",
          recordCount: this.automationRules.length + this.syncConfigs.length,
        },
        message: `ส่งออกข้อมูลสำเร็จ: ${filename}`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "เกิดข้อผิดพลาดในการส่งออกข้อมูล",
        timestamp: new Date(),
      };
    }
  }

  // Helper methods
  private generateId(): string {
    return `automation_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  private calculateNextRun(
    trigger: AutomationRule["trigger"]
  ): string | undefined {
    if (trigger === "on_schedule") {
      const nextRun = new Date();
      nextRun.setHours(nextRun.getHours() + 1);
      return nextRun.toISOString();
    }
    return undefined;
  }

  private shouldRunRule(rule: AutomationRule): boolean {
    if (rule.trigger === "manual") {
      return false;
    }

    if (rule.trigger === "on_schedule" && rule.nextRun) {
      return new Date() >= new Date(rule.nextRun);
    }

    return true;
  }

  private async executeRule(
    rule: AutomationRule
  ): Promise<{ success: boolean; message: string }> {
    const conditionsMet = await this.checkConditions(rule.conditions);

    if (!conditionsMet) {
      return {
        success: false,
        message: "เงื่อนไขไม่ตรง",
      };
    }

    for (const action of rule.actions) {
      await this.executeAction(action);
    }

    return {
      success: true,
      message: `ดำเนินการ ${rule.actions.length} การกระทำสำเร็จ`,
    };
  }

  private async checkConditions(
    conditions: AutomationCondition[]
  ): Promise<boolean> {
    // ตรวจสอบเงื่อนไข (ตัวอย่าง)
    return true;
  }

  private async executeAction(action: AutomationAction): Promise<void> {
    switch (action.type) {
      case "update_property":
        await this.updateProperty(action.target, action.value);
        break;
      case "add_tag":
        // await this.addTag(action.target, action.value);
        break;
      case "create_page":
        await this.createPage(action.target, action.value, action.parameters);
        break;
      case "send_notification":
        await this.sendNotification(action.value, action.parameters);
        break;
      case "export_data":
        await this.exportData(action.target, action.parameters);
        break;
      case "sync_to_obsidian":
        await this.syncToObsidian(
          action.target,
          action.value,
          action.parameters
        );
        break;
    }
  }

  private async performSync(
    config: SyncConfig,
    direction: SyncConfig["syncDirection"]
  ): Promise<{ success: boolean; message: string }> {
    try {
      switch (direction) {
        case "notion_to_obsidian":
          await this.syncNotionToObsidian(config);
          break;
        case "obsidian_to_notion":
          await this.syncObsidianToNotion(config);
          break;
        case "bidirectional":
          await this.syncNotionToObsidian(config);
          await this.syncObsidianToNotion(config);
          break;
      }

      return {
        success: true,
        message: `ซิงค์ ${direction} สำเร็จ`,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async syncNotionToObsidian(config: SyncConfig): Promise<void> {
    // ดึงข้อมูลจาก Notion และสร้างไฟล์ใน Obsidian
    console.info(`Syncing ${config.sourceDatabase} to ${config.targetFolder}`);
  }

  private async syncObsidianToNotion(config: SyncConfig): Promise<void> {
    // อัปเดตข้อมูลใน Notion จากไฟล์ Obsidian
    console.info(`Syncing ${config.targetFolder} to ${config.sourceDatabase}`);
  }

  private async updateProperty(target: string, value: any): Promise<void> {
    console.info(`Updating property ${target} with value ${value}`);
  }

  addTag(tag: string): void {
    console.info(`Adding tag ${tag}`);
  }

  private async createPage(
    target: string,
    value: any,
    parameters?: Record<string, any>
  ): Promise<void> {
    console.info(`Creating page in ${target} with value ${value}`);
  }

  private async sendNotification(
    message: string,
    parameters?: Record<string, any>
  ): Promise<void> {
    console.info(`🔔 Notification: ${message}`);
  }

  private async exportData(
    target: string,
    parameters?: Record<string, any>
  ): Promise<void> {
    console.info(`Exporting data to ${target}`);
  }

  private async syncToObsidian(
    target: string,
    value: any,
    parameters?: Record<string, any>
  ): Promise<void> {
    console.info(`Syncing ${target} to Obsidian`);
  }

  private async ensureFolderExists(folderPath: string): Promise<void> {
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      // await this.app.vault.createFolder(folderPath);
      console.info(`Would create folder: ${folderPath}`);
    }
  }

  private convertToCSV(data: any): string {
    return "automation_rules,count\n" + this.automationRules.length;
  }

  private convertToMarkdown(data: any): string {
    return `# Automation Data Export

## Automation Rules
Total: ${this.automationRules.length}

${this.automationRules
  .map((rule) => `- ${rule.name} (${rule.trigger})`)
  .join("\n")}

## Sync Configs
Total: ${this.syncConfigs.length}

${this.syncConfigs
  .map((config) => `- ${config.sourceDatabase} → ${config.targetFolder}`)
  .join("\n")}

---
*Exported on: ${new Date().toLocaleString("th-TH")}*
`;
  }

  private async loadAutomationData(): Promise<void> {
    try {
      const automationFile = this.app.vault.getAbstractFileByPath(
        "automation-data.json"
      );
      if (automationFile) {
        const content = await this.app.vault.read(automationFile as any);
        const data = JSON.parse(content);
        this.automationRules = data.automationRules || [];
        this.syncConfigs = data.syncConfigs || [];
      }
    } catch (error) {
      console.warn("Failed to load automation data:", error);
    }
  }

  private async saveAutomationData(): Promise<void> {
    try {
      const data = {
        automationRules: this.automationRules,
        syncConfigs: this.syncConfigs,
        lastUpdated: new Date().toISOString(),
      };

      const content = JSON.stringify(data, null, 2);
      await this.app.vault.create("automation-data.json", content);
    } catch (error) {
      console.error("Failed to save automation data:", error);
    }
  }

  getMetadata(): ToolMetadata {
    return {
      id: "notion-data-automation",
      name: "Notion Data Automation",
      description: "จัดการข้อมูล Notion แบบอัตโนมัติ พร้อม sync กับ Obsidian",
      category: "Automation",
      icon: "⚡",
      version: "1.0.0",
      author: "Ultima-Orb Team",
      tags: ["automation", "notion", "sync", "data-management", "workflow"],
      commands: this.metadata.commands,
    };
  }
}
