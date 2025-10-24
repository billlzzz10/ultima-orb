import { App, TFile, Notice } from "obsidian";
import { FeatureManager } from "../../core/FeatureManager";

export interface DocumentMetadata {
  id: string;
  filename: string;
  filepath: string;
  size: number;
  type: string;
  created: Date;
  modified: Date;
  tags: string[];
  categories: string[];
  summary?: string;
  keywords: string[];
  language: string;
  wordCount: number;
  characterCount: number;
  readingTime: number;
}

export interface ProcessingOptions {
  extractText: boolean;
  extractMetadata: boolean;
  generateSummary: boolean;
  extractKeywords: boolean;
  detectLanguage: boolean;
  calculateMetrics: boolean;
  chunkSize: number;
  overlap: number;
  includeImages: boolean;
  includeTables: boolean;
  includeCode: boolean;
}

export interface ProcessingResult {
  success: boolean;
  metadata: DocumentMetadata;
  content: string;
  chunks: string[];
  summary?: string | undefined;
  keywords?: string[] | undefined;
  language: string;
  metrics: {
    wordCount: number;
    characterCount: number;
    readingTime: number;
    chunkCount: number;
  };
  error?: string;
}

export class DocumentProcessor {
  private app: App;
  private featureManager: FeatureManager;
  private processingOptions: ProcessingOptions;

  constructor(app: App, featureManager: FeatureManager) {
    this.app = app;
    this.featureManager = featureManager;
    this.processingOptions = this.getDefaultOptions();
  }

  private getDefaultOptions(): ProcessingOptions {
    return {
      extractText: true,
      extractMetadata: true,
      generateSummary: false,
      extractKeywords: false,
      detectLanguage: true,
      calculateMetrics: true,
      chunkSize: 1000,
      overlap: 200,
      includeImages: false,
      includeTables: true,
      includeCode: true,
    };
  }

  async processDocument(file: TFile): Promise<ProcessingResult> {
    try {
      const content = await this.app.vault.read(file);
      const metadata = await this.extractMetadata(file, content);
      
      let processedContent = content;
      let chunks: string[] = [];
      let summary: string | undefined;
      let keywords: string[] = [];
      let language = "en";

      // Extract and process content
      if (this.processingOptions.extractText) {
        processedContent = await this.extractText(content, file);
      }

      // Generate chunks
      if (this.processingOptions.chunkSize > 0) {
        chunks = this.createChunks(processedContent);
      }

      // Generate summary
      if (this.processingOptions.generateSummary) {
        summary = await this.generateSummary(processedContent);
      }

      // Extract keywords
      if (this.processingOptions.extractKeywords) {
        keywords = await this.extractKeywords(processedContent);
      }

      // Detect language
      if (this.processingOptions.detectLanguage) {
        language = await this.detectLanguage(processedContent);
      }

      // Calculate metrics
      const metrics = this.calculateMetrics(processedContent, chunks);

      const result: ProcessingResult = {
        success: true,
        metadata,
        content: processedContent,
        chunks,
        summary,
        keywords,
        language,
        metrics,
      };

      new Notice(`Processed ${file.name} successfully`);
      return result;
    } catch (error) {
      console.error(`Error processing document ${file.path}:`, error);
      return {
        success: false,
        metadata: await this.extractBasicMetadata(file),
        content: "",
        chunks: [],
        keywords: [],
        language: "en",
        metrics: {
          wordCount: 0,
          characterCount: 0,
          readingTime: 0,
          chunkCount: 0,
        },
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async extractMetadata(file: TFile, content: string): Promise<DocumentMetadata> {
    const basicMetadata = await this.extractBasicMetadata(file);
    
    if (!this.processingOptions.extractMetadata) {
      return basicMetadata;
    }

    // Extract tags from content
    const tags = this.extractTags(content);
    
    // Extract categories based on content patterns
    const categories = this.extractCategories(content);
    
    // Extract keywords
    const keywords = this.extractBasicKeywords(content);

    return {
      ...basicMetadata,
      tags,
      categories,
      keywords,
    };
  }

  private async extractBasicMetadata(file: TFile): Promise<DocumentMetadata> {
    const content = await this.app.vault.read(file);
    const wordCount = this.countWords(content);
    const characterCount = content.length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed

    return {
      id: file.path,
      filename: file.name,
      filepath: file.path,
      size: file.stat.size,
      type: file.extension,
      created: new Date(file.stat.ctime),
      modified: new Date(file.stat.mtime),
      tags: [],
      categories: [],
      keywords: [],
      language: "en",
      wordCount,
      characterCount,
      readingTime,
    };
  }

  private async extractText(content: string, file: TFile): Promise<string> {
    let extractedText = content;

    // Remove markdown formatting
    extractedText = this.removeMarkdownFormatting(extractedText);

    // Extract tables if enabled
    if (this.processingOptions.includeTables) {
      extractedText = this.extractTables(extractedText);
    }

    // Extract code if enabled
    if (this.processingOptions.includeCode) {
      extractedText = this.extractCode(extractedText);
    }

    // Remove images if not enabled
    if (!this.processingOptions.includeImages) {
      extractedText = this.removeImages(extractedText);
    }

    return extractedText;
  }

  private removeMarkdownFormatting(text: string): string {
    // Remove headers
    text = text.replace(/^#{1,6}\s+/gm, "");
    
    // Remove bold and italic
    text = text.replace(/\*\*(.*?)\*\*/g, "$1");
    text = text.replace(/\*(.*?)\*/g, "$1");
    text = text.replace(/__(.*?)__/g, "$1");
    text = text.replace(/_(.*?)_/g, "$1");
    
    // Remove strikethrough
    text = text.replace(/~~(.*?)~~/g, "$1");
    
    // Remove inline code
    text = text.replace(/`(.*?)`/g, "$1");
    
    // Remove links
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    
    // Remove blockquotes
    text = text.replace(/^>\s+/gm, "");
    
    // Remove list markers
    text = text.replace(/^[\s]*[-*+]\s+/gm, "");
    text = text.replace(/^[\s]*\d+\.\s+/gm, "");
    
    // Remove horizontal rules
    text = text.replace(/^---$/gm, "");
    
    // Clean up extra whitespace
    text = text.replace(/\n\s*\n/g, "\n\n");
    text = text.trim();

    return text;
  }

  private extractTables(text: string): string {
    const tableRegex = /\|(.+)\|/g;
    const tables: string[] = [];
    let match;

    while ((match = tableRegex.exec(text)) !== null) {
      tables.push(match[0]);
    }

    return tables.join("\n");
  }

  private extractCode(text: string): string {
    const codeBlockRegex = /```[\s\S]*?```/g;
    const codeBlocks: string[] = [];
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      codeBlocks.push(match[0]);
    }

    return codeBlocks.join("\n");
  }

  private removeImages(text: string): string {
    // Remove image links
    text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "");
    
    // Remove image references
    text = text.replace(/!\[([^\]]*)\]\[[^\]]+\]/g, "");
    
    return text;
  }

  private createChunks(content: string): string[] {
    const chunks: string[] = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = "";
    let chunkIndex = 0;

    for (const sentence of sentences) {
      const sentenceWithPunctuation = sentence.trim() + ".";
      
      if ((currentChunk + sentenceWithPunctuation).length > this.processingOptions.chunkSize) {
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
          chunkIndex++;
        }
        currentChunk = sentenceWithPunctuation;
      } else {
        currentChunk += " " + sentenceWithPunctuation;
      }
    }

    // Add the last chunk
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private async generateSummary(content: string): Promise<string> {
    // This would typically use an AI model to generate a summary
    // For now, we'll create a simple extractive summary
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const summaryLength = Math.min(3, Math.ceil(sentences.length * 0.2));
    
    return sentences.slice(0, summaryLength).join(". ") + ".";
  }

  private async extractKeywords(content: string): Promise<string[]> {
    // Simple keyword extraction based on frequency and importance
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Sort by frequency and return top keywords
    const sortedWords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    return sortedWords;
  }

  private extractBasicKeywords(content: string): string[] {
    // Extract basic keywords without AI processing
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by",
      "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did",
      "will", "would", "could", "should", "may", "might", "must", "can", "this", "that", "these", "those"
    ]);

    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    return Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  private async detectLanguage(content: string): Promise<string> {
    // Simple language detection based on common words
    const englishWords = ["the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with"];
    const thaiWords = ["และ", "หรือ", "ใน", "ที่", "ไป", "มา", "ให้", "กับ", "ของ", "จาก"];
    
    const words = content.toLowerCase().split(/\s+/);
    const englishCount = words.filter(word => englishWords.includes(word)).length;
    const thaiCount = words.filter(word => thaiWords.includes(word)).length;
    
    if (thaiCount > englishCount) {
      return "th";
    }
    
    return "en";
  }

  private extractTags(content: string): string[] {
    const tagPattern = /#(\w+)/g;
    const tags: string[] = [];
    let match;

    while ((match = tagPattern.exec(content)) !== null) {
      tags.push(match[1]);
    }

    return [...new Set(tags)]; // Remove duplicates
  }

  private extractCategories(content: string): string[] {
    const categories: string[] = [];
    
    // Detect categories based on content patterns
    if (content.includes("function") || content.includes("class") || content.includes("import")) {
      categories.push("code");
    }
    
    if (content.includes("TODO") || content.includes("FIXME") || content.includes("BUG")) {
      categories.push("task");
    }
    
    if (content.includes("http") || content.includes("www")) {
      categories.push("reference");
    }
    
    if (content.includes("##") || content.includes("###")) {
      categories.push("documentation");
    }
    
    if (categories.length === 0) {
      categories.push("general");
    }
    
    return categories;
  }

  private calculateMetrics(content: string, chunks: string[]): {
    wordCount: number;
    characterCount: number;
    readingTime: number;
    chunkCount: number;
  } {
    const wordCount = this.countWords(content);
    const characterCount = content.length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed
    const chunkCount = chunks.length;

    return {
      wordCount,
      characterCount,
      readingTime,
      chunkCount,
    };
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  updateProcessingOptions(options: Partial<ProcessingOptions>): void {
    this.processingOptions = { ...this.processingOptions, ...options };
  }

  getProcessingOptions(): ProcessingOptions {
    return { ...this.processingOptions };
  }

  async processMultipleDocuments(files: TFile[]): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];
    
    for (const file of files) {
      const result = await this.processDocument(file);
      results.push(result);
    }

    new Notice(`Processed ${results.length} documents`);
    return results;
  }

  async batchProcess(files: TFile[], batchSize: number = 5): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(file => this.processDocument(file))
      );
      results.push(...batchResults);
      
      // Show progress
      const progress = Math.min(100, ((i + batchSize) / files.length) * 100);
      new Notice(`Processing: ${Math.round(progress)}% complete`);
    }

    return results;
  }
}
