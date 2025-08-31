import { NotionDataAutomationTool } from "./tools/NotionDataAutomationTool";
import { APIManagerTool } from "./tools/APIManagerTool";

// Mock Obsidian App สำหรับ demo
const mockApp = {
  vault: {
    create: async (path: string, content: string) => {
      console.info(`📄 Created file: ${path}`);
      console.info(`📝 Content preview: ${content.substring(0, 100)}...`);
    },
    createFolder: async (path: string) => {
      console.info(`📁 Created folder: ${path}`);
    },
    getAbstractFileByPath: (path: string) => {
      console.info(`🔍 Looking for file: ${path}`);
      return null; // ไม่มีไฟล์เดิม
    },
    read: async (file: any) => {
      console.info(`📖 Reading file: ${file.path}`);
      return "{}"; // ข้อมูลเริ่มต้น
    },
  },
} as any;

async function demoNotionDataAutomation() {
  console.info("🚀 Starting Notion Data Automation Demo...\n");

  // สร้าง instances
  const apiManager = new APIManagerTool(mockApp);
  const automationTool = new NotionDataAutomationTool(mockApp, apiManager);

  try {
    // 1. สร้างกฎการทำงานอัตโนมัติ
    console.info("📋 1. Creating Automation Rules...");

    const rule1 = await automationTool.execute({
      action: "create_automation_rule",
      name: "Auto-Notify New Tasks",
      trigger: "on_create",
      conditions: [
        {
          field: "type",
          operator: "equals",
          value: "task",
        },
      ],
      actions: [
        {
          type: "send_notification",
          target: "obsidian",
          value: "New task created: {{title}}",
        },
        {
          type: "add_tag",
          target: "new-task",
          value: "automated",
        },
      ],
    });

    console.info("✅ Rule 1 created:", rule1.data.name);

    const rule2 = await automationTool.execute({
      action: "create_automation_rule",
      name: "Sync High Priority",
      trigger: "on_update",
      conditions: [
        {
          field: "priority",
          operator: "equals",
          value: "P0",
        },
      ],
      actions: [
        {
          type: "sync_to_obsidian",
          target: "high-priority-folder",
          value: "{{title}}",
          parameters: {
            createNote: true,
            addFrontmatter: true,
          },
        },
      ],
    });

    console.info("✅ Rule 2 created:", rule2.data.name);

    // 2. ตั้งค่าการซิงค์
    console.info("\n🔄 2. Setting up Sync Configurations...");

    const sync1 = await automationTool.execute({
      action: "setup_sync",
      sourceDatabase: "bc0bf76b3caf4cdd9f31b856520834d5",
      targetFolder: "Notion Sync/Projects",
      syncDirection: "notion_to_obsidian",
      propertyMapping: {
        Name: "title",
        Status: "status",
        Priority: "priority",
        "Due Date": "due_date",
        Assignee: "assignee",
      },
    });

    console.info(
      "✅ Sync 1 configured:",
      sync1.data.sourceDatabase,
      "→",
      sync1.data.targetFolder
    );

    const sync2 = await automationTool.execute({
      action: "setup_sync",
      sourceDatabase: "another-database-id",
      targetFolder: "Notion Sync/Notes",
      syncDirection: "bidirectional",
      propertyMapping: {
        Title: "title",
        Content: "content",
        Tags: "tags",
        Created: "created_date",
      },
    });

    console.info(
      "✅ Sync 2 configured:",
      sync2.data.sourceDatabase,
      "→",
      sync2.data.targetFolder
    );

    // 3. รันกฎการทำงานอัตโนมัติ
    console.info("\n⚡ 3. Running Automation Rules...");

    const runResult = await automationTool.execute({
      action: "run_automation",
      force: true,
    });

    console.info(
      `✅ Executed ${runResult.data.executedRules} rules out of ${runResult.data.totalRules} total rules`
    );

    // 4. ซิงค์ข้อมูล
    console.info("\n🔄 4. Syncing Data...");

    const syncResult = await automationTool.execute({
      action: "sync_data",
    });

    console.info(
      `✅ Synced ${syncResult.data.syncedConfigs} configurations out of ${syncResult.data.totalConfigs} total configs`
    );

    // 5. ส่งออกข้อมูลการทำงานอัตโนมัติ
    console.info("\n📤 5. Exporting Automation Data...");

    const exportResult = await automationTool.execute({
      action: "export_automation_data",
      format: "markdown",
      includeHistory: true,
    });

    console.info(
      `✅ Exported automation data to: ${exportResult.data.filename}`
    );

    // 6. แสดงสถิติ
    console.info("\n📊 6. Automation Statistics:");
    console.info(`- Total Rules: ${runResult.data.totalRules}`);
    console.info(`- Executed Rules: ${runResult.data.executedRules}`);
    console.info(`- Total Sync Configs: ${syncResult.data.totalConfigs}`);
    console.info(`- Synced Configs: ${syncResult.data.syncedConfigs}`);
    console.info(`- Export Format: ${exportResult.data.format}`);

    // 7. ตัวอย่างการใช้งานขั้นสูง
    console.info("\n🎯 7. Advanced Usage Examples:");

    // สร้างกฎสำหรับการจัดการงานที่เกินกำหนด
    const overdueRule = await automationTool.execute({
      action: "create_automation_rule",
      name: "Overdue Task Handler",
      trigger: "on_schedule",
      conditions: [
        {
          field: "due_date",
          operator: "less_than",
          value: "today",
        },
        {
          field: "status",
          operator: "not_equals",
          value: "Done",
        },
      ],
      actions: [
        {
          type: "send_notification",
          target: "obsidian",
          value: "🚨 Overdue task detected: {{title}}",
        },
        {
          type: "update_property",
          target: "priority",
          value: "P0",
        },
        {
          type: "add_tag",
          target: "overdue",
          value: "urgent",
        },
      ],
    });

    console.info("✅ Overdue rule created:", overdueRule.data.name);

    // สร้างกฎสำหรับการจัดการงานที่เสร็จสิ้น
    const completedRule = await automationTool.execute({
      action: "create_automation_rule",
      name: "Completed Task Handler",
      trigger: "on_update",
      conditions: [
        {
          field: "status",
          operator: "equals",
          value: "Done",
        },
      ],
      actions: [
        {
          type: "send_notification",
          target: "obsidian",
          value: "✅ Task completed: {{title}}",
        },
        {
          type: "export_data",
          target: "completed-tasks-report",
          parameters: {
            format: "csv",
            includeMetrics: true,
          },
        },
      ],
    });

    console.info("✅ Completed rule created:", completedRule.data.name);

    console.info("\n🎉 Demo completed successfully!");
    console.info("\n📝 Summary:");
    console.info("- Created 4 automation rules");
    console.info("- Set up 2 sync configurations");
    console.info("- Executed automation rules");
    console.info("- Synced data between Notion and Obsidian");
    console.info("- Exported automation data");
    console.info("\n💡 Next steps:");
    console.info("- Configure real Notion API keys");
    console.info("- Set up actual database IDs");
    console.info("- Customize automation rules for your workflow");
    console.info("- Monitor automation execution logs");
  } catch (error) {
    console.error("❌ Demo failed:", error);
  }
}

// รัน demo ถ้าเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  demoNotionDataAutomation().catch(console.error);
}

export { demoNotionDataAutomation };
