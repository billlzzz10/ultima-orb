import { App, PluginSettingTab, Setting } from "obsidian";
import { UltimaOrbPlugin } from "../UltimaOrbPlugin";

/**
 * 📊 Settings Dashboard - แบบ Cursor
 */
export class SettingsDashboard extends PluginSettingTab {
  private plugin: UltimaOrbPlugin;

  constructor(app: App, plugin: UltimaOrbPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Header
    containerEl.createEl("h2", { text: "🔮 Ultima-Orb Settings Dashboard" });
    containerEl.createEl("p", { text: "The Ultimate Hybrid AI Command Center" });

    // Dashboard Grid
    const dashboardGrid = containerEl.createEl("div", { cls: "dashboard-grid" });

    // ===== AI STATUS SECTION =====
    this.createAISection(dashboardGrid);

    // ===== MCP INTEGRATIONS SECTION =====
    this.createMCPSection(dashboardGrid);

    // ===== KNOWLEDGE BASE SECTION =====
    this.createKnowledgeSection(dashboardGrid);

    // ===== AGENT MODES SECTION =====
    this.createAgentSection(dashboardGrid);

    // ===== CUSTOM COMMANDS SECTION =====
    this.createCustomCommandsSection(dashboardGrid);

    // ===== STATISTICS SECTION =====
    this.createStatsSection(dashboardGrid);
  }

  /**
   * 🤖 AI Status Section
   */
  private createAISection(container: HTMLElement): void {
    const section = container.createEl("div", { cls: "dashboard-section ai-section" });
    
    section.createEl("h3", { text: "🤖 AI Status" });

    // AI Providers Status
    const providersGrid = section.createEl("div", { cls: "providers-grid" });
    
    const providers = [
      { name: "OpenAI", status: "✅ Connected", icon: "🔵" },
      { name: "Claude", status: "✅ Connected", icon: "🟠" },
      { name: "Gemini", status: "⚠️ Limited", icon: "🟡" },
      { name: "Ollama", status: "❌ Disconnected", icon: "🟣" }
    ];

    providers.forEach(provider => {
      const providerCard = providersGrid.createEl("div", { cls: "provider-card" });
      providerCard.createEl("div", { text: provider.icon, cls: "provider-icon" });
      providerCard.createEl("div", { text: provider.name, cls: "provider-name" });
      providerCard.createEl("div", { text: provider.status, cls: "provider-status" });
    });

    // Model Selection
    const modelSection = section.createEl("div", { cls: "model-section" });
    modelSection.createEl("h4", { text: "Active Models" });

    new Setting(modelSection)
      .setName("Primary Model")
      .setDesc("Main AI model for general tasks")
      .addDropdown(dropdown => {
        dropdown
          .addOption("gpt-4", "GPT-4")
          .addOption("gpt-3.5-turbo", "GPT-3.5 Turbo")
          .addOption("claude-3", "Claude 3")
          .addOption("gemini-pro", "Gemini Pro")
          .setValue("gpt-4");
      });

    new Setting(modelSection)
      .setName("Code Model")
      .setDesc("Specialized model for coding tasks")
      .addDropdown(dropdown => {
        dropdown
          .addOption("gpt-4", "GPT-4")
          .addOption("claude-3-sonnet", "Claude 3 Sonnet")
          .addOption("gemini-pro", "Gemini Pro")
          .setValue("gpt-4");
      });
  }

  /**
   * 🔗 MCP Integrations Section
   */
  private createMCPSection(container: HTMLElement): void {
    const section = container.createEl("div", { cls: "dashboard-section mcp-section" });
    
    section.createEl("h3", { text: "🔗 MCP Integrations" });

    // Integration Cards
    const integrations = [
      {
        name: "Notion",
        status: "✅ Connected",
        icon: "📝",
        description: "Sync notes and databases",
        config: { url: "https://mcp.notion.com/mcp", type: "Streamable HTTP" }
      },
      {
        name: "ClickUp",
        status: "⚠️ Limited",
        icon: "📋",
        description: "Task and project management",
        config: { url: "https://mcp.clickup.com/mcp", type: "SSE" }
      },
      {
        name: "Airtable",
        status: "❌ Disconnected",
        icon: "📊",
        description: "Database and spreadsheet sync",
        config: { url: "https://mcp.airtable.com/mcp", type: "STDIO" }
      }
    ];

    integrations.forEach(integration => {
      const card = section.createEl("div", { cls: "integration-card" });
      
      const header = card.createEl("div", { cls: "integration-header" });
      header.createEl("span", { text: integration.icon, cls: "integration-icon" });
      header.createEl("span", { text: integration.name, cls: "integration-name" });
      header.createEl("span", { text: integration.status, cls: "integration-status" });

      card.createEl("p", { text: integration.description, cls: "integration-desc" });

      const config = card.createEl("div", { cls: "integration-config" });
      config.createEl("span", { text: `URL: ${integration.config.url}`, cls: "config-url" });
      config.createEl("span", { text: `Type: ${integration.config.type}`, cls: "config-type" });

      // Action buttons
      const actions = card.createEl("div", { cls: "integration-actions" });
      
      if (integration.status.includes("Connected")) {
        actions.createEl("button", { text: "Sync", cls: "action-btn sync-btn" });
        actions.createEl("button", { text: "Disconnect", cls: "action-btn disconnect-btn" });
      } else {
        actions.createEl("button", { text: "Connect", cls: "action-btn connect-btn" });
        actions.createEl("button", { text: "Configure", cls: "action-btn config-btn" });
      }
    });
  }

  /**
   * 📚 Knowledge Base Section
   */
  private createKnowledgeSection(container: HTMLElement): void {
    const section = container.createEl("div", { cls: "dashboard-section knowledge-section" });
    
    section.createEl("h3", { text: "📚 Knowledge Base" });

    // Knowledge Stats
    const stats = section.createEl("div", { cls: "knowledge-stats" });
    
    const statItems = [
      { label: "Total Documents", value: "1,247", icon: "📄" },
      { label: "Indexed Files", value: "892", icon: "🔍" },
      { label: "Embeddings", value: "45.2K", icon: "🧠" },
      { label: "Last Sync", value: "2 min ago", icon: "🔄" }
    ];

    statItems.forEach(stat => {
      const statCard = stats.createEl("div", { cls: "stat-card" });
      statCard.createEl("div", { text: stat.icon, cls: "stat-icon" });
      statCard.createEl("div", { text: stat.value, cls: "stat-value" });
      statCard.createEl("div", { text: stat.label, cls: "stat-label" });
    });

    // Knowledge Sources
    const sources = section.createEl("div", { cls: "knowledge-sources" });
    sources.createEl("h4", { text: "Knowledge Sources" });

    const sourcesList = [
      { name: "Obsidian Vault", status: "✅ Active", count: "1,156 files" },
      { name: "Notion Workspace", status: "✅ Synced", count: "89 pages" },
      { name: "Web Bookmarks", status: "⚠️ Partial", count: "234 links" },
      { name: "Local Documents", status: "❌ Inactive", count: "0 files" }
    ];

    sourcesList.forEach(source => {
      const sourceItem = sources.createEl("div", { cls: "source-item" });
      sourceItem.createEl("span", { text: source.name, cls: "source-name" });
      sourceItem.createEl("span", { text: source.status, cls: "source-status" });
      sourceItem.createEl("span", { text: source.count, cls: "source-count" });
    });

    // Knowledge Actions
    const actions = section.createEl("div", { cls: "knowledge-actions" });
    actions.createEl("button", { text: "🔍 Rebuild Index", cls: "action-btn rebuild-btn" });
    actions.createEl("button", { text: "📥 Import Files", cls: "action-btn import-btn" });
    actions.createEl("button", { text: "⚙️ Settings", cls: "action-btn settings-btn" });
  }

  /**
   * 🤖 Agent Modes Section
   */
  private createAgentSection(container: HTMLElement): void {
    const section = container.createEl("div", { cls: "dashboard-section agent-section" });
    
    section.createEl("h3", { text: "🤖 Agent Modes" });

    // Agent Flow Mode
    const flowMode = section.createEl("div", { cls: "agent-mode-card" });
    flowMode.createEl("h4", { text: "🔄 Agent Flow Mode" });
    flowMode.createEl("p", { text: "Multi-step automated workflows with AI agents", cls: "mode-description" });

    const flowStats = flowMode.createEl("div", { cls: "mode-stats" });
    flowStats.createEl("div", { text: "Active Flows: 3", cls: "stat-item" });
    flowStats.createEl("div", { text: "Completed: 47", cls: "stat-item" });
    flowStats.createEl("div", { text: "Success Rate: 94%", cls: "stat-item" });

    new Setting(flowMode)
      .setName("Auto-execute Flows")
      .setDesc("Automatically run agent flows when triggered")
      .addToggle(toggle => toggle.setValue(true));

    // Build Agent Mode
    const buildMode = section.createEl("div", { cls: "agent-mode-card" });
    buildMode.createEl("h4", { text: "🏗️ Build Agent Mode" });
    buildMode.createEl("p", { text: "Create custom AI agents for specific tasks", cls: "mode-description" });

    const buildStats = buildMode.createEl("div", { cls: "mode-stats" });
    buildStats.createEl("div", { text: "Custom Agents: 12", cls: "stat-item" });
    buildStats.createEl("div", { text: "Templates: 8", cls: "stat-item" });
    buildStats.createEl("div", { text: "Active: 5", cls: "stat-item" });

    const buildActions = buildMode.createEl("div", { cls: "mode-actions" });
    buildActions.createEl("button", { text: "➕ Create Agent", cls: "action-btn create-btn" });
    buildActions.createEl("button", { text: "📋 Templates", cls: "action-btn templates-btn" });
    buildActions.createEl("button", { text: "📊 Analytics", cls: "action-btn analytics-btn" });
  }

  /**
   * ⚙️ Custom Commands Section
   */
  private createCustomCommandsSection(container: HTMLElement): void {
    const section = container.createEl("div", { cls: "dashboard-section commands-section" });
    
    section.createEl("h3", { text: "⚙️ Custom Commands" });

    // Command Stats
    const commandStats = section.createEl("div", { cls: "command-stats" });
    commandStats.createEl("div", { text: "Total Commands: 24", cls: "stat-item" });
    commandStats.createEl("div", { text: "Custom: 8", cls: "stat-item" });
    commandStats.createEl("div", { text: "Most Used: @search", cls: "stat-item" });

    // Command Categories
    const categories = section.createEl("div", { cls: "command-categories" });
    categories.createEl("h4", { text: "Command Categories" });

    const categoryList = [
      { name: "AI Commands", count: 6, icon: "🤖" },
      { name: "File Operations", count: 4, icon: "📁" },
      { name: "Data Analysis", count: 3, icon: "📊" },
      { name: "Code Generation", count: 5, icon: "💻" },
      { name: "Integration", count: 3, icon: "🔗" },
      { name: "Custom", count: 8, icon: "⚙️" }
    ];

    categoryList.forEach(category => {
      const categoryItem = categories.createEl("div", { cls: "category-item" });
      categoryItem.createEl("span", { text: category.icon, cls: "category-icon" });
      categoryItem.createEl("span", { text: category.name, cls: "category-name" });
      categoryItem.createEl("span", { text: `${category.count} commands`, cls: "category-count" });
    });

    // Command Management
    const management = section.createEl("div", { cls: "command-management" });
    management.createEl("h4", { text: "Command Management" });

    const managementActions = management.createEl("div", { cls: "management-actions" });
    managementActions.createEl("button", { text: "➕ Add Command", cls: "action-btn add-btn" });
    managementActions.createEl("button", { text: "📝 Edit Commands", cls: "action-btn edit-btn" });
    managementActions.createEl("button", { text: "📤 Export", cls: "action-btn export-btn" });
    managementActions.createEl("button", { text: "📥 Import", cls: "action-btn import-btn" });
  }

  /**
   * 📊 Statistics Section
   */
  private createStatsSection(container: HTMLElement): void {
    const section = container.createEl("div", { cls: "dashboard-section stats-section" });
    
    section.createEl("h3", { text: "📊 Usage Statistics" });

    // Usage Stats
    const usageStats = section.createEl("div", { cls: "usage-stats" });
    
    const stats = [
      { label: "Total AI Calls", value: "2,847", trend: "+12%" },
      { label: "Commands Used", value: "1,234", trend: "+8%" },
      { label: "Files Processed", value: "456", trend: "+15%" },
      { label: "Time Saved", value: "23.5h", trend: "+20%" }
    ];

    stats.forEach(stat => {
      const statCard = usageStats.createEl("div", { cls: "usage-stat-card" });
      statCard.createEl("div", { text: stat.value, cls: "stat-value" });
      statCard.createEl("div", { text: stat.label, cls: "stat-label" });
      statCard.createEl("div", { text: stat.trend, cls: "stat-trend" });
    });

    // Recent Activity
    const activity = section.createEl("div", { cls: "recent-activity" });
    activity.createEl("h4", { text: "Recent Activity" });

    const activities = [
      { action: "AI Code Review", time: "2 min ago", status: "✅" },
      { action: "Notion Sync", time: "5 min ago", status: "✅" },
      { action: "Agent Flow Completed", time: "12 min ago", status: "✅" },
      { action: "Knowledge Index Update", time: "1 hour ago", status: "⚠️" }
    ];

    activities.forEach(activityItem => {
      const item = activity.createEl("div", { cls: "activity-item" });
      item.createEl("span", { text: activityItem.status, cls: "activity-status" });
      item.createEl("span", { text: activityItem.action, cls: "activity-action" });
      item.createEl("span", { text: activityItem.time, cls: "activity-time" });
    });

    // Performance Metrics
    const performance = section.createEl("div", { cls: "performance-metrics" });
    performance.createEl("h4", { text: "Performance Metrics" });

    const metrics = [
      { metric: "Response Time", value: "1.2s", status: "Good" },
      { metric: "Memory Usage", value: "45MB", status: "Normal" },
      { metric: "CPU Usage", value: "12%", status: "Low" },
      { metric: "Error Rate", value: "0.3%", status: "Excellent" }
    ];

    metrics.forEach(metric => {
      const metricItem = performance.createEl("div", { cls: "metric-item" });
      metricItem.createEl("span", { text: metric.metric, cls: "metric-name" });
      metricItem.createEl("span", { text: metric.value, cls: "metric-value" });
      metricItem.createEl("span", { text: metric.status, cls: "metric-status" });
    });
  }
}
