export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  metadata?: Record<string, any>;
}

export interface ProviderConfig {
  name: string;
  endpoint?: string;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface ProviderStatus {
  connected: boolean;
  model?: string;
  error?: string;
  lastChecked?: Date;
}

export abstract class BaseProvider {
  protected config: ProviderConfig;
  protected status: ProviderStatus;

  constructor(config: ProviderConfig) {
    this.config = {
      temperature: 0.7,
      maxTokens: 2048,
      timeout: 30000,
      ...config
    };
    this.status = { connected: false };
  }

  /**
   * ส่งข้อความไปยัง AI provider และรับคำตอบกลับมา
   */
  abstract chat(messages: ChatMessage[]): Promise<ChatResponse>;

  /**
   * ตรวจสอบการเชื่อมต่อกับ provider
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * ดึงรายการ models ที่ใช้ได้
   */
  abstract getAvailableModels(): Promise<string[]>;

  /**
   * ตั้งค่า configuration ใหม่
   */
  updateConfig(newConfig: Partial<ProviderConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * ดึง configuration ปัจจุบัน
   */
  getConfig(): ProviderConfig {
    return { ...this.config };
  }

  /**
   * ดึงสถานะการเชื่อมต่อ
   */
  getStatus(): ProviderStatus {
    return { ...this.status };
  }

  /**
   * ดึงชื่อ provider
   */
  getName(): string {
    return this.config.name;
  }

  /**
   * ตรวจสอบว่า provider พร้อมใช้งานหรือไม่
   */
  isReady(): boolean {
    return this.status.connected;
  }

  /**
   * สร้าง system message สำหรับ context
   */
  protected createSystemMessage(content: string): ChatMessage {
    return {
      role: 'system',
      content,
      timestamp: Date.now()
    };
  }

  /**
   * สร้าง user message
   */
  protected createUserMessage(content: string): ChatMessage {
    return {
      role: 'user',
      content,
      timestamp: Date.now()
    };
  }

  /**
   * สร้าง assistant message
   */
  protected createAssistantMessage(content: string): ChatMessage {
    return {
      role: 'assistant',
      content,
      timestamp: Date.now()
    };
  }

  /**
   * จัดการ error และอัปเดตสถานะ
   */
  protected handleError(error: any): void {
    this.status.connected = false;
    this.status.error = error instanceof Error ? error.message : 'Unknown error';
    this.status.lastChecked = new Date();
  }

  /**
   * อัปเดตสถานะเมื่อเชื่อมต่อสำเร็จ
   */
  protected updateStatus(connected: boolean, model?: string, error?: string): void {
    this.status.connected = connected;
    this.status.model = model;
    this.status.error = error;
    this.status.lastChecked = new Date();
  }
}
