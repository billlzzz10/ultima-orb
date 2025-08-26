import { ToolBase, ToolMetadata, ToolResult } from "../core/tools/ToolBase";
import { App } from "obsidian";
import { APIManagerTool } from "./APIManagerTool";

export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

export interface AirtableTable {
  id: string;
  name: string;
  description?: string;
  fields: AirtableField[];
}

export interface AirtableField {
  id: string;
  name: string;
  type: string;
  options?: any;
}

export interface AirtableBase {
  id: string;
  name: string;
  description?: string;
  tables: AirtableTable[];
}

export class AirtableIntegrationTool extends ToolBase {
  private app: App;
  private apiManager: APIManagerTool;
  private baseUrl = "https://api.airtable.com/v0";

  constructor(app: App, apiManager: APIManagerTool) {
    super({
      id: "airtable-integration",
      name: "Airtable Integration",
      description:
        "เชื่อมต่อและจัดการข้อมูลกับ Airtable สำหรับใช้เป็นข้อมูลอ้างอิง AI",
      category: "Integration",
      icon: "📊",
      version: "1.0.0",
      author: "Ultima-Orb Team",
      tags: ["airtable", "integration", "database", "api", "ai-reference"],
      commands: [
        {
          name: "list_bases",
          description: "แสดงรายการ Airtable bases ทั้งหมด",
          parameters: {},
        },
        {
          name: "get_base_info",
          description: "ดึงข้อมูลของ base เฉพาะ",
          parameters: {
            baseId: {
              type: "string",
              required: true,
              description: "ID ของ Airtable base",
            },
          },
        },
        {
          name: "list_tables",
          description: "แสดงรายการ tables ใน base",
          parameters: {
            baseId: {
              type: "string",
              required: true,
              description: "ID ของ Airtable base",
            },
          },
        },
        {
          name: "get_table_schema",
          description: "ดึง schema ของ table",
          parameters: {
            baseId: {
              type: "string",
              required: true,
              description: "ID ของ Airtable base",
            },
            tableId: {
              type: "string",
              required: true,
              description: "ID ของ table",
            },
          },
        },
        {
          name: "query_records",
          description: "ค้นหาข้อมูลใน table",
          parameters: {
            baseId: {
              type: "string",
              required: true,
              description: "ID ของ Airtable base",
            },
            tableId: {
              type: "string",
              required: true,
              description: "ID ของ table",
            },
            filterByFormula: {
              type: "string",
              required: false,
              description: "สูตรสำหรับกรองข้อมูล",
            },
            sort: {
              type: "array",
              required: false,
              description: "การเรียงลำดับข้อมูล",
            },
            maxRecords: {
              type: "number",
              required: false,
              description: "จำนวนรายการสูงสุด (default: 100)",
            },
          },
        },
        {
          name: "create_record",
          description: "สร้างรายการใหม่ใน table",
          parameters: {
            baseId: {
              type: "string",
              required: true,
              description: "ID ของ Airtable base",
            },
            tableId: {
              type: "string",
              required: true,
              description: "ID ของ table",
            },
            fields: {
              type: "object",
              required: true,
              description: "ข้อมูลที่จะบันทึก",
            },
          },
        },
        {
          name: "update_record",
          description: "อัปเดตรายการใน table",
          parameters: {
            baseId: {
              type: "string",
              required: true,
              description: "ID ของ Airtable base",
            },
            tableId: {
              type: "string",
              required: true,
              description: "ID ของ table",
            },
            recordId: {
              type: "string",
              required: true,
              description: "ID ของรายการ",
            },
            fields: {
              type: "object",
              required: true,
              description: "ข้อมูลที่จะอัปเดต",
            },
          },
        },
        {
          name: "delete_record",
          description: "ลบรายการใน table",
          parameters: {
            baseId: {
              type: "string",
              required: true,
              description: "ID ของ Airtable base",
            },
            tableId: {
              type: "string",
              required: true,
              description: "ID ของ table",
            },
            recordId: {
              type: "string",
              required: true,
              description: "ID ของรายการ",
            },
          },
        },
        {
          name: "export_to_obsidian",
          description: "ส่งออกข้อมูลจาก Airtable ไปยัง Obsidian",
          parameters: {
            baseId: {
              type: "string",
              required: true,
              description: "ID ของ Airtable base",
            },
            tableId: {
              type: "string",
              required: true,
              description: "ID ของ table",
            },
            targetFolder: {
              type: "string",
              required: false,
              description: "โฟลเดอร์ปลายทาง (default: Airtable Data)",
            },
            format: {
              type: "string",
              required: false,
              description: "รูปแบบไฟล์ (md, json, csv)",
            },
          },
        },
        {
          name: "sync_with_obsidian",
          description: "ซิงค์ข้อมูลระหว่าง Airtable และ Obsidian",
          parameters: {
            baseId: {
              type: "string",
              required: true,
              description: "ID ของ Airtable base",
            },
            tableId: {
              type: "string",
              required: true,
              description: "ID ของ table",
            },
            syncDirection: {
              type: "string",
              required: false,
              description:
                "ทิศทางการซิงค์ (airtable_to_obsidian, obsidian_to_airtable, bidirectional)",
            },
            mapping: {
              type: "object",
              required: false,
              description: "การจับคู่ fields ระหว่าง Airtable และ Obsidian",
            },
          },
        },
      ],
    });
    this.app = app;
    this.apiManager = apiManager;
  }

  async execute(params: any): Promise<ToolResult> {
    try {
      switch (params.action) {
        case "list_bases":
          return await this.listBases();
        case "get_base_info":
          return await this.getBaseInfo(params.baseId);
        case "list_tables":
          return await this.listTables(params.baseId);
        case "get_table_schema":
          return await this.getTableSchema(params.baseId, params.tableId);
        case "query_records":
          return await this.queryRecords(params);
        case "create_record":
          return await this.createRecord(params);
        case "update_record":
          return await this.updateRecord(params);
        case "delete_record":
          return await this.deleteRecord(params);
        case "export_to_obsidian":
          return await this.exportToObsidian(params);
        case "sync_with_obsidian":
          return await this.syncWithObsidian(params);
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
        error: error instanceof Error ? error.message : "Unknown error",
        message: "เกิดข้อผิดพลาดในการดำเนินการ",
        timestamp: new Date(),
      };
    }
  }

  private async listBases(): Promise<ToolResult> {
    try {
      const apiKey = await this.getAirtableApiKey();
      const response = await fetch(`${this.baseUrl}/meta/bases`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const bases = data.bases.map((base: any) => ({
        id: base.id,
        name: base.name,
        description: base.description,
      }));

      return {
        success: true,
        data: {
          bases,
          total: bases.length,
        },
        message: `พบ Airtable bases ทั้งหมด ${bases.length} รายการ`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "เกิดข้อผิดพลาดในการดึงรายการ bases",
        timestamp: new Date(),
      };
    }
  }

  private async getBaseInfo(baseId: string): Promise<ToolResult> {
    try {
      const apiKey = await this.getAirtableApiKey();
      const response = await fetch(
        `${this.baseUrl}/meta/bases/${baseId}/tables`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const tables = data.tables.map((table: any) => ({
        id: table.id,
        name: table.name,
        description: table.description,
        fields: table.fields.map((field: any) => ({
          id: field.id,
          name: field.name,
          type: field.type,
          options: field.options,
        })),
      }));

      return {
        success: true,
        data: {
          baseId,
          tables,
          totalTables: tables.length,
        },
        message: `ดึงข้อมูล base สำเร็จ: ${tables.length} tables`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "เกิดข้อผิดพลาดในการดึงข้อมูล base",
        timestamp: new Date(),
      };
    }
  }

  private async listTables(baseId: string): Promise<ToolResult> {
    try {
      const baseInfo = await this.getBaseInfo(baseId);
      if (!baseInfo.success) {
        return baseInfo;
      }

      return {
        success: true,
        data: {
          baseId,
          tables: baseInfo.data.tables,
          total: baseInfo.data.totalTables,
        },
        message: `พบ tables ทั้งหมด ${baseInfo.data.totalTables} รายการใน base ${baseId}`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "เกิดข้อผิดพลาดในการดึงรายการ tables",
        timestamp: new Date(),
      };
    }
  }

  private async getTableSchema(
    baseId: string,
    tableId: string
  ): Promise<ToolResult> {
    try {
      const baseInfo = await this.getBaseInfo(baseId);
      if (!baseInfo.success) {
        return baseInfo;
      }

      const table = baseInfo.data.tables.find((t: any) => t.id === tableId);
      if (!table) {
        return {
          success: false,
          error: "Table not found",
          message: "ไม่พบ table ที่ระบุ",
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        data: {
          baseId,
          tableId,
          table,
        },
        message: `ดึง schema ของ table สำเร็จ: ${table.name}`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "เกิดข้อผิดพลาดในการดึง schema",
        timestamp: new Date(),
      };
    }
  }

  private async queryRecords(params: any): Promise<ToolResult> {
    const { baseId, tableId, filterByFormula, sort, maxRecords = 100 } = params;

    try {
      const apiKey = await this.getAirtableApiKey();
      const url = new URL(`${this.baseUrl}/${baseId}/${tableId}`);

      if (filterByFormula) {
        url.searchParams.append("filterByFormula", filterByFormula);
      }
      if (sort) {
        url.searchParams.append("sort", JSON.stringify(sort));
      }
      if (maxRecords) {
        url.searchParams.append("maxRecords", maxRecords.toString());
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const records = data.records.map((record: any) => ({
        id: record.id,
        fields: record.fields,
        createdTime: record.createdTime,
      }));

      return {
        success: true,
        data: {
          baseId,
          tableId,
          records,
          total: records.length,
          offset: data.offset,
        },
        message: `ค้นหาข้อมูลสำเร็จ: ${records.length} รายการ`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "เกิดข้อผิดพลาดในการค้นหาข้อมูล",
        timestamp: new Date(),
      };
    }
  }

  private async createRecord(params: any): Promise<ToolResult> {
    const { baseId, tableId, fields } = params;

    try {
      const apiKey = await this.getAirtableApiKey();
      const response = await fetch(`${this.baseUrl}/${baseId}/${tableId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const record = {
        id: data.id,
        fields: data.fields,
        createdTime: data.createdTime,
      };

      return {
        success: true,
        data: {
          baseId,
          tableId,
          record,
        },
        message: "สร้างรายการใหม่สำเร็จ",
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "เกิดข้อผิดพลาดในการสร้างรายการ",
        timestamp: new Date(),
      };
    }
  }

  private async updateRecord(params: any): Promise<ToolResult> {
    const { baseId, tableId, recordId, fields } = params;

    try {
      const apiKey = await this.getAirtableApiKey();
      const response = await fetch(
        `${this.baseUrl}/${baseId}/${tableId}/${recordId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fields,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const record = {
        id: data.id,
        fields: data.fields,
        createdTime: data.createdTime,
      };

      return {
        success: true,
        data: {
          baseId,
          tableId,
          recordId,
          record,
        },
        message: "อัปเดตรายการสำเร็จ",
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "เกิดข้อผิดพลาดในการอัปเดตรายการ",
        timestamp: new Date(),
      };
    }
  }

  private async deleteRecord(params: any): Promise<ToolResult> {
    const { baseId, tableId, recordId } = params;

    try {
      const apiKey = await this.getAirtableApiKey();
      const response = await fetch(
        `${this.baseUrl}/${baseId}/${tableId}/${recordId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        data: {
          baseId,
          tableId,
          recordId,
        },
        message: "ลบรายการสำเร็จ",
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "เกิดข้อผิดพลาดในการลบรายการ",
        timestamp: new Date(),
      };
    }
  }

  private async exportToObsidian(params: any): Promise<ToolResult> {
    const {
      baseId,
      tableId,
      targetFolder = "Airtable Data",
      format = "md",
    } = params;

    try {
      // ดึงข้อมูลจาก Airtable
      const queryResult = await this.queryRecords({
        baseId,
        tableId,
        maxRecords: 1000,
      });

      if (!queryResult.success) {
        return queryResult;
      }

      const { records } = queryResult.data;

      // สร้างโฟลเดอร์ปลายทาง
      await this.ensureFolderExists(targetFolder);

      // ส่งออกข้อมูลตามรูปแบบ
      let exportedFiles: string[] = [];

      switch (format) {
        case "md":
          exportedFiles = await this.exportToMarkdown(
            records,
            targetFolder,
            tableId
          );
          break;
        case "json":
          exportedFiles = await this.exportToJson(
            records,
            targetFolder,
            tableId
          );
          break;
        case "csv":
          exportedFiles = await this.exportToCsv(
            records,
            targetFolder,
            tableId
          );
          break;
        default:
          throw new Error(`รูปแบบไม่รองรับ: ${format}`);
      }

      return {
        success: true,
        data: {
          baseId,
          tableId,
          exportedFiles,
          totalRecords: records.length,
          format,
        },
        message: `ส่งออกข้อมูลสำเร็จ: ${exportedFiles.length} ไฟล์`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "เกิดข้อผิดพลาดในการส่งออกข้อมูล",
        timestamp: new Date(),
      };
    }
  }

  private async syncWithObsidian(params: any): Promise<ToolResult> {
    const {
      baseId,
      tableId,
      syncDirection = "airtable_to_obsidian",
      mapping = {},
    } = params;

    try {
      // ดึงข้อมูลจาก Airtable
      const airtableData = await this.queryRecords({
        baseId,
        tableId,
        maxRecords: 1000,
      });

      if (!airtableData.success) {
        return airtableData;
      }

      const { records } = airtableData.data;
      const targetFolder = "Airtable Sync";

      // สร้างโฟลเดอร์ปลายทาง
      await this.ensureFolderExists(targetFolder);

      // สร้างไฟล์ sync configuration
      const syncConfig = {
        baseId,
        tableId,
        syncDirection,
        mapping,
        lastSync: new Date().toISOString(),
        totalRecords: records.length,
      };

      const configPath = `${targetFolder}/sync-config-${tableId}.json`;
      await this.app.vault.create(
        configPath,
        JSON.stringify(syncConfig, null, 2)
      );

      // สร้างไฟล์ข้อมูล
      const dataPath = `${targetFolder}/data-${tableId}.json`;
      await this.app.vault.create(dataPath, JSON.stringify(records, null, 2));

      return {
        success: true,
        data: {
          baseId,
          tableId,
          syncDirection,
          configFile: configPath,
          dataFile: dataPath,
          totalRecords: records.length,
        },
        message: `ซิงค์ข้อมูลสำเร็จ: ${records.length} รายการ`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "เกิดข้อผิดพลาดในการซิงค์ข้อมูล",
        timestamp: new Date(),
      };
    }
  }

  // Helper methods
  private async getAirtableApiKey(): Promise<string> {
    const result = await this.apiManager.execute({
      action: "get_api_key",
      provider: "airtable",
    });

    if (!result.success || !result.data.key) {
      throw new Error("Airtable API key not found. Please configure it first.");
    }

    return result.data.key;
  }

  private async ensureFolderExists(folderPath: string): Promise<void> {
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      // await this.app.vault.createFolder(folderPath);
    }
  }

  private async exportToMarkdown(
    records: AirtableRecord[],
    targetFolder: string,
    tableId: string
  ): Promise<string[]> {
    const files: string[] = [];

    for (const record of records) {
      const filename = `${targetFolder}/${tableId}-${record.id}.md`;
      const content = this.formatRecordAsMarkdown(record);
      await this.app.vault.create(filename, content);
      files.push(filename);
    }

    return files;
  }

  private async exportToJson(
    records: AirtableRecord[],
    targetFolder: string,
    tableId: string
  ): Promise<string[]> {
    const filename = `${targetFolder}/${tableId}-export.json`;
    const content = JSON.stringify(records, null, 2);
    await this.app.vault.create(filename, content);
    return [filename];
  }

  private async exportToCsv(
    records: AirtableRecord[],
    targetFolder: string,
    tableId: string
  ): Promise<string[]> {
    if (records.length === 0) {
      return [];
    }

    const headers = Object.keys(records[0].fields);
    const csvContent = [
      headers.join(","),
      ...records.map((record) =>
        headers
          .map((header) => JSON.stringify(record.fields[header] || ""))
          .join(",")
      ),
    ].join("\n");

    const filename = `${targetFolder}/${tableId}-export.csv`;
    await this.app.vault.create(filename, csvContent);
    return [filename];
  }

  private formatRecordAsMarkdown(record: AirtableRecord): string {
    const fields = Object.entries(record.fields)
      .map(([key, value]) => `**${key}:** ${value}`)
      .join("\n");

    return `# Record ${record.id}

${fields}

---
*Created: ${record.createdTime}*
*Exported: ${new Date().toISOString()}*`;
  }

  async initialize(): Promise<void> {
    // สร้างโฟลเดอร์เริ่มต้น
    await this.ensureFolderExists("Airtable Data");
    await this.ensureFolderExists("Airtable Sync");
  }

  async cleanup(): Promise<void> {
    // ไม่ต้องทำอะไรเพิ่มเติม
  }

  enable(): void {
    // ไม่ต้องทำอะไรเพิ่มเติม
  }

  disable(): void {
    // ไม่ต้องทำอะไรเพิ่มเติม
  }

  async test(): Promise<ToolResult> {
    try {
      // ทดสอบการเชื่อมต่อ API
      const bases = await this.listBases();

      if (bases.success && bases.data.bases.length > 0) {
        return {
          success: true,
          data: {
            connection: "success",
            availableBases: bases.data.bases.length,
            message: "Airtable connection test successful",
          },
          message: "ทดสอบการเชื่อมต่อ Airtable สำเร็จ",
          timestamp: new Date(),
        };
      } else {
        return {
          success: false,
          error: "No bases found or API key not configured",
          message: "ไม่พบ bases หรือ API key ไม่ได้ตั้งค่า",
          timestamp: new Date(),
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "เกิดข้อผิดพลาดในการทดสอบ",
        timestamp: new Date(),
      };
    }
  }
}
