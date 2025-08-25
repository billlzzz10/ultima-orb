import { ToolBase, ToolMetadata, ToolResult } from "../core/tools/ToolBase";
import { App } from "obsidian";
import { Notice } from "obsidian";

/**
 * 🔗 Webhook & Integration Hub Tool - จัดการ webhooks และ integrations
 */
export class WebhookIntegrationTool extends ToolBase {
  private app: App;
  private webhooks: Map<string, WebhookConfig> = new Map();
  private integrations: Map<string, IntegrationConfig> = new Map();
  private eventListeners: Map<string, EventListener[]> = new Map();

  constructor(app: App) {
    super({
      id: "webhook-integration",
      name: "Webhook & Integration Hub",
      description: "จัดการ webhooks และ integrations กับบริการภายนอก",
      category: "Integration",
      icon: "🔗",
      version: "1.0.0",
      author: "Ultima-Orb Team",
      tags: ["webhook", "integration", "notion", "airtable", "clickup", "sync"],
    });
    this.app = app;
    this.initializeIntegrations();
  }

  /**
   * 🔧 เริ่มต้น integrations พื้นฐาน
   */
  private async initializeIntegrations(): Promise<void> {
    // Notion Integration
    this.integrations.set("notion", {
      name: "Notion",
      type: "database",
      apiKey:
        "patSAFehqyaDt50Lt.9323a998b3b0babe891fb0c0af5bbbc76e8ec4d0da33ef8b212745c8c3efc0bf",
      webhookUrl: "",
      isActive: true,
      config: {
        databaseId: "",
        syncInterval: 300000, // 5 minutes
        autoSync: true,
      },
    });

    // Airtable Integration
    this.integrations.set("airtable", {
      name: "Airtable",
      type: "database",
      apiKey: "",
      webhookUrl: "",
      isActive: false,
      config: {
        baseId: "",
        tableName: "",
        syncInterval: 600000, // 10 minutes
        autoSync: false,
      },
    });

    // ClickUp Integration
    this.integrations.set("clickup", {
      name: "ClickUp",
      type: "project-management",
      apiKey: "",
      webhookUrl: "",
      isActive: false,
      config: {
        workspaceId: "",
        projectId: "",
        syncInterval: 300000, // 5 minutes
        autoSync: false,
      },
    });

    console.log(
      "Webhook Integration Tool initialized with integrations:",
      Array.from(this.integrations.keys())
    );
  }

  /**
   * 🎯 Execute tool
   */
  async execute(params: {
    action: string;
    integration?: string;
    webhookUrl?: string;
    event?: string;
    data?: any;
    config?: any;
  }): Promise<ToolResult> {
    try {
      const { action, integration, webhookUrl, event, data, config } = params;

      switch (action) {
        case "registerWebhook":
          return await this.registerWebhook(integration!, webhookUrl!, event!);

        case "unregisterWebhook":
          return await this.unregisterWebhook(integration!);

        case "triggerWebhook":
          return await this.triggerWebhook(integration!, event!, data);

        case "syncIntegration":
          return await this.syncIntegration(integration!);

        case "testIntegration":
          return await this.testIntegration(integration!);

        case "updateIntegrationConfig":
          return await this.updateIntegrationConfig(integration!, config);

        case "getIntegrationStatus":
          return await this.getIntegrationStatus(integration!);

        case "listIntegrations":
          return await this.listIntegrations();

        case "listWebhooks":
          return await this.listWebhooks();

        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to execute webhook integration action",
        timestamp: new Date(),
      };
    }
  }

  /**
   * 📝 ลงทะเบียน webhook
   */
  private async registerWebhook(
    integration: string,
    webhookUrl: string,
    event: string
  ): Promise<ToolResult> {
    try {
      const integrationConfig = this.integrations.get(integration);
      if (!integrationConfig) {
        throw new Error(`Integration '${integration}' not found`);
      }

      const webhookConfig: WebhookConfig = {
        integration,
        url: webhookUrl,
        event,
        isActive: true,
        lastTriggered: null,
        triggerCount: 0,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Ultima-Orb/1.0.0",
        },
      };

      this.webhooks.set(integration, webhookConfig);
      integrationConfig.webhookUrl = webhookUrl;

      // ลงทะเบียน event listener
      this.registerEventListener(integration, event);

      return {
        success: true,
        data: webhookConfig,
        message: `Webhook registered for ${integration} integration`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to register webhook",
        timestamp: new Date(),
      };
    }
  }

  /**
   * 🗑️ ยกเลิกการลงทะเบียน webhook
   */
  private async unregisterWebhook(integration: string): Promise<ToolResult> {
    try {
      const webhook = this.webhooks.get(integration);
      if (!webhook) {
        throw new Error(`Webhook for integration '${integration}' not found`);
      }

      this.webhooks.delete(integration);

      const integrationConfig = this.integrations.get(integration);
      if (integrationConfig) {
        integrationConfig.webhookUrl = "";
      }

      // ลบ event listener
      this.removeEventListener(integration);

      return {
        success: true,
        data: { integration },
        message: `Webhook unregistered for ${integration} integration`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to unregister webhook",
        timestamp: new Date(),
      };
    }
  }

  /**
   * 🚀 เรียกใช้ webhook
   */
  private async triggerWebhook(
    integration: string,
    event: string,
    data?: any
  ): Promise<ToolResult> {
    try {
      const webhook = this.webhooks.get(integration);
      if (!webhook || !webhook.isActive) {
        throw new Error(
          `Active webhook for integration '${integration}' not found`
        );
      }

      const payload = {
        event,
        integration,
        timestamp: new Date().toISOString(),
        data: data || {},
        source: "ultima-orb",
      };

      const response = await fetch(webhook.url, {
        method: "POST",
        headers: webhook.headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Webhook request failed: ${response.status} ${response.statusText}`
        );
      }

      // อัปเดตสถิติ
      webhook.lastTriggered = new Date();
      webhook.triggerCount++;

      return {
        success: true,
        data: {
          response: await response.text(),
          status: response.status,
          triggerCount: webhook.triggerCount,
        },
        message: `Webhook triggered successfully for ${integration}`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to trigger webhook",
        timestamp: new Date(),
      };
    }
  }

  /**
   * 🔄 ซิงค์ข้อมูล integration
   */
  private async syncIntegration(integration: string): Promise<ToolResult> {
    try {
      const integrationConfig = this.integrations.get(integration);
      if (!integrationConfig) {
        throw new Error(`Integration '${integration}' not found`);
      }

      if (!integrationConfig.isActive) {
        throw new Error(`Integration '${integration}' is not active`);
      }

      let syncResult: any;

      switch (integration) {
        case "notion":
          syncResult = await this.syncNotion(integrationConfig);
          break;

        case "airtable":
          syncResult = await this.syncAirtable(integrationConfig);
          break;

        case "clickup":
          syncResult = await this.syncClickUp(integrationConfig);
          break;

        default:
          throw new Error(
            `Sync not implemented for integration '${integration}'`
          );
      }

      // เรียกใช้ webhook ถ้ามี
      if (integrationConfig.webhookUrl) {
        await this.triggerWebhook(integration, "sync_completed", syncResult);
      }

      return {
        success: true,
        data: syncResult,
        message: `Integration ${integration} synced successfully`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to sync integration",
        timestamp: new Date(),
      };
    }
  }

  /**
   * 🔄 ซิงค์ Notion
   */
  private async syncNotion(config: IntegrationConfig): Promise<any> {
    // จำลองการซิงค์ Notion
    const mockData = {
      databases: [
        { id: "db1", title: "Projects", lastEdited: new Date().toISOString() },
        { id: "db2", title: "Tasks", lastEdited: new Date().toISOString() },
      ],
      pages: [
        { id: "page1", title: "Project Alpha", status: "In Progress" },
        { id: "page2", title: "Project Beta", status: "Completed" },
      ],
    };

    return {
      type: "notion",
      timestamp: new Date().toISOString(),
      data: mockData,
      recordCount: mockData.databases.length + mockData.pages.length,
    };
  }

  /**
   * 🔄 ซิงค์ Airtable
   */
  private async syncAirtable(config: IntegrationConfig): Promise<any> {
    // จำลองการซิงค์ Airtable
    const mockData = {
      tables: [
        { id: "tbl1", name: "Projects", recordCount: 25 },
        { id: "tbl2", name: "Tasks", recordCount: 150 },
      ],
      records: [
        { id: "rec1", fields: { Name: "Project A", Status: "Active" } },
        { id: "rec2", fields: { Name: "Project B", Status: "Completed" } },
      ],
    };

    return {
      type: "airtable",
      timestamp: new Date().toISOString(),
      data: mockData,
      recordCount: mockData.records.length,
    };
  }

  /**
   * 🔄 ซิงค์ ClickUp
   */
  private async syncClickUp(config: IntegrationConfig): Promise<any> {
    // จำลองการซิงค์ ClickUp
    const mockData = {
      spaces: [
        { id: "space1", name: "Development", taskCount: 45 },
        { id: "space2", name: "Design", taskCount: 23 },
      ],
      tasks: [
        { id: "task1", name: "Implement Feature X", status: "In Progress" },
        { id: "task2", name: "Design UI", status: "Completed" },
      ],
    };

    return {
      type: "clickup",
      timestamp: new Date().toISOString(),
      data: mockData,
      recordCount: mockData.tasks.length,
    };
  }

  /**
   * 🧪 ทดสอบ integration
   */
  private async testIntegration(integration: string): Promise<ToolResult> {
    try {
      const integrationConfig = this.integrations.get(integration);
      if (!integrationConfig) {
        throw new Error(`Integration '${integration}' not found`);
      }

      // ทดสอบการเชื่อมต่อ
      let testResult: any;

      switch (integration) {
        case "notion":
          testResult = await this.testNotionConnection(integrationConfig);
          break;

        case "airtable":
          testResult = await this.testAirtableConnection(integrationConfig);
          break;

        case "clickup":
          testResult = await this.testClickUpConnection(integrationConfig);
          break;

        default:
          throw new Error(
            `Test not implemented for integration '${integration}'`
          );
      }

      return {
        success: true,
        data: testResult,
        message: `Integration ${integration} test completed`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to test integration",
        timestamp: new Date(),
      };
    }
  }

  /**
   * 🧪 ทดสอบการเชื่อมต่อ Notion
   */
  private async testNotionConnection(config: IntegrationConfig): Promise<any> {
    // จำลองการทดสอบ Notion
    return {
      status: "connected",
      apiKey: config.apiKey ? "configured" : "missing",
      permissions: ["read", "write"],
      rateLimit: {
        remaining: 1000,
        reset: new Date(Date.now() + 3600000).toISOString(),
      },
    };
  }

  /**
   * 🧪 ทดสอบการเชื่อมต่อ Airtable
   */
  private async testAirtableConnection(
    config: IntegrationConfig
  ): Promise<any> {
    // จำลองการทดสอบ Airtable
    return {
      status: config.apiKey ? "connected" : "not_configured",
      apiKey: config.apiKey ? "configured" : "missing",
      permissions: ["read", "write"],
      rateLimit: {
        remaining: 500,
        reset: new Date(Date.now() + 1800000).toISOString(),
      },
    };
  }

  /**
   * 🧪 ทดสอบการเชื่อมต่อ ClickUp
   */
  private async testClickUpConnection(config: IntegrationConfig): Promise<any> {
    // จำลองการทดสอบ ClickUp
    return {
      status: config.apiKey ? "connected" : "not_configured",
      apiKey: config.apiKey ? "configured" : "missing",
      permissions: ["read", "write"],
      rateLimit: {
        remaining: 2000,
        reset: new Date(Date.now() + 7200000).toISOString(),
      },
    };
  }

  /**
   * ⚙️ อัปเดตการตั้งค่า integration
   */
  private async updateIntegrationConfig(
    integration: string,
    config: any
  ): Promise<ToolResult> {
    try {
      const integrationConfig = this.integrations.get(integration);
      if (!integrationConfig) {
        throw new Error(`Integration '${integration}' not found`);
      }

      // อัปเดตการตั้งค่า
      Object.assign(integrationConfig.config, config);

      return {
        success: true,
        data: integrationConfig,
        message: `Integration ${integration} configuration updated`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to update integration configuration",
        timestamp: new Date(),
      };
    }
  }

  /**
   * 📊 รับสถานะ integration
   */
  private async getIntegrationStatus(integration: string): Promise<ToolResult> {
    try {
      const integrationConfig = this.integrations.get(integration);
      if (!integrationConfig) {
        throw new Error(`Integration '${integration}' not found`);
      }

      const webhook = this.webhooks.get(integration);
      const status = {
        name: integrationConfig.name,
        type: integrationConfig.type,
        isActive: integrationConfig.isActive,
        isConfigured: !!integrationConfig.apiKey,
        hasWebhook: !!webhook,
        webhookStatus: webhook
          ? {
              isActive: webhook.isActive,
              lastTriggered: webhook.lastTriggered,
              triggerCount: webhook.triggerCount,
            }
          : null,
        config: integrationConfig.config,
      };

      return {
        success: true,
        data: status,
        message: `Integration ${integration} status retrieved`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to get integration status",
        timestamp: new Date(),
      };
    }
  }

  /**
   * 📋 รายการ integrations ทั้งหมด
   */
  private async listIntegrations(): Promise<ToolResult> {
    try {
      const integrations = Array.from(this.integrations.entries()).map(
        ([key, config]) => ({
          key,
          name: config.name,
          type: config.type,
          isActive: config.isActive,
          isConfigured: !!config.apiKey,
          hasWebhook: !!this.webhooks.get(key),
        })
      );

      return {
        success: true,
        data: integrations,
        message: `Found ${integrations.length} integrations`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to list integrations",
        timestamp: new Date(),
      };
    }
  }

  /**
   * 📋 รายการ webhooks ทั้งหมด
   */
  private async listWebhooks(): Promise<ToolResult> {
    try {
      const webhooks = Array.from(this.webhooks.entries()).map(
        ([integration, config]) => ({
          integration,
          url: config.url,
          event: config.event,
          isActive: config.isActive,
          lastTriggered: config.lastTriggered,
          triggerCount: config.triggerCount,
        })
      );

      return {
        success: true,
        data: webhooks,
        message: `Found ${webhooks.length} webhooks`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        message: "Failed to list webhooks",
      };
    }
  }

  /**
   * 📝 ลงทะเบียน event listener
   */
  private registerEventListener(integration: string, event: string): void {
    const listener = (data: any) => {
      this.triggerWebhook(integration, event, data).catch((error) => {
        console.error(`Failed to trigger webhook for ${integration}:`, error);
      });
    };

    const listeners = this.eventListeners.get(integration) || [];
    listeners.push(listener);
    this.eventListeners.set(integration, listeners);
  }

  /**
   * 🗑️ ลบ event listener
   */
  private removeEventListener(integration: string): void {
    this.eventListeners.delete(integration);
  }

  /**
   * 📝 รับ metadata ของ tool
   */
  getMetadata(): ToolMetadata {
    return {
      name: "Webhook & Integration Hub",
      description: "จัดการ webhooks และ integrations กับบริการภายนอก",
      version: "1.0.0",
      author: "Ultima-Orb Team",
      category: "Integration",
      tags: ["webhook", "integration", "notion", "airtable", "clickup", "sync"],
      icon: "🔗",
      commands: [
        {
          name: "registerWebhook",
          description: "ลงทะเบียน webhook สำหรับ integration",
          parameters: {
            integration: {
              type: "string",
              required: true,
              description: "ชื่อ integration",
            },
            webhookUrl: {
              type: "string",
              required: true,
              description: "URL ของ webhook",
            },
            event: {
              type: "string",
              required: true,
              description: "ชื่อ event",
            },
          },
        },
        {
          name: "unregisterWebhook",
          description: "ยกเลิกการลงทะเบียน webhook",
          parameters: {
            integration: {
              type: "string",
              required: true,
              description: "ชื่อ integration",
            },
          },
        },
        {
          name: "triggerWebhook",
          description: "เรียกใช้ webhook",
          parameters: {
            integration: {
              type: "string",
              required: true,
              description: "ชื่อ integration",
            },
            event: {
              type: "string",
              required: true,
              description: "ชื่อ event",
            },
            data: {
              type: "object",
              required: false,
              description: "ข้อมูลที่จะส่ง",
            },
          },
        },
        {
          name: "syncIntegration",
          description: "ซิงค์ข้อมูล integration",
          parameters: {
            integration: {
              type: "string",
              required: true,
              description: "ชื่อ integration",
            },
          },
        },
        {
          name: "testIntegration",
          description: "ทดสอบ integration",
          parameters: {
            integration: {
              type: "string",
              required: true,
              description: "ชื่อ integration",
            },
          },
        },
        {
          name: "updateIntegrationConfig",
          description: "อัปเดตการตั้งค่า integration",
          parameters: {
            integration: {
              type: "string",
              required: true,
              description: "ชื่อ integration",
            },
            config: {
              type: "object",
              required: true,
              description: "การตั้งค่าใหม่",
            },
          },
        },
        {
          name: "getIntegrationStatus",
          description: "รับสถานะ integration",
          parameters: {
            integration: {
              type: "string",
              required: true,
              description: "ชื่อ integration",
            },
          },
        },
        {
          name: "listIntegrations",
          description: "รายการ integrations ทั้งหมด",
          parameters: {},
        },
        {
          name: "listWebhooks",
          description: "รายการ webhooks ทั้งหมด",
          parameters: {},
        },
      ],
    };
  }
}

/**
 * 📋 Types สำหรับ Webhook & Integration
 */
interface WebhookConfig {
  integration: string;
  url: string;
  event: string;
  isActive: boolean;
  lastTriggered: Date | null;
  triggerCount: number;
  headers: Record<string, string>;
}

interface IntegrationConfig {
  name: string;
  type: string;
  apiKey: string;
  webhookUrl: string;
  isActive: boolean;
  config: Record<string, any>;
}

interface EventListener {
  (data: any): void;
}
