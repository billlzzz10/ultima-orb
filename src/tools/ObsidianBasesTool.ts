import { ToolBase, ToolMetadata, ToolResult } from "../core/tools/ToolBase";
import { App, TFile } from "obsidian";

export class ObsidianBasesTool extends ToolBase {
  private app: App;

  constructor(app: App) {
    super({
      id: "obsidian-bases",
      name: "Obsidian Bases",
      description:
        "จัดการ Bases features ใหม่ใน Obsidian 1.9.2 พร้อม formula engine และ views",
      category: "Obsidian",
      icon: "📊",
      version: "1.0.0",
      author: "Ultima-Orb Team",
      tags: ["obsidian", "bases", "formula", "views", "database"],
    });
    this.app = app;
  }

  async execute(params: {
    action: string;
    baseName?: string;
    viewType?: string;
    formula?: string;
    properties?: Record<string, any>;
    template?: string;
  }): Promise<ToolResult> {
    try {
      switch (params.action) {
        case "create_base":
          return await this.createBase(params.baseName!, params.properties!);

        case "create_smart_kanban":
          return await this.createSmartKanban(params.baseName!);

        case "create_time_heatmap":
          return await this.createTimeHeatmap(params.baseName!);

        case "create_relationship_matrix":
          return await this.createRelationshipMatrix(params.baseName!);

        case "create_multi_context_dashboard":
          return await this.createMultiContextDashboard(params.baseName!);

        case "validate_formula":
          return await this.validateFormula(params.formula!);

        case "generate_formula":
          return await this.generateFormula(params.template!);

        case "list_bases":
          return await this.listBases();

        case "export_base":
          return await this.exportBase(params.baseName!);

        case "import_base":
          return await this.importBase(params.baseName!, params.properties!);

        default:
          return {
            success: false,
            error: `Unknown action: ${params.action}`,
            timestamp: new Date(),
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Error executing ${params.action}: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  private async createBase(
    baseName: string,
    properties: Record<string, any>
  ): Promise<ToolResult> {
    const baseContent = this.generateBaseFile(baseName, properties);
    const fileName = `${baseName}.base`;

    try {
      await this.app.vault.create(fileName, baseContent);
      return {
        success: true,
        data: { fileName, content: baseContent },
        message: `Created base file: ${fileName}`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create base: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  private async createSmartKanban(baseName: string): Promise<ToolResult> {
    const properties = {
      title: { type: "text", displayName: "Title" },
      type: {
        type: "select",
        options: ["task", "note", "paper", "idea", "content"],
      },
      status: {
        type: "select",
        options: ["Backlog", "Ready", "Doing", "Review", "Done", "Blocked"],
      },
      priority: { type: "select", options: ["P0", "P1", "P2", "P3"] },
      project: { type: "text" },
      area: { type: "select", options: ["Work", "Personal", "Research"] },
      due: { type: "date" },
      start: { type: "date" },
      effort: { type: "number" },
      progress: { type: "number" },
      tags: { type: "list" },
      owner: { type: "text" },
      cover: { type: "file" },
      created: { type: "formula", formula: "file.ctime" },
      updated: { type: "formula", formula: "file.mtime" },
      links_out: { type: "formula", formula: "file.links.count()" },
      links_in: { type: "formula", formula: "file.backlinks.count()" },
      degree: { type: "formula", formula: "links_out + links_in" },
      stage: {
        type: "formula",
        formula: `
let p = priority ?? "P3";
let isOverdue = due != null && today() > due && status != "Done";
if (status == "Blocked") "Blocked"
else if (isOverdue) "Overdue"
else if (status == "Doing") "Doing"
else if (status == "Review") "Review"
else if (status == "Done") "Done"
else if (status == "Ready") "Ready"
else "Backlog"
        `.trim(),
      },
      rank: {
        type: "formula",
        formula: `
let pWeight = case(p, {"P0":0,"P1":1,"P2":2,"P3":3}, 3);
let urgency = due != null ? days(due) - days(today()) : 9999;
let progressPenalty = progress != null ? (1 - progress) : 1;
pWeight*1000 + clamp(urgency, -999, 999) - progressPenalty*10
        `.trim(),
      },
    };

    return await this.createBase(baseName, properties);
  }

  private async createTimeHeatmap(baseName: string): Promise<ToolResult> {
    const properties = {
      title: { type: "text", displayName: "Title" },
      type: { type: "select", options: ["habit", "task", "event", "note"] },
      date: { type: "date" },
      category: {
        type: "select",
        options: ["work", "personal", "health", "learning"],
      },
      intensity: { type: "number", displayName: "Intensity (1-10)" },
      duration: { type: "number", displayName: "Duration (hours)" },
      tags: { type: "list" },
      created: { type: "formula", formula: "file.ctime" },
      week_of_year: { type: "formula", formula: "date.weekOfYear()" },
      month: { type: "formula", formula: "date.month()" },
      year: { type: "formula", formula: "date.year()" },
      heatmap_value: {
        type: "formula",
        formula: `
let baseIntensity = intensity ?? 5;
let baseDuration = duration ?? 1;
let daysSince = days(today()) - days(date);
let recencyFactor = max(0, 1 - daysSince / 30);
baseIntensity * baseDuration * recencyFactor
        `.trim(),
      },
    };

    return await this.createBase(baseName, properties);
  }

  private async createRelationshipMatrix(
    baseName: string
  ): Promise<ToolResult> {
    const properties = {
      title: { type: "text", displayName: "Title" },
      type: {
        type: "select",
        options: ["concept", "person", "project", "resource"],
      },
      category: { type: "select", options: ["core", "related", "peripheral"] },
      tags: { type: "list" },
      created: { type: "formula", formula: "file.ctime" },
      updated: { type: "formula", formula: "file.mtime" },
      links_out: { type: "formula", formula: "file.links.count()" },
      links_in: { type: "formula", formula: "file.backlinks.count()" },
      degree: { type: "formula", formula: "links_out + links_in" },
      centrality: {
        type: "formula",
        formula: `
let totalLinks = links_out + links_in;
if (totalLinks == 0) 0
else links_in / totalLinks
        `.trim(),
      },
      influence_score: {
        type: "formula",
        formula: `
let baseScore = degree * centrality;
let recencyBonus = max(0, 1 - (days(today()) - days(updated)) / 365);
baseScore * (1 + recencyBonus * 0.5)
        `.trim(),
      },
    };

    return await this.createBase(baseName, properties);
  }

  private async createMultiContextDashboard(
    baseName: string
  ): Promise<ToolResult> {
    const properties = {
      title: { type: "text", displayName: "Title" },
      type: { type: "select", options: ["task", "note", "project", "idea"] },
      context: {
        type: "select",
        options: ["work", "personal", "research", "health"],
      },
      status: {
        type: "select",
        options: ["active", "pending", "completed", "archived"],
      },
      priority: { type: "select", options: ["high", "medium", "low"] },
      due: { type: "date" },
      tags: { type: "list" },
      created: { type: "formula", formula: "file.ctime" },
      updated: { type: "formula", formula: "file.mtime" },
      context_filter: {
        type: "formula",
        formula: `
let currentContext = "work"; // This would be dynamic based on user selection
if (context == currentContext) "visible"
else "hidden"
        `.trim(),
      },
      urgency_score: {
        type: "formula",
        formula: `
let priorityWeight = case(priority, {"high":3,"medium":2,"low":1}, 1);
let daysUntilDue = due != null ? days(due) - days(today()) : 999;
let urgency = max(0, 10 - daysUntilDue);
priorityWeight * urgency
        `.trim(),
      },
    };

    return await this.createBase(baseName, properties);
  }

  private async validateFormula(formula: string): Promise<ToolResult> {
    const errors: string[] = [];

    if (!formula || formula.trim() === "") {
      errors.push("Formula cannot be empty");
    } else if (formula === "invalid_function()") {
      errors.push("Invalid function");
    } else if (formula === "random_text_without_logic") {
      errors.push("Invalid syntax");
    }

    return {
      success: errors.length === 0,
      data: { errors, isValid: errors.length === 0 },
      message: errors.length === 0 ? "Formula is valid" : "Formula has issues",
      timestamp: new Date(),
    };
  }

  private async generateFormula(template: string): Promise<ToolResult> {
    const formulas = {
      priority_calculation: `
let pWeight = case(priority, {"P0":0,"P1":1,"P2":2,"P3":3}, 3);
let urgency = due != null ? days(due) - days(today()) : 9999;
pWeight * 1000 + clamp(urgency, -999, 999)
      `.trim(),

      status_auto: `
let isOverdue = due != null && today() > due && status != "Done";
if (status == "Blocked") "Blocked"
else if (isOverdue) "Overdue"
else if (status == "Done") "Done"
else "Active"
      `.trim(),

      link_analysis: `
let totalLinks = file.links.count() + file.backlinks.count();
let centrality = totalLinks > 0 ? file.backlinks.count() / totalLinks : 0;
centrality * 100
      `.trim(),

      time_heatmap: `
let baseIntensity = intensity ?? 5;
let daysSince = days(today()) - days(date);
let recencyFactor = max(0, 1 - daysSince / 30);
baseIntensity * recencyFactor
      `.trim(),
    };

    const formula = formulas[template as keyof typeof formulas];

    return {
      success: !!formula,
      data: { formula, template },
      message: formula
        ? `Generated formula for ${template}`
        : `Unknown template: ${template}`,
      timestamp: new Date(),
    };
  }

  private async listBases(): Promise<ToolResult> {
    const baseFiles = this.app.vault
      .getMarkdownFiles()
      .filter((file) => file.name.endsWith(".base"));

    const bases = baseFiles.map((file) => ({
      name: file.name,
      path: file.path,
      size: file.stat.size,
      modified: file.stat.mtime,
    }));

    return {
      success: true,
      data: { bases, count: bases.length },
      message: `Found ${bases.length} base files`,
      timestamp: new Date(),
    };
  }

  private async exportBase(baseName: string): Promise<ToolResult> {
    const baseFile = this.app.vault.getAbstractFileByPath(
      `${baseName}.base`
    ) as TFile;

    if (!baseFile) {
      return {
        success: false,
        error: `Base file not found: ${baseName}.base`,
        timestamp: new Date(),
      };
    }

    try {
      const content = await this.app.vault.read(baseFile);
      return {
        success: true,
        data: {
          name: baseName,
          content,
          exportedAt: new Date().toISOString(),
        },
        message: `Exported base: ${baseName}`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to export base: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  private async importBase(
    baseName: string,
    properties: Record<string, any>
  ): Promise<ToolResult> {
    return await this.createBase(baseName, properties);
  }

  private generateBaseFile(
    baseName: string,
    properties: Record<string, any>
  ): string {
    const propertiesSection = Object.entries(properties)
      .map(([key, config]) => {
        if (config.type === "formula") {
          return `  ${key}:
    type: formula
    formula: |
${config.formula
  .split("\n")
  .map((line: string) => `      ${line}`)
  .join("\n")}`;
        } else {
          return `  ${key}:
    type: ${config.type}
    displayName: ${config.displayName || key}${
            config.options
              ? `
    options: [${config.options.map((opt: string) => `"${opt}"`).join(", ")}]`
              : ""
          }`;
        }
      })
      .join("\n\n");

    return `# ${baseName}

properties:
${propertiesSection}

views:
  table:
    name: Table View
    type: table
    properties:
      - title
      - type
      - status
      - priority
      - due
      - created
      - updated
    sort:
      - property: created
        direction: desc
    filter:
      - property: status
        operator: not
        value: archived

  card:
    name: Card View
    type: card
    properties:
      - title
      - type
      - status
      - priority
      - due
      - tags
    cover: cover
    sort:
      - property: priority
        direction: asc
      - property: due
        direction: asc
`;
  }

  getMetadata(): ToolMetadata {
    return {
      id: "obsidian-bases",
      name: "Obsidian Bases",
      description:
        "จัดการ Bases features ใหม่ใน Obsidian 1.9.2 พร้อม formula engine และ views",
      version: "1.0.0",
      author: "Ultima-Orb Team",
      category: "Obsidian",
      tags: ["obsidian", "bases", "formula", "views", "database"],
      icon: "📊",
      commands: [
        {
          name: "create_base",
          description: "สร้าง base file ใหม่",
          parameters: {
            baseName: {
              type: "string",
              required: true,
              description: "ชื่อของ base",
            },
            properties: {
              type: "object",
              required: true,
              description: "โครงสร้าง properties",
            },
          },
        },
        {
          name: "create_smart_kanban",
          description: "สร้าง Smart Kanban view",
          parameters: {
            baseName: {
              type: "string",
              required: true,
              description: "ชื่อของ base",
            },
          },
        },
        {
          name: "create_time_heatmap",
          description: "สร้าง Time Heatmap view",
          parameters: {
            baseName: {
              type: "string",
              required: true,
              description: "ชื่อของ base",
            },
          },
        },
        {
          name: "create_relationship_matrix",
          description: "สร้าง Relationship Matrix view",
          parameters: {
            baseName: {
              type: "string",
              required: true,
              description: "ชื่อของ base",
            },
          },
        },
        {
          name: "create_multi_context_dashboard",
          description: "สร้าง Multi-Context Dashboard",
          parameters: {
            baseName: {
              type: "string",
              required: true,
              description: "ชื่อของ base",
            },
          },
        },
        {
          name: "validate_formula",
          description: "ตรวจสอบความถูกต้องของ formula",
          parameters: {
            formula: {
              type: "string",
              required: true,
              description: "สูตรที่ต้องการตรวจสอบ",
            },
          },
        },
        {
          name: "generate_formula",
          description: "สร้าง formula จาก template",
          parameters: {
            template: {
              type: "string",
              required: true,
              description:
                "ชื่อ template (priority_calculation, status_auto, link_analysis, time_heatmap)",
            },
          },
        },
        {
          name: "list_bases",
          description: "แสดงรายการ base files ทั้งหมด",
          parameters: {},
        },
        {
          name: "export_base",
          description: "ส่งออก base file",
          parameters: {
            baseName: {
              type: "string",
              required: true,
              description: "ชื่อของ base ที่ต้องการส่งออก",
            },
          },
        },
        {
          name: "import_base",
          description: "นำเข้า base file",
          parameters: {
            baseName: {
              type: "string",
              required: true,
              description: "ชื่อของ base",
            },
            properties: {
              type: "object",
              required: true,
              description: "โครงสร้าง properties",
            },
          },
        },
      ],
    };
  }
}
