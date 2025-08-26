import { ToolBase, ToolMetadata, ToolResult } from "../core/tools/ToolBase";
import { App } from "obsidian";
import { AIOrchestrationTool } from "./AIOrchestrationTool";

/**
 * 📊 Notion Analysis Tool - ดึงและวิเคราะห์ข้อมูล Notion database
 */
export class NotionAnalysisTool extends ToolBase {
  private app: App;
  private aiOrchestration: AIOrchestrationTool;
  private notionApiKey: string;
  private notionBaseUrl = "https://api.notion.com/v1";

  constructor(app: App, aiOrchestration: AIOrchestrationTool) {
    super({
      id: "notion-analysis",
      name: "Notion Analysis",
      description: "ดึงและวิเคราะห์ข้อมูล Notion database ด้วย AI",
      category: "Analysis",
      icon: "📊",
      version: "1.0.0",
      author: "Ultima-Orb Team",
      tags: ["notion", "analysis", "ai", "database", "insights"],
    });
    this.app = app;
    this.aiOrchestration = aiOrchestration;
    this.notionApiKey =
      "patSAFehqyaDt50Lt.9323a998b3b0babe891fb0c0af5bbbc76e8ec4d0da33ef8b212745c8c3efc0bf";
  }

  /**
   * 🎯 Execute tool
   */
  async execute(params: {
    action: string;
    databaseId?: string;
    analysisType?: string;
    aiProvider?: string;
    prompt?: string;
  }): Promise<ToolResult> {
    try {
      const { action, databaseId, analysisType, aiProvider, prompt } = params;

      switch (action) {
        case "fetchAllDatabases":
          return await this.fetchAllDatabases();

        case "fetchDatabaseContent":
          return await this.fetchDatabaseContent(databaseId!);

        case "analyzeWithAI":
          return await this.analyzeWithAI(
            databaseId!,
            analysisType!,
            aiProvider!,
            prompt
          );

        case "comprehensiveAnalysis":
          return await this.comprehensiveAnalysis(aiProvider || "azure-openai");

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to execute Notion analysis action",
        timestamp: new Date(),
      };
    }
  }

  /**
   * 📋 ดึงรายการ databases ทั้งหมด
   */
  private async fetchAllDatabases(): Promise<ToolResult> {
    try {
      const response = await fetch(`${this.notionBaseUrl}/search`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.notionApiKey}`,
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
        throw new Error(
          `Notion API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const databases = data.results.map((db: any) => ({
        id: db.id,
        title: db.title[0]?.plain_text || "Untitled",
        createdTime: db.created_time,
        lastEditedTime: db.last_edited_time,
        url: db.url,
        properties: Object.keys(db.properties),
      }));

      return {
        success: true,
        data: {
          databases,
          totalCount: databases.length,
        },
        message: `Found ${databases.length} Notion databases`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to fetch Notion databases",
        timestamp: new Date(),
      };
    }
  }

  /**
   * 📄 ดึงเนื้อหาของ database
   */
  private async fetchDatabaseContent(databaseId: string): Promise<ToolResult> {
    try {
      // ดึงโครงสร้าง database
      const dbResponse = await fetch(
        `${this.notionBaseUrl}/databases/${databaseId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.notionApiKey}`,
            "Notion-Version": "2022-06-28",
          },
        }
      );

      if (!dbResponse.ok) {
        throw new Error(
          `Database fetch error: ${dbResponse.status} ${dbResponse.statusText}`
        );
      }

      const dbData = await dbResponse.json();

      // ดึงข้อมูล pages ใน database
      const pagesResponse = await fetch(
        `${this.notionBaseUrl}/databases/${databaseId}/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.notionApiKey}`,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page_size: 100,
          }),
        }
      );

      if (!pagesResponse.ok) {
        throw new Error(
          `Pages fetch error: ${pagesResponse.status} ${pagesResponse.statusText}`
        );
      }

      const pagesData = await pagesResponse.json();

      // แปลงข้อมูลให้เป็นรูปแบบที่อ่านง่าย
      const pages = pagesData.results.map((page: any) => {
        const properties: any = {};

        // แปลง properties เป็นข้อความ
        Object.entries(page.properties).forEach(
          ([key, value]: [string, any]) => {
            if (value.type === "title" && value.title.length > 0) {
              properties[key] = value.title[0].plain_text;
            } else if (
              value.type === "rich_text" &&
              value.rich_text.length > 0
            ) {
              properties[key] = value.rich_text[0].plain_text;
            } else if (value.type === "select" && value.select) {
              properties[key] = value.select.name;
            } else if (
              value.type === "multi_select" &&
              value.multi_select.length > 0
            ) {
              properties[key] = value.multi_select
                .map((item: any) => item.name)
                .join(", ");
            } else if (value.type === "date" && value.date) {
              properties[key] = value.date.start;
            } else if (value.type === "number") {
              properties[key] = value.number;
            } else if (value.type === "checkbox") {
              properties[key] = value.checkbox;
            } else {
              properties[key] = "N/A";
            }
          }
        );

        return {
          id: page.id,
          title: properties.Name || properties.Title || "Untitled",
          properties,
          createdTime: page.created_time,
          lastEditedTime: page.last_edited_time,
          url: page.url,
        };
      });

      return {
        success: true,
        data: {
          database: {
            id: dbData.id,
            title: dbData.title[0]?.plain_text || "Untitled",
            properties: dbData.properties,
            url: dbData.url,
          },
          pages,
          totalPages: pages.length,
        },
        message: `Fetched ${pages.length} pages from database`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to fetch database content",
        timestamp: new Date(),
      };
    }
  }

  /**
   * 🤖 วิเคราะห์ข้อมูลด้วย AI
   */
  private async analyzeWithAI(
    databaseId: string,
    analysisType: string,
    aiProvider: string,
    customPrompt?: string
  ): Promise<ToolResult> {
    try {
      // ดึงข้อมูล database ก่อน
      const fetchResult = await this.fetchDatabaseContent(databaseId);
      if (!fetchResult.success) {
        throw new Error("Failed to fetch database content for analysis");
      }

      const { database, pages } = fetchResult.data;

      // สร้าง prompt ตามประเภทการวิเคราะห์
      let prompt =
        customPrompt ||
        this.generateAnalysisPrompt(analysisType, database, pages);

      // ใช้ AI Orchestration Tool
      const aiResult = await this.aiOrchestration.execute({
        prompt,
        provider: aiProvider,
        temperature: 0.7,
        maxTokens: 4000,
        systemPrompt:
          "You are a data analyst expert. Provide detailed insights and actionable recommendations based on the Notion database data provided.",
      });

      if (!aiResult.success) {
        throw new Error(`AI analysis failed: ${aiResult.error}`);
      }

      return {
        success: true,
        data: {
          database,
          analysisType,
          aiProvider,
          aiResponse: aiResult.data,
          pagesAnalyzed: pages.length,
        },
        message: `AI analysis completed using ${aiProvider}`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to analyze with AI",
        timestamp: new Date(),
      };
    }
  }

  /**
   * 🔍 การวิเคราะห์แบบครอบคลุม
   */
  private async comprehensiveAnalysis(aiProvider: string): Promise<ToolResult> {
    try {
      // ดึง databases ทั้งหมด
      const databasesResult = await this.fetchAllDatabases();
      if (!databasesResult.success) {
        throw new Error("Failed to fetch databases");
      }

      const { databases } = databasesResult.data;
      const analyses: any[] = [];

      // วิเคราะห์แต่ละ database
      for (const db of databases.slice(0, 3)) {
        // จำกัดที่ 3 databases เพื่อไม่ให้ใช้เวลานานเกินไป
        try {
          const analysis = await this.analyzeWithAI(
            db.id,
            "comprehensive",
            aiProvider,
            `Analyze this Notion database "${db.title}" comprehensively. Provide insights about data structure, content patterns, and recommendations for optimization.`
          );

          if (analysis.success) {
            analyses.push({
              database: db,
              analysis: analysis.data,
            });
          }
        } catch (error) {
          console.warn(`Failed to analyze database ${db.title}:`, error);
        }
      }

      // สรุปการวิเคราะห์ทั้งหมด
      const summaryPrompt = `
        Based on the analysis of ${
          analyses.length
        } Notion databases, provide a comprehensive summary including:
        1. Overall data patterns and trends
        2. Common themes across databases
        3. Recommendations for data organization
        4. Potential improvements for workflow efficiency
        5. Key insights and actionable next steps
        
        Analysis results: ${JSON.stringify(analyses, null, 2)}
      `;

      const summaryResult = await this.aiOrchestration.execute({
        prompt: summaryPrompt,
        provider: aiProvider,
        temperature: 0.7,
        maxTokens: 3000,
        systemPrompt:
          "You are a senior data analyst and workflow optimization expert. Provide strategic insights and recommendations.",
      });

      return {
        success: true,
        data: {
          databasesAnalyzed: analyses.length,
          individualAnalyses: analyses,
          summary: summaryResult.success ? summaryResult.data : null,
          totalDatabases: databases.length,
        },
        message: `Comprehensive analysis completed for ${analyses.length} databases`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to perform comprehensive analysis",
        timestamp: new Date(),
      };
    }
  }

  /**
   * 📝 สร้าง prompt สำหรับการวิเคราะห์
   */
  private generateAnalysisPrompt(
    analysisType: string,
    database: any,
    pages: any[]
  ): string {
    const basePrompt = `
      Analyze this Notion database: "${database.title}"
      
      Database Structure:
      ${JSON.stringify(database.properties, null, 2)}
      
      Sample Data (${pages.length} pages):
      ${JSON.stringify(pages.slice(0, 10), null, 2)}
    `;

    switch (analysisType) {
      case "trends":
        return `${basePrompt}
          
          Please analyze for:
          1. Temporal trends and patterns
          2. Data distribution across time
          3. Seasonal patterns if any
          4. Growth or decline trends
          5. Recommendations for trend monitoring
        `;

      case "structure":
        return `${basePrompt}
          
          Please analyze for:
          1. Data structure efficiency
          2. Property usage patterns
          3. Missing or redundant fields
          4. Data consistency issues
          5. Recommendations for structure optimization
        `;

      case "content":
        return `${basePrompt}
          
          Please analyze for:
          1. Content quality and completeness
          2. Common themes and patterns
          3. Content gaps or redundancies
          4. User engagement patterns
          5. Recommendations for content improvement
        `;

      case "workflow":
        return `${basePrompt}
          
          Please analyze for:
          1. Workflow efficiency patterns
          2. Bottlenecks or inefficiencies
          3. Process optimization opportunities
          4. Automation potential
          5. Recommendations for workflow improvement
        `;

      default:
        return `${basePrompt}
          
          Please provide a comprehensive analysis including:
          1. Key insights and patterns
          2. Data quality assessment
          3. Potential improvements
          4. Actionable recommendations
          5. Strategic suggestions
        `;
    }
  }

  /**
   * 📝 รับ metadata ของ tool
   */
  getMetadata(): ToolMetadata {
    return {
      id: "notion-analysis",
      name: "Notion Analysis",
      description: "ดึงและวิเคราะห์ข้อมูล Notion database ด้วย AI",
      version: "1.0.0",
      author: "Ultima-Orb Team",
      category: "Analysis",
      tags: ["notion", "analysis", "ai", "database", "insights"],
      icon: "📊",
      commands: [
        {
          name: "fetchAllDatabases",
          description: "ดึงรายการ Notion databases ทั้งหมด",
          parameters: {},
        },
        {
          name: "fetchDatabaseContent",
          description: "ดึงเนื้อหาของ database",
          parameters: {
            databaseId: {
              type: "string",
              required: true,
              description: "ID ของ Notion database",
            },
          },
        },
        {
          name: "analyzeWithAI",
          description: "วิเคราะห์ข้อมูลด้วย AI",
          parameters: {
            databaseId: {
              type: "string",
              required: true,
              description: "ID ของ Notion database",
            },
            analysisType: {
              type: "string",
              required: true,
              description:
                "ประเภทการวิเคราะห์ (trends, structure, content, workflow)",
            },
            aiProvider: {
              type: "string",
              required: true,
              description: "AI provider (azure-openai, ollama)",
            },
            prompt: {
              type: "string",
              required: false,
              description: "Custom prompt สำหรับการวิเคราะห์",
            },
          },
        },
        {
          name: "comprehensiveAnalysis",
          description: "การวิเคราะห์แบบครอบคลุมทุก database",
          parameters: {
            aiProvider: {
              type: "string",
              required: false,
              description: "AI provider (azure-openai, ollama)",
            },
          },
        },
      ],
    };
  }
}
