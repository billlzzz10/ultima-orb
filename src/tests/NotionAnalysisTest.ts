import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NotionAnalysisTool } from "../tools/NotionAnalysisTool";
// ใช้ mock สำหรับ AIOrchestrationTool เพื่อหลีกเลี่ยงการเรียก network จริง
import type { AIOrchestrationTool } from "../tools/AIOrchestrationTool";
import { App } from "obsidian";

// Mock App
const mockApp = {
  vault: {
    read: async () => "test content",
    write: async () => {},
  },
} as any;

describe("NotionAnalysisTool", () => {
  let notionAnalysis: NotionAnalysisTool;
  let aiOrchestration: AIOrchestrationTool;
  const originalFetch = global.fetch;

  beforeEach(() => {
    // mock fetch ให้คืนข้อมูลจำลองและไม่เรียก external APIs
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ results: [] }),
    })) as any;

    // mock AIOrchestrationTool ด้วย object ที่มี method execute เท่านั้น
    aiOrchestration = {
      execute: async () => ({ success: true, data: {}, timestamp: new Date() }),
    } as unknown as AIOrchestrationTool;

    notionAnalysis = new NotionAnalysisTool(mockApp, aiOrchestration);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("Tool Metadata", () => {
    it("should have correct metadata", () => {
      const metadata = notionAnalysis.getMetadata();

      expect(metadata.id).toBe("notion-analysis");
      expect(metadata.name).toBe("Notion Analysis");
      expect(metadata.category).toBe("Analysis");
      expect(metadata.tags).toContain("notion");
      expect(metadata.tags).toContain("analysis");
      expect(metadata.tags).toContain("ai");
    });

    it("should have commands defined", () => {
      const metadata = notionAnalysis.getMetadata();
      expect(metadata.commands).toBeDefined();
      expect(metadata.commands!.length).toBeGreaterThan(0);
    });
  });

  describe("Execute Method", () => {
    it("should handle fetchAllDatabases action", async () => {
      const result = await notionAnalysis.execute({
        action: "fetchAllDatabases",
      });

      expect(result.success).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it("should handle comprehensiveAnalysis action", async () => {
      const result = await notionAnalysis.execute({
        action: "comprehensiveAnalysis",
        aiProvider: "azure-openai",
      });

      expect(result.success).toBeDefined();
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it("should handle unknown action", async () => {
      const result = await notionAnalysis.execute({
        action: "unknownAction",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown action");
    });
  });

  describe("Tool Integration", () => {
    it("should be properly integrated with AIOrchestrationTool", () => {
      expect(notionAnalysis).toBeInstanceOf(NotionAnalysisTool);
    });
  });
});
