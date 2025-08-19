import { App, PluginSettingTab, Setting } from "obsidian";
import { UltimaOrbPlugin } from "../UltimaOrbPlugin";
import { MCPManager } from "../core/MCPManager";

export class MCPSettingsTab extends PluginSettingTab {
  plugin: UltimaOrbPlugin;

  constructor(app: App, plugin: UltimaOrbPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Header
    containerEl.createEl("h2", { text: "🔗 MCP Integration Settings" });
    containerEl.createEl("p", {
      text: "Configure Model Context Protocol (MCP) connections for external services",
      cls: "setting-item-description",
    });

    // Connection Type Selection
    this.createConnectionTypeSection(containerEl);

    // Notion MCP Settings
    this.createNotionMCPSection(containerEl);

    // ClickUp MCP Settings
    this.createClickUpMCPSection(containerEl);

    // Airtable MCP Settings
    this.createAirtableMCPSection(containerEl);

    // Test Connections
    this.createTestConnectionsSection(containerEl);
  }

  /**
   * Create connection type selection section
   */
  createConnectionTypeSection(containerEl: HTMLElement): void {
    const section = containerEl.createEl("div", { cls: "setting-item" });
    section.createEl("h3", { text: "🌐 Connection Type" });

    const description = section.createEl("p", {
      text: "Choose the connection type for MCP servers:",
      cls: "setting-item-description",
    });

    // Connection type options
    const connectionTypes = [
      {
        value: "streamable-http",
        name: "Streamable HTTP (Recommended)",
        description: "Best performance, real-time streaming",
      },
      {
        value: "sse",
        name: "SSE (Server-Sent Events)",
        description: "Event-driven communication",
      },
      {
        value: "stdio",
        name: "STDIO (Local Server)",
        description: "Local process communication",
      },
    ];

    connectionTypes.forEach((type) => {
      const setting = new Setting(section)
        .setName(type.name)
        .setDesc(type.description)
        .addToggle((toggle) => {
          const currentType =
            this.plugin.getSettingsManager().getSetting("mcpConnectionType") ||
            "streamable-http";
          toggle.setValue(currentType === type.value);
          toggle.onChange(async (value) => {
            if (value) {
              this.plugin
                .getSettingsManager()
                .setSetting("mcpConnectionType", type.value);
              await this.plugin.saveData(
                this.plugin.getSettingsManager().getSettings()
              );
            }
          });
        });
    });
  }

  /**
   * Create Notion MCP settings section
   */
  createNotionMCPSection(containerEl: HTMLElement): void {
    const section = containerEl.createEl("div", { cls: "setting-item" });
    section.createEl("h3", { text: "📝 Notion MCP" });

    // Notion Token
    new Setting(section)
      .setName("Notion Integration Token")
      .setDesc("Your Notion integration token (starts with secret_)")
      .addText((text) => {
        text
          .setPlaceholder("secret_...")
          .setValue(
            this.plugin.getSettingsManager().getSetting("notionToken") || ""
          )
          .onChange(async (value) => {
            this.plugin.getSettingsManager().setSetting("notionToken", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });

    // Notion MCP URL
    new Setting(section)
      .setName("Notion MCP URL")
      .setDesc("MCP server URL for Notion")
      .addText((text) => {
        const defaultUrl = "https://mcp.notion.com/mcp";
        text
          .setPlaceholder(defaultUrl)
          .setValue(
            this.plugin.getSettingsManager().getSetting("notionMCPUrl") ||
              defaultUrl
          )
          .onChange(async (value) => {
            this.plugin.getSettingsManager().setSetting("notionMCPUrl", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });

    // Test Notion Connection
    new Setting(section)
      .setName("Test Notion MCP Connection")
      .setDesc("Test the connection to Notion MCP server")
      .addButton((button) => {
        button.setButtonText("Test Connection").onClick(async () => {
          button.setButtonText("Testing...");
          button.setDisabled(true);

          try {
            const config = MCPManager.getRecommendedConfigs();
            const mcpManager = new MCPManager(config);
            const result = await mcpManager.initialize();

            if (result.notion) {
              button.setButtonText("✅ Connected");
              button.setCta();
            } else {
              button.setButtonText("❌ Failed");
              button.setWarning();
            }
          } catch (error) {
            button.setButtonText("❌ Error");
            button.setWarning();
          }

          setTimeout(() => {
            button.setButtonText("Test Connection");
            button.setDisabled(false);
          }, 3000);
        });
      });
  }

  /**
   * Create ClickUp MCP settings section
   */
  createClickUpMCPSection(containerEl: HTMLElement): void {
    const section = containerEl.createEl("div", { cls: "setting-item" });
    section.createEl("h3", { text: "📋 ClickUp MCP" });

    // ClickUp API Key
    new Setting(section)
      .setName("ClickUp API Key")
      .setDesc("Your ClickUp API key (starts with pk_)")
      .addText((text) => {
        text
          .setPlaceholder("pk_...")
          .setValue(
            this.plugin.getSettingsManager().getSetting("clickUpApiKey") || ""
          )
          .onChange(async (value) => {
            this.plugin.getSettingsManager().setSetting("clickUpApiKey", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });

    // ClickUp MCP URL
    new Setting(section)
      .setName("ClickUp MCP URL")
      .setDesc("MCP server URL for ClickUp")
      .addText((text) => {
        const defaultUrl = "https://mcp.clickup.com/mcp";
        text
          .setPlaceholder(defaultUrl)
          .setValue(
            this.plugin.getSettingsManager().getSetting("clickUpMCPUrl") ||
              defaultUrl
          )
          .onChange(async (value) => {
            this.plugin.getSettingsManager().setSetting("clickUpMCPUrl", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });

    // Test ClickUp Connection
    new Setting(section)
      .setName("Test ClickUp MCP Connection")
      .setDesc("Test the connection to ClickUp MCP server")
      .addButton((button) => {
        button.setButtonText("Test Connection").onClick(async () => {
          button.setButtonText("Testing...");
          button.setDisabled(true);

          try {
            const config = MCPManager.getRecommendedConfigs();
            const mcpManager = new MCPManager(config);
            const result = await mcpManager.initialize();

            if (result.clickup) {
              button.setButtonText("✅ Connected");
              button.setCta();
            } else {
              button.setButtonText("❌ Failed");
              button.setWarning();
            }
          } catch (error) {
            button.setButtonText("❌ Error");
            button.setWarning();
          }

          setTimeout(() => {
            button.setButtonText("Test Connection");
            button.setDisabled(false);
          }, 3000);
        });
      });
  }

  /**
   * Create Airtable MCP settings section
   */
  createAirtableMCPSection(containerEl: HTMLElement): void {
    const section = containerEl.createEl("div", { cls: "setting-item" });
    section.createEl("h3", { text: "📊 Airtable MCP" });

    // Airtable API Key
    new Setting(section)
      .setName("Airtable API Key")
      .setDesc("Your Airtable API key")
      .addText((text) => {
        text
          .setPlaceholder("key...")
          .setValue(
            this.plugin.getSettingsManager().getSetting("airtableApiKey") || ""
          )
          .onChange(async (value) => {
            this.plugin
              .getSettingsManager()
              .setSetting("airtableApiKey", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });

    // Airtable MCP URL
    new Setting(section)
      .setName("Airtable MCP URL")
      .setDesc("MCP server URL for Airtable")
      .addText((text) => {
        const defaultUrl = "https://mcp.airtable.com/mcp";
        text
          .setPlaceholder(defaultUrl)
          .setValue(
            this.plugin.getSettingsManager().getSetting("airtableMCPUrl") ||
              defaultUrl
          )
          .onChange(async (value) => {
            this.plugin
              .getSettingsManager()
              .setSetting("airtableMCPUrl", value);
            await this.plugin.saveData(
              this.plugin.getSettingsManager().getSettings()
            );
          });
      });

    // Test Airtable Connection
    new Setting(section)
      .setName("Test Airtable MCP Connection")
      .setDesc("Test the connection to Airtable MCP server")
      .addButton((button) => {
        button.setButtonText("Test Connection").onClick(async () => {
          button.setButtonText("Testing...");
          button.setDisabled(true);

          try {
            const config = MCPManager.getRecommendedConfigs();
            const mcpManager = new MCPManager(config);
            const result = await mcpManager.initialize();

            if (result.airtable) {
              button.setButtonText("✅ Connected");
              button.setCta();
            } else {
              button.setButtonText("❌ Failed");
              button.setWarning();
            }
          } catch (error) {
            button.setButtonText("❌ Error");
            button.setWarning();
          }

          setTimeout(() => {
            button.setButtonText("Test Connection");
            button.setDisabled(false);
          }, 3000);
        });
      });
  }

  /**
   * Create test all connections section
   */
  createTestConnectionsSection(containerEl: HTMLElement): void {
    const section = containerEl.createEl("div", { cls: "setting-item" });
    section.createEl("h3", { text: "🧪 Test All Connections" });

    // Test All Connections Button
    new Setting(section)
      .setName("Test All MCP Connections")
      .setDesc("Test connections to all configured MCP servers")
      .addButton((button) => {
        button
          .setButtonText("Test All")
          .setCta()
          .onClick(async () => {
            button.setButtonText("Testing All...");
            button.setDisabled(true);

            try {
              const config = MCPManager.getRecommendedConfigs();
              const mcpManager = new MCPManager(config);
              const results = await mcpManager.testAllConnections();

              const successCount =
                Object.values(results).filter(Boolean).length;
              const totalCount = Object.keys(results).length;

              if (successCount === totalCount) {
                button.setButtonText(
                  `✅ All Connected (${successCount}/${totalCount})`
                );
                button.setCta();
              } else {
                button.setButtonText(
                  `⚠️ Partial (${successCount}/${totalCount})`
                );
                button.setWarning();
              }
            } catch (error) {
              button.setButtonText("❌ Error");
              button.setWarning();
            }

            setTimeout(() => {
              button.setButtonText("Test All");
              button.setDisabled(false);
            }, 5000);
          });
      });

    // Connection Status Display
    const statusSection = section.createEl("div", {
      cls: "mcp-status-section",
    });
    statusSection.createEl("h4", { text: "Connection Status" });

    const statusList = statusSection.createEl("ul", { cls: "mcp-status-list" });
    const services = ["Notion", "ClickUp", "Airtable"];

    services.forEach((service) => {
      const listItem = statusList.createEl("li");
      listItem.createEl("span", { text: `${service}: ` });
      listItem.createEl("span", {
        text: "Disconnected",
        cls: "status-disconnected",
      });
    });
  }
}
