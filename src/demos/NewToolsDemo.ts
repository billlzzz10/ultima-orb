import { ObsidianBasesTool } from "../tools/ObsidianBasesTool";
import { APIManagerTool } from "../tools/APIManagerTool";
import { App } from "obsidian";

const mockApp = {
  vault: {
    create: async (fileName: string, content: string) => {
      console.log(`📝 สร้างไฟล์: ${fileName}`);
      return { fileName, content };
    },
    getMarkdownFiles: () => [],
    getAbstractFileByPath: (path: string) => null,
    read: async (file: any) => "{}",
    modify: async (file: any, content: string) => {
      console.log(`📝 แก้ไขไฟล์: ${content.substring(0, 100)}...`);
    },
  },
} as any;

export class NewToolsDemo {
  private obsidianBases: ObsidianBasesTool;
  private apiManager: APIManagerTool;

  constructor() {
    this.obsidianBases = new ObsidianBasesTool(mockApp);
    this.apiManager = new APIManagerTool(mockApp);
  }

  async runDemo(): Promise<void> {
    console.log("🚀 เริ่มต้น Demo สำหรับ Tools ใหม่");
    console.log("=".repeat(50));

    await this.demoObsidianBases();
    await this.demoAPIManager();

    console.log("=".repeat(50));
    console.log("✅ Demo เสร็จสิ้น!");
  }

  private async demoObsidianBases(): Promise<void> {
    console.log("\n📊 Demo: ObsidianBasesTool");
    console.log("-".repeat(30));

    try {
      // 1. สร้าง Smart Kanban
      console.log("1️⃣ สร้าง Smart Kanban...");
      const kanbanResult = await this.obsidianBases.execute({
        action: "create_smart_kanban",
        baseName: "project-management",
      });
      console.log(`✅ ${kanbanResult.message}`);

      // 2. สร้าง Time Heatmap
      console.log("\n2️⃣ สร้าง Time Heatmap...");
      const heatmapResult = await this.obsidianBases.execute({
        action: "create_time_heatmap",
        baseName: "activity-tracker",
      });
      console.log(`✅ ${heatmapResult.message}`);

      // 3. สร้าง Relationship Matrix
      console.log("\n3️⃣ สร้าง Relationship Matrix...");
      const matrixResult = await this.obsidianBases.execute({
        action: "create_relationship_matrix",
        baseName: "knowledge-graph",
      });
      console.log(`✅ ${matrixResult.message}`);

      // 4. สร้าง Multi-Context Dashboard
      console.log("\n4️⃣ สร้าง Multi-Context Dashboard...");
      const dashboardResult = await this.obsidianBases.execute({
        action: "create_multi_context_dashboard",
        baseName: "personal-dashboard",
      });
      console.log(`✅ ${dashboardResult.message}`);

      // 5. ตรวจสอบ Formula
      console.log("\n5️⃣ ตรวจสอบ Formula...");
      const formulaResult = await this.obsidianBases.execute({
        action: "validate_formula",
        formula:
          "let x = priority ?? 'P3'; if (x == 'P0') 'Urgent' else 'Normal'",
      });
      console.log(`✅ ${formulaResult.message}`);

      // 6. สร้าง Formula จาก Template
      console.log("\n6️⃣ สร้าง Formula จาก Template...");
      const templateResult = await this.obsidianBases.execute({
        action: "generate_formula",
        template: "priority_calculation",
      });
      console.log(`✅ ${templateResult.message}`);
      console.log(`📝 Formula: ${templateResult.data.formula}`);

      // 7. แสดงรายการ Bases
      console.log("\n7️⃣ แสดงรายการ Bases...");
      const listResult = await this.obsidianBases.execute({
        action: "list_bases",
      });
      console.log(`✅ ${listResult.message}`);
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดใน ObsidianBasesTool:", error);
    }
  }

  private async demoAPIManager(): Promise<void> {
    console.log("\n🔑 Demo: APIManagerTool");
    console.log("-".repeat(30));

    try {
      // 1. เพิ่ม API Keys
      console.log("1️⃣ เพิ่ม API Keys...");

      const notionResult = await this.apiManager.execute({
        action: "add_key",
        provider: "notion",
        keyName: "main-notion",
        apiKey: "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",
      });
      console.log(`✅ ${notionResult.message}`);

      const azureResult = await this.apiManager.execute({
        action: "add_key",
        provider: "azure-openai",
        keyName: "main-azure",
        apiKey:
          "4Jgj78ZoDBR6xP8LQmImm1r1RV3OpJ310vef9icSsetzZhicRrPkJQQJ99BHACHYHv6XJ3w3AAAAACOGZ5gC",
        endpoint:
          "https://billl-mer7xd8i-eastus2.services.ai.azure.com/models/chat/completions?api-version=2024-05-01-preview",
      });
      console.log(`✅ ${azureResult.message}`);

      // 2. แสดงรายการ Keys
      console.log("\n2️⃣ แสดงรายการ API Keys...");
      const listResult = await this.apiManager.execute({
        action: "list_keys",
      });
      console.log(`✅ ${listResult.message}`);
      console.log(`📊 จำนวน Keys: ${listResult.data.count}`);

      // 3. เปิดใช้งาน Keys
      console.log("\n3️⃣ เปิดใช้งาน Keys...");
      const activateNotionResult = await this.apiManager.execute({
        action: "activate_key",
        provider: "notion",
        keyName: "main-notion",
      });
      console.log(`✅ ${activateNotionResult.message}`);

      const activateAzureResult = await this.apiManager.execute({
        action: "activate_key",
        provider: "azure-openai",
        keyName: "main-azure",
      });
      console.log(`✅ ${activateAzureResult.message}`);

      // 4. ดึง Active Keys
      console.log("\n4️⃣ ดึง Active Keys...");
      const activeNotionResult = await this.apiManager.execute({
        action: "get_active_key",
        provider: "notion",
      });
      console.log(`✅ ${activeNotionResult.message}`);
      console.log(`🔑 Active Notion Key: ${activeNotionResult.data.name}`);

      const activeAzureResult = await this.apiManager.execute({
        action: "get_active_key",
        provider: "azure-openai",
      });
      console.log(`✅ ${activeAzureResult.message}`);
      console.log(`🔑 Active Azure Key: ${activeAzureResult.data.name}`);

      // 5. ทดสอบการเชื่อมต่อ
      console.log("\n5️⃣ ทดสอบการเชื่อมต่อ...");
      const testNotionResult = await this.apiManager.execute({
        action: "test_connection",
        provider: "notion",
        keyName: "main-notion",
      });
      console.log(`✅ ${testNotionResult.message}`);

      const testAzureResult = await this.apiManager.execute({
        action: "test_connection",
        provider: "azure-openai",
        keyName: "main-azure",
      });
      console.log(`✅ ${testAzureResult.message}`);

      // 6. อัปเดต Key
      console.log("\n6️⃣ อัปเดต API Key...");
      const updateResult = await this.apiManager.execute({
        action: "update_key",
        provider: "notion",
        keyName: "main-notion",
        apiKey: "ntn_updated_key_here",
      });
      console.log(`✅ ${updateResult.message}`);

      // 7. ส่งออก Keys
      console.log("\n7️⃣ ส่งออก Keys...");
      const exportResult = await this.apiManager.execute({
        action: "export_keys",
      });
      console.log(`✅ ${exportResult.message}`);
      console.log(`📊 ส่งออก ${exportResult.data.keys.length} keys`);

      // 8. แสดงรายการ Keys ตาม Provider
      console.log("\n8️⃣ แสดงรายการ Keys ตาม Provider...");
      const notionKeysResult = await this.apiManager.execute({
        action: "list_keys",
        provider: "notion",
      });
      console.log(`✅ ${notionKeysResult.message}`);

      const azureKeysResult = await this.apiManager.execute({
        action: "list_keys",
        provider: "azure-openai",
      });
      console.log(`✅ ${azureKeysResult.message}`);
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดใน APIManagerTool:", error);
    }
  }

  async showToolMetadata(): Promise<void> {
    console.log("\n📋 Tool Metadata");
    console.log("=".repeat(50));

    // ObsidianBasesTool Metadata
    const basesMetadata = this.obsidianBases.getMetadata();
    console.log(`\n📊 ${basesMetadata.name} (${basesMetadata.id})`);
    console.log(`📝 ${basesMetadata.description}`);
    console.log(`🏷️  Category: ${basesMetadata.category}`);
    console.log(`🏷️  Tags: ${basesMetadata.tags.join(", ")}`);
    console.log(`📋 Commands: ${basesMetadata.commands?.length || 0} commands`);

    // APIManagerTool Metadata
    const apiMetadata = this.apiManager.getMetadata();
    console.log(`\n🔑 ${apiMetadata.name} (${apiMetadata.id})`);
    console.log(`📝 ${apiMetadata.description}`);
    console.log(`🏷️  Category: ${apiMetadata.category}`);
    console.log(`🏷️  Tags: ${apiMetadata.tags.join(", ")}`);
    console.log(`📋 Commands: ${apiMetadata.commands?.length || 0} commands`);
  }

  async showAvailableCommands(): Promise<void> {
    console.log("\n🛠️ Available Commands");
    console.log("=".repeat(50));

    // ObsidianBasesTool Commands
    const basesCommands = this.obsidianBases.getMetadata().commands || [];
    console.log(`\n📊 ObsidianBasesTool Commands (${basesCommands.length}):`);
    basesCommands.forEach((cmd, index) => {
      console.log(`  ${index + 1}. ${cmd.name} - ${cmd.description}`);
    });

    // APIManagerTool Commands
    const apiCommands = this.apiManager.getMetadata().commands || [];
    console.log(`\n🔑 APIManagerTool Commands (${apiCommands.length}):`);
    apiCommands.forEach((cmd, index) => {
      console.log(`  ${index + 1}. ${cmd.name} - ${cmd.description}`);
    });
  }
}

// ฟังก์ชันสำหรับรัน demo
export async function runNewToolsDemo(): Promise<void> {
  const demo = new NewToolsDemo();

  console.log("🎯 Ultima-Orb New Tools Demo");
  console.log("สร้างโดย: Ultima-Orb Team");
  console.log("เวอร์ชัน: 1.0.0");

  await demo.showToolMetadata();
  await demo.showAvailableCommands();
  await demo.runDemo();
}

// ตัวอย่างการใช้งาน
if (require.main === module) {
  runNewToolsDemo().catch(console.error);
}
