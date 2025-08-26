import { ToolBase, ToolMetadata, ToolResult } from "../core/tools/ToolBase";
import { App } from "obsidian";
import { APIManagerTool } from "./APIManagerTool";
import { AIOrchestrationTool } from "./AIOrchestrationTool";

export interface NotionAnalysisRequest {
  databaseId?: string;
  analysisType:
    | "structure"
    | "content"
    | "patterns"
    | "recommendations"
    | "full";
  focusAreas?: string[];
  outputFormat?: "summary" | "detailed" | "visual";
}

export interface NotionInsight {
  type: "structure" | "content" | "pattern" | "recommendation";
  title: string;
  description: string;
  confidence: number;
  data?: any;
  suggestions?: string[];
}

export interface NotionAnalysisResponse {
  insights: NotionInsight[];
  summary: string;
  recommendations: string[];
  metadata: {
    analyzedAt: string;
    databasesAnalyzed: number;
    totalPages: number;
    analysisDuration: number;
  };
}

export class NotionAIAssistantTool extends ToolBase {
  private app: App;
  private apiManager: APIManagerTool;
  private aiOrchestration: AIOrchestrationTool;
  private notionBaseUrl = "https://api.notion.com/v1";

  constructor(
    app: App,
    apiManager: APIManagerTool,
    aiOrchestration: AIOrchestrationTool
  ) {
    super({
      id: "notion-ai-assistant",
      name: "Notion AI Assistant",
      description: "AI assistant ที่เข้าใจโครงสร้างข้อมูล Notion และให้คำแนะนำ",
      category: "AI",
      icon: "🤖",
      version: "1.0.0",
      author: "Ultima-Orb Team",
      tags: ["ai", "notion", "analysis", "insights", "recommendations"],
      commands: [
        {
          name: "analyze_structure",
          description: "วิเคราะห์โครงสร้างของ Notion databases",
          parameters: {
            databaseId: {
              type: "string",
              required: false,
              description:
                "ID ของ database ที่ต้องการวิเคราะห์ (ถ้าไม่ระบุจะวิเคราะห์ทั้งหมด)",
            },
            focusAreas: {
              type: "array",
              required: false,
              description:
                "พื้นที่ที่ต้องการเน้น เช่น ['properties', 'relationships', 'content']",
            },
          },
        },
        {
          name: "generate_insights",
          description: "สร้าง insights จากข้อมูล Notion",
          parameters: {
            analysisType: {
              type: "string",
              required: true,
              description:
                "ประเภทการวิเคราะห์: structure, content, patterns, recommendations, full",
            },
            outputFormat: {
              type: "string",
              required: false,
              description: "รูปแบบผลลัพธ์: summary, detailed, visual",
            },
          },
        },
        {
          name: "optimize_database",
          description: "ให้คำแนะนำในการปรับปรุง database",
          parameters: {
            databaseId: {
              type: "string",
              required: true,
              description: "ID ของ database ที่ต้องการปรับปรุง",
            },
            optimizationType: {
              type: "string",
              required: false,
              description:
                "ประเภทการปรับปรุง: structure, performance, usability",
            },
          },
        },
        {
          name: "create_template",
          description: "สร้าง template สำหรับ database ใหม่",
          parameters: {
            useCase: {
              type: "string",
              required: true,
              description:
                "กรณีการใช้งาน เช่น 'project_management', 'content_library', 'research'",
            },
            complexity: {
              type: "string",
              required: false,
              description: "ระดับความซับซ้อน: simple, medium, advanced",
            },
          },
        },
        {
          name: "sync_recommendations",
          description: "ซิงค์คำแนะนำกับ Obsidian",
          parameters: {
            action: {
              type: "string",
              required: true,
              description:
                "การดำเนินการ: create_notes, update_properties, generate_templates",
            },
            targetFolder: {
              type: "string",
              required: false,
              description: "โฟลเดอร์เป้าหมายใน Obsidian",
            },
          },
        },
      ],
    });
    this.app = app;
    this.apiManager = apiManager;
    this.aiOrchestration = aiOrchestration;
  }

  async execute(params: {
    action: string;
    databaseId?: string;
    analysisType?: string;
    focusAreas?: string[];
    outputFormat?: string;
    optimizationType?: string;
    useCase?: string;
    complexity?: string;
    targetFolder?: string;
  }): Promise<ToolResult> {
    try {
      switch (params.action) {
        case "analyze_structure":
          return await this.analyzeStructure(
            params.databaseId,
            params.focusAreas
          );

        case "generate_insights":
          return await this.generateInsights(
            params.analysisType!,
            params.outputFormat
          );

        case "optimize_database":
          return await this.optimizeDatabase(
            params.databaseId!,
            params.optimizationType
          );

        case "create_template":
          return await this.createTemplate(params.useCase!, params.complexity);

        case "sync_recommendations":
          return await this.syncRecommendations(
            params.action,
            params.targetFolder
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

  private async analyzeStructure(
    databaseId?: string,
    focusAreas?: string[]
  ): Promise<ToolResult> {
    try {
      // ดึง Notion API key
      const notionKeyResult = await this.apiManager.execute({
        action: "get_active_key",
        provider: "notion",
      });

      if (!notionKeyResult.success) {
        return {
          success: false,
          error: "ไม่พบ Notion API key ที่ใช้งานได้",
          message: "กรุณาเพิ่มและเปิดใช้งาน Notion API key ก่อน",
          timestamp: new Date(),
        };
      }

      const notionApiKey = notionKeyResult.data.key;

      // ดึงข้อมูล databases
      const databases = databaseId
        ? [await this.fetchDatabase(databaseId, notionApiKey)]
        : await this.fetchAllDatabases(notionApiKey);

      // วิเคราะห์โครงสร้าง
      const analysis = await this.performStructureAnalysis(
        databases,
        focusAreas
      );

      return {
        success: true,
        data: analysis,
        message: `วิเคราะห์โครงสร้างสำเร็จ ${databases.length} databases`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "เกิดข้อผิดพลาดในการวิเคราะห์โครงสร้าง",
        timestamp: new Date(),
      };
    }
  }

  private async generateInsights(
    analysisType: string,
    outputFormat?: string
  ): Promise<ToolResult> {
    try {
      // ใช้ AI ในการสร้าง insights
      const prompt = this.buildAnalysisPrompt(analysisType, outputFormat);

      const aiResponse = await this.aiOrchestration.execute({
        // action: "generate_text",
        prompt: prompt,
        model: "llama-scout-instruct",
        maxTokens: 2000,
      });

      if (!aiResponse.success) {
        return {
          success: false,
          error: "ไม่สามารถสร้าง insights ได้",
          message: "เกิดข้อผิดพลาดในการใช้ AI",
          timestamp: new Date(),
        };
      }

      const insights = this.parseAIInsights(aiResponse.data.content);

      return {
        success: true,
        data: {
          insights,
          summary: aiResponse.data.content,
          recommendations: this.extractRecommendations(aiResponse.data.content),
        },
        message: "สร้าง insights สำเร็จ",
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "เกิดข้อผิดพลาดในการสร้าง insights",
        timestamp: new Date(),
      };
    }
  }

  private async optimizeDatabase(
    databaseId: string,
    optimizationType?: string
  ): Promise<ToolResult> {
    try {
      // ดึงข้อมูล database
      const notionKeyResult = await this.apiManager.execute({
        action: "get_active_key",
        provider: "notion",
      });

      if (!notionKeyResult.success) {
        return {
          success: false,
          error: "ไม่พบ Notion API key ที่ใช้งานได้",
          message: "กรุณาเพิ่มและเปิดใช้งาน Notion API key ก่อน",
          timestamp: new Date(),
        };
      }

      const database = await this.fetchDatabase(
        databaseId,
        notionKeyResult.data.key
      );

      // สร้างคำแนะนำการปรับปรุง
      const recommendations = await this.generateOptimizationRecommendations(
        database,
        optimizationType
      );

      return {
        success: true,
        data: recommendations,
        message: "สร้างคำแนะนำการปรับปรุงสำเร็จ",
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "เกิดข้อผิดพลาดในการสร้างคำแนะนำการปรับปรุง",
        timestamp: new Date(),
      };
    }
  }

  private async createTemplate(
    useCase: string,
    complexity?: string
  ): Promise<ToolResult> {
    try {
      // สร้าง template ด้วย AI
      const prompt = this.buildTemplatePrompt(useCase, complexity);

      const aiResponse = await this.aiOrchestration.execute({
        // action: "generate_text",
        prompt: prompt,
        model: "llama-scout-instruct",
        maxTokens: 1500,
      });

      if (!aiResponse.success) {
        return {
          success: false,
          error: "ไม่สามารถสร้าง template ได้",
          message: "เกิดข้อผิดพลาดในการใช้ AI",
          timestamp: new Date(),
        };
      }

      const template = this.parseTemplate(aiResponse.data.content);

      return {
        success: true,
        data: template,
        message: `สร้าง template สำหรับ ${useCase} สำเร็จ`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "เกิดข้อผิดพลาดในการสร้าง template",
        timestamp: new Date(),
      };
    }
  }

  private async syncRecommendations(
    action: string,
    targetFolder?: string
  ): Promise<ToolResult> {
    try {
      const folder = targetFolder || "Notion Recommendations";

      // สร้างโฟลเดอร์ถ้ายังไม่มี
      await this.ensureFolderExists(folder);

      switch (action) {
        case "create_notes":
          await this.createRecommendationNotes(folder);
          break;
        case "update_properties":
          await this.updateObsidianProperties(folder);
          break;
        case "generate_templates":
          await this.generateObsidianTemplates(folder);
          break;
        default:
          return {
            success: false,
            error: `Unknown sync action: ${action}`,
            message: "ไม่รู้จักการดำเนินการซิงค์ที่ระบุ",
            timestamp: new Date(),
          };
      }

      return {
        success: true,
        data: { action, targetFolder: folder },
        message: `ซิงค์คำแนะนำสำเร็จ: ${action}`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "เกิดข้อผิดพลาดในการซิงค์คำแนะนำ",
        timestamp: new Date(),
      };
    }
  }

  // Helper methods
  private async fetchDatabase(
    databaseId: string,
    apiKey: string
  ): Promise<any> {
    const response = await fetch(
      `${this.notionBaseUrl}/databases/${databaseId}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Notion-Version": "2022-06-28",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch database: ${response.statusText}`);
    }

    return await response.json();
  }

  private async fetchAllDatabases(apiKey: string): Promise<any[]> {
    const response = await fetch(`${this.notionBaseUrl}/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          property: "object",
          value: "database",
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch databases: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  }

  private async performStructureAnalysis(
    databases: any[],
    focusAreas?: string[]
  ): Promise<any> {
    const analysis = {
      totalDatabases: databases.length,
      propertyTypes: {},
      commonPatterns: [],
      recommendations: [],
    };

    // วิเคราะห์ properties
    databases.forEach((db) => {
      if (db.properties) {
        Object.values(db.properties).forEach((prop: any) => {
          const type = prop.type || "unknown";
          analysis.propertyTypes[type] =
            (analysis.propertyTypes[type] || 0) + 1;
        });
      }
    });

    // สร้างคำแนะนำ
    // analysis.recommendations = this.generateStructureRecommendations(analysis);

    return analysis;
  }

  private buildAnalysisPrompt(
    analysisType: string,
    outputFormat?: string
  ): string {
    return `วิเคราะห์ข้อมูล Notion databases และให้ insights ในรูปแบบ ${
      outputFormat || "summary"
    }:

ประเภทการวิเคราะห์: ${analysisType}

กรุณาให้:
1. สรุปโครงสร้างข้อมูล
2. ระบุ patterns ที่พบ
3. ให้คำแนะนำการปรับปรุง
4. ตัวอย่างการใช้งานที่ดี

ตอบเป็นภาษาไทยและให้ข้อมูลที่เป็นประโยชน์สำหรับการจัดการข้อมูล Notion`;
  }

  private buildTemplatePrompt(useCase: string, complexity?: string): string {
    return `สร้าง Notion database template สำหรับ ${useCase} ระดับความซับซ้อน ${
      complexity || "medium"
    }:

กรุณาให้:
1. รายการ properties ที่แนะนำ
2. ประเภทของแต่ละ property
3. ตัวอย่างค่า
4. คำอธิบายการใช้งาน
5. สูตรหรือฟังก์ชันที่แนะนำ

ตอบเป็นภาษาไทยและให้ template ที่ใช้งานได้จริง`;
  }

  private parseAIInsights(content: string): NotionInsight[] {
    // แยก insights จาก AI response
    const insights: NotionInsight[] = [];

    // ตัวอย่างการแยก insights (ในที่จริงจะต้องใช้ regex หรือ NLP)
    const lines = content.split("\n");
    let currentInsight: Partial<NotionInsight> = {};

    lines.forEach((line) => {
      if (line.includes("**")) {
        if (currentInsight.title) {
          insights.push(currentInsight as NotionInsight);
        }
        currentInsight = {
          title: line.replace(/\*\*/g, "").trim(),
          type: "recommendation",
          confidence: 0.8,
          description: "",
        };
      } else if (currentInsight.title && line.trim()) {
        currentInsight.description =
          (currentInsight.description || "") + line.trim() + " ";
      }
    });

    if (currentInsight.title) {
      insights.push(currentInsight as NotionInsight);
    }

    return insights;
  }

  private extractRecommendations(content: string): string[] {
    const recommendations: string[] = [];
    const lines = content.split("\n");

    lines.forEach((line) => {
      if (
        line.includes("แนะนำ") ||
        line.includes("ควร") ||
        line.includes("แนะนำให้")
      ) {
        recommendations.push(line.trim());
      }
    });

    return recommendations;
  }

  private async generateOptimizationRecommendations(
    database: any,
    optimizationType?: string
  ): Promise<any> {
    const recommendations: {
      structure: string[];
      performance: string[];
      usability: string[];
    } = {
      structure: [],
      performance: [],
      usability: [],
    };

    // วิเคราะห์โครงสร้าง
    if (database.properties) {
      const propertyCount = Object.keys(database.properties).length;
      if (propertyCount > 20) {
        recommendations.structure.push(
          "พิจารณาลดจำนวน properties เพื่อเพิ่มประสิทธิภาพ"
        );
      }
    }

    // วิเคราะห์ performance
    if (database.pages && database.pages.length > 100) {
      recommendations.performance.push(
        "พิจารณาแบ่ง database เป็นส่วนย่อยเพื่อเพิ่มความเร็ว"
      );
    }

    // วิเคราะห์ usability
    recommendations.usability.push(
      "เพิ่ม description ให้กับ properties ที่สำคัญ"
    );
    recommendations.usability.push("ใช้ consistent naming convention");

    return recommendations;
  }

  private parseTemplate(content: string): any {
    // แยก template จาก AI response
    const template = {
      properties: [],
      formulas: [],
      examples: [],
      description: "",
    };

    // ตัวอย่างการแยก template (ในที่จริงจะต้องใช้ regex หรือ NLP)
    const lines = content.split("\n");
    let currentSection = "";

    lines.forEach((line) => {
      if (line.includes("Properties:")) {
        currentSection = "properties";
      } else if (line.includes("Formulas:")) {
        currentSection = "formulas";
      } else if (line.includes("Examples:")) {
        currentSection = "examples";
      } else if (line.trim() && currentSection) {
        template[currentSection].push(line.trim());
      }
    });

    return template;
  }

  private async ensureFolderExists(folderPath: string): Promise<void> {
    // สร้างโฟลเดอร์ใน Obsidian vault
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      // await this.app.vault.createFolder(folderPath);
    }
  }

  private async createRecommendationNotes(folder: string): Promise<void> {
    const recommendations = [
      {
        title: "Notion Database Optimization",
        content:
          "# Notion Database Optimization\n\n## คำแนะนำการปรับปรุง\n\n### 1. โครงสร้าง\n- ใช้ properties ที่เหมาะสม\n- จัดกลุ่มข้อมูลอย่างเป็นระบบ\n\n### 2. ประสิทธิภาพ\n- ลดจำนวน properties ที่ไม่จำเป็น\n- ใช้ formulas อย่างมีประสิทธิภาพ\n\n### 3. การใช้งาน\n- เพิ่ม descriptions\n- ใช้ consistent naming",
      },
      {
        title: "Notion Best Practices",
        content:
          "# Notion Best Practices\n\n## หลักการออกแบบ Database\n\n### Properties\n- ใช้ title property สำหรับชื่อหลัก\n- ใช้ select/multi-select สำหรับหมวดหมู่\n- ใช้ date สำหรับวันที่สำคัญ\n\n### Views\n- สร้าง views หลายแบบตามการใช้งาน\n- ใช้ filters และ sorts อย่างเหมาะสม\n\n### Formulas\n- ใช้ formulas สำหรับการคำนวณอัตโนมัติ\n- หลีกเลี่ยง formulas ที่ซับซ้อนเกินไป",
      },
    ];

    for (const rec of recommendations) {
      const filePath = `${folder}/${rec.title}.md`;
      await this.app.vault.create(filePath, rec.content);
    }
  }

  private async updateObsidianProperties(folder: string): Promise<void> {
    // อัปเดต properties ใน Obsidian files
    const files = this.app.vault.getMarkdownFiles();

    for (const file of files) {
      if (file.path.startsWith(folder)) {
        const content = await this.app.vault.read(file);
        const updatedContent = this.addNotionProperties(content);
        await this.app.vault.modify(file, updatedContent);
      }
    }
  }

  private async generateObsidianTemplates(folder: string): Promise<void> {
    const templates = [
      {
        name: "Notion Database Template",
        content: `---
notion-database-id: ""
notion-database-title: ""
notion-database-description: ""
notion-properties:
  - name: "Title"
    type: "title"
    description: "ชื่อหลักของรายการ"
  - name: "Status"
    type: "select"
    options: ["Backlog", "In Progress", "Done"]
  - name: "Priority"
    type: "select"
    options: ["High", "Medium", "Low"]
  - name: "Due Date"
    type: "date"
    description: "วันที่ครบกำหนด"
---

# {{title}}

## สถานะ
- **Status**: {{status}}
- **Priority**: {{priority}}
- **Due Date**: {{due_date}}

## เนื้อหา
{{content}}

## ลิงก์ที่เกี่ยวข้อง
- [Notion Database]({{notion_url}})
`,
      },
    ];

    for (const template of templates) {
      const filePath = `${folder}/${template.name}.md`;
      await this.app.vault.create(filePath, template.content);
    }
  }

  private addNotionProperties(content: string): string {
    // เพิ่ม Notion properties ลงใน frontmatter
    if (content.includes("---")) {
      const frontmatter = `notion-database-id: ""
notion-database-title: ""
notion-last-synced: "${new Date().toISOString()}"
`;

      return content.replace("---", `---\n${frontmatter}`);
    }

    return `---
notion-database-id: ""
notion-database-title: ""
notion-last-synced: "${new Date().toISOString()}"
---

${content}`;
  }

  private generateStructureRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];

    if (analysis.totalDatabases > 10) {
      recommendations.push("พิจารณารวม databases ที่เกี่ยวข้องกัน");
    }

    if (analysis.propertyTypes["rich_text"] > 100) {
      recommendations.push(
        "พิจารณาใช้ select properties แทน rich_text สำหรับข้อมูลที่จำกัด"
      );
    }

    return recommendations;
  }

  getMetadata(): ToolMetadata {
    return {
      id: "notion-ai-assistant",
      name: "Notion AI Assistant",
      description: "AI assistant ที่เข้าใจโครงสร้างข้อมูล Notion และให้คำแนะนำ",
      category: "AI",
      icon: "🤖",
      version: "1.0.0",
      author: "Ultima-Orb Team",
      tags: ["ai", "notion", "analysis", "insights", "recommendations"],
      commands: this.metadata.commands,
    };
  }
}
