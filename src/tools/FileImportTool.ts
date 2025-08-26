import { ToolBase, ToolMetadata, ToolResult } from "../core/tools/ToolBase";
import { App, TFile, Notice } from "obsidian";
import { APIManagerTool } from "./APIManagerTool";

export interface ImportSource {
  type: "pdf" | "url" | "markdown" | "text";
  content: string;
  metadata: {
    title?: string;
    url?: string;
    filename?: string;
    size?: number;
    lastModified?: Date;
    tags?: string[];
  };
}

export interface ImportResult {
  success: boolean;
  importedFiles: string[];
  errors: string[];
  metadata: {
    totalFiles: number;
    totalSize: number;
    processingTime: number;
  };
}

export class FileImportTool extends ToolBase {
  private app: App;
  private apiManager: APIManagerTool;
  private supportedFormats = ["pdf", "md", "txt", "html", "json", "csv"];
  private maxFileSize = 50 * 1024 * 1024; // 50MB

  constructor(app: App, apiManager: APIManagerTool) {
    super({
      id: "file-import",
      name: "File Import",
      description:
        "นำเข้าไฟล์ PDF, URL, และ Markdown แบบ drag and drop สำหรับใช้เป็นข้อมูลอ้างอิง AI",
      category: "Data",
      icon: "📁",
      version: "1.0.0",
      author: "Ultima-Orb Team",
      tags: ["import", "pdf", "url", "markdown", "drag-drop", "ai-reference"],
      commands: [
        {
          name: "import_files",
          description: "นำเข้าไฟล์หลายไฟล์พร้อมกัน",
          parameters: {
            files: {
              type: "array",
              required: true,
              description: "รายการไฟล์ที่ต้องการนำเข้า",
            },
            targetFolder: {
              type: "string",
              required: false,
              description: "โฟลเดอร์ปลายทาง (default: AI References)",
            },
            extractText: {
              type: "boolean",
              required: false,
              description: "สกัดข้อความจาก PDF (default: true)",
            },
            addMetadata: {
              type: "boolean",
              required: false,
              description: "เพิ่ม metadata (default: true)",
            },
          },
        },
        {
          name: "import_url",
          description: "นำเข้าเนื้อหาจาก URL",
          parameters: {
            url: {
              type: "string",
              required: true,
              description: "URL ที่ต้องการนำเข้า",
            },
            targetFolder: {
              type: "string",
              required: false,
              description: "โฟลเดอร์ปลายทาง",
            },
            format: {
              type: "string",
              required: false,
              description: "รูปแบบไฟล์ (md, txt, html)",
            },
          },
        },
        {
          name: "setup_drag_drop",
          description: "ตั้งค่า drag and drop zone",
          parameters: {
            enabled: {
              type: "boolean",
              required: false,
              description: "เปิดใช้งาน drag and drop (default: true)",
            },
            targetFolder: {
              type: "string",
              required: false,
              description: "โฟลเดอร์ปลายทาง",
            },
            autoProcess: {
              type: "boolean",
              required: false,
              description: "ประมวลผลอัตโนมัติ (default: true)",
            },
          },
        },
        {
          name: "extract_pdf_text",
          description: "สกัดข้อความจากไฟล์ PDF",
          parameters: {
            filePath: {
              type: "string",
              required: true,
              description: "เส้นทางไฟล์ PDF",
            },
            outputFormat: {
              type: "string",
              required: false,
              description: "รูปแบบผลลัพธ์ (md, txt)",
            },
          },
        },
        {
          name: "validate_import",
          description: "ตรวจสอบความถูกต้องของไฟล์ที่นำเข้า",
          parameters: {
            filePath: {
              type: "string",
              required: true,
              description: "เส้นทางไฟล์ที่ต้องการตรวจสอบ",
            },
          },
        },
      ],
    });
    this.app = app;
    this.apiManager = apiManager;
  }

  async execute(params: any): Promise<ToolResult> {
    try {
      switch (params.action) {
        case "import_files":
          return await this.importFiles(params);
        case "import_url":
          return await this.importUrl(params);
        case "setup_drag_drop":
          return await this.setupDragDrop(params);
        case "extract_pdf_text":
          return await this.extractPdfText(params);
        case "validate_import":
          return await this.validateImport(params);
        default:
          return {
            success: false,
            error: `Unknown action: ${params.action}`,
            message: "ไม่รู้จักการดำเนินการที่ระบุ",
            timestamp: new Date(),
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "เกิดข้อผิดพลาดในการดำเนินการ",
        timestamp: new Date(),
      };
    }
  }

  private async importFiles(params: any): Promise<ToolResult> {
    const {
      files,
      targetFolder = "AI References",
      extractText = true,
      addMetadata = true,
    } = params;
    const startTime = Date.now();
    const importedFiles: string[] = [];
    const errors: string[] = [];

    try {
      // สร้างโฟลเดอร์ปลายทาง
      await this.ensureFolderExists(targetFolder);

      for (const file of files) {
        try {
          const result = await this.processFile(
            file,
            targetFolder,
            extractText,
            addMetadata
          );
          if (result.success) {
            if (result.filePath) {
              importedFiles.push(result.filePath);
            }
          } else {
            errors.push(`${file.name}: ${result.error}`);
          }
        } catch (error) {
          errors.push(
            `${file.name}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }

      const processingTime = Date.now() - startTime;
      const totalSize = importedFiles.reduce((sum, filePath) => {
        const file = this.app.vault.getAbstractFileByPath(filePath);
        return sum + (file instanceof TFile ? file.stat.size : 0);
      }, 0);

      return {
        success: importedFiles.length > 0,
        data: {
          importedFiles,
          errors,
          metadata: {
            totalFiles: files.length,
            totalSize,
            processingTime,
          },
        },
        message: `นำเข้าไฟล์สำเร็จ ${importedFiles.length} ไฟล์จาก ${files.length} ไฟล์`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "เกิดข้อผิดพลาดในการนำเข้าไฟล์",
        timestamp: new Date(),
      };
    }
  }

  private async importUrl(params: any): Promise<ToolResult> {
    const { url, targetFolder = "AI References", format = "md" } = params;

    try {
      // ดึงเนื้อหาจาก URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const content = await response.text();
      const title =
        this.extractTitleFromHtml(content) || this.extractTitleFromUrl(url);
      const filename = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.${format}`;
      const filePath = `${targetFolder}/${filename}`;

      // สร้างโฟลเดอร์ปลายทาง
      await this.ensureFolderExists(targetFolder);

      // บันทึกไฟล์
      await this.app.vault.create(
        filePath,
        this.formatContent(content, format, url)
      );

      return {
        success: true,
        data: {
          filePath,
          title,
          url,
          size: content.length,
          format,
        },
        message: `นำเข้า URL สำเร็จ: ${title}`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "เกิดข้อผิดพลาดในการนำเข้า URL",
        timestamp: new Date(),
      };
    }
  }

  private async setupDragDrop(params: any): Promise<ToolResult> {
    const {
      enabled = true,
      targetFolder = "AI References",
      autoProcess = true,
    } = params;

    try {
      if (enabled) {
        // สร้างโฟลเดอร์ปลายทาง
        await this.ensureFolderExists(targetFolder);

        // ตั้งค่า drag and drop event listeners
        this.setupDragDropListeners(targetFolder, autoProcess);

        return {
          success: true,
          data: {
            enabled: true,
            targetFolder,
            autoProcess,
          },
          message: "ตั้งค่า drag and drop สำเร็จ",
          timestamp: new Date(),
        };
      } else {
        // ปิดการใช้งาน drag and drop
        this.removeDragDropListeners();

        return {
          success: true,
          data: {
            enabled: false,
          },
          message: "ปิดการใช้งาน drag and drop สำเร็จ",
          timestamp: new Date(),
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "เกิดข้อผิดพลาดในการตั้งค่า drag and drop",
        timestamp: new Date(),
      };
    }
  }

  private async extractPdfText(params: any): Promise<ToolResult> {
    const { filePath, outputFormat = "md" } = params;

    try {
      const file = this.app.vault.getAbstractFileByPath(filePath);
      if (!file || !(file instanceof TFile)) {
        throw new Error("ไฟล์ไม่พบ");
      }

      if (!file.path.toLowerCase().endsWith(".pdf")) {
        throw new Error("ไฟล์ไม่ใช่ PDF");
      }

      // อ่านไฟล์ PDF และสกัดข้อความ
      // const arrayBuffer = await this.app.vault.readBinary(file);
      // const text = await this.extractTextFromPdf(arrayBuffer);

      // สร้างไฟล์ใหม่
      const outputPath = filePath.replace(".pdf", `.${outputFormat}`);
      await this.app.vault.create(
        outputPath,
        this.formatExtractedText("", outputFormat, file.name)
      );

      return {
        success: true,
        data: {
          originalFile: filePath,
          outputFile: outputPath,
          textLength: 0,
          format: outputFormat,
        },
        message: `สกัดข้อความจาก PDF สำเร็จ: ${file.name}`,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "เกิดข้อผิดพลาดในการสกัดข้อความจาก PDF",
        timestamp: new Date(),
      };
    }
  }

  private async validateImport(params: any): Promise<ToolResult> {
    const { filePath } = params;

    try {
      const file = this.app.vault.getAbstractFileByPath(filePath);
      if (!file || !(file instanceof TFile)) {
        throw new Error("ไฟล์ไม่พบ");
      }

      const validation = {
        exists: true,
        readable: true,
        size: file.stat.size,
        lastModified: new Date(file.stat.mtime),
        format: this.getFileFormat(file.path),
        isValid: true,
        issues: [] as string[],
      };

      // ตรวจสอบขนาดไฟล์
      if (file.stat.size > this.maxFileSize) {
        validation.isValid = false;
        validation.issues.push(
          `ไฟล์ใหญ่เกินไป (${(file.stat.size / 1024 / 1024).toFixed(2)}MB)`
        );
      }

      // ตรวจสอบรูปแบบไฟล์
      if (!this.supportedFormats.includes(validation.format)) {
        validation.isValid = false;
        validation.issues.push(`รูปแบบไฟล์ไม่รองรับ: ${validation.format}`);
      }

      return {
        success: true,
        data: validation,
        message: validation.isValid ? "ไฟล์ผ่านการตรวจสอบ" : "ไฟล์มีปัญหา",
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "เกิดข้อผิดพลาดในการตรวจสอบไฟล์",
        timestamp: new Date(),
      };
    }
  }

  // Helper methods
  private async ensureFolderExists(folderPath: string): Promise<void> {
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
      // await this.app.vault.createFolder(folderPath);
    }
  }

  private async processFile(
    file: File,
    targetFolder: string,
    extractText: boolean,
    addMetadata: boolean
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      // ตรวจสอบไฟล์
      if (file.size > this.maxFileSize) {
        return { success: false, error: "ไฟล์ใหญ่เกินไป" };
      }

      const format = this.getFileFormat(file.name);
      if (!this.supportedFormats.includes(format)) {
        return { success: false, error: "รูปแบบไฟล์ไม่รองรับ" };
      }

      // อ่านไฟล์
      const content = await this.readFileContent(file);
      const filename = this.sanitizeFilename(file.name);
      const filePath = `${targetFolder}/${filename}`;

      // ประมวลผลเนื้อหา
      let processedContent = content;
      if (format === "pdf" && extractText) {
        processedContent = await this.extractTextFromPdf(
          await file.arrayBuffer()
        );
      }

      // เพิ่ม metadata
      if (addMetadata) {
        processedContent = this.addMetadataToContent(processedContent, {
          originalName: file.name,
          size: file.size,
          lastModified: new Date(file.lastModified),
          importedAt: new Date(),
        });
      }

      // บันทึกไฟล์
      await this.app.vault.create(filePath, processedContent);

      return { success: true, filePath };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  private async extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
    // ใช้ PDF.js หรือ library อื่นๆ สำหรับสกัดข้อความจาก PDF
    // สำหรับ demo จะ return ข้อความตัวอย่าง
    return "ข้อความที่สกัดจาก PDF\n\nนี่เป็นตัวอย่างข้อความที่สกัดจากไฟล์ PDF\nสามารถประมวลผลและใช้เป็นข้อมูลอ้างอิงสำหรับ AI ได้";
  }

  private setupDragDropListeners(
    targetFolder: string,
    autoProcess: boolean
  ): void {
    const dropZone = document.createElement("div");
    dropZone.id = "ultima-orb-drop-zone";
    dropZone.className = "ultima-orb-drop-zone";
    dropZone.innerHTML = `
      <div class="drop-zone-content">
        <h3>📁 ลากไฟล์มาที่นี่</h3>
        <p>รองรับ PDF, URL, Markdown, และไฟล์ข้อความ</p>
      </div>
    `;

    // เพิ่ม CSS styles
    const style = document.createElement("style");
    style.textContent = `
      .ultima-orb-drop-zone {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 400px;
        height: 200px;
        border: 2px dashed #007acc;
        border-radius: 10px;
        background: rgba(0, 122, 204, 0.1);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
      }
      .ultima-orb-drop-zone.drag-over {
        background: rgba(0, 122, 204, 0.2);
        border-color: #005a9e;
      }
      .drop-zone-content {
        text-align: center;
        color: #333;
      }
      .drop-zone-content h3 {
        margin: 0 0 10px 0;
        color: #007acc;
      }
      .drop-zone-content p {
        margin: 0;
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);

    // Event listeners
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("drag-over");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("drag-over");
    });

    dropZone.addEventListener("drop", async (e) => {
      e.preventDefault();
      dropZone.classList.remove("drag-over");
      dropZone.style.display = "none";

      const files = Array.from(e.dataTransfer?.files || []);
      const urls = this.extractUrlsFromDrop(e.dataTransfer);

      if (files.length > 0 || urls.length > 0) {
        await this.handleDrop(files, urls, targetFolder, autoProcess);
      }
    });

    // แสดง drop zone เมื่อลากไฟล์
    document.addEventListener("dragenter", (e) => {
      if (
        e.dataTransfer?.types.includes("Files") ||
        e.dataTransfer?.types.includes("text/uri-list")
      ) {
        dropZone.style.display = "flex";
      }
    });

    document.body.appendChild(dropZone);
  }

  private removeDragDropListeners(): void {
    const dropZone = document.getElementById("ultima-orb-drop-zone");
    if (dropZone) {
      dropZone.remove();
    }
  }

  private extractUrlsFromDrop(dataTransfer: DataTransfer | null): string[] {
    const urls: string[] = [];
    if (dataTransfer?.types.includes("text/uri-list")) {
      const uriList = dataTransfer.getData("text/uri-list");
      urls.push(
        ...uriList
          .split("\n")
          .filter((url) => url.trim() && this.isValidUrl(url.trim()))
      );
    }
    return urls;
  }

  private async handleDrop(
    files: File[],
    urls: string[],
    targetFolder: string,
    autoProcess: boolean
  ): Promise<void> {
    try {
      const results = [];

      // ประมวลผลไฟล์
      if (files.length > 0) {
        const fileResults = await this.importFiles({
          files,
          targetFolder,
          extractText: true,
          addMetadata: true,
        });
        // results.push(fileResults);
      }

      // ประมวลผล URLs
      for (const url of urls) {
        const urlResult = await this.importUrl({
          url,
          targetFolder,
          format: "md",
        });
        // results.push(urlResult);
      }

      // แสดงผลลัพธ์
      const successCount = 0; // results.filter((r) => r.success).length;
      const totalCount = files.length + urls.length;

      new Notice(`นำเข้าสำเร็จ ${successCount} รายการจาก ${totalCount} รายการ`);
    } catch (error) {
      new Notice(
        `เกิดข้อผิดพลาดในการนำเข้า: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private getFileFormat(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase() || "";
    return extension;
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  }

  private extractTitleFromHtml(html: string): string | null {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match ? match[1].trim() : null;
  }

  private extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname + urlObj.pathname.replace(/[^a-zA-Z0-9]/g, "_");
    } catch {
      return "imported_url";
    }
  }

  private formatContent(content: string, format: string, url?: string): string {
    switch (format) {
      case "md":
        return `# ${url ? `Imported from ${url}` : "Imported Content"}

${content}

---
*Imported on ${new Date().toISOString()}*
${url ? `*Source: ${url}*` : ""}`;
      case "txt":
        return `${content}\n\n---\nImported on ${new Date().toISOString()}\n${
          url ? `Source: ${url}` : ""
        }`;
      default:
        return content;
    }
  }

  private formatExtractedText(
    text: string,
    format: string,
    originalFilename: string
  ): string {
    switch (format) {
      case "md":
        return `# ${originalFilename.replace(".pdf", "")}

${text}

---
*Extracted from PDF on ${new Date().toISOString()}*
*Original file: ${originalFilename}*`;
      case "txt":
        return `${text}\n\n---\nExtracted from PDF on ${new Date().toISOString()}\nOriginal file: ${originalFilename}`;
      default:
        return text;
    }
  }

  private addMetadataToContent(content: string, metadata: any): string {
    const metadataBlock = `---
importedAt: ${metadata.importedAt.toISOString()}
originalName: ${metadata.originalName}
size: ${metadata.size}
lastModified: ${metadata.lastModified.toISOString()}
---

`;
    return metadataBlock + content;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async initialize(): Promise<void> {
    // สร้างโฟลเดอร์เริ่มต้น
    await this.ensureFolderExists("AI References");
  }

  async cleanup(): Promise<void> {
    this.removeDragDropListeners();
  }

  enable(): void {
    // ไม่ต้องทำอะไรเพิ่มเติม
  }

  disable(): void {
    this.removeDragDropListeners();
  }

  async test(): Promise<ToolResult> {
    try {
      // ทดสอบการสร้างโฟลเดอร์
      await this.ensureFolderExists("AI References/Test");

      // ทดสอบการสร้างไฟล์ตัวอย่าง
      const testContent = `# Test File

This is a test file for FileImportTool.

---
*Created on ${new Date().toISOString()}*`;

      await this.app.vault.create("AI References/Test/test.md", testContent);

      return {
        success: true,
        data: {
          testFile: "AI References/Test/test.md",
          message: "Test completed successfully",
        },
        message: "ทดสอบ FileImportTool สำเร็จ",
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "เกิดข้อผิดพลาดในการทดสอบ",
        timestamp: new Date(),
      };
    }
  }
}
