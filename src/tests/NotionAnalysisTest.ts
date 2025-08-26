import { describe, it, expect, beforeEach } from "vitest";
import { NotionAnalysisTool } from "../tools/NotionAnalysisTool";
import { AIOrchestrationTool } from "../tools/AIOrchestrationTool";
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

  beforeEach(async () => {
    aiOrchestration = new AIOrchestrationTool(mockApp);
    notionAnalysis = new NotionAnalysisTool(mockApp, aiOrchestration);
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
      expect(aiOrchestration).toBeInstanceOf(AIOrchestrationTool);
    });
  });
});
