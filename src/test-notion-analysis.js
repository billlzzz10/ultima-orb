// Test Notion Analysis Tool with real API
import { NotionAnalysisTool } from "./tools/NotionAnalysisTool.js";
import { AIOrchestrationTool } from "./tools/AIOrchestrationTool.js";

// Mock App for testing
const mockApp = {
  vault: {
    read: async () => "test content",
    write: async () => {},
  },
};

/**
 * 🧪 ทดสอบการใช้งานจริง Notion Analysis Tool
 */
async function testNotionAnalysis() {
  console.info("🚀 เริ่มต้นทดสอบ Notion Analysis Tool กับข้อมูลจริง...");

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
      databasesResult.data.databases.forEach((db, index) => {
        console.info(`  ${index + 1}. ${db.title} (${db.id})`);
        console.info(`     Properties: ${db.properties.join(", ")}`);
        console.info(`     URL: ${db.url}`);
      });
    } else {
      console.info("❌ ดึง databases ไม่สำเร็จ:", databasesResult.error);
      return;
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

    console.info("\n🎉 การทดสอบ Notion Analysis Tool เสร็จสิ้น!");
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการทดสอบ:", error);
  }
}

/**
 * 🧪 ทดสอบการเชื่อมต่อ Notion API โดยตรง
 */
async function testNotionConnection() {
  console.info("🔗 ทดสอบการเชื่อมต่อ Notion API โดยตรง...");

  try {
    const response = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY || ""}`,
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

      // แสดงรายละเอียด databases
      data.results.forEach((db, index) => {
        console.info(
          `  ${index + 1}. ${db.title[0]?.plain_text || "Untitled"} (${db.id})`
        );
        console.info(
          `     Properties: ${Object.keys(db.properties).join(", ")}`
        );
        console.info(`     URL: ${db.url}`);
      });

      return data.results;
    } else {
      console.info(
        "❌ การเชื่อมต่อ Notion API ไม่สำเร็จ:",
        response.status,
        response.statusText
      );
      const errorText = await response.text();
      console.info("Error details:", errorText);
      return null;
    }
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการเชื่อมต่อ:", error);
    return null;
  }
}

/**
 * 🧪 ทดสอบ AI Providers
 */
async function testAIProviders() {
  console.info("🤖 ทดสอบ AI Providers...");

  try {
    const aiOrchestration = new AIOrchestrationTool(mockApp);

    // ทดสอบ Azure OpenAI
    console.info("🔵 ทดสอบ Azure OpenAI...");
    const azureResult = await aiOrchestration.execute({
      prompt: "สวัสดีครับ นี่คือการทดสอบ Azure OpenAI กรุณาตอบกลับเป็นภาษาไทย",
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
      prompt: "สวัสดีครับ นี่คือการทดสอบ Ollama กรุณาตอบกลับเป็นภาษาไทย",
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

// รันการทดสอบ
async function runAllTests() {
  console.info("🧪 เริ่มต้นการทดสอบทั้งหมด...\n");

  // ทดสอบการเชื่อมต่อ Notion API
  await testNotionConnection();

  console.info("\n" + "=".repeat(50) + "\n");

  // ทดสอบ AI Providers
  await testAIProviders();

  console.info("\n" + "=".repeat(50) + "\n");

  // ทดสอบ Notion Analysis Tool
  await testNotionAnalysis();
}

// Export functions
export {
  testNotionAnalysis,
  testNotionConnection,
  testAIProviders,
  runAllTests,
};

// รันการทดสอบถ้าเรียกไฟล์นี้โดยตรง
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}
