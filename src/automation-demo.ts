import { NotionDataAutomationTool } from "./tools/NotionDataAutomationTool";
import { APIManagerTool } from "./tools/APIManagerTool";

// Mock Obsidian App สำหรับ demo
const mockApp = {
  vault: {
    create: async (path: string, content: string) => {
      console.log(`📄 Created file: ${path}`);
      console.log(`📝 Content preview: ${content.substring(0, 100)}...`);
    },
    createFolder: async (path: string) => {
      console.log(`📁 Created folder: ${path}`);
    },
    getAbstractFileByPath: (path: string) => {
      console.log(`🔍 Looking for file: ${path}`);
      return null; // ไม่มีไฟล์เดิม
    },
    read: async (file: any) => {
      console.log(`📖 Reading file: ${file.path}`);
      return "{}"; // ข้อมูลเริ่มต้น
    },
  },
} as any;

async function demoNotionDataAutomation() {
  console.log("🚀 Starting Notion Data Automation Demo...\n");

  // สร้าง instances
  const apiManager = new APIManagerTool(mockApp);
  const automationTool = new NotionDataAutomationTool(mockApp, apiManager);

  try {
    // 1. สร้างกฎการทำงานอัตโนมัติ
    console.log("📋 1. Creating Automation Rules...");

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

    console.log("✅ Rule 1 created:", rule1.data.name);

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

    console.log("✅ Rule 2 created:", rule2.data.name);

    // 2. ตั้งค่าการซิงค์
    console.log("\n🔄 2. Setting up Sync Configurations...");

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

    console.log(
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

    console.log(
      "✅ Sync 2 configured:",
      sync2.data.sourceDatabase,
      "→",
      sync2.data.targetFolder
    );

    // 3. รันกฎการทำงานอัตโนมัติ
    console.log("\n⚡ 3. Running Automation Rules...");

    const runResult = await automationTool.execute({
      action: "run_automation",
      force: true,
    });

    console.log(
      `✅ Executed ${runResult.data.executedRules} rules out of ${runResult.data.totalRules} total rules`
    );

    // 4. ซิงค์ข้อมูล
    console.log("\n🔄 4. Syncing Data...");

    const syncResult = await automationTool.execute({
      action: "sync_data",
    });

    console.log(
      `✅ Synced ${syncResult.data.syncedConfigs} configurations out of ${syncResult.data.totalConfigs} total configs`
    );

    // 5. ส่งออกข้อมูลการทำงานอัตโนมัติ
    console.log("\n📤 5. Exporting Automation Data...");

    const exportResult = await automationTool.execute({
      action: "export_automation_data",
      format: "markdown",
      includeHistory: true,
    });

    console.log(
      `✅ Exported automation data to: ${exportResult.data.filename}`
    );

    // 6. แสดงสถิติ
    console.log("\n📊 6. Automation Statistics:");
    console.log(`- Total Rules: ${runResult.data.totalRules}`);
    console.log(`- Executed Rules: ${runResult.data.executedRules}`);
    console.log(`- Total Sync Configs: ${syncResult.data.totalConfigs}`);
    console.log(`- Synced Configs: ${syncResult.data.syncedConfigs}`);
    console.log(`- Export Format: ${exportResult.data.format}`);

    // 7. ตัวอย่างการใช้งานขั้นสูง
    console.log("\n🎯 7. Advanced Usage Examples:");

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

    console.log("✅ Overdue rule created:", overdueRule.data.name);

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

    console.log("✅ Completed rule created:", completedRule.data.name);

    console.log("\n🎉 Demo completed successfully!");
    console.log("\n📝 Summary:");
    console.log("- Created 4 automation rules");
    console.log("- Set up 2 sync configurations");
    console.log("- Executed automation rules");
    console.log("- Synced data between Notion and Obsidian");
    console.log("- Exported automation data");
    console.log("\n💡 Next steps:");
    console.log("- Configure real Notion API keys");
    console.log("- Set up actual database IDs");
    console.log("- Customize automation rules for your workflow");
    console.log("- Monitor automation execution logs");
  } catch (error) {
    console.error("❌ Demo failed:", error);
  }
}

// รัน demo ถ้าเรียกไฟล์นี้โดยตรง
if (require.main === module) {
  demoNotionDataAutomation().catch(console.error);
}

export { demoNotionDataAutomation };
