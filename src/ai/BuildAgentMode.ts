import { App, Notice } from "obsidian";
import { AIFeatures } from "./AIFeatures";

/**
 * 🏗️ Build Agent Mode - Create custom AI agents
 */
export class BuildAgentMode {
  private app: App;
  private aiFeatures: AIFeatures;
  private agents: Map<string, CustomAgent> = new Map();
  private templates: Map<string, AgentTemplate> = new Map();

  constructor(app: App, aiFeatures: AIFeatures) {
    this.app = app;
    this.aiFeatures = aiFeatures;
    this.initializeTemplates();
  }

  /**
   * 📋 Initialize Agent Templates
   */
  private initializeTemplates(): void {
    // Code Review Agent Template
    this.createTemplate("code-review-agent", {
      name: "Code Review Agent",
      description: "Specialized agent for code review and analysis",
      category: "Development",
      capabilities: ["code-analysis", "security-check", "performance-review"],
      prompt: `You are a Code Review Agent. Your role is to:
1. Analyze code quality and structure
2. Check for security vulnerabilities
3. Suggest performance improvements
4. Review best practices
5. Generate documentation

Please provide comprehensive code reviews with actionable recommendations.`,
      parameters: [
        {
          name: "language",
          type: "string",
          description: "Programming language",
          default: "TypeScript",
        },
        {
          name: "framework",
          type: "string",
          description: "Framework used",
          default: "",
        },
        {
          name: "strictness",
          type: "number",
          description: "Review strictness (1-10)",
          default: 7,
        },
      ],
    });

    // Content Writer Agent Template
    this.createTemplate("content-writer-agent", {
      name: "Content Writer Agent",
      description: "Agent for creating high-quality content",
      category: "Content",
      capabilities: ["research", "writing", "editing", "seo"],
      prompt: `You are a Content Writer Agent. Your role is to:
1. Research topics thoroughly
2. Create engaging and informative content
3. Optimize for SEO
4. Edit and improve content
5. Generate multiple content formats

Please create high-quality, well-researched content that engages readers.`,
      parameters: [
        {
          name: "tone",
          type: "string",
          description: "Content tone",
          default: "professional",
        },
        {
          name: "length",
          type: "string",
          description: "Content length",
          default: "medium",
        },
        {
          name: "target_audience",
          type: "string",
          description: "Target audience",
          default: "general",
        },
      ],
    });

    // Data Analyst Agent Template
    this.createTemplate("data-analyst-agent", {
      name: "Data Analyst Agent",
      description: "Agent for data analysis and insights",
      category: "Analytics",
      capabilities: ["data-cleaning", "analysis", "visualization", "insights"],
      prompt: `You are a Data Analyst Agent. Your role is to:
1. Clean and prepare data
2. Perform statistical analysis
3. Create visualizations
4. Extract meaningful insights
5. Generate reports

Please provide comprehensive data analysis with clear insights and recommendations.`,
      parameters: [
        {
          name: "analysis_type",
          type: "string",
          description: "Type of analysis",
          default: "exploratory",
        },
        {
          name: "confidence_level",
          type: "number",
          description: "Confidence level (0.9-0.99)",
          default: 0.95,
        },
        {
          name: "visualization_style",
          type: "string",
          description: "Visualization style",
          default: "modern",
        },
      ],
    });

    // Research Agent Template
    this.createTemplate("research-agent", {
      name: "Research Agent",
      description: "Agent for comprehensive research tasks",
      category: "Research",
      capabilities: [
        "information-gathering",
        "fact-checking",
        "synthesis",
        "citation",
      ],
      prompt: `You are a Research Agent. Your role is to:
1. Gather comprehensive information
2. Fact-check and verify sources
3. Synthesize findings
4. Provide citations and references
5. Identify research gaps

Please conduct thorough research with verified sources and clear citations.`,
      parameters: [
        {
          name: "depth",
          type: "string",
          description: "Research depth",
          default: "comprehensive",
        },
        {
          name: "sources",
          type: "number",
          description: "Minimum sources",
          default: 5,
        },
        {
          name: "format",
          type: "string",
          description: "Output format",
          default: "report",
        },
      ],
    });
  }

  /**
   * 📋 Create Agent Template
   */
  createTemplate(id: string, template: AgentTemplate): void {
    this.templates.set(id, template);
    new Notice(`✅ Template created: ${template.name}`);
  }

  /**
   * 🏗️ Build Agent from Template
   */
  buildAgentFromTemplate(templateId: string, config: AgentConfig): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const agentId = `${templateId}_${Date.now()}`;
    const agent: CustomAgent = {
      id: agentId,
      name: config.name || template.name,
      description: config.description || template.description,
      category: template.category,
      capabilities: template.capabilities,
      prompt: config.customPrompt || template.prompt,
      parameters: config.parameters || template.parameters,
      config: config,
      createdAt: new Date(),
      isActive: true,
    };

    this.agents.set(agentId, agent);
    new Notice(`✅ Agent built: ${agent.name}`);
    return agentId;
  }

  /**
   * 🏗️ Build Custom Agent
   */
  buildCustomAgent(config: CustomAgentConfig): string {
    const agentId = `custom_${Date.now()}`;
    const agent: CustomAgent = {
      id: agentId,
      name: config.name,
      description: config.description,
      category: config.category,
      capabilities: config.capabilities,
      prompt: config.prompt,
      parameters: config.parameters || [],
      config: config,
      createdAt: new Date(),
      isActive: true,
    };

    this.agents.set(agentId, agent);
    new Notice(`✅ Custom agent built: ${agent.name}`);
    return agentId;
  }

  /**
   * 🚀 Execute Agent
   */
  async executeAgent(
    agentId: string,
    input: any,
    context: any = {}
  ): Promise<AgentResult> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    if (!agent.isActive) {
      throw new Error(`Agent is inactive: ${agentId}`);
    }

    try {
      // Prepare context with agent parameters
      const agentContext = {
        ...context,
        agent: {
          name: agent.name,
          capabilities: agent.capabilities,
          parameters: agent.parameters,
        },
        input,
        timestamp: new Date().toISOString(),
      };

      // Execute agent with custom prompt
      const result = await this.aiFeatures.chatWithAI(
        `${agent.prompt}\n\nInput: ${JSON.stringify(
          input,
          null,
          2
        )}\n\nContext: ${JSON.stringify(agentContext, null, 2)}`
      );

      return {
        success: true,
        agentId,
        agentName: agent.name,
        result,
        context: agentContext,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        agentId,
        agentName: agent.name,
        error: error as string,
        timestamp: new Date(),
      };
    }
  }

  /**
   * 📝 Update Agent
   */
  updateAgent(agentId: string, updates: Partial<CustomAgent>): boolean {
    const agent = this.agents.get(agentId);
    if (agent) {
      Object.assign(agent, updates);
      new Notice(`📝 Agent updated: ${agentId}`);
      return true;
    }
    return false;
  }

  /**
   * 🗑️ Delete Agent
   */
  deleteAgent(agentId: string): boolean {
    const deleted = this.agents.delete(agentId);
    if (deleted) {
      new Notice(`🗑️ Agent deleted: ${agentId}`);
    }
    return deleted;
  }

  /**
   * 🔄 Toggle Agent Status
   */
  toggleAgent(agentId: string): boolean {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.isActive = !agent.isActive;
      new Notice(
        `${agent.isActive ? "✅" : "❌"} Agent ${
          agent.isActive ? "activated" : "deactivated"
        }: ${agentId}`
      );
      return true;
    }
    return false;
  }

  /**
   * 📋 Get All Agents
   */
  getAllAgents(): CustomAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * 📋 Get Active Agents
   */
  getActiveAgents(): CustomAgent[] {
    return Array.from(this.agents.values()).filter((agent) => agent.isActive);
  }

  /**
   * 📋 Get Agents by Category
   */
  getAgentsByCategory(category: string): CustomAgent[] {
    return Array.from(this.agents.values()).filter(
      (agent) => agent.category === category
    );
  }

  /**
   * 📋 Get All Templates
   */
  getAllTemplates(): AgentTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * 📋 Get Templates by Category
   */
  getTemplatesByCategory(category: string): AgentTemplate[] {
    return Array.from(this.templates.values()).filter(
      (template) => template.category === category
    );
  }

  /**
   * 📤 Export Agent
   */
  exportAgent(agentId: string): string {
    const agent = this.agents.get(agentId);
    if (agent) {
      return JSON.stringify(agent, null, 2);
    }
    throw new Error(`Agent not found: ${agentId}`);
  }

  /**
   * 📥 Import Agent
   */
  importAgent(agentData: string): string {
    try {
      const agent: CustomAgent = JSON.parse(agentData);
      const agentId = agent.id || `imported_${Date.now()}`;
      this.agents.set(agentId, agent);
      new Notice(`📥 Agent imported: ${agent.name}`);
      return agentId;
    } catch (error) {
      throw new Error(`Invalid agent data: ${error}`);
    }
  }

  /**
   * 📊 Get Agent Statistics
   */
  getAgentStats(): AgentStats {
    const totalAgents = this.agents.size;
    const activeAgents = Array.from(this.agents.values()).filter(
      (agent) => agent.isActive
    ).length;
    const totalTemplates = this.templates.size;

    const categories = new Set(
      Array.from(this.agents.values()).map((agent) => agent.category)
    );
    const uniqueCategories = categories.size;

    return {
      total: totalAgents,
      active: activeAgents,
      inactive: totalAgents - activeAgents,
      templates: totalTemplates,
      categories: uniqueCategories,
    };
  }

  /**
   * 🔍 Search Agents
   */
  searchAgents(query: string): CustomAgent[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.agents.values()).filter(
      (agent) =>
        agent.name.toLowerCase().includes(lowercaseQuery) ||
        agent.description.toLowerCase().includes(lowercaseQuery) ||
        agent.category.toLowerCase().includes(lowercaseQuery) ||
        agent.capabilities.some((cap) =>
          cap.toLowerCase().includes(lowercaseQuery)
        )
    );
  }

  /**
   * 🔍 Search Templates
   */
  searchTemplates(query: string): AgentTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.templates.values()).filter(
      (template) =>
        template.name.toLowerCase().includes(lowercaseQuery) ||
        template.description.toLowerCase().includes(lowercaseQuery) ||
        template.category.toLowerCase().includes(lowercaseQuery) ||
        template.capabilities.some((cap) =>
          cap.toLowerCase().includes(lowercaseQuery)
        )
    );
  }
}

/**
 * 🤖 Custom Agent Interface
 */
interface CustomAgent {
  id: string;
  name: string;
  description: string;
  category: string;
  capabilities: string[];
  prompt: string;
  parameters: AgentParameter[];
  config: AgentConfig;
  createdAt: Date;
  isActive: boolean;
}

/**
 * 📋 Agent Template Interface
 */
interface AgentTemplate {
  id?: string;
  name: string;
  description: string;
  category: string;
  capabilities: string[];
  prompt: string;
  parameters: AgentParameter[];
}

/**
 * ⚙️ Agent Parameter Interface
 */
interface AgentParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array";
  description: string;
  default?: any;
  required?: boolean;
}

/**
 * ⚙️ Agent Config Interface
 */
interface AgentConfig {
  name?: string;
  description?: string;
  customPrompt?: string;
  parameters?: AgentParameter[];
  [key: string]: any;
}

/**
 * ⚙️ Custom Agent Config Interface
 */
interface CustomAgentConfig {
  name: string;
  description: string;
  category: string;
  capabilities: string[];
  prompt: string;
  parameters?: AgentParameter[];
}

/**
 * 📊 Agent Result Interface
 */
interface AgentResult {
  success: boolean;
  agentId: string;
  agentName: string;
  result?: string;
  error?: string;
  context?: any;
  timestamp: Date;
}

/**
 * 📈 Agent Stats Interface
 */
interface AgentStats {
  total: number;
  active: number;
  inactive: number;
  templates: number;
  categories: number;
}
