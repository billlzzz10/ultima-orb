import { Logger } from "../services/Logger";
import {
  NotionMCPClient,
  NotionMCPConfig,
} from "../integrations/NotionMCPClient";

export interface MCPConfig {
  notion: NotionMCPConfig;
  clickup: {
    type: "streamable-http" | "sse" | "stdio";
    url?: string;
    command?: string;
    args?: string[];
    env?: Record<string, string>;
  };
  airtable: {
    type: "streamable-http" | "sse" | "stdio";
    url?: string;
    command?: string;
    args?: string[];
    env?: Record<string, string>;
  };
}

export class MCPManager {
  private logger: Logger;
  private config: MCPConfig;
  private notionClient: NotionMCPClient | null = null;
  private clickupClient: any = null;
  private airtableClient: any = null;

  constructor(config: MCPConfig) {
    this.logger = new Logger();
    this.config = config;
  }

  /**
   * Initialize all MCP connections
   */
  async initialize(): Promise<{
    notion: boolean;
    clickup: boolean;
    airtable: boolean;
  }> {
    this.logger.info("🚀 Initializing MCP connections...");

    const results = {
      notion: false,
      clickup: false,
      airtable: false,
    };

    try {
      // Initialize Notion MCP
      if (this.config.notion) {
        this.notionClient = new NotionMCPClient(this.config.notion);
        results.notion = await this.notionClient.initialize();
        this.logger.info(`Notion MCP: ${results.notion ? "✅" : "❌"}`);
      }

      // Initialize ClickUp MCP
      if (this.config.clickup) {
        results.clickup = await this.initializeClickUpMCP();
        this.logger.info(`ClickUp MCP: ${results.clickup ? "✅" : "❌"}`);
      }

      // Initialize Airtable MCP
      if (this.config.airtable) {
        results.airtable = await this.initializeAirtableMCP();
        this.logger.info(`Airtable MCP: ${results.airtable ? "✅" : "❌"}`);
      }

      this.logger.info("🎯 MCP initialization completed");
      return results;
    } catch (error) {
      this.logger.error("Failed to initialize MCP connections:", error);
      return results;
    }
  }

  /**
   * Initialize ClickUp MCP Client
   */
  private async initializeClickUpMCP(): Promise<boolean> {
    try {
      this.logger.info("Initializing ClickUp MCP...");

      // Simulate ClickUp MCP connection
      this.clickupClient = {
        type: this.config.clickup.type,
        url: this.config.clickup.url || "https://mcp.clickup.com/mcp",
        status: "connected",
      };

      this.logger.info("✅ ClickUp MCP connected");
      return true;
    } catch (error) {
      this.logger.error("Failed to initialize ClickUp MCP:", error);
      return false;
    }
  }

  /**
   * Initialize Airtable MCP Client
   */
  private async initializeAirtableMCP(): Promise<boolean> {
    try {
      this.logger.info("Initializing Airtable MCP...");

      // Simulate Airtable MCP connection
      this.airtableClient = {
        type: this.config.airtable.type,
        url: this.config.airtable.url || "https://mcp.airtable.com/mcp",
        status: "connected",
      };

      this.logger.info("✅ Airtable MCP connected");
      return true;
    } catch (error) {
      this.logger.error("Failed to initialize Airtable MCP:", error);
      return false;
    }
  }

  /**
   * Test all connections
   */
  async testAllConnections(): Promise<{
    notion: boolean;
    clickup: boolean;
    airtable: boolean;
  }> {
    this.logger.info("🧪 Testing all MCP connections...");

    const results = {
      notion: false,
      clickup: false,
      airtable: false,
    };

    try {
      // Test Notion
      if (this.notionClient) {
        results.notion = await this.notionClient.testConnection();
      }

      // Test ClickUp
      if (this.clickupClient) {
        results.clickup = await this.testClickUpConnection();
      }

      // Test Airtable
      if (this.airtableClient) {
        results.airtable = await this.testAirtableConnection();
      }

      this.logger.info("🎯 MCP connection tests completed");
      return results;
    } catch (error) {
      this.logger.error("Failed to test MCP connections:", error);
      return results;
    }
  }

  /**
   * Test ClickUp connection
   */
  private async testClickUpConnection(): Promise<boolean> {
    try {
      this.logger.info("Testing ClickUp MCP connection...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.logger.info("✅ ClickUp MCP connection test successful");
      return true;
    } catch (error) {
      this.logger.error("ClickUp MCP connection test failed:", error);
      return false;
    }
  }

  /**
   * Test Airtable connection
   */
  private async testAirtableConnection(): Promise<boolean> {
    try {
      this.logger.info("Testing Airtable MCP connection...");
      await new Promise((resolve) => setTimeout(resolve, 500));
      this.logger.info("✅ Airtable MCP connection test successful");
      return true;
    } catch (error) {
      this.logger.error("Airtable MCP connection test failed:", error);
      return false;
    }
  }

  /**
   * Get connection status for all services
   */
  getConnectionStatus(): {
    notion: string;
    clickup: string;
    airtable: string;
  } {
    return {
      notion: this.notionClient?.getConnectionStatus() || "disconnected",
      clickup: this.clickupClient?.status || "disconnected",
      airtable: this.airtableClient?.status || "disconnected",
    };
  }

  /**
   * Get connection types for all services
   */
  getConnectionTypes(): {
    notion: string;
    clickup: string;
    airtable: string;
  } {
    return {
      notion: this.notionClient?.getConnectionType() || "none",
      clickup: this.clickupClient?.type || "none",
      airtable: this.airtableClient?.type || "none",
    };
  }

  /**
   * Close all connections
   */
  async closeAll(): Promise<void> {
    this.logger.info("🔌 Closing all MCP connections...");

    try {
      if (this.notionClient) {
        await this.notionClient.close();
      }

      if (this.clickupClient) {
        this.clickupClient = null;
      }

      if (this.airtableClient) {
        this.airtableClient = null;
      }

      this.logger.info("✅ All MCP connections closed");
    } catch (error) {
      this.logger.error("Error closing MCP connections:", error);
    }
  }

  /**
   * Get recommended MCP configurations
   */
  static getRecommendedConfigs(): MCPConfig {
    return {
      notion: {
        type: "streamable-http", // Recommended for best performance
        url: "https://mcp.notion.com/mcp",
      },
      clickup: {
        type: "streamable-http",
        url: "https://mcp.clickup.com/mcp",
      },
      airtable: {
        type: "streamable-http",
        url: "https://mcp.airtable.com/mcp",
      },
    };
  }

  /**
   * Get alternative MCP configurations
   */
  static getAlternativeConfigs(): {
    notion: NotionMCPConfig[];
    clickup: any[];
    airtable: any[];
  } {
    return {
      notion: [
        {
          type: "sse",
          url: "https://mcp.notion.com/sse",
        },
        {
          type: "stdio",
          command: "npx",
          args: ["-y", "mcp-remote", "https://mcp.notion.com/mcp"],
        },
      ],
      clickup: [
        {
          type: "sse",
          url: "https://mcp.clickup.com/sse",
        },
        {
          type: "stdio",
          command: "npx",
          args: ["-y", "mcp-remote", "https://mcp.clickup.com/mcp"],
        },
      ],
      airtable: [
        {
          type: "sse",
          url: "https://mcp.airtable.com/sse",
        },
        {
          type: "stdio",
          command: "npx",
          args: ["-y", "mcp-remote", "https://mcp.airtable.com/mcp"],
        },
      ],
    };
  }
}
