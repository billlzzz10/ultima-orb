import { ObsidianBasesTool } from "../tools/ObsidianBasesTool";
import { APIManagerTool } from "../tools/APIManagerTool";
import { App } from "obsidian";

const mockApp = {
  vault: {
    create: async (fileName: string, content: string) => {
      console.info(`📝 สร้างไฟล์: ${fileName}`);
      return { fileName, content };
    },
    getMarkdownFiles: () => [],
    getAbstractFileByPath: (path: string) => null,
    read: async (file: any) => "{}",
    modify: async (file: any, content: string) => {
      console.info(`📝 แก้ไขไฟล์: ${content.substring(0, 100)}...`);
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
    console.info("🚀 เริ่มต้น Demo สำหรับ Tools ใหม่");
    console.info("=".repeat(50));

    await this.demoObsidianBases();
    await this.demoAPIManager();

    console.info("=".repeat(50));
    console.info("✅ Demo เสร็จสิ้น!");
  }

  private async demoObsidianBases(): Promise<void> {
    console.info("\n📊 Demo: ObsidianBasesTool");
    console.info("-".repeat(30));

    try {
      // 1. สร้าง Smart Kanban
      console.info("1️⃣ สร้าง Smart Kanban...");
      const kanbanResult = await this.obsidianBases.execute({
        action: "create_smart_kanban",
        baseName: "project-management",
      });
      console.info(`✅ ${kanbanResult.message}`);

      // 2. สร้าง Time Heatmap
      console.info("\n2️⃣ สร้าง Time Heatmap...");
      const heatmapResult = await this.obsidianBases.execute({
        action: "create_time_heatmap",
        baseName: "activity-tracker",
      });
      console.info(`✅ ${heatmapResult.message}`);

      // 3. สร้าง Relationship Matrix
      console.info("\n3️⃣ สร้าง Relationship Matrix...");
      const matrixResult = await this.obsidianBases.execute({
        action: "create_relationship_matrix",
        baseName: "knowledge-graph",
      });
      console.info(`✅ ${matrixResult.message}`);

      // 4. สร้าง Multi-Context Dashboard
      console.info("\n4️⃣ สร้าง Multi-Context Dashboard...");
      const dashboardResult = await this.obsidianBases.execute({
        action: "create_multi_context_dashboard",
        baseName: "personal-dashboard",
      });
      console.info(`✅ ${dashboardResult.message}`);

      // 5. ตรวจสอบ Formula
      console.info("\n5️⃣ ตรวจสอบ Formula...");
      const formulaResult = await this.obsidianBases.execute({
        action: "validate_formula",
        formula:
          "let x = priority ?? 'P3'; if (x == 'P0') 'Urgent' else 'Normal'",
      });
      console.info(`✅ ${formulaResult.message}`);

      // 6. สร้าง Formula จาก Template
      console.info("\n6️⃣ สร้าง Formula จาก Template...");
      const templateResult = await this.obsidianBases.execute({
        action: "generate_formula",
        template: "priority_calculation",
      });
      console.info(`✅ ${templateResult.message}`);
      console.info(`📝 Formula: ${templateResult.data.formula}`);

      // 7. แสดงรายการ Bases
      console.info("\n7️⃣ แสดงรายการ Bases...");
      const listResult = await this.obsidianBases.execute({
        action: "list_bases",
      });
      console.info(`✅ ${listResult.message}`);
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดใน ObsidianBasesTool:", error);
    }
  }

  private async demoAPIManager(): Promise<void> {
    console.info("\n🔑 Demo: APIManagerTool");
    console.info("-".repeat(30));

    try {
      // 1. เพิ่ม API Keys
      console.info("1️⃣ เพิ่ม API Keys...");

      const notionResult = await this.apiManager.execute({
        action: "add_key",
        provider: "notion",
        keyName: "main-notion",
        apiKey: "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",
      });
      console.info(`✅ ${notionResult.message}`);

      const azureResult = await this.apiManager.execute({
        action: "add_key",
        provider: "azure-openai",
        keyName: "main-azure",
        apiKey:
          "4Jgj78ZoDBR6xP8LQmImm1r1RV3OpJ310vef9icSsetzZhicRrPkJQQJ99BHACHYHv6XJ3w3AAAAACOGZ5gC",
        endpoint:
          "https://billl-mer7xd8i-eastus2.services.ai.azure.com/models/chat/completions?api-version=2024-05-01-preview",
      });
      console.info(`✅ ${azureResult.message}`);

      // 2. แสดงรายการ Keys
      console.info("\n2️⃣ แสดงรายการ API Keys...");
      const listResult = await this.apiManager.execute({
        action: "list_keys",
      });
      console.info(`✅ ${listResult.message}`);
      console.info(`📊 จำนวน Keys: ${listResult.data.count}`);

      // 3. เปิดใช้งาน Keys
      console.info("\n3️⃣ เปิดใช้งาน Keys...");
      const activateNotionResult = await this.apiManager.execute({
        action: "activate_key",
        provider: "notion",
        keyName: "main-notion",
      });
      console.info(`✅ ${activateNotionResult.message}`);

      const activateAzureResult = await this.apiManager.execute({
        action: "activate_key",
        provider: "azure-openai",
        keyName: "main-azure",
      });
      console.info(`✅ ${activateAzureResult.message}`);

      // 4. ดึง Active Keys
      console.info("\n4️⃣ ดึง Active Keys...");
      const activeNotionResult = await this.apiManager.execute({
        action: "get_active_key",
        provider: "notion",
      });
      console.info(`✅ ${activeNotionResult.message}`);
      console.info(`🔑 Active Notion Key: ${activeNotionResult.data.name}`);

      const activeAzureResult = await this.apiManager.execute({
        action: "get_active_key",
        provider: "azure-openai",
      });
      console.info(`✅ ${activeAzureResult.message}`);
      console.info(`🔑 Active Azure Key: ${activeAzureResult.data.name}`);

      // 5. ทดสอบการเชื่อมต่อ
      console.info("\n5️⃣ ทดสอบการเชื่อมต่อ...");
      const testNotionResult = await this.apiManager.execute({
        action: "test_connection",
        provider: "notion",
        keyName: "main-notion",
      });
      console.info(`✅ ${testNotionResult.message}`);

      const testAzureResult = await this.apiManager.execute({
        action: "test_connection",
        provider: "azure-openai",
        keyName: "main-azure",
      });
      console.info(`✅ ${testAzureResult.message}`);

      // 6. อัปเดต Key
      console.info("\n6️⃣ อัปเดต API Key...");
      const updateResult = await this.apiManager.execute({
        action: "update_key",
        provider: "notion",
        keyName: "main-notion",
        apiKey: "ntn_updated_key_here",
      });
      console.info(`✅ ${updateResult.message}`);

      // 7. ส่งออก Keys
      console.info("\n7️⃣ ส่งออก Keys...");
      const exportResult = await this.apiManager.execute({
        action: "export_keys",
      });
      console.info(`✅ ${exportResult.message}`);
      console.info(`📊 ส่งออก ${exportResult.data.keys.length} keys`);

      // 8. แสดงรายการ Keys ตาม Provider
      console.info("\n8️⃣ แสดงรายการ Keys ตาม Provider...");
      const notionKeysResult = await this.apiManager.execute({
        action: "list_keys",
        provider: "notion",
      });
      console.info(`✅ ${notionKeysResult.message}`);

      const azureKeysResult = await this.apiManager.execute({
        action: "list_keys",
        provider: "azure-openai",
      });
      console.info(`✅ ${azureKeysResult.message}`);
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดใน APIManagerTool:", error);
    }
  }

  async showToolMetadata(): Promise<void> {
    console.info("\n📋 Tool Metadata");
    console.info("=".repeat(50));

    // ObsidianBasesTool Metadata
    const basesMetadata = this.obsidianBases.getMetadata();
    console.info(`\n📊 ${basesMetadata.name} (${basesMetadata.id})`);
    console.info(`📝 ${basesMetadata.description}`);
    console.info(`🏷️  Category: ${basesMetadata.category}`);
    console.info(`🏷️  Tags: ${basesMetadata.tags.join(", ")}`);
    console.info(`📋 Commands: ${basesMetadata.commands?.length || 0} commands`);

    // APIManagerTool Metadata
    const apiMetadata = this.apiManager.getMetadata();
    console.info(`\n🔑 ${apiMetadata.name} (${apiMetadata.id})`);
    console.info(`📝 ${apiMetadata.description}`);
    console.info(`🏷️  Category: ${apiMetadata.category}`);
    console.info(`🏷️  Tags: ${apiMetadata.tags.join(", ")}`);
    console.info(`📋 Commands: ${apiMetadata.commands?.length || 0} commands`);
  }

  async showAvailableCommands(): Promise<void> {
    console.info("\n🛠️ Available Commands");
    console.info("=".repeat(50));

    // ObsidianBasesTool Commands
    const basesCommands = this.obsidianBases.getMetadata().commands || [];
    console.info(`\n📊 ObsidianBasesTool Commands (${basesCommands.length}):`);
    basesCommands.forEach((cmd, index) => {
      console.info(`  ${index + 1}. ${cmd.name} - ${cmd.description}`);
    });

    // APIManagerTool Commands
    const apiCommands = this.apiManager.getMetadata().commands || [];
    console.info(`\n🔑 APIManagerTool Commands (${apiCommands.length}):`);
    apiCommands.forEach((cmd, index) => {
      console.info(`  ${index + 1}. ${cmd.name} - ${cmd.description}`);
    });
  }
}

// ฟังก์ชันสำหรับรัน demo
export async function runNewToolsDemo(): Promise<void> {
  const demo = new NewToolsDemo();

  console.info("🎯 Ultima-Orb New Tools Demo");
  console.info("สร้างโดย: Ultima-Orb Team");
  console.info("เวอร์ชัน: 1.0.0");

  await demo.showToolMetadata();
  await demo.showAvailableCommands();
  await demo.runDemo();
}

// ตัวอย่างการใช้งาน
if (require.main === module) {
  runNewToolsDemo().catch(console.error);
}
