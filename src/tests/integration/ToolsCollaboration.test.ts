import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { APIManagerTool } from "../../tools/APIManagerTool";
import { NotionAIAssistantTool } from "../../tools/NotionAIAssistantTool";

// mock Obsidian App สำหรับการจัดการไฟล์
const mockApp = {
  vault: {
    getAbstractFileByPath: (_: string) => null,
    read: async () => "{}",
    modify: async () => {},
    create: async () => ({}) as any,
  },
} as any;

describe("Tools Collaboration", () => {
  let apiManager: APIManagerTool;
  let assistant: NotionAIAssistantTool;
  let originalFetch: typeof fetch;

  beforeEach(async () => {
    apiManager = new APIManagerTool(mockApp);
    await apiManager.execute({
      action: "add_key",
      provider: "notion",
      keyName: "test",
      apiKey: "secret",
    });

    const mockAI = {
      execute: async () => ({ success: true, data: {}, timestamp: new Date() }),
    } as any;

    assistant = new NotionAIAssistantTool(mockApp, apiManager, mockAI);

    originalFetch = global.fetch;
    global.fetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        results: [
          {
            properties: {
              title: { type: "title" },
            },
          },
        ],
      }),
    })) as any;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should analyze structure using API key from APIManagerTool", async () => {
    const result = await assistant.execute({ action: "analyze_structure" });
    expect(result.success).toBe(true);
    expect(result.data.totalDatabases).toBe(1);
    expect((global.fetch as any)).toHaveBeenCalled();
  });
});
