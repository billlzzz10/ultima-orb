import { describe, it, expect } from "vitest";
import { NotionAIAssistantTool } from "../tools/NotionAIAssistantTool";

// สร้าง mock objects สำหรับ dependencies ที่จำเป็น
const mockApp = { vault: {} } as any;
const mockApiManager = {
  execute: async () => ({ success: true, data: { key: "dummy" }, timestamp: new Date() }),
} as any;
const mockAI = {
  execute: async () => ({ success: true, data: {}, timestamp: new Date() }),
} as any;

describe("NotionAIAssistantTool", () => {
  const assistant = new NotionAIAssistantTool(mockApp, mockApiManager, mockAI);

  it("should expose correct metadata", () => {
    const metadata = assistant.getMetadata();
    expect(metadata.id).toBe("notion-ai-assistant");
    expect(metadata.name).toBe("Notion AI Assistant");
    expect(metadata.category).toBe("AI");
  });

  it("should handle unknown actions safely", async () => {
    const result = await assistant.execute({ action: "unknown" });
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unknown action");
  });
});
