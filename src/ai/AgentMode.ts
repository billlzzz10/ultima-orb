import { App, Notice } from "obsidian";
import { AIFeatures } from "./AIFeatures";

/**
 * 🤖 Agent Mode - AI Agent ที่ทำงานอัตโนมัติ
 */
export class AgentMode {
  private app: App;
  private aiFeatures: AIFeatures;
  private isActive: boolean = false;
  private currentTask: string = "";
  private taskHistory: Array<{
    task: string;
    result: string;
    timestamp: Date;
  }> = [];

  constructor(app: App, aiFeatures: AIFeatures) {
    this.app = app;
    this.aiFeatures = aiFeatures;
  }

  /**
   * 🚀 เริ่ม Agent Mode
   */
  async startAgentMode(task: string): Promise<void> {
    try {
      this.isActive = true;
      this.currentTask = task;
      this.taskHistory = [];

      new Notice("🤖 Agent Mode Started!");

      // วิเคราะห์งาน
      const analysis = await this.analyzeTask(task);
      new Notice("📊 Task Analysis Complete");

      // แบ่งงานเป็นขั้นตอน
      const steps = await this.breakDownTask(analysis);
      new Notice(`🔧 Task broken into ${steps.length} steps`);

      // ทำแต่ละขั้นตอน
      for (const step of steps) {
        if (!this.isActive) break; // ตรวจสอบว่ายัง active อยู่หรือไม่

        const result = await this.executeStep(step);
        this.taskHistory.push({ task: step, result, timestamp: new Date() });

        new Notice(`✅ Step completed: ${step.substring(0, 30)}...`);
      }

      // สรุปผลงาน
      const summary = await this.generateSummary();
      new Notice("✅ Agent Mode Completed!");

      // ไม่ return อะไร เพราะเป็น void
    } catch (error) {
      new Notice("❌ Agent Mode Error: " + error);
      this.stopAgentMode();
    }
  }

  /**
   * 🛑 หยุด Agent Mode
   */
  stopAgentMode(): void {
    this.isActive = false;
    new Notice("🛑 Agent Mode Stopped");
  }

  /**
   * 📊 วิเคราะห์งาน
   */
  private async analyzeTask(task: string): Promise<string> {
    const prompt = `Analyze this task and provide a detailed breakdown:

Task: ${task}

Please provide:
1. Task type and complexity
2. Required resources
3. Potential challenges
4. Success criteria
5. Estimated steps needed`;

    return await this.aiFeatures.chatWithAI(prompt);
  }

  /**
   * 🔧 แบ่งงานเป็นขั้นตอน
   */
  private async breakDownTask(analysis: string): Promise<string[]> {
    const prompt = `Based on this analysis, break down the task into specific executable steps:

Analysis: ${analysis}

Please provide a numbered list of specific steps that can be executed one by one.`;

    const response = await this.aiFeatures.chatWithAI(prompt);

    // แยกขั้นตอนจาก response
    const steps = response
      .split("\n")
      .filter((line) => /^\d+\./.test(line.trim()))
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter((step) => step.length > 0);

    return steps;
  }

  /**
   * ⚡ ทำขั้นตอนเดียว
   */
  private async executeStep(step: string): Promise<string> {
    new Notice(`🤖 Executing: ${step.substring(0, 50)}...`);

    const prompt = `Execute this step: ${step}

Please provide:
1. What you're doing
2. The result
3. Any issues encountered
4. Next steps if needed`;

    return await this.aiFeatures.chatWithAI(prompt);
  }

  /**
   * 📝 สรุปผลงาน
   */
  private async generateSummary(): Promise<string> {
    const prompt = `Generate a summary of the completed task:

Original Task: ${this.currentTask}
Number of Steps: ${this.taskHistory.length}

Task History:
${this.taskHistory
  .map(
    (item, index) =>
      `${index + 1}. ${item.task}\n   Result: ${item.result.substring(
        0,
        100
      )}...`
  )
  .join("\n")}

Please provide:
1. Overall success assessment
2. Key achievements
3. Issues encountered
4. Recommendations for future similar tasks`;

    return await this.aiFeatures.chatWithAI(prompt);
  }

  /**
   * 📋 ดูประวัติงาน
   */
  getTaskHistory(): Array<{ task: string; result: string; timestamp: Date }> {
    return this.taskHistory;
  }

  /**
   * 🔄 รีเซ็ต Agent
   */
  resetAgent(): void {
    this.taskHistory = [];
    this.currentTask = "";
    this.isActive = false;
    new Notice("🔄 Agent Reset");
  }

  /**
   * 📊 สถานะ Agent
   */
  getStatus(): { isActive: boolean; currentTask: string; stepCount: number } {
    return {
      isActive: this.isActive,
      currentTask: this.currentTask,
      stepCount: this.taskHistory.length,
    };
  }
}
