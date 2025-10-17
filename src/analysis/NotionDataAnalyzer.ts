import * as fs from "fs";
import * as path from "path";

export interface NotionAnalysisResult {
  summary: {
    totalDatabases: number;
    totalPages: number;
    totalBlocks: number;
    databaseTypes: Record<string, number>;
    propertyTypes: Record<string, number>;
    averagePagesPerDatabase: number;
    largestDatabase: {
      name: string;
      pageCount: number;
    };
    mostCommonProperties: Array<{
      name: string;
      count: number;
      type: string;
    }>;
  };
  patterns: {
    databaseNaming: string[];
    propertyUsage: Record<string, number>;
    contentTypes: Record<string, number>;
    datePatterns: {
      createdDates: string[];
      updatedDates: string[];
    };
  };
  insights: {
    topDatabases: Array<{
      name: string;
      description: string;
      pageCount: number;
      properties: string[];
    }>;
    dataQuality: {
      completeness: number;
      consistency: number;
      issues: string[];
    };
    recommendations: string[];
  };
  exportData: {
    databases: any[];
    pages: any[];
    blocks: any[];
    metadata: {
      analyzedAt: string;
      sourceFiles: string[];
      totalSize: number;
    };
  };
}

export class NotionDataAnalyzer {
  private dataDir: string;
  private outputDir: string;

  constructor(
    dataDir: string = "notion-outputs",
    outputDir: string = "analysis-results"
  ) {
    this.dataDir = this.sanitizePath(dataDir, "notion-outputs");
    this.outputDir = this.sanitizePath(outputDir, "analysis-results");
    this.ensureOutputDir();
  }

  private sanitizePath(inputPath: string, allowedBase: string): string {
    const resolvedPath = path.resolve(inputPath);
    const allowedPath = path.resolve(allowedBase);
    if (!resolvedPath.startsWith(allowedPath)) {
      throw new Error(
        `Path traversal attempt: ${inputPath} is outside of ${allowedBase}`
      );
    }
    return resolvedPath;
  }

  private ensureOutputDir(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async analyzeAllData(): Promise<NotionAnalysisResult> {
    console.info("🔍 เริ่มวิเคราะห์ข้อมูล Notion...");

    const allData = await this.loadAllData();
    const analysis = await this.performAnalysis(allData);

    await this.saveAnalysisResults(analysis);
    await this.generateReports(analysis);

    return analysis;
  }

  private async loadAllData(): Promise<any[]> {
    const files = fs
      .readdirSync(this.dataDir)
      .filter((file) => file.endsWith(".json"))
      .filter((file) => file.includes("notion-query-database"));

    console.info(`📁 พบไฟล์ข้อมูล ${files.length} ไฟล์`);

    const allData: any[] = [];

    for (const file of files) {
      try {
        const filePath = path.join(this.dataDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const data = JSON.parse(content);

        if (data.results && Array.isArray(data.results)) {
          allData.push(...data.results);
        }
      } catch (error) {
        console.warn(`⚠️ ไม่สามารถอ่านไฟล์ ${file}:`, error);
      }
    }

    console.info(`📊 โหลดข้อมูล ${allData.length} databases`);
    return allData;
  }

  private async performAnalysis(
    databases: any[]
  ): Promise<NotionAnalysisResult> {
    console.info("📈 วิเคราะห์ข้อมูล...");

    const summary = this.analyzeSummary(databases);
    const patterns = this.analyzePatterns(databases);
    const insights = this.generateInsights(databases);
    const exportData = this.prepareExportData(databases);

    return {
      summary,
      patterns,
      insights,
      exportData,
    };
  }

  private analyzeSummary(databases: any[]): NotionAnalysisResult["summary"] {
    const databaseTypes: Record<string, number> = {};
    const propertyTypes: Record<string, number> = {};
    let totalPages = 0;
    let totalBlocks = 0;

    // วิเคราะห์ databases
    databases.forEach((db) => {
      // Database types
      const type = db.object || "unknown";
      databaseTypes[type] = (databaseTypes[type] || 0) + 1;

      // Properties
      if (db.properties) {
        Object.values(db.properties).forEach((prop: any) => {
          const propType = prop.type || "unknown";
          propertyTypes[propType] = (propertyTypes[propType] || 0) + 1;
        });
      }

      // Pages count
      if (db.pages) {
        totalPages += db.pages.length;
        db.pages.forEach((page: any) => {
          if (page.blocks) {
            totalBlocks += page.blocks.length;
          }
        });
      }
    });

    // หา largest database
    const largestDb = databases.reduce(
      (largest, db) => {
        const pageCount = db.pages ? db.pages.length : 0;
        return pageCount > largest.pageCount
          ? { name: db.title?.[0]?.plain_text || "Unknown", pageCount }
          : largest;
      },
      { name: "Unknown", pageCount: 0 }
    );

    // หา most common properties
    const propertyCounts = Object.entries(propertyTypes)
      .map(([name, count]) => ({
        name,
        count: count as number,
        type: "property",
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalDatabases: databases.length,
      totalPages,
      totalBlocks,
      databaseTypes,
      propertyTypes,
      averagePagesPerDatabase:
        databases.length > 0 ? totalPages / databases.length : 0,
      largestDatabase: largestDb,
      mostCommonProperties: propertyCounts,
    };
  }

  private analyzePatterns(databases: any[]): NotionAnalysisResult["patterns"] {
    const databaseNaming: string[] = [];
    const propertyUsage: Record<string, number> = {};
    const contentTypes: Record<string, number> = {};
    const createdDates: string[] = [];
    const updatedDates: string[] = [];

    databases.forEach((db) => {
      // Database naming patterns
      if (db.title) {
        const name = db.title[0]?.plain_text || "";
        if (name) {
          databaseNaming.push(name);
        }
      }

      // Property usage
      if (db.properties) {
        Object.keys(db.properties).forEach((propName) => {
          propertyUsage[propName] = (propertyUsage[propName] || 0) + 1;
        });
      }

      // Content types
      if (db.pages) {
        db.pages.forEach((page: any) => {
          if (page.properties) {
            Object.values(page.properties).forEach((prop: any) => {
              const type = prop.type || "unknown";
              contentTypes[type] = (contentTypes[type] || 0) + 1;
            });
          }

          // Date patterns
          if (page.created_time) {
            createdDates.push(page.created_time);
          }
          if (page.last_edited_time) {
            updatedDates.push(page.last_edited_time);
          }
        });
      }
    });

    return {
      databaseNaming,
      propertyUsage,
      contentTypes,
      datePatterns: {
        createdDates,
        updatedDates,
      },
    };
  }

  private generateInsights(databases: any[]): NotionAnalysisResult["insights"] {
    // Top databases
    const topDatabases = databases
      .map((db) => ({
        name: db.title?.[0]?.plain_text || "Unknown",
        description: db.description?.[0]?.plain_text || "",
        pageCount: db.pages ? db.pages.length : 0,
        properties: db.properties ? Object.keys(db.properties) : [],
      }))
      .sort((a, b) => b.pageCount - a.pageCount)
      .slice(0, 10);

    // Data quality analysis
    const qualityIssues: string[] = [];
    let completenessScore = 0;
    let consistencyScore = 0;
    let totalChecks = 0;

    databases.forEach((db) => {
      totalChecks++;

      // Completeness checks
      if (!db.title || !db.title[0]?.plain_text) {
        qualityIssues.push(`Database missing title: ${db.id}`);
      }
      if (!db.properties || Object.keys(db.properties).length === 0) {
        qualityIssues.push(`Database missing properties: ${db.id}`);
      }
      if (db.pages && db.pages.length === 0) {
        qualityIssues.push(`Database has no pages: ${db.id}`);
      }

      // Consistency checks
      if (db.pages) {
        const pageIds = new Set();
        db.pages.forEach((page: any) => {
          if (pageIds.has(page.id)) {
            qualityIssues.push(`Duplicate page ID found: ${page.id}`);
          }
          pageIds.add(page.id);
        });
      }
    });

    completenessScore =
      totalChecks > 0
        ? ((totalChecks - qualityIssues.length) / totalChecks) * 100
        : 0;
    consistencyScore =
      totalChecks > 0
        ? ((totalChecks -
            qualityIssues.filter((issue) => issue.includes("Duplicate"))
              .length) /
            totalChecks) *
          100
        : 0;

    // Recommendations
    const recommendations: string[] = [];

    if (completenessScore < 80) {
      recommendations.push("ควรเพิ่มข้อมูลที่ขาดหายไปใน databases");
    }
    if (consistencyScore < 90) {
      recommendations.push("ควรตรวจสอบและแก้ไขข้อมูลที่ซ้ำกัน");
    }
    if (topDatabases.length > 0 && topDatabases[0].pageCount > 100) {
      recommendations.push("พิจารณาแบ่ง databases ขนาดใหญ่เป็นส่วนย่อย");
    }

    return {
      topDatabases,
      dataQuality: {
        completeness: completenessScore,
        consistency: consistencyScore,
        issues: qualityIssues,
      },
      recommendations,
    };
  }

  private prepareExportData(
    databases: any[]
  ): NotionAnalysisResult["exportData"] {
    const allPages: any[] = [];
    const allBlocks: any[] = [];

    databases.forEach((db) => {
      if (db.pages) {
        allPages.push(...db.pages);
        db.pages.forEach((page: any) => {
          if (page.blocks) {
            allBlocks.push(...page.blocks);
          }
        });
      }
    });

    const sourceFiles = fs
      .readdirSync(this.dataDir)
      .filter((file) => file.endsWith(".json"))
      .filter((file) => file.includes("notion-query-database"));

    return {
      databases,
      pages: allPages,
      blocks: allBlocks,
      metadata: {
        analyzedAt: new Date().toISOString(),
        sourceFiles,
        totalSize: JSON.stringify(databases).length,
      },
    };
  }

  private async saveAnalysisResults(
    analysis: NotionAnalysisResult
  ): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // Save full analysis
    const analysisFile = path.join(
      this.outputDir,
      `notion-analysis-${timestamp}.json`
    );
    fs.writeFileSync(analysisFile, JSON.stringify(analysis, null, 2));
    console.info(`💾 บันทึกผลการวิเคราะห์: ${analysisFile}`);

    // Save summary
    const summaryFile = path.join(
      this.outputDir,
      `notion-summary-${timestamp}.json`
    );
    fs.writeFileSync(summaryFile, JSON.stringify(analysis.summary, null, 2));
    console.info(`📊 บันทึกสรุป: ${summaryFile}`);
  }

  private async generateReports(analysis: NotionAnalysisResult): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // Generate Markdown report
    const markdownReport = this.generateMarkdownReport(analysis);
    const reportFile = path.join(
      this.outputDir,
      `notion-report-${timestamp}.md`
    );
    fs.writeFileSync(reportFile, markdownReport);
    console.info(`📝 สร้างรายงาน Markdown: ${reportFile}`);

    // Generate CSV exports
    await this.generateCSVExports(analysis, timestamp);
  }

  private generateMarkdownReport(analysis: NotionAnalysisResult): string {
    const { summary, patterns, insights } = analysis;

    return `# Notion Data Analysis Report

## 📊 สรุปข้อมูล

- **จำนวน Databases**: ${summary.totalDatabases}
- **จำนวน Pages**: ${summary.totalPages}
- **จำนวน Blocks**: ${summary.totalBlocks}
- **เฉลี่ย Pages ต่อ Database**: ${summary.averagePagesPerDatabase.toFixed(2)}

### 🏆 Database ที่ใหญ่ที่สุด
- **ชื่อ**: ${summary.largestDatabase.name}
- **จำนวน Pages**: ${summary.largestDatabase.pageCount}

### 📋 ประเภท Databases
${Object.entries(summary.databaseTypes)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join("\n")}

### 🔧 Properties ที่ใช้บ่อยที่สุด
${summary.mostCommonProperties
  .map((prop) => `- ${prop.name}: ${prop.count}`)
  .join("\n")}

## 📈 การวิเคราะห์ Patterns

### 🏷️ การตั้งชื่อ Databases
${patterns.databaseNaming
  .slice(0, 10)
  .map((name) => `- ${name}`)
  .join("\n")}

### 📅 รูปแบบวันที่
- **วันที่สร้าง**: ${patterns.datePatterns.createdDates.length} รายการ
- **วันที่แก้ไขล่าสุด**: ${patterns.datePatterns.updatedDates.length} รายการ

## 💡 ข้อมูลเชิงลึก

### 🥇 Top 10 Databases
${insights.topDatabases
  .map((db, index) => `${index + 1}. **${db.name}** (${db.pageCount} pages)`)
  .join("\n")}

### 📊 คุณภาพข้อมูล
- **ความสมบูรณ์**: ${insights.dataQuality.completeness.toFixed(1)}%
- **ความสม่ำเสมอ**: ${insights.dataQuality.consistency.toFixed(1)}%

### ⚠️ ปัญหาที่พบ
${
  insights.dataQuality.issues.length > 0
    ? insights.dataQuality.issues.map((issue) => `- ${issue}`).join("\n")
    : "- ไม่พบปัญหา"
}

### 💡 คำแนะนำ
${insights.recommendations.map((rec) => `- ${rec}`).join("\n")}

---
*สร้างเมื่อ: ${new Date().toLocaleString("th-TH")}*
`;
  }

  private async generateCSVExports(
    analysis: NotionAnalysisResult,
    timestamp: string
  ): Promise<void> {
    // Export databases summary
    const databasesCSV = this.convertToCSV(analysis.insights.topDatabases, [
      "name",
      "description",
      "pageCount",
      "properties",
    ]);
    const databasesFile = path.join(
      this.outputDir,
      `databases-summary-${timestamp}.csv`
    );
    fs.writeFileSync(databasesFile, databasesCSV);
    console.info(`📊 ส่งออก CSV databases: ${databasesFile}`);

    // Export property usage
    const propertyUsage = Object.entries(analysis.patterns.propertyUsage).map(
      ([name, count]) => ({ name, count })
    );
    const propertiesCSV = this.convertToCSV(propertyUsage, ["name", "count"]);
    const propertiesFile = path.join(
      this.outputDir,
      `property-usage-${timestamp}.csv`
    );
    fs.writeFileSync(propertiesFile, propertiesCSV);
    console.info(`📊 ส่งออก CSV properties: ${propertiesFile}`);
  }

  private convertToCSV(data: any[], headers: string[]): string {
    const csvHeaders = headers.join(",");
    const csvRows = data.map((item) =>
      headers
        .map((header) => {
          const value = item[header];
          if (Array.isArray(value)) {
            return `"${value.join("; ")}"`;
          }
          return `"${value || ""}"`;
        })
        .join(",")
    );

    return [csvHeaders, ...csvRows].join("\n");
  }

  async generateTrainingData(): Promise<void> {
    console.info("🤖 สร้าง Training Data สำหรับ AI...");

    const allData = await this.loadAllData();
    const trainingData = this.prepareTrainingData(allData);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const trainingFile = path.join(
      this.outputDir,
      `ai-training-data-${timestamp}.json`
    );

    fs.writeFileSync(trainingFile, JSON.stringify(trainingData, null, 2));
    console.info(`🤖 บันทึก Training Data: ${trainingFile}`);
  }

  private prepareTrainingData(databases: any[]): any {
    const trainingExamples: any[] = [];

    databases.forEach((db) => {
      if (db.pages && db.pages.length > 0) {
        db.pages.forEach((page: any) => {
          const example = {
            database_name: db.title?.[0]?.plain_text || "Unknown",
            page_title:
              page.properties?.Name?.title?.[0]?.plain_text || "Untitled",
            page_type: page.object,
            properties: page.properties ? Object.keys(page.properties) : [],
            content_summary: this.extractContentSummary(page),
            created_time: page.created_time,
            last_edited_time: page.last_edited_time,
          };

          trainingExamples.push(example);
        });
      }
    });

    return {
      metadata: {
        total_examples: trainingExamples.length,
        source_databases: databases.length,
        generated_at: new Date().toISOString(),
      },
      examples: trainingExamples,
    };
  }

  private extractContentSummary(page: any): string {
    if (page.blocks && page.blocks.length > 0) {
      const textBlocks = page.blocks
        .filter(
          (block: any) =>
            block.type === "paragraph" ||
            block.type === "heading_1" ||
            block.type === "heading_2"
        )
        .map((block: any) => {
          if (block.paragraph?.rich_text) {
            return block.paragraph.rich_text
              .map((text: any) => text.plain_text)
              .join(" ");
          }
          if (block.heading_1?.rich_text) {
            return block.heading_1.rich_text
              .map((text: any) => text.plain_text)
              .join(" ");
          }
          if (block.heading_2?.rich_text) {
            return block.heading_2.rich_text
              .map((text: any) => text.plain_text)
              .join(" ");
          }
          return "";
        })
        .filter((text) => text.length > 0)
        .join(" ");

      return (
        textBlocks.substring(0, 200) + (textBlocks.length > 200 ? "..." : "")
      );
    }

    return "";
  }
}

// ฟังก์ชันสำหรับรันการวิเคราะห์
export async function runNotionAnalysis(): Promise<void> {
  console.info("🎯 เริ่มการวิเคราะห์ข้อมูล Notion");

  const analyzer = new NotionDataAnalyzer();

  try {
    const analysis = await analyzer.analyzeAllData();
    await analyzer.generateTrainingData();

    console.info("✅ การวิเคราะห์เสร็จสิ้น!");
    console.info(`📊 จำนวน Databases: ${analysis.summary.totalDatabases}`);
    console.info(`📄 จำนวน Pages: ${analysis.summary.totalPages}`);
    console.info(`🔧 จำนวน Blocks: ${analysis.summary.totalBlocks}`);
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการวิเคราะห์:", error);
  }
}

// ตัวอย่างการใช้งาน
if (require.main === module) {
  runNotionAnalysis().catch(console.error);
}
