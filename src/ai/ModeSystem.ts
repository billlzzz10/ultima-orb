/**
 * 🎯 Mode System for Ultima-Orb
 * ระบบจัดการ modes การทำงานของ AI ที่ยืดหยุ่น
 */

export interface Mode {
  id: string;
  name: string;
  description: string;
  roleDefinition: string;
  customInstructions?: string;
  toolGroups: string[];
  provider: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ToolGroup {
  id: string;
  name: string;
  description: string;
  tools: string[];
  enabled: boolean;
}

export class ModeSystem {
  private modes: Map<string, Mode> = new Map();
  private toolGroups: Map<string, ToolGroup> = new Map();
  private activeMode: string = "ask";

  constructor() {
    this.initializeDefaultModes();
    this.initializeDefaultToolGroups();
  }

  /**
   * เริ่มต้น modes มาตรฐาน
   */
  private initializeDefaultModes() {
    const defaultModes: Mode[] = [
      {
        id: "ask",
        name: "Ask Mode",
        description: "สำหรับถามคำถามและวิเคราะห์ข้อมูล",
        roleDefinition:
          "คุณเป็น AI Assistant ที่ช่วยตอบคำถามและวิเคราะห์ข้อมูลใน Obsidian vault",
        toolGroups: ["read", "search", "insights"],
        provider: "openai",
        model: "gpt-4",
        temperature: 0.7,
        maxTokens: 2000,
      },
      {
        id: "write",
        name: "Write Mode",
        description: "สำหรับเขียนและแก้ไขเอกสาร",
        roleDefinition:
          "คุณเป็น AI Writing Assistant ที่ช่วยเขียนและแก้ไขเอกสารใน Obsidian",
        toolGroups: ["read", "edit", "search"],
        provider: "openai",
        model: "gpt-4",
        temperature: 0.8,
        maxTokens: 3000,
      },
      {
        id: "learn",
        name: "Learn Mode",
        description: "สำหรับการเรียนรู้และสร้าง study materials",
        roleDefinition:
          "คุณเป็น AI Learning Assistant ที่ช่วยสร้าง study materials และสรุปเนื้อหา",
        toolGroups: ["read", "edit", "search", "insights"],
        provider: "openai",
        model: "gpt-4",
        temperature: 0.6,
        maxTokens: 2500,
      },
      {
        id: "research",
        name: "Research Mode",
        description: "สำหรับการวิจัยและวิเคราะห์เชิงลึก",
        roleDefinition:
          "คุณเป็น AI Research Assistant ที่ช่วยในการวิจัยและวิเคราะห์ข้อมูลเชิงลึก",
        toolGroups: ["read", "search", "web", "insights"],
        provider: "openai",
        model: "gpt-4",
        temperature: 0.5,
        maxTokens: 4000,
      },
      {
        id: "code",
        name: "Code Mode",
        description: "สำหรับการเขียนและแก้ไขโค้ด",
        roleDefinition:
          "คุณเป็น AI Code Assistant ที่ช่วยเขียนและแก้ไขโค้ดในโปรเจกต์",
        toolGroups: ["read", "edit", "search"],
        provider: "openai",
        model: "gpt-4",
        temperature: 0.3,
        maxTokens: 3000,
      },
    ];

    defaultModes.forEach((mode) => {
      this.modes.set(mode.id, mode);
    });
  }

  /**
   * เริ่มต้น tool groups มาตรฐาน
   */
  private initializeDefaultToolGroups() {
    const defaultToolGroups: ToolGroup[] = [
      {
        id: "read",
        name: "File Reading",
        description: "เครื่องมือสำหรับอ่านไฟล์และข้อมูล",
        tools: ["read_file", "list_files", "get_file_info"],
        enabled: true,
      },
      {
        id: "edit",
        name: "File Editing",
        description: "เครื่องมือสำหรับแก้ไขและเขียนไฟล์",
        tools: ["write_file", "append_file", "delete_file", "create_file"],
        enabled: true,
      },
      {
        id: "search",
        name: "Search & Analysis",
        description: "เครื่องมือสำหรับค้นหาและวิเคราะห์",
        tools: [
          "search_files",
          "semantic_search",
          "regex_search",
          "analyze_content",
        ],
        enabled: true,
      },
      {
        id: "web",
        name: "Web Research",
        description: "เครื่องมือสำหรับค้นหาข้อมูลจากเว็บ",
        tools: ["search_web", "fetch_url", "extract_content"],
        enabled: true,
      },
      {
        id: "insights",
        name: "Insights & Analysis",
        description: "เครื่องมือสำหรับวิเคราะห์และสรุปข้อมูล",
        tools: ["generate_insights", "summarize_content", "extract_key_points"],
        enabled: true,
      },
      {
        id: "mcp",
        name: "MCP Tools",
        description: "เครื่องมือ MCP (Model Context Protocol)",
        tools: ["use_mcp_tool", "access_mcp_resource"],
        enabled: true,
      },
    ];

    defaultToolGroups.forEach((group) => {
      this.toolGroups.set(group.id, group);
    });
  }

  /**
   * รับ mode ปัจจุบัน
   */
  getActiveMode(): Mode | undefined {
    return this.modes.get(this.activeMode);
  }

  /**
   * เปลี่ยน mode
   */
  setActiveMode(modeId: string): boolean {
    if (this.modes.has(modeId)) {
      this.activeMode = modeId;
      return true;
    }
    return false;
  }

  /**
   * รับ modes ทั้งหมด
   */
  getAllModes(): Mode[] {
    return Array.from(this.modes.values());
  }

  /**
   * เพิ่ม mode ใหม่
   */
  addMode(mode: Mode): void {
    this.modes.set(mode.id, mode);
  }

  /**
   * ลบ mode
   */
  removeMode(modeId: string): boolean {
    return this.modes.delete(modeId);
  }

  /**
   * อัปเดต mode
   */
  updateMode(modeId: string, updates: Partial<Mode>): boolean {
    const mode = this.modes.get(modeId);
    if (mode) {
      this.modes.set(modeId, { ...mode, ...updates });
      return true;
    }
    return false;
  }

  /**
   * รับ tool groups สำหรับ mode ปัจจุบัน
   */
  getActiveToolGroups(): ToolGroup[] {
    const activeMode = this.getActiveMode();
    if (!activeMode) return [];

    return activeMode.toolGroups
      .map((groupId) => this.toolGroups.get(groupId))
      .filter(
        (group): group is ToolGroup => group !== undefined && group.enabled
      );
  }

  /**
   * รับ tools ทั้งหมดสำหรับ mode ปัจจุบัน
   */
  getActiveTools(): string[] {
    const activeGroups = this.getActiveToolGroups();
    return activeGroups.flatMap((group) => group.tools);
  }

  /**
   * รับ tool groups ทั้งหมด
   */
  getAllToolGroups(): ToolGroup[] {
    return Array.from(this.toolGroups.values());
  }

  /**
   * เพิ่ม tool group ใหม่
   */
  addToolGroup(group: ToolGroup): void {
    this.toolGroups.set(group.id, group);
  }

  /**
   * อัปเดต tool group
   */
  updateToolGroup(groupId: string, updates: Partial<ToolGroup>): boolean {
    const group = this.toolGroups.get(groupId);
    if (group) {
      this.toolGroups.set(groupId, { ...group, ...updates });
      return true;
    }
    return false;
  }

  /**
   * สร้าง context สำหรับ AI request
   */
  buildContext(customInstructions?: string): string {
    const activeMode = this.getActiveMode();
    if (!activeMode) {
      throw new Error("No active mode found");
    }

    let context = `Mode: ${activeMode.name}\n`;
    context += `Role: ${activeMode.roleDefinition}\n`;

    if (activeMode.customInstructions) {
      context += `Custom Instructions: ${activeMode.customInstructions}\n`;
    }

    if (customInstructions) {
      context += `Additional Instructions: ${customInstructions}\n`;
    }

    const activeTools = this.getActiveTools();
    if (activeTools.length > 0) {
      context += `Available Tools: ${activeTools.join(", ")}\n`;
    }

    return context;
  }

  /**
   * รับการตั้งค่า AI สำหรับ mode ปัจจุบัน
   */
  getAISettings(): {
    provider: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } {
    const activeMode = this.getActiveMode();
    if (!activeMode) {
      return { provider: "openai" };
    }

    const settings: {
      provider: string;
      model?: string;
      temperature?: number;
      maxTokens?: number;
    } = {
      provider: activeMode.provider,
    };

    if (activeMode.model) {
      settings.model = activeMode.model;
    }
    if (activeMode.temperature) {
      settings.temperature = activeMode.temperature;
    }
    if (activeMode.maxTokens) {
      settings.maxTokens = activeMode.maxTokens;
    }

    return settings;
  }

  /**
   * ส่งออกการตั้งค่า
   */
  exportSettings(): {
    modes: Mode[];
    toolGroups: ToolGroup[];
    activeMode: string;
  } {
    return {
      modes: this.getAllModes(),
      toolGroups: this.getAllToolGroups(),
      activeMode: this.activeMode,
    };
  }

  /**
   * นำเข้าการตั้งค่า
   */
  importSettings(settings: {
    modes: Mode[];
    toolGroups: ToolGroup[];
    activeMode: string;
  }): void {
    // Clear existing
    this.modes.clear();
    this.toolGroups.clear();

    // Import modes
    settings.modes.forEach((mode) => {
      this.modes.set(mode.id, mode);
    });

    // Import tool groups
    settings.toolGroups.forEach((group) => {
      this.toolGroups.set(group.id, group);
    });

    // Set active mode
    if (this.modes.has(settings.activeMode)) {
      this.activeMode = settings.activeMode;
    }
  }
}
