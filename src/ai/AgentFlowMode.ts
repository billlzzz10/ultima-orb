import { App, Notice } from "obsidian";
import { AIFeatures } from "./AIFeatures";

/**
 * 🔄 Agent Flow Mode - Multi-step automated workflows
 */
export class AgentFlowMode {
  private app: App;
  private aiFeatures: AIFeatures;
  private flows: Map<string, AgentFlow> = new Map();
  private activeFlows: Map<string, FlowExecution> = new Map();

  constructor(app: App, aiFeatures: AIFeatures) {
    this.app = app;
    this.aiFeatures = aiFeatures;
    this.initializeDefaultFlows();
  }

  /**
   * 🔧 Initialize Default Flows
   */
  private initializeDefaultFlows(): void {
    // Code Review Flow
    this.createFlow("code-review", {
      name: "Code Review Flow",
      description: "Automated code review and analysis",
      steps: [
        {
          id: "analyze",
          name: "Code Analysis",
          description: "Analyze code structure and quality",
          action: async (context: any) => {
            return await this.aiFeatures.analyzeContent(context.code);
          },
        },
        {
          id: "security",
          name: "Security Check",
          description: "Check for security vulnerabilities",
          action: async (context: any) => {
            return await this.aiFeatures.chatWithAI(
              `Security audit for this code: ${context.code}`
            );
          },
        },
        {
          id: "optimize",
          name: "Optimization",
          description: "Suggest performance improvements",
          action: async (context: any) => {
            return await this.aiFeatures.chatWithAI(
              `Optimize this code for performance: ${context.code}`
            );
          },
        },
        {
          id: "document",
          name: "Documentation",
          description: "Generate documentation",
          action: async (context: any) => {
            return await this.aiFeatures.chatWithAI(
              `Generate documentation for: ${context.code}`
            );
          },
        },
      ],
    });

    // Content Creation Flow
    this.createFlow("content-creation", {
      name: "Content Creation Flow",
      description: "Create comprehensive content from outline",
      steps: [
        {
          id: "research",
          name: "Research",
          description: "Gather information and research",
          action: async (context: any) => {
            return await this.aiFeatures.chatWithAI(
              `Research about: ${context.topic}`
            );
          },
        },
        {
          id: "outline",
          name: "Create Outline",
          description: "Generate content outline",
          action: async (context: any) => {
            return await this.aiFeatures.chatWithAI(
              `Create outline for: ${context.topic}`
            );
          },
        },
        {
          id: "write",
          name: "Write Content",
          description: "Write the main content",
          action: async (context: any) => {
            return await this.aiFeatures.chatWithAI(
              `Write content based on outline: ${context.outline}`
            );
          },
        },
        {
          id: "review",
          name: "Review & Edit",
          description: "Review and improve content",
          action: async (context: any) => {
            return await this.aiFeatures.chatWithAI(
              `Review and improve this content: ${context.content}`
            );
          },
        },
      ],
    });

    // Data Analysis Flow
    this.createFlow("data-analysis", {
      name: "Data Analysis Flow",
      description: "Comprehensive data analysis workflow",
      steps: [
        {
          id: "clean",
          name: "Data Cleaning",
          description: "Clean and prepare data",
          action: async (context: any) => {
            return await this.aiFeatures.chatWithAI(
              `Clean this data: ${context.data}`
            );
          },
        },
        {
          id: "explore",
          name: "Exploratory Analysis",
          description: "Initial data exploration",
          action: async (context: any) => {
            return await this.aiFeatures.chatWithAI(
              `Perform exploratory analysis on: ${context.data}`
            );
          },
        },
        {
          id: "visualize",
          name: "Visualization",
          description: "Create data visualizations",
          action: async (context: any) => {
            return await this.aiFeatures.chatWithAI(
              `Create visualizations for: ${context.analysis}`
            );
          },
        },
        {
          id: "insights",
          name: "Generate Insights",
          description: "Extract key insights",
          action: async (context: any) => {
            return await this.aiFeatures.chatWithAI(
              `Extract insights from: ${context.analysis}`
            );
          },
        },
      ],
    });
  }

  /**
   * 📋 Create Flow
   */
  createFlow(id: string, flow: AgentFlow): void {
    this.flows.set(id, flow);
    new Notice(`✅ Flow created: ${flow.name}`);
  }

  /**
   * 🚀 Execute Flow
   */
  async executeFlow(flowId: string, context: any = {}): Promise<FlowResult> {
    const flow = this.flows.get(flowId);
    if (!flow) {
      throw new Error(`Flow not found: ${flowId}`);
    }

    const executionId = `${flowId}_${Date.now()}`;
    const execution: FlowExecution = {
      id: executionId,
      flowId,
      status: "running",
      startTime: new Date(),
      steps: [],
      context: { ...context },
    };

    this.activeFlows.set(executionId, execution);
    new Notice(`🔄 Starting flow: ${flow.name}`);

    try {
      let currentContext = { ...context };

      for (const step of flow.steps) {
        // Update step status
        const stepExecution = {
          id: step.id,
          name: step.name,
          status: "running",
          startTime: new Date(),
          result: null,
          error: null,
        };

        execution.steps.push(stepExecution);

        try {
          // Execute step
          const result = await step.action(currentContext);
          stepExecution.result = result;
          stepExecution.status = "completed";
          stepExecution.endTime = new Date();

          // Update context with result
          currentContext[step.id] = result;

          new Notice(`✅ Step completed: ${step.name}`);
        } catch (error) {
          stepExecution.status = "failed";
          stepExecution.error = error as string;
          stepExecution.endTime = new Date();

          new Notice(`❌ Step failed: ${step.name}`);
          throw error;
        }
      }

      // Flow completed successfully
      execution.status = "completed";
      execution.endTime = new Date();
      execution.result = currentContext;

      new Notice(`✅ Flow completed: ${flow.name}`);
      return {
        success: true,
        execution,
        result: currentContext,
      };
    } catch (error) {
      execution.status = "failed";
      execution.endTime = new Date();
      execution.error = error as string;

      new Notice(`❌ Flow failed: ${flow.name}`);
      return {
        success: false,
        execution,
        error: error as string,
      };
    } finally {
      this.activeFlows.delete(executionId);
    }
  }

  /**
   * 🛑 Stop Flow
   */
  stopFlow(executionId: string): boolean {
    const execution = this.activeFlows.get(executionId);
    if (execution) {
      execution.status = "stopped";
      execution.endTime = new Date();
      this.activeFlows.delete(executionId);
      new Notice(`🛑 Flow stopped: ${execution.flowId}`);
      return true;
    }
    return false;
  }

  /**
   * 📊 Get Flow Status
   */
  getFlowStatus(executionId: string): FlowExecution | null {
    return this.activeFlows.get(executionId) || null;
  }

  /**
   * 📋 Get All Flows
   */
  getAllFlows(): AgentFlow[] {
    return Array.from(this.flows.values());
  }

  /**
   * 🔄 Get Active Flows
   */
  getActiveFlows(): FlowExecution[] {
    return Array.from(this.activeFlows.values());
  }

  /**
   * 🗑️ Delete Flow
   */
  deleteFlow(flowId: string): boolean {
    const deleted = this.flows.delete(flowId);
    if (deleted) {
      new Notice(`🗑️ Flow deleted: ${flowId}`);
    }
    return deleted;
  }

  /**
   * 📝 Update Flow
   */
  updateFlow(flowId: string, updates: Partial<AgentFlow>): boolean {
    const flow = this.flows.get(flowId);
    if (flow) {
      Object.assign(flow, updates);
      new Notice(`📝 Flow updated: ${flowId}`);
      return true;
    }
    return false;
  }

  /**
   * 📤 Export Flow
   */
  exportFlow(flowId: string): string {
    const flow = this.flows.get(flowId);
    if (flow) {
      return JSON.stringify(flow, null, 2);
    }
    throw new Error(`Flow not found: ${flowId}`);
  }

  /**
   * 📥 Import Flow
   */
  importFlow(flowData: string): string {
    try {
      const flow: AgentFlow = JSON.parse(flowData);
      const flowId = flow.id || `imported_${Date.now()}`;
      this.flows.set(flowId, flow);
      new Notice(`📥 Flow imported: ${flow.name}`);
      return flowId;
    } catch (error) {
      throw new Error(`Invalid flow data: ${error}`);
    }
  }

  /**
   * 📊 Get Flow Statistics
   */
  getFlowStats(): FlowStats {
    const totalFlows = this.flows.size;
    const activeFlows = this.activeFlows.size;
    const completedFlows = 0; // Would need to track completed flows
    const failedFlows = 0; // Would need to track failed flows

    return {
      total: totalFlows,
      active: activeFlows,
      completed: completedFlows,
      failed: failedFlows,
      successRate:
        completedFlows > 0
          ? (completedFlows / (completedFlows + failedFlows)) * 100
          : 0,
    };
  }
}

/**
 * 📋 Agent Flow Interface
 */
interface AgentFlow {
  id?: string;
  name: string;
  description: string;
  steps: FlowStep[];
}

/**
 * ⚡ Flow Step Interface
 */
interface FlowStep {
  id: string;
  name: string;
  description: string;
  action: (context: any) => Promise<string>;
}

/**
 * 🔄 Flow Execution Interface
 */
interface FlowExecution {
  id: string;
  flowId: string;
  status: "running" | "completed" | "failed" | "stopped";
  startTime: Date;
  endTime?: Date;
  steps: StepExecution[];
  context: any;
  result?: any;
  error?: string;
}

/**
 * 📝 Step Execution Interface
 */
interface StepExecution {
  id: string;
  name: string;
  status: "running" | "completed" | "failed";
  startTime: Date;
  endTime?: Date;
  result?: string;
  error?: string;
}

/**
 * 📊 Flow Result Interface
 */
interface FlowResult {
  success: boolean;
  execution: FlowExecution;
  result?: any;
  error?: string;
}

/**
 * 📈 Flow Stats Interface
 */
interface FlowStats {
  total: number;
  active: number;
  completed: number;
  failed: number;
  successRate: number;
}
