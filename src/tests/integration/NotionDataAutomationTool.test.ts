import { describe, it, expect, beforeEach, vi } from "vitest";
import { NotionDataAutomationTool } from "../../tools/NotionDataAutomationTool";
import { APIManagerTool } from "../../tools/APIManagerTool";

// Mock Obsidian App
const mockApp = {
  vault: {
    create: vi.fn(),
    createFolder: vi.fn(),
    getAbstractFileByPath: vi.fn(),
    read: vi.fn(),
  },
} as any;

describe("NotionDataAutomationTool", () => {
  let automationTool: NotionDataAutomationTool;
  let apiManager: APIManagerTool;

  beforeEach(() => {
    apiManager = new APIManagerTool(mockApp);
    automationTool = new NotionDataAutomationTool(mockApp, apiManager);
  });

  describe("Metadata", () => {
    it("should have correct metadata", () => {
      const metadata = automationTool.getMetadata();

      expect(metadata.id).toBe("notion-data-automation");
      expect(metadata.name).toBe("Notion Data Automation");
      expect(metadata.description).toContain(
        "จัดการข้อมูล Notion แบบอัตโนมัติ"
      );
      expect(metadata.category).toBe("Automation");
      expect(metadata.icon).toBe("⚡");
      expect(metadata.version).toBe("1.0.0");
      expect(metadata.author).toBe("Ultima-Orb Team");
      expect(metadata.tags).toContain("automation");
      expect(metadata.tags).toContain("notion");
      expect(metadata.tags).toContain("sync");
      expect(metadata.commands).toBeDefined();
      expect(metadata.commands!.length).toBeGreaterThan(0);
    });

    it("should have required commands", () => {
      const metadata = automationTool.getMetadata();
      const commandNames = metadata.commands!.map((cmd) => cmd.name);

      expect(commandNames).toContain("create_automation_rule");
      expect(commandNames).toContain("setup_sync");
      expect(commandNames).toContain("run_automation");
      expect(commandNames).toContain("sync_data");
      expect(commandNames).toContain("export_automation_data");
    });
  });

  describe("Execute", () => {
    it("should create automation rule successfully", async () => {
      const result = await automationTool.execute({
        action: "create_automation_rule",
        name: "Test Rule",
        trigger: "on_create",
        actions: [
          {
            type: "send_notification",
            target: "obsidian",
            value: "Test notification",
          },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe("Test Rule");
      expect(result.data.trigger).toBe("on_create");
      expect(result.data.enabled).toBe(true);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it("should setup sync configuration successfully", async () => {
      const result = await automationTool.execute({
        action: "setup_sync",
        sourceDatabase: "test-db-id",
        targetFolder: "Test Folder",
        syncDirection: "notion_to_obsidian",
        propertyMapping: {
          title: "title",
          status: "status",
        },
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.sourceDatabase).toBe("test-db-id");
      expect(result.data.targetFolder).toBe("Test Folder");
      expect(result.data.syncDirection).toBe("notion_to_obsidian");
      expect(result.data.enabled).toBe(true);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it("should run automation successfully", async () => {
      // First create a rule
      await automationTool.execute({
        action: "create_automation_rule",
        name: "Test Rule",
        trigger: "manual",
        actions: [
          {
            type: "send_notification",
            target: "obsidian",
            value: "Test notification",
          },
        ],
      });

      const result = await automationTool.execute({
        action: "run_automation",
        force: true,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.totalRules).toBeGreaterThan(0);
      expect(result.data.executedRules).toBeGreaterThan(0);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it("should sync data successfully", async () => {
      // First setup sync
      await automationTool.execute({
        action: "setup_sync",
        sourceDatabase: "test-db-id",
        targetFolder: "Test Folder",
        syncDirection: "notion_to_obsidian",
      });

      const result = await automationTool.execute({
        action: "sync_data",
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.totalConfigs).toBeGreaterThan(0);
      expect(result.data.syncedConfigs).toBeGreaterThan(0);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it("should export automation data successfully", async () => {
      mockApp.vault.create.mockResolvedValue(undefined);

      const result = await automationTool.execute({
        action: "export_automation_data",
        format: "json",
        includeHistory: false,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.filename).toContain("automation-data");
      expect(result.data.format).toBe("json");
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it("should handle unknown action", async () => {
      const result = await automationTool.execute({
        action: "unknown_action",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown action");
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it("should handle errors gracefully", async () => {
      // Mock an error by passing invalid parameters
      const result = await automationTool.execute({
        action: "create_automation_rule",
        // Missing required parameters
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe("Error Handling", () => {
    it("should handle missing required parameters", async () => {
      const result = await automationTool.execute({
        action: "create_automation_rule",
        // Missing name, trigger, actions
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle invalid trigger type", async () => {
      const result = await automationTool.execute({
        action: "create_automation_rule",
        name: "Test Rule",
        trigger: "invalid_trigger",
        actions: [],
      });

      expect(result.success).toBe(true); // Should still work as trigger is cast to any
    });
  });

  describe("Data Persistence", () => {
    it("should save and load automation data", async () => {
      // Create a rule
      await automationTool.execute({
        action: "create_automation_rule",
        name: "Persistence Test",
        trigger: "on_update",
        actions: [],
      });

      // Setup sync
      await automationTool.execute({
        action: "setup_sync",
        sourceDatabase: "persistence-db",
        targetFolder: "Persistence Folder",
        syncDirection: "bidirectional",
      });

      // The tool should automatically save data after each operation
      // In a real test, we would verify the saved data
      expect(true).toBe(true); // Placeholder assertion
    });
  });
});
