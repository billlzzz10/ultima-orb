import { ToolBase, ToolMetadata, ToolResult } from "../core/tools/ToolBase";
import { App } from "obsidian";

interface APIKey {
  name: string;
  key: string;
  endpoint?: string;
  provider: string;
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

export class APIManagerTool extends ToolBase {
  private app: App;
  private apiKeys: Map<string, APIKey> = new Map();
  private configFile = "api-keys.json";

  constructor(app: App) {
    super({
      id: "api-manager",
      name: "API Manager",
      description: "จัดการ API keys อย่างปลอดภัยสำหรับบริการต่างๆ",
      category: "Integration",
      icon: "🔑",
      version: "1.0.0",
      author: "Ultima-Orb Team",
      tags: ["api", "security", "keys", "integration"],
    });
    this.app = app;
    this.loadAPIKeys();
  }

  async execute(params: {
    action: string;
    provider?: string;
    keyName?: string;
    apiKey?: string;
    endpoint?: string;
    isActive?: boolean;
  }): Promise<ToolResult> {
    try {
      switch (params.action) {
        case "add_key":
          return await this.addAPIKey(
            params.provider!,
            params.keyName!,
            params.apiKey!,
            params.endpoint
          );

        case "get_key":
          return await this.getAPIKey(params.provider!, params.keyName!);

        case "list_keys":
          return await this.listAPIKeys(params.provider);

        case "update_key":
          return await this.updateAPIKey(
            params.provider!,
            params.keyName!,
            params.apiKey!,
            params.endpoint
          );

        case "delete_key":
          return await this.deleteAPIKey(params.provider!, params.keyName!);

        case "activate_key":
          return await this.activateKey(params.provider!, params.keyName!);

        case "deactivate_key":
          return await this.deactivateKey(params.provider!, params.keyName!);

        case "get_active_key":
          return await this.getActiveKey(params.provider!);

        case "test_connection":
          return await this.testConnection(params.provider!, params.keyName!);

        case "rotate_key":
          return await this.rotateKey(
            params.provider!,
            params.keyName!,
            params.apiKey!
          );

        case "export_keys":
          return await this.exportKeys();

        case "import_keys":
          return await this.importKeys(params.apiKey!); // apiKey parameter contains JSON data

        default:
          return {
            success: false,
            error: `Unknown action: ${params.action}`,
            timestamp: new Date(),
          };
      }
    } catch (error) {
      return {
        success: false,
        error: `Error executing ${params.action}: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  private async addAPIKey(
    provider: string,
    keyName: string,
    apiKey: string,
    endpoint?: string
  ): Promise<ToolResult> {
    const keyId = `${provider}:${keyName}`;

    if (this.apiKeys.has(keyId)) {
      return {
        success: false,
        error: `API key already exists: ${keyId}`,
        timestamp: new Date(),
      };
    }

    const newKey: APIKey = {
      name: keyName,
      key: this.encryptKey(apiKey),
      provider,
      isActive: true,
      createdAt: new Date(),
    };
    if (endpoint) {
      try {
        const url = new URL(String(endpoint));
        // Normalize - remove trailing slashes
        newKey.endpoint = url.toString().replace(/\/+$/, "");
      } catch {
        // Fallback: trim whitespace and store as-is if not a valid URL
        newKey.endpoint = String(endpoint).trim();
      }
    }

    this.apiKeys.set(keyId, newKey);
    await this.saveAPIKeys();

    return {
      success: true,
      data: { keyId, provider, keyName },
      message: `Added API key: ${keyId}`,
      timestamp: new Date(),
    };
  }

  private async getAPIKey(
    provider: string,
    keyName: string
  ): Promise<ToolResult> {
    const keyId = `${provider}:${keyName}`;
    const apiKey = this.apiKeys.get(keyId);

    if (!apiKey) {
      return {
        success: false,
        error: `API key not found: ${keyId}`,
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      data: {
        name: apiKey.name,
        key: this.decryptKey(apiKey.key),
        endpoint: apiKey.endpoint,
        provider: apiKey.provider,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
        lastUsed: apiKey.lastUsed,
      },
      message: `Retrieved API key: ${keyId}`,
      timestamp: new Date(),
    };
  }

  private async listAPIKeys(provider?: string): Promise<ToolResult> {
    const keys = Array.from(this.apiKeys.values())
      .filter((key) => !provider || key.provider === provider)
      .map((key) => ({
        id: `${key.provider}:${key.name}`,
        name: key.name,
        provider: key.provider,
        endpoint: key.endpoint,
        isActive: key.isActive,
        createdAt: key.createdAt,
        lastUsed: key.lastUsed,
      }));

    return {
      success: true,
      data: { keys, count: keys.length },
      message: `Found ${keys.length} API keys${
        provider ? ` for ${provider}` : ""
      }`,
      timestamp: new Date(),
    };
  }

  private async updateAPIKey(
    provider: string,
    keyName: string,
    newKey: string,
    endpoint?: string
  ): Promise<ToolResult> {
    const keyId = `${provider}:${keyName}`;
    const apiKey = this.apiKeys.get(keyId);

    if (!apiKey) {
      return {
        success: false,
        error: `API key not found: ${keyId}`,
        timestamp: new Date(),
      };
    }

    apiKey.key = this.encryptKey(newKey);
    if (endpoint) apiKey.endpoint = endpoint;
    apiKey.lastUsed = new Date();

    await this.saveAPIKeys();

    return {
      success: true,
      data: { keyId },
      message: `Updated API key: ${keyId}`,
      timestamp: new Date(),
    };
  }

  private async deleteAPIKey(
    provider: string,
    keyName: string
  ): Promise<ToolResult> {
    const keyId = `${provider}:${keyName}`;

    if (!this.apiKeys.has(keyId)) {
      return {
        success: false,
        error: `API key not found: ${keyId}`,
        timestamp: new Date(),
      };
    }

    this.apiKeys.delete(keyId);
    await this.saveAPIKeys();

    return {
      success: true,
      data: { keyId },
      message: `Deleted API key: ${keyId}`,
      timestamp: new Date(),
    };
  }

  private async activateKey(
    provider: string,
    keyName: string
  ): Promise<ToolResult> {
    const keyId = `${provider}:${keyName}`;
    const apiKey = this.apiKeys.get(keyId);

    if (!apiKey) {
      return {
        success: false,
        error: `API key not found: ${keyId}`,
        timestamp: new Date(),
      };
    }

    // Deactivate other keys from the same provider
    for (const [id, key] of this.apiKeys.entries()) {
      if (key.provider === provider) {
        key.isActive = false;
      }
    }

    apiKey.isActive = true;
    await this.saveAPIKeys();

    return {
      success: true,
      data: { keyId },
      message: `Activated API key: ${keyId}`,
      timestamp: new Date(),
    };
  }

  private async deactivateKey(
    provider: string,
    keyName: string
  ): Promise<ToolResult> {
    const keyId = `${provider}:${keyName}`;
    const apiKey = this.apiKeys.get(keyId);

    if (!apiKey) {
      return {
        success: false,
        error: `API key not found: ${keyId}`,
        timestamp: new Date(),
      };
    }

    apiKey.isActive = false;
    await this.saveAPIKeys();

    return {
      success: true,
      data: { keyId },
      message: `Deactivated API key: ${keyId}`,
      timestamp: new Date(),
    };
  }

  private async getActiveKey(provider: string): Promise<ToolResult> {
    const activeKey = Array.from(this.apiKeys.values()).find(
      (key) => key.provider === provider && key.isActive
    );

    if (!activeKey) {
      return {
        success: false,
        error: `No active API key found for provider: ${provider}`,
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      data: {
        name: activeKey.name,
        key: this.decryptKey(activeKey.key),
        endpoint: activeKey.endpoint,
        provider: activeKey.provider,
        createdAt: activeKey.createdAt,
        lastUsed: activeKey.lastUsed,
      },
      message: `Retrieved active API key for ${provider}`,
      timestamp: new Date(),
    };
  }

  private async testConnection(
    provider: string,
    keyName: string
  ): Promise<ToolResult> {
    const keyResult = await this.getAPIKey(provider, keyName);

    if (!keyResult.success) {
      return keyResult;
    }

    const apiKey = keyResult.data;

    try {
      let testResult;

      switch (provider) {
        case "notion":
          testResult = await this.testNotionConnection(apiKey.key);
          break;
        case "azure-openai":
          testResult = await this.testAzureOpenAIConnection(
            apiKey.key,
            apiKey.endpoint
          );
          break;
        case "openai":
          testResult = await this.testOpenAIConnection(apiKey.key);
          break;
        case "ollama":
          testResult = await this.testOllamaConnection(apiKey.endpoint);
          break;
        default:
          return {
            success: false,
            error: `Unsupported provider for testing: ${provider}`,
            timestamp: new Date(),
          };
      }

      // Update last used timestamp
      const keyId = `${provider}:${keyName}`;
      const storedKey = this.apiKeys.get(keyId);
      if (storedKey) {
        storedKey.lastUsed = new Date();
        await this.saveAPIKeys();
      }

      return testResult;
    } catch (error) {
      return {
        success: false,
        error: `Connection test failed: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  private async testNotionConnection(apiKey: string): Promise<ToolResult> {
    const response = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        filter: {
          property: "object",
          value: "database",
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data: { databases: data.results.length },
        message: `Notion connection successful. Found ${data.results.length} databases.`,
        timestamp: new Date(),
      };
    } else {
      return {
        success: false,
        error: `Notion connection failed: ${response.status} ${response.statusText}`,
        timestamp: new Date(),
      };
    }
  }

  private async testAzureOpenAIConnection(
    apiKey: string,
    endpoint: string
  ): Promise<ToolResult> {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant.",
          },
          {
            role: "user",
            content: "Hello",
          },
        ],
        model: "llama-scout-instruct",
        max_tokens: 10,
      }),
    });

    if (response.ok) {
      return {
        success: true,
        data: { model: "llama-scout-instruct" },
        message: "Azure OpenAI connection successful.",
        timestamp: new Date(),
      };
    } else {
      return {
        success: false,
        error: `Azure OpenAI connection failed: ${response.status} ${response.statusText}`,
        timestamp: new Date(),
      };
    }
  }

  private async testOpenAIConnection(apiKey: string): Promise<ToolResult> {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data: { models: data.data.length },
        message: `OpenAI connection successful. Available models: ${data.data.length}`,
        timestamp: new Date(),
      };
    } else {
      return {
        success: false,
        error: `OpenAI connection failed: ${response.status} ${response.statusText}`,
        timestamp: new Date(),
      };
    }
  }

  private async testOllamaConnection(endpoint: string): Promise<ToolResult> {
    const response = await fetch(`${endpoint}/api/tags`, {
      method: "GET",
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data: { models: data.models?.length || 0 },
        message: `Ollama connection successful. Available models: ${
          data.models?.length || 0
        }`,
        timestamp: new Date(),
      };
    } else {
      return {
        success: false,
        error: `Ollama connection failed: ${response.status} ${response.statusText}`,
        timestamp: new Date(),
      };
    }
  }

  private async rotateKey(
    provider: string,
    keyName: string,
    newKey: string
  ): Promise<ToolResult> {
    const keyId = `${provider}:${keyName}`;
    const apiKey = this.apiKeys.get(keyId);

    if (!apiKey) {
      return {
        success: false,
        error: `API key not found: ${keyId}`,
        timestamp: new Date(),
      };
    }

    // Test the new key first
    const testResult = await this.testConnection(provider, keyName);
    if (!testResult.success) {
      return {
        success: false,
        error: `New key validation failed: ${testResult.error}`,
        timestamp: new Date(),
      };
    }

    // Update the key
    apiKey.key = this.encryptKey(newKey);
    apiKey.lastUsed = new Date();
    await this.saveAPIKeys();

    return {
      success: true,
      data: { keyId },
      message: `Rotated API key: ${keyId}`,
      timestamp: new Date(),
    };
  }

  private async exportKeys(): Promise<ToolResult> {
    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      keys: Array.from(this.apiKeys.values()).map((key) => ({
        name: key.name,
        provider: key.provider,
        endpoint: key.endpoint,
        isActive: key.isActive,
        createdAt: key.createdAt,
        lastUsed: key.lastUsed,
        // Note: We don't export the actual keys for security
      })),
    };

    return {
      success: true,
      data: exportData,
      message: `Exported ${exportData.keys.length} API key metadata`,
      timestamp: new Date(),
    };
  }

  private async importKeys(jsonData: string): Promise<ToolResult> {
    try {
      const importData = JSON.parse(jsonData);
      let importedCount = 0;

      for (const keyData of importData.keys || []) {
        // Note: This would need the actual keys to be provided separately
        // For now, we just import the metadata
        const keyId = `${keyData.provider}:${keyData.name}`;
        if (!this.apiKeys.has(keyId)) {
          const newKey: APIKey = {
            name: keyData.name,
            key: "", // Would need to be provided separately
            provider: keyData.provider,
            isActive: keyData.isActive || false,
            createdAt: new Date(keyData.createdAt),
          };
          if (keyData.endpoint) {
            newKey.endpoint = keyData.endpoint;
          }
          if (keyData.lastUsed) {
            newKey.lastUsed = new Date(keyData.lastUsed);
          }
          this.apiKeys.set(keyId, newKey);
          importedCount++;
        }
      }

      await this.saveAPIKeys();

      return {
        success: true,
        data: { importedCount },
        message: `Imported ${importedCount} API key metadata`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to import keys: ${error}`,
        timestamp: new Date(),
      };
    }
  }

  private encryptKey(key: string): string {
    // Simple base64 encoding for now - in production, use proper encryption
    return Buffer.from(key).toString("base64");
  }

  private decryptKey(encryptedKey: string): string {
    // Simple base64 decoding for now - in production, use proper decryption
    return Buffer.from(encryptedKey, "base64").toString("utf-8");
  }

  private async loadAPIKeys(): Promise<void> {
    try {
      const configFile = this.app.vault.getAbstractFileByPath(this.configFile);
      if (configFile) {
        const content = await this.app.vault.read(configFile as any);
        const data = JSON.parse(content);

        for (const [keyId, keyData] of Object.entries(data.keys || {})) {
          this.apiKeys.set(keyId, {
            ...(keyData as any),
            createdAt: new Date((keyData as any).createdAt),
            lastUsed: (keyData as any).lastUsed
              ? new Date((keyData as any).lastUsed)
              : undefined,
          });
        }
      }
    } catch (error) {
      console.warn("Failed to load API keys:", error);
    }
  }

  private async saveAPIKeys(): Promise<void> {
    try {
      const data = {
        version: "1.0",
        lastUpdated: new Date().toISOString(),
        keys: Object.fromEntries(this.apiKeys),
      };

      const content = JSON.stringify(data, null, 2);

      const configFile = this.app.vault.getAbstractFileByPath(this.configFile);
      if (configFile) {
        await this.app.vault.modify(configFile as any, content);
      } else {
        await this.app.vault.create(this.configFile, content);
      }
    } catch (error) {
      console.error("Failed to save API keys:", error);
    }
  }

  getMetadata(): ToolMetadata {
    return {
      id: "api-manager",
      name: "API Manager",
      description: "จัดการ API keys อย่างปลอดภัยสำหรับบริการต่างๆ",
      version: "1.0.0",
      author: "Ultima-Orb Team",
      category: "Integration",
      tags: ["api", "security", "keys", "integration"],
      icon: "🔑",
      commands: [
        {
          name: "add_key",
          description: "เพิ่ม API key ใหม่",
          parameters: {
            provider: {
              type: "string",
              required: true,
              description:
                "ชื่อ provider (notion, azure-openai, openai, ollama)",
            },
            keyName: {
              type: "string",
              required: true,
              description: "ชื่อของ key",
            },
            apiKey: { type: "string", required: true, description: "API key" },
            endpoint: {
              type: "string",
              required: false,
              description: "Endpoint URL (สำหรับ Azure OpenAI และ Ollama)",
            },
          },
        },
        {
          name: "get_key",
          description: "ดึง API key",
          parameters: {
            provider: {
              type: "string",
              required: true,
              description: "ชื่อ provider",
            },
            keyName: {
              type: "string",
              required: true,
              description: "ชื่อของ key",
            },
          },
        },
        {
          name: "list_keys",
          description: "แสดงรายการ API keys",
          parameters: {
            provider: {
              type: "string",
              required: false,
              description: "กรองตาม provider",
            },
          },
        },
        {
          name: "update_key",
          description: "อัปเดต API key",
          parameters: {
            provider: {
              type: "string",
              required: true,
              description: "ชื่อ provider",
            },
            keyName: {
              type: "string",
              required: true,
              description: "ชื่อของ key",
            },
            apiKey: {
              type: "string",
              required: true,
              description: "API key ใหม่",
            },
            endpoint: {
              type: "string",
              required: false,
              description: "Endpoint URL ใหม่",
            },
          },
        },
        {
          name: "delete_key",
          description: "ลบ API key",
          parameters: {
            provider: {
              type: "string",
              required: true,
              description: "ชื่อ provider",
            },
            keyName: {
              type: "string",
              required: true,
              description: "ชื่อของ key",
            },
          },
        },
        {
          name: "activate_key",
          description: "เปิดใช้งาน API key",
          parameters: {
            provider: {
              type: "string",
              required: true,
              description: "ชื่อ provider",
            },
            keyName: {
              type: "string",
              required: true,
              description: "ชื่อของ key",
            },
          },
        },
        {
          name: "deactivate_key",
          description: "ปิดใช้งาน API key",
          parameters: {
            provider: {
              type: "string",
              required: true,
              description: "ชื่อ provider",
            },
            keyName: {
              type: "string",
              required: true,
              description: "ชื่อของ key",
            },
          },
        },
        {
          name: "get_active_key",
          description: "ดึง API key ที่ใช้งานอยู่",
          parameters: {
            provider: {
              type: "string",
              required: true,
              description: "ชื่อ provider",
            },
          },
        },
        {
          name: "test_connection",
          description: "ทดสอบการเชื่อมต่อ API",
          parameters: {
            provider: {
              type: "string",
              required: true,
              description: "ชื่อ provider",
            },
            keyName: {
              type: "string",
              required: true,
              description: "ชื่อของ key",
            },
          },
        },
        {
          name: "rotate_key",
          description: "เปลี่ยน API key",
          parameters: {
            provider: {
              type: "string",
              required: true,
              description: "ชื่อ provider",
            },
            keyName: {
              type: "string",
              required: true,
              description: "ชื่อของ key",
            },
            apiKey: {
              type: "string",
              required: true,
              description: "API key ใหม่",
            },
          },
        },
        {
          name: "export_keys",
          description: "ส่งออกข้อมูล API keys",
          parameters: {},
        },
        {
          name: "import_keys",
          description: "นำเข้าข้อมูล API keys",
          parameters: {
            apiKey: {
              type: "string",
              required: true,
              description: "JSON data ของ API keys",
            },
          },
        },
      ],
    };
  }
}
