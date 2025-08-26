import { describe, it, expect, beforeEach } from "vitest";
import { APIManagerTool } from "../../tools/APIManagerTool";
import { App } from "obsidian";

const mockApp = {
  vault: {
    getAbstractFileByPath: (path: string) => null,
    read: async (file: any) => "{}",
    modify: async (file: any, content: string) => {},
    create: async (fileName: string, content: string) => {
      return { fileName, content };
    },
  },
} as any;

describe("APIManagerTool", () => {
  let apiManager: APIManagerTool;

  beforeEach(() => {
    apiManager = new APIManagerTool(mockApp);
  });

  describe("Tool Metadata", () => {
    it("should have correct metadata", () => {
      const metadata = apiManager.getMetadata();

      expect(metadata.id).toBe("api-manager");
      expect(metadata.name).toBe("API Manager");
      expect(metadata.category).toBe("Integration");
      expect(metadata.icon).toBe("🔑");
      expect(metadata.tags).toContain("api");
      expect(metadata.tags).toContain("security");
      expect(metadata.tags).toContain("keys");
    });

    it("should have commands defined", () => {
      const metadata = apiManager.getMetadata();

      expect(metadata.commands).toBeDefined();
      expect(metadata.commands!.length).toBeGreaterThan(0);

      const commandNames = metadata.commands!.map((cmd) => cmd.name);
      expect(commandNames).toContain("add_key");
      expect(commandNames).toContain("get_key");
      expect(commandNames).toContain("list_keys");
      expect(commandNames).toContain("test_connection");
    });
  });

  describe("Execute Method", () => {
    it("should handle add_key action", async () => {
      const result = await apiManager.execute({
        action: "add_key",
        provider: "notion",
        keyName: "test-key",
        apiKey: "test-api-key",
      });

      expect(result.success).toBe(true);
      expect(result.data.keyId).toBe("notion:test-key");
      expect(result.message).toContain("Added API key");
    });

    it("should handle get_key action", async () => {
      // First add a key
      await apiManager.execute({
        action: "add_key",
        provider: "notion",
        keyName: "test-key",
        apiKey: "test-api-key",
      });

      // Then get the key
      const result = await apiManager.execute({
        action: "get_key",
        provider: "notion",
        keyName: "test-key",
      });

      expect(result.success).toBe(true);
      expect(result.data.name).toBe("test-key");
      expect(result.data.provider).toBe("notion");
      expect(result.data.key).toBe("test-api-key");
    });

    it("should handle list_keys action", async () => {
      // Add some keys first
      await apiManager.execute({
        action: "add_key",
        provider: "notion",
        keyName: "key1",
        apiKey: "key1-value",
      });

      await apiManager.execute({
        action: "add_key",
        provider: "azure-openai",
        keyName: "key2",
        apiKey: "key2-value",
      });

      const result = await apiManager.execute({
        action: "list_keys",
      });

      expect(result.success).toBe(true);
      expect(result.data.keys).toBeDefined();
      expect(result.data.count).toBe(2);
    });

    it("should handle list_keys with provider filter", async () => {
      // Add keys for different providers
      await apiManager.execute({
        action: "add_key",
        provider: "notion",
        keyName: "notion-key",
        apiKey: "notion-value",
      });

      await apiManager.execute({
        action: "add_key",
        provider: "azure-openai",
        keyName: "azure-key",
        apiKey: "azure-value",
      });

      const result = await apiManager.execute({
        action: "list_keys",
        provider: "notion",
      });

      expect(result.success).toBe(true);
      expect(result.data.keys).toBeDefined();
      expect(result.data.count).toBe(1);
      expect(result.data.keys[0].provider).toBe("notion");
    });

    it("should handle update_key action", async () => {
      // First add a key
      await apiManager.execute({
        action: "add_key",
        provider: "notion",
        keyName: "test-key",
        apiKey: "old-key",
      });

      // Then update it
      const result = await apiManager.execute({
        action: "update_key",
        provider: "notion",
        keyName: "test-key",
        apiKey: "new-key",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Updated API key");
    });

    it("should handle delete_key action", async () => {
      // First add a key
      await apiManager.execute({
        action: "add_key",
        provider: "notion",
        keyName: "test-key",
        apiKey: "test-key",
      });

      // Then delete it
      const result = await apiManager.execute({
        action: "delete_key",
        provider: "notion",
        keyName: "test-key",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Deleted API key");
    });

    it("should handle activate_key action", async () => {
      // Add multiple keys for the same provider
      await apiManager.execute({
        action: "add_key",
        provider: "notion",
        keyName: "key1",
        apiKey: "key1-value",
      });

      await apiManager.execute({
        action: "add_key",
        provider: "notion",
        keyName: "key2",
        apiKey: "key2-value",
      });

      // Activate the second key
      const result = await apiManager.execute({
        action: "activate_key",
        provider: "notion",
        keyName: "key2",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Activated API key");
    });

    it("should handle deactivate_key action", async () => {
      // First add and activate a key
      await apiManager.execute({
        action: "add_key",
        provider: "notion",
        keyName: "test-key",
        apiKey: "test-key",
      });

      await apiManager.execute({
        action: "activate_key",
        provider: "notion",
        keyName: "test-key",
      });

      // Then deactivate it
      const result = await apiManager.execute({
        action: "deactivate_key",
        provider: "notion",
        keyName: "test-key",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Deactivated API key");
    });

    it("should handle get_active_key action", async () => {
      // Add and activate a key
      await apiManager.execute({
        action: "add_key",
        provider: "notion",
        keyName: "test-key",
        apiKey: "test-key",
      });

      await apiManager.execute({
        action: "activate_key",
        provider: "notion",
        keyName: "test-key",
      });

      // Get the active key
      const result = await apiManager.execute({
        action: "get_active_key",
        provider: "notion",
      });

      expect(result.success).toBe(true);
      expect(result.data.name).toBe("test-key");
      expect(result.data.provider).toBe("notion");
    });

    it("should handle export_keys action", async () => {
      // Add some keys first
      await apiManager.execute({
        action: "add_key",
        provider: "notion",
        keyName: "key1",
        apiKey: "key1-value",
      });

      const result = await apiManager.execute({
        action: "export_keys",
      });

      expect(result.success).toBe(true);
      expect(result.data.keys).toBeDefined();
      expect(result.data.keys.length).toBe(1);
      expect(result.data.keys[0].name).toBe("key1");
      expect(result.data.keys[0].provider).toBe("notion");
    });

    it("should handle import_keys action", async () => {
      const importData = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        keys: [
          {
            name: "imported-key",
            provider: "notion",
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      const result = await apiManager.execute({
        action: "import_keys",
        apiKey: JSON.stringify(importData),
      });

      expect(result.success).toBe(true);
      expect(result.data.importedCount).toBe(1);
    });

    it("should handle unknown action", async () => {
      const result = await apiManager.execute({
        action: "unknown_action",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown action");
    });
  });

  describe("Error Handling", () => {
    it("should handle duplicate key addition", async () => {
      // Add a key first
      await apiManager.execute({
        action: "add_key",
        provider: "notion",
        keyName: "test-key",
        apiKey: "test-key",
      });

      // Try to add the same key again
      const result = await apiManager.execute({
        action: "add_key",
        provider: "notion",
        keyName: "test-key",
        apiKey: "test-key",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("already exists");
    });

    it("should handle getting non-existent key", async () => {
      const result = await apiManager.execute({
        action: "get_key",
        provider: "notion",
        keyName: "non-existent",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });

    it("should handle updating non-existent key", async () => {
      const result = await apiManager.execute({
        action: "update_key",
        provider: "notion",
        keyName: "non-existent",
        apiKey: "new-key",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });

    it("should handle deleting non-existent key", async () => {
      const result = await apiManager.execute({
        action: "delete_key",
        provider: "notion",
        keyName: "non-existent",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });

    it("should handle getting active key when none exists", async () => {
      const result = await apiManager.execute({
        action: "get_active_key",
        provider: "notion",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("No active API key found");
    });
  });

  describe("Key Management", () => {
    it("should handle key with endpoint", async () => {
      const result = await apiManager.execute({
        action: "add_key",
        provider: "azure-openai",
        keyName: "azure-key",
        apiKey: "azure-api-key",
        endpoint: "https://azure-endpoint.com",
      });

      expect(result.success).toBe(true);
      expect(result.data.keyId).toBe("azure-openai:azure-key");
    });

    it("should handle key rotation", async () => {
      // Add a key first
      await apiManager.execute({
        action: "add_key",
        provider: "notion",
        keyName: "test-key",
        apiKey: "old-key",
      });

      // Rotate the key
      const result = await apiManager.execute({
        action: "rotate_key",
        provider: "notion",
        keyName: "test-key",
        apiKey: "new-key",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("Rotated API key");
    });
  });
});
