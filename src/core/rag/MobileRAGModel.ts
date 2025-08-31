import { App, Notice } from "obsidian";
import { RAGModel, SearchResult } from "../interfaces";

/**
 * 🧠 Mobile RAG Model - เหมาะสำหรับมือถือและทำงานแบบ offline
 */
export class MobileRAGModel implements RAGModel {
  public id: string;
  public name: string;
  public type: "local" | "remote";
  public size: "tiny" | "small" | "medium" | "large";
  public dimensions: number;
  public maxTokens: number;
  public isMobileOptimized: boolean;

  private app: App;
  private embeddings: Map<string, number[]> = new Map();
  private documents: Map<string, string> = new Map();
  private isLoaded: boolean = false;
  private modelSize: number = 0; // in MB

  constructor(
    app: App,
    config: {
      id: string;
      name: string;
      size: "tiny" | "small" | "medium" | "large";
      dimensions: number;
      maxTokens: number;
    }
  ) {
    this.app = app;
    this.id = config.id;
    this.name = config.name;
    this.type = "local";
    this.size = config.size;
    this.dimensions = config.dimensions;
    this.maxTokens = config.maxTokens;
    this.isMobileOptimized = true;

    // กำหนดขนาดตาม model size
    this.modelSize = this.getModelSize(config.size);
  }

  /**
   * 📥 โหลด Model
   */
  async load(): Promise<void> {
    if (this.isLoaded) {
      return;
    }

    try {
      console.info(`🔄 Loading mobile RAG model: ${this.name}`);

      // ตรวจสอบพื้นที่ว่าง
      const availableSpace = await this.checkAvailableSpace();
      if (availableSpace < this.modelSize) {
        throw new Error(
          `Insufficient storage space. Required: ${this.modelSize}MB, Available: ${availableSpace}MB`
        );
      }

      // โหลด embeddings ที่มีอยู่
      await this.loadExistingEmbeddings();

      this.isLoaded = true;
      console.info(`✅ Mobile RAG model loaded: ${this.name}`);
    } catch (error) {
      console.error(`❌ Failed to load mobile RAG model: ${error}`);
      throw error;
    }
  }

  /**
   * 📤 ปลด Model
   */
  async unload(): Promise<void> {
    if (!this.isLoaded) {
      return;
    }

    try {
      // บันทึก embeddings ลง disk
      await this.saveEmbeddings();

      // ล้าง memory
      this.embeddings.clear();
      this.documents.clear();

      this.isLoaded = false;
      console.info(`✅ Mobile RAG model unloaded: ${this.name}`);
    } catch (error) {
      console.error(`❌ Failed to unload mobile RAG model: ${error}`);
      throw error;
    }
  }

  /**
   * 🔤 สร้าง Embeddings
   */
  async embed(text: string): Promise<number[]> {
    if (!this.isLoaded) {
      throw new Error("RAG model not loaded");
    }

    try {
      // ใช้ simple hash-based embedding สำหรับ mobile
      return this.generateSimpleEmbedding(text);
    } catch (error) {
      console.error(`❌ Failed to generate embedding: ${error}`);
      throw error;
    }
  }

  /**
   * 🔍 ค้นหาเอกสาร
   */
  async search(query: string, documents: string[]): Promise<SearchResult[]> {
    if (!this.isLoaded) {
      throw new Error("RAG model not loaded");
    }

    try {
      const queryEmbedding = await this.embed(query);
      const results: SearchResult[] = [];

      for (const doc of documents) {
        const docEmbedding = await this.embed(doc);
        const score = this.calculateSimilarity(queryEmbedding, docEmbedding);

        if (score > 0.3) {
          // threshold สำหรับ mobile
          results.push({
            document: doc,
            score,
            metadata: {
              length: doc.length,
              timestamp: Date.now(),
            },
          });
        }
      }

      // เรียงตาม score
      return results.sort((a, b) => b.score - a.score).slice(0, 5);
    } catch (error) {
      console.error(`❌ Failed to search documents: ${error}`);
      throw error;
    }
  }

  /**
   * 📝 เพิ่มเอกสาร
   */
  async addDocument(id: string, content: string): Promise<void> {
    if (!this.isLoaded) {
      throw new Error("RAG model not loaded");
    }

    try {
      const embedding = await this.embed(content);
      this.embeddings.set(id, embedding);
      this.documents.set(id, content);

      console.info(`✅ Document added to RAG model: ${id}`);
    } catch (error) {
      console.error(`❌ Failed to add document: ${error}`);
      throw error;
    }
  }

  /**
   * 🗑️ ลบเอกสาร
   */
  async removeDocument(id: string): Promise<void> {
    if (!this.isLoaded) {
      throw new Error("RAG model not loaded");
    }

    try {
      this.embeddings.delete(id);
      this.documents.delete(id);

      console.info(`✅ Document removed from RAG model: ${id}`);
    } catch (error) {
      console.error(`❌ Failed to remove document: ${error}`);
      throw error;
    }
  }

  /**
   * 📊 สถิติ Model
   */
  getStats(): {
    documents: number;
    embeddings: number;
    modelSize: number;
    memoryUsage: number;
  } {
    return {
      documents: this.documents.size,
      embeddings: this.embeddings.size,
      modelSize: this.modelSize,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  // ===== PRIVATE METHODS =====

  /**
   * 📏 กำหนดขนาด Model
   */
  private getModelSize(size: "tiny" | "small" | "medium" | "large"): number {
    const sizes = {
      tiny: 1, // 1MB
      small: 5, // 5MB
      medium: 15, // 15MB
      large: 50, // 50MB
    };
    return sizes[size];
  }

  /**
   * 💾 ตรวจสอบพื้นที่ว่าง
   */
  private async checkAvailableSpace(): Promise<number> {
    try {
      // ใช้ localStorage เป็นตัวแทน
      const testKey = "rag_storage_test";
      const testData = "x".repeat(1024 * 1024); // 1MB

      // ทดสอบเขียนข้อมูล
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);

      // ประมาณการพื้นที่ว่าง (simplified)
      return 100; // 100MB (approximate)
    } catch (error) {
      console.warn("Could not check available space:", error);
      return 50; // fallback
    }
  }

  /**
   * 📥 โหลด Embeddings ที่มีอยู่
   */
  private async loadExistingEmbeddings(): Promise<void> {
    try {
      const stored = localStorage.getItem(`rag_embeddings_${this.id}`);
      if (stored) {
        const data = JSON.parse(stored);
        this.embeddings = new Map(data.embeddings);
        this.documents = new Map(data.documents);
        console.info(`📥 Loaded ${this.embeddings.size} existing embeddings`);
      }
    } catch (error) {
      console.warn("Could not load existing embeddings:", error);
    }
  }

  /**
   * 💾 บันทึก Embeddings
   */
  private async saveEmbeddings(): Promise<void> {
    try {
      const data = {
        embeddings: Array.from(this.embeddings.entries()),
        documents: Array.from(this.documents.entries()),
        timestamp: Date.now(),
      };

      localStorage.setItem(`rag_embeddings_${this.id}`, JSON.stringify(data));
      console.info(`💾 Saved ${this.embeddings.size} embeddings`);
    } catch (error) {
      console.warn("Could not save embeddings:", error);
    }
  }

  /**
   * 🔤 สร้าง Simple Embedding
   */
  private generateSimpleEmbedding(text: string): number[] {
    // ใช้ simple hash-based approach สำหรับ mobile
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(this.dimensions).fill(0);

    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      const position = hash % this.dimensions;
      embedding[position] += 1;
    });

    // Normalize
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0)
    );
    if (magnitude > 0) {
      embedding.forEach((val, i) => {
        embedding[i] = val / magnitude;
      });
    }

    return embedding;
  }

  /**
   * 🔢 Simple Hash Function
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * 📊 คำนวณความคล้ายคลึง
   */
  private calculateSimilarity(
    embedding1: number[],
    embedding2: number[]
  ): number {
    if (embedding1.length !== embedding2.length) {
      return 0;
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * 💾 ประมาณการการใช้ Memory
   */
  private estimateMemoryUsage(): number {
    const embeddingSize = this.embeddings.size * this.dimensions * 8; // 8 bytes per number
    const documentSize = Array.from(this.documents.values()).reduce(
      (sum, doc) => sum + doc.length * 2,
      0
    ); // 2 bytes per character

    return (embeddingSize + documentSize) / (1024 * 1024); // Convert to MB
  }
}

/**
 * 🏭 Mobile RAG Model Factory
 */
export class MobileRAGModelFactory {
  private static models: Map<string, MobileRAGModel> = new Map();

  /**
   * 🔧 สร้าง Mobile RAG Model
   */
  static createModel(
    app: App,
    config: {
      id: string;
      name: string;
      size: "tiny" | "small" | "medium" | "large";
    }
  ): MobileRAGModel {
    const dimensions = this.getDimensionsForSize(config.size);
    const maxTokens = this.getMaxTokensForSize(config.size);

    const model = new MobileRAGModel(app, {
      ...config,
      dimensions,
      maxTokens,
    });

    this.models.set(config.id, model);
    return model;
  }

  /**
   * 📋 รับ Model ที่มีอยู่
   */
  static getModel(id: string): MobileRAGModel | undefined {
    return this.models.get(id);
  }

  /**
   * 📊 สถิติ Models ทั้งหมด
   */
  static getAllModels(): MobileRAGModel[] {
    return Array.from(this.models.values());
  }

  /**
   * 🗑️ ลบ Model
   */
  static removeModel(id: string): boolean {
    return this.models.delete(id);
  }

  // ===== PRIVATE METHODS =====

  /**
   * 📏 กำหนด Dimensions ตามขนาด
   */
  private static getDimensionsForSize(
    size: "tiny" | "small" | "medium" | "large"
  ): number {
    const dimensions = {
      tiny: 64, // 64 dimensions
      small: 128, // 128 dimensions
      medium: 256, // 256 dimensions
      large: 512, // 512 dimensions
    };
    return dimensions[size];
  }

  /**
   * 📝 กำหนด Max Tokens ตามขนาด
   */
  private static getMaxTokensForSize(
    size: "tiny" | "small" | "medium" | "large"
  ): number {
    const maxTokens = {
      tiny: 512, // 512 tokens
      small: 1024, // 1K tokens
      medium: 2048, // 2K tokens
      large: 4096, // 4K tokens
    };
    return maxTokens[size];
  }
}
