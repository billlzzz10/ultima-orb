import { App, TFile, Notice } from "obsidian";
import { FeatureManager } from "../../core/FeatureManager";

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    file: string;
    start: number;
    end: number;
    type: string;
    tags: string[];
    created: Date;
    modified: Date;
  };
  embedding?: number[];
}

export interface IndexingOptions {
  chunkSize: number;
  overlap: number;
  includeMetadata: boolean;
  filterExtensions: string[];
  excludePaths: string[];
}

export class DocumentIndexer {
  private app: App;
  private featureManager: FeatureManager;
  private chunks: Map<string, DocumentChunk> = new Map();
  private indexingOptions: IndexingOptions;

  constructor(app: App, featureManager: FeatureManager) {
    this.app = app;
    this.featureManager = featureManager;
    this.indexingOptions = this.getDefaultOptions();
  }

  private getDefaultOptions(): IndexingOptions {
    return {
      chunkSize: 1000,
      overlap: 200,
      includeMetadata: true,
      filterExtensions: [".md", ".txt", ".json", ".yaml", ".yml"],
      excludePaths: [".obsidian/", "node_modules/", ".git/"],
    };
  }

  async indexDocument(file: TFile): Promise<DocumentChunk[]> {
    try {
      const content = await this.app.vault.read(file);
      const chunks = this.chunkDocument(content, file);

      // Store chunks
      chunks.forEach((chunk) => {
        this.chunks.set(chunk.id, chunk);
      });

      new Notice(`Indexed ${file.name}: ${chunks.length} chunks`);
      return chunks;
    } catch (error) {
      console.error(`Error indexing document ${file.path}:`, error);
      new Notice(`Error indexing ${file.name}`);
      return [];
    }
  }

  async indexAllDocuments(): Promise<DocumentChunk[]> {
    const allChunks: DocumentChunk[] = [];
    const files = this.app.vault.getMarkdownFiles();

    for (const file of files) {
      if (this.shouldIndexFile(file)) {
        const chunks = await this.indexDocument(file);
        allChunks.push(...chunks);
      }
    }

    new Notice(`Indexed ${allChunks.length} chunks from ${files.length} files`);
    return allChunks;
  }

  private shouldIndexFile(file: TFile): boolean {
    // Check file extension
    const extension = file.extension;
    if (!this.indexingOptions.filterExtensions.includes(`.${extension}`)) {
      return false;
    }

    // Check excluded paths
    for (const excludedPath of this.indexingOptions.excludePaths) {
      if (file.path.includes(excludedPath)) {
        return false;
      }
    }

    return true;
  }

  private chunkDocument(content: string, file: TFile): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const lines = content.split("\n");
    let currentChunk = "";
    let startLine = 0;
    let chunkIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      currentChunk += line + "\n";

      // Check if we should create a chunk
      if (
        currentChunk.length >= this.indexingOptions.chunkSize ||
        i === lines.length - 1
      ) {
        const chunk: DocumentChunk = {
          id: `${file.path}-${chunkIndex}`,
          content: currentChunk.trim(),
          metadata: {
            file: file.path,
            start: startLine,
            end: i,
            type: this.detectContentType(currentChunk),
            tags: this.extractTags(currentChunk),
            created: new Date(file.stat.ctime),
            modified: new Date(file.stat.mtime),
          },
        };

        chunks.push(chunk);
        chunkIndex++;

        // Prepare for next chunk with overlap
        if (i < lines.length - 1) {
          const overlapLines = this.calculateOverlap(currentChunk);
          currentChunk = overlapLines;
          startLine = i - overlapLines.split("\n").length + 1;
        }
      }
    }

    return chunks;
  }

  private calculateOverlap(chunk: string): string {
    const lines = chunk.split("\n");
    const overlapSize = Math.floor(this.indexingOptions.overlap / 50); // Approximate lines
    return lines.slice(-overlapSize).join("\n");
  }

  private detectContentType(content: string): string {
    // Detect content type based on patterns
    if (content.includes("```") && content.includes("function")) {
      return "code";
    } else if (content.includes("#") && content.includes("##")) {
      return "documentation";
    } else if (content.includes("- [ ]") || content.includes("- [x]")) {
      return "task-list";
    } else if (content.includes("|") && content.includes("---")) {
      return "table";
    } else {
      return "text";
    }
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

  async updateIndex(file: TFile): Promise<void> {
    // Remove existing chunks for this file
    const existingChunks = Array.from(this.chunks.keys()).filter((key) =>
      key.startsWith(file.path)
    );

    existingChunks.forEach((key) => this.chunks.delete(key));

    // Re-index the file
    await this.indexDocument(file);
  }

  async removeFromIndex(file: TFile): Promise<void> {
    const chunksToRemove = Array.from(this.chunks.keys()).filter((key) =>
      key.startsWith(file.path)
    );

    chunksToRemove.forEach((key) => this.chunks.delete(key));
    new Notice(`Removed ${chunksToRemove.length} chunks from index`);
  }

  getChunks(): DocumentChunk[] {
    return Array.from(this.chunks.values());
  }

  getChunksByFile(filePath: string): DocumentChunk[] {
    return Array.from(this.chunks.values()).filter(
      (chunk) => chunk.metadata.file === filePath
    );
  }

  getChunksByType(type: string): DocumentChunk[] {
    return Array.from(this.chunks.values()).filter(
      (chunk) => chunk.metadata.type === type
    );
  }

  getChunksByTag(tag: string): DocumentChunk[] {
    return Array.from(this.chunks.values()).filter((chunk) =>
      chunk.metadata.tags.includes(tag)
    );
  }

  searchChunks(query: string): DocumentChunk[] {
    const results: DocumentChunk[] = [];
    const queryLower = query.toLowerCase();

    for (const chunk of this.chunks.values()) {
      if (chunk.content.toLowerCase().includes(queryLower)) {
        results.push(chunk);
      }
    }

    return results;
  }

  getIndexStats(): {
    totalChunks: number;
    totalFiles: number;
    averageChunkSize: number;
    typeDistribution: Record<string, number>;
  } {
    const chunks = Array.from(this.chunks.values());
    const files = new Set(chunks.map((chunk) => chunk.metadata.file));
    const totalSize = chunks.reduce(
      (sum, chunk) => sum + chunk.content.length,
      0
    );

    const typeDistribution: Record<string, number> = {};
    chunks.forEach((chunk) => {
      typeDistribution[chunk.metadata.type] =
        (typeDistribution[chunk.metadata.type] || 0) + 1;
    });

    return {
      totalChunks: chunks.length,
      totalFiles: files.size,
      averageChunkSize:
        chunks.length > 0 ? Math.round(totalSize / chunks.length) : 0,
      typeDistribution,
    };
  }

  updateIndexingOptions(options: Partial<IndexingOptions>): void {
    this.indexingOptions = { ...this.indexingOptions, ...options };
  }

  getIndexingOptions(): IndexingOptions {
    return { ...this.indexingOptions };
  }

  clearIndex(): void {
    this.chunks.clear();
    new Notice("Index cleared");
  }

  exportIndex(): string {
    return JSON.stringify(Array.from(this.chunks.values()), null, 2);
  }

  importIndex(indexData: string): void {
    try {
      const chunks = JSON.parse(indexData) as DocumentChunk[];
      this.chunks.clear();

      chunks.forEach((chunk) => {
        this.chunks.set(chunk.id, chunk);
      });

      new Notice(`Imported ${chunks.length} chunks`);
    } catch (error) {
      console.error("Error importing index:", error);
      new Notice("Error importing index");
    }
  }
}
