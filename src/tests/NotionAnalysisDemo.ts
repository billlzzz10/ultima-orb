import { NotionAnalysisTool } from "../tools/NotionAnalysisTool";
import { AIOrchestrationTool } from "../tools/AIOrchestrationTool";

// Mock App สำหรับการทดสอบ
const mockApp = {
  vault: {
    read: async () => "test content",
    write: async () => {},
  },
} as any;

/**
 * 🧪 Demo การใช้งาน Notion Analysis Tool
 */
export async function runNotionAnalysisDemo() {
  console.info("🚀 เริ่มต้น Notion Analysis Demo...");

  try {
    // สร้าง AI Orchestration Tool
    const aiOrchestration = new AIOrchestrationTool(mockApp);

    // สร้าง Notion Analysis Tool
    const notionAnalysis = new NotionAnalysisTool(mockApp, aiOrchestration);

    console.info("✅ Tools ถูกสร้างเรียบร้อยแล้ว");

    // ทดสอบ 1: ดึงรายการ databases ทั้งหมด
    console.info("\n📋 ทดสอบ 1: ดึงรายการ Notion databases ทั้งหมด");
    const databasesResult = await notionAnalysis.execute({
      action: "fetchAllDatabases",
    });

    if (databasesResult.success) {
      console.info("✅ ดึง databases สำเร็จ");
      console.info(`📊 พบ ${databasesResult.data.totalCount} databases`);

      // แสดงรายละเอียด databases
      databasesResult.data.databases.forEach((db: any, index: number) => {
        console.info(`  ${index + 1}. ${db.title} (${db.id})`);
        console.info(`     Properties: ${db.properties.join(", ")}`);
      });
    } else {
      console.info("❌ ดึง databases ไม่สำเร็จ:", databasesResult.error);
    }

    // ทดสอบ 2: การวิเคราะห์แบบครอบคลุมด้วย Azure OpenAI
    console.info("\n🤖 ทดสอบ 2: การวิเคราะห์แบบครอบคลุมด้วย Azure OpenAI");
    const comprehensiveResult = await notionAnalysis.execute({
      action: "comprehensiveAnalysis",
      aiProvider: "azure-openai",
    });

    if (comprehensiveResult.success) {
      console.info("✅ การวิเคราะห์แบบครอบคลุมสำเร็จ");
      console.info(
        `📊 วิเคราะห์ ${comprehensiveResult.data.databasesAnalyzed} databases`
      );
      console.info(`📈 ข้อมูลสรุป:`, comprehensiveResult.data.summary);
    } else {
      console.info(
        "❌ การวิเคราะห์แบบครอบคลุมไม่สำเร็จ:",
        comprehensiveResult.error
      );
    }

    // ทดสอบ 3: การวิเคราะห์ด้วย Ollama (ถ้ามี)
    console.info("\n🤖 ทดสอบ 3: การวิเคราะห์ด้วย Ollama");
    const ollamaResult = await notionAnalysis.execute({
      action: "comprehensiveAnalysis",
      aiProvider: "ollama",
    });

    if (ollamaResult.success) {
      console.info("✅ การวิเคราะห์ด้วย Ollama สำเร็จ");
      console.info(
        `📊 วิเคราะห์ ${ollamaResult.data.databasesAnalyzed} databases`
      );
    } else {
      console.info("❌ การวิเคราะห์ด้วย Ollama ไม่สำเร็จ:", ollamaResult.error);
    }

    // ทดสอบ 4: วิเคราะห์ database เฉพาะ (ถ้ามี database)
    if (databasesResult.success && databasesResult.data.totalCount > 0) {
      const firstDb = databasesResult.data.databases[0];
      console.info(
        `\n🔍 ทดสอบ 4: วิเคราะห์ database "${firstDb.title}" ด้วย Azure OpenAI`
      );

      const specificAnalysis = await notionAnalysis.execute({
        action: "analyzeWithAI",
        databaseId: firstDb.id,
        analysisType: "structure",
        aiProvider: "azure-openai",
        prompt: `วิเคราะห์โครงสร้างของ database "${firstDb.title}" และให้คำแนะนำในการปรับปรุง`,
      });

      if (specificAnalysis.success) {
        console.info("✅ การวิเคราะห์ database เฉพาะสำเร็จ");
        console.info(
          `📊 วิเคราะห์ ${specificAnalysis.data.pagesAnalyzed} pages`
        );
        console.info(`🤖 AI Response:`, specificAnalysis.data.aiResponse);
      } else {
        console.info(
          "❌ การวิเคราะห์ database เฉพาะไม่สำเร็จ:",
          specificAnalysis.error
        );
      }
    }

    console.info("\n🎉 Notion Analysis Demo เสร็จสิ้น!");
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดใน Demo:", error);
  }
}

/**
 * 🧪 ทดสอบการเชื่อมต่อ Notion API
 */
export async function testNotionConnection() {
  console.info("🔗 ทดสอบการเชื่อมต่อ Notion API...");

  try {
    const response = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${process.env.NOTION_API_KEY || ""}`,
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

    if (response.ok) {
      const data = await response.json();
      console.info("✅ การเชื่อมต่อ Notion API สำเร็จ");
      console.info(`📊 พบ ${data.results.length} databases`);
      return true;
    } else {
      console.info(
        "❌ การเชื่อมต่อ Notion API ไม่สำเร็จ:",
        response.status,
        response.statusText
      );
      return false;
    }
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการเชื่อมต่อ:", error);
    return false;
  }
}

/**
 * 🧪 ทดสอบ AI Providers
 */
export async function testAIProviders() {
  console.info("🤖 ทดสอบ AI Providers...");

  const mockApp = {
    vault: {
      read: async () => "test content",
      write: async () => {},
    },
  } as any;

  try {
    const aiOrchestration = new AIOrchestrationTool(mockApp);

    // ทดสอบ Azure OpenAI
    console.info("🔵 ทดสอบ Azure OpenAI...");
    const azureResult = await aiOrchestration.execute({
      prompt: "สวัสดีครับ นี่คือการทดสอบ Azure OpenAI",
      provider: "azure-openai",
    });

    if (azureResult.success) {
      console.info("✅ Azure OpenAI ทำงานได้");
      console.info("📝 Response:", azureResult.data.content);
    } else {
      console.info("❌ Azure OpenAI ไม่ทำงาน:", azureResult.error);
    }

    // ทดสอบ Ollama
    console.info("🟢 ทดสอบ Ollama...");
    const ollamaResult = await aiOrchestration.execute({
      prompt: "สวัสดีครับ นี่คือการทดสอบ Ollama",
      provider: "ollama",
    });

    if (ollamaResult.success) {
      console.info("✅ Ollama ทำงานได้");
      console.info("📝 Response:", ollamaResult.data.content);
    } else {
      console.info("❌ Ollama ไม่ทำงาน:", ollamaResult.error);
    }
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการทดสอบ AI:", error);
  }
}

// Export สำหรับการใช้งาน
export { NotionAnalysisTool, AIOrchestrationTool };
