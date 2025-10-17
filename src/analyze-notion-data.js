// สคริปต์สำหรับวิเคราะห์ข้อมูล Notion
const fs = require("fs");
const path = require("path");

class NotionDataAnalyzer {
  constructor(dataDir = "notion-outputs", outputDir = "analysis-results") {
    this.dataDir = this.sanitizePath(dataDir, "notion-outputs");
    this.outputDir = this.sanitizePath(outputDir, "analysis-results");
    this.ensureOutputDir();
  }

  sanitizePath(inputPath, allowedBase) {
    if (typeof inputPath !== "string" || inputPath.trim().length === 0) {
      throw new Error("Invalid path: inputPath must be a non-empty string");
    }
    const resolvedPath = path.resolve(inputPath);
    const allowedPath = path.resolve(allowedBase);
    const relative = path.relative(allowedPath, resolvedPath);
    // If relative starts with '..' or is absolute, resolvedPath is outside allowedPath (handles different drives on Windows)
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(
        `Path traversal attempt: ${inputPath} is outside of ${allowedBase}`
      );
    }
    return resolvedPath;
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async analyzeAllData() {
    console.info("🔍 เริ่มวิเคราะห์ข้อมูล Notion...");

    const allData = await this.loadAllData();
    const analysis = await this.performAnalysis(allData);

    await this.saveAnalysisResults(analysis);
    await this.generateReports(analysis);

    return analysis;
  }

  async loadAllData() {
    const files = fs
      .readdirSync(this.dataDir)
      .filter((file) => file.endsWith(".json"))
      .filter((file) => file.includes("notion-query-database"));

    console.info(`📁 พบไฟล์ข้อมูล ${files.length} ไฟล์`);

    const allData = [];

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

  async performAnalysis(databases) {
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

  analyzeSummary(databases) {
    const databaseTypes = {};
    const propertyTypes = {};
    let totalPages = 0;
    let totalBlocks = 0;

    // วิเคราะห์ databases
    databases.forEach((db) => {
      // Database types
      const type = db.object || "unknown";
      databaseTypes[type] = (databaseTypes[type] || 0) + 1;

      // Properties
      if (db.properties) {
        Object.values(db.properties).forEach((prop) => {
          const propType = prop.type || "unknown";
          propertyTypes[propType] = (propertyTypes[propType] || 0) + 1;
        });
      }

      // Pages count
      if (db.pages) {
        totalPages += db.pages.length;
        db.pages.forEach((page) => {
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
      .map(([name, count]) => ({ name, count, type: "property" }))
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

  analyzePatterns(databases) {
    const databaseNaming = [];
    const propertyUsage = {};
    const contentTypes = {};
    const createdDates = [];
    const updatedDates = [];

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
        db.pages.forEach((page) => {
          if (page.properties) {
            Object.values(page.properties).forEach((prop) => {
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

  generateInsights(databases) {
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
    const qualityIssues = [];
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
        db.pages.forEach((page) => {
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
    const recommendations = [];

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

  prepareExportData(databases) {
    const allPages = [];
    const allBlocks = [];

    databases.forEach((db) => {
      if (db.pages) {
        allPages.push(...db.pages);
        db.pages.forEach((page) => {
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

  async saveAnalysisResults(analysis) {
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

  async generateReports(analysis) {
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

  generateMarkdownReport(analysis) {
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

  async generateCSVExports(analysis, timestamp) {
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

  convertToCSV(data, headers) {
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

  async generateTrainingData() {
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

  prepareTrainingData(databases) {
    const trainingExamples = [];

    databases.forEach((db) => {
      if (db.pages && db.pages.length > 0) {
        db.pages.forEach((page) => {
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

  extractContentSummary(page) {
    if (page.blocks && page.blocks.length > 0) {
      const textBlocks = page.blocks
        .filter(
          (block) =>
            block.type === "paragraph" ||
            block.type === "heading_1" ||
            block.type === "heading_2"
        )
        .map((block) => {
          if (block.paragraph?.rich_text) {
            return block.paragraph.rich_text
              .map((text) => text.plain_text)
              .join(" ");
          }
          if (block.heading_1?.rich_text) {
            return block.heading_1.rich_text
              .map((text) => text.plain_text)
              .join(" ");
          }
          if (block.heading_2?.rich_text) {
            return block.heading_2.rich_text
              .map((text) => text.plain_text)
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
async function runNotionAnalysis() {
  console.info("🎯 เริ่มการวิเคราะห์ข้อมูล Notion");

  const analyzer = new NotionDataAnalyzer();

  try {
    const analysis = await analyzer.analyzeAllData();
    await analyzer.generateTrainingData();

    console.info("✅ การวิเคราะห์เสร็จสิ้น!");
    console.info(`📊 จำนวน Databases: ${analysis.summary.totalDatabases}`);
    console.info(`📄 จำนวน Pages: ${analysis.summary.totalPages}`);
    console.info(`🔧 จำนวน Blocks: ${analysis.summary.totalBlocks}`);

    // แสดงผลสรุป
    console.info("\n📋 ผลสรุปการวิเคราะห์:");
    console.info("=".repeat(50));
    console.info(
      `🏆 Database ที่ใหญ่ที่สุด: ${analysis.summary.largestDatabase.name} (${analysis.summary.largestDatabase.pageCount} pages)`
    );
    console.info(
      `📊 คุณภาพข้อมูล - ความสมบูรณ์: ${analysis.insights.dataQuality.completeness.toFixed(
        1
      )}%`
    );
    console.info(
      `📊 คุณภาพข้อมูล - ความสม่ำเสมอ: ${analysis.insights.dataQuality.consistency.toFixed(
        1
      )}%`
    );

    if (analysis.insights.recommendations.length > 0) {
      console.info("\n💡 คำแนะนำ:");
      analysis.insights.recommendations.forEach((rec) =>
        console.info(`- ${rec}`)
      );
    }
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการวิเคราะห์:", error);
  }
}

// รันการวิเคราะห์
if (require.main === module) {
  runNotionAnalysis().catch(console.error);
}

module.exports = { NotionDataAnalyzer, runNotionAnalysis };
