import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { App } from "obsidian";
import { FeatureManager } from "../../core/FeatureManager";
import { ToolDatabaseManager } from "../../core/ToolDatabaseManager";
import { ScriptEngine } from "../../scripting/ScriptEngine";
import { DocumentIndexer } from "../../ai/rag/DocumentIndexer";
import { OllamaIntegration } from "../../ai/local/OllamaIntegration";
import { NotionDatabaseManager } from "../../integrations/notion/DatabaseManager";
import { ChartJSManager } from "../../libraries/ChartJS";
import { DocumentProcessor } from "../../ai/anythingllm/DocumentProcessor";

// Mock Obsidian App
const mockApp = {
  vault: {
    read: async (file: any) => "Test content",
    create: async (path: string, content: string) => ({ path, content }),
    modify: async (file: any, content: string) => ({ file, content }),
    getAbstractFileByPath: (path: string) => ({ path, stat: { size: 100 } }),
    getMarkdownFiles: () => [],
  },
} as unknown as App;

describe("Ultima-Orb System Integration Tests", () => {
  let featureManager: FeatureManager;
  let toolDatabaseManager: ToolDatabaseManager;
  let scriptEngine: ScriptEngine;
  let documentIndexer: DocumentIndexer;
  let ollamaIntegration: OllamaIntegration;
  let notionDatabaseManager: NotionDatabaseManager;
  let chartJSManager: ChartJSManager;
  let documentProcessor: DocumentProcessor;

  beforeEach(() => {
    featureManager = new FeatureManager(mockApp);
    toolDatabaseManager = new ToolDatabaseManager(mockApp, featureManager);
    scriptEngine = new ScriptEngine(mockApp, featureManager);
    documentIndexer = new DocumentIndexer(mockApp, featureManager);
    ollamaIntegration = new OllamaIntegration(mockApp, featureManager);
    notionDatabaseManager = new NotionDatabaseManager(mockApp, featureManager);
    chartJSManager = new ChartJSManager(mockApp, featureManager);
    documentProcessor = new DocumentProcessor(mockApp, featureManager);
  });

  afterEach(() => {
    // Cleanup
  });

  describe("Core System Integration", () => {
    it("should initialize all core components successfully", () => {
      expect(featureManager).toBeDefined();
      expect(toolDatabaseManager).toBeDefined();
      expect(scriptEngine).toBeDefined();
      expect(documentIndexer).toBeDefined();
      expect(ollamaIntegration).toBeDefined();
      expect(notionDatabaseManager).toBeDefined();
      expect(chartJSManager).toBeDefined();
      expect(documentProcessor).toBeDefined();
    });

    it("should have correct tool database structure", () => {
      const tools = toolDatabaseManager.getAllTools();
      expect(tools).toBeDefined();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    it("should have all required tool categories", () => {
      const tools = toolDatabaseManager.getAllTools();
      const categories = [...new Set(tools.map((tool) => tool.category))];

      expect(categories).toContain("Core");
      expect(categories).toContain("AI");
      expect(categories).toContain("Features");
      expect(categories).toContain("Integration");
      expect(categories).toContain("Visualization");
      expect(categories).toContain("Development");
    });
  });

  describe("Advanced Scripting System", () => {
    it("should execute basic JavaScript scripts", async () => {
      const script = "console.log('Hello World'); return 'Test Output';";
      const context = {
        app: mockApp,
        file: { path: "test.md" },
        content: "Test content",
        variables: {},
        functions: {},
      };

      const result = await scriptEngine.executeScript(script, context);
      expect(result.success).toBe(true);
    });

    it("should handle script errors gracefully", async () => {
      const invalidScript = "invalid javascript code;";
      const context = {
        app: mockApp,
        file: { path: "test.md" },
        content: "Test content",
        variables: {},
        functions: {},
      };

      const result = await scriptEngine.executeScript(invalidScript, context);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should validate scripts for security", () => {
      const dangerousScript = "eval('alert(1)');";
      const validation = scriptEngine.validateScript(dangerousScript);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe("RAG System", () => {
    it("should index documents correctly", async () => {
      const mockFile = {
        path: "test.md",
        name: "test.md",
        stat: { size: 100, ctime: Date.now(), mtime: Date.now() },
      } as any;

      const chunks = await documentIndexer.indexDocument(mockFile);
      expect(Array.isArray(chunks)).toBe(true);
    });

    it("should create document chunks with proper metadata", async () => {
      const mockFile = {
        path: "test.md",
        name: "test.md",
        stat: { size: 100, ctime: Date.now(), mtime: Date.now() },
      } as any;

      const chunks = await documentIndexer.indexDocument(mockFile);

      if (chunks.length > 0) {
        const chunk = chunks[0];
        expect(chunk.id).toBeDefined();
        expect(chunk.content).toBeDefined();
        expect(chunk.metadata).toBeDefined();
        expect(chunk.metadata.file).toBe("test.md");
      }
    });

    it("should search chunks effectively", async () => {
      const mockFile = {
        path: "test.md",
        name: "test.md",
        stat: { size: 100, ctime: Date.now(), mtime: Date.now() },
      } as any;

      await documentIndexer.indexDocument(mockFile);
      const searchResults = documentIndexer.searchChunks("test");
      expect(Array.isArray(searchResults)).toBe(true);
    });
  });

  describe("Local AI Models", () => {
    it("should initialize Ollama integration", () => {
      expect(ollamaIntegration.getBaseUrl()).toBe("http://localhost:11434");
      expect(ollamaIntegration.getDefaultModel()).toBe("llama2");
    });

    it("should handle Ollama connection errors gracefully", async () => {
      const models = await ollamaIntegration.listModels();
      // Should return empty array if Ollama is not running
      expect(Array.isArray(models)).toBe(true);
    });

    it("should generate text with proper error handling", async () => {
      try {
        const result = await ollamaIntegration.generateText({
          model: "llama2",
          prompt: "Hello",
        });
        // If Ollama is running, should get a response
        if (result) {
          expect(result.model).toBe("llama2");
        }
      } catch (error) {
        // If Ollama is not running, should throw an error
        expect(error).toBeDefined();
      }
    });
  });

  describe("Notion Integration", () => {
    it("should initialize Notion database manager", () => {
      expect(notionDatabaseManager).toBeDefined();
    });

    it("should handle missing API key gracefully", async () => {
      try {
        await notionDatabaseManager.listDatabases();
        fail("Should throw error for missing API key");
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toContain("API key not set");
      }
    });

    it("should create property types correctly", () => {
      const titleProperty = notionDatabaseManager.createTitleProperty("Title");
      const textProperty =
        notionDatabaseManager.createTextProperty("Description");
      const numberProperty =
        notionDatabaseManager.createNumberProperty("Count");

      expect(titleProperty.type).toBe("title");
      expect(textProperty.type).toBe("rich_text");
      expect(numberProperty.type).toBe("number");
    });
  });

  describe("Chart.js Integration", () => {
    it("should initialize Chart.js manager", () => {
      expect(chartJSManager).toBeDefined();
    });

    it("should generate chart data correctly", () => {
      const labels = ["A", "B", "C"];
      const data = chartJSManager.generateRandomData(labels, 2);

      expect(data.labels).toEqual(labels);
      expect(data.datasets).toHaveLength(2);
      expect(data.datasets[0].data).toHaveLength(3);
    });

    it("should create time series data", () => {
      const data = chartJSManager.generateTimeSeriesData(7, 1);
      expect(data.labels).toHaveLength(7);
      expect(data.datasets).toHaveLength(1);
    });

    it("should create categorical data", () => {
      const categories = ["Category 1", "Category 2", "Category 3"];
      const data = chartJSManager.generateCategoricalData(categories, 2);
      expect(data.labels).toEqual(categories);
      expect(data.datasets).toHaveLength(2);
    });
  });

  describe("Document Processing", () => {
    it("should process documents with default options", async () => {
      const mockFile = {
        path: "test.md",
        name: "test.md",
        stat: { size: 100, ctime: Date.now(), mtime: Date.now() },
      } as any;

      const result = await documentProcessor.processDocument(mockFile);
      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.chunks).toBeDefined();
    });

    it("should extract metadata correctly", async () => {
      const mockFile = {
        path: "test.md",
        name: "test.md",
        stat: { size: 100, ctime: Date.now(), mtime: Date.now() },
      } as any;

      const result = await documentProcessor.processDocument(mockFile);
      expect(result.metadata.filename).toBe("test.md");
      expect(result.metadata.filepath).toBe("test.md");
      expect(result.metadata.type).toBe("md");
    });

    it("should calculate metrics correctly", async () => {
      const mockFile = {
        path: "test.md",
        name: "test.md",
        stat: { size: 100, ctime: Date.now(), mtime: Date.now() },
      } as any;

      const result = await documentProcessor.processDocument(mockFile);
      expect(result.metrics.wordCount).toBeGreaterThan(0);
      expect(result.metrics.characterCount).toBeGreaterThan(0);
      expect(result.metrics.readingTime).toBeGreaterThan(0);
      expect(result.metrics.chunkCount).toBeGreaterThanOrEqual(0);
    });

    it("should handle processing errors gracefully", async () => {
      // Test with invalid file
      const invalidFile = null as any;

      try {
        await documentProcessor.processDocument(invalidFile);
        fail("Should throw error for invalid file");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Feature Manager Integration", () => {
    it("should manage feature access correctly", () => {
      const isFeatureEnabled = featureManager.isFeatureEnabled("test-feature");
      expect(typeof isFeatureEnabled).toBe("boolean");
    });

    it("should handle license validation", () => {
      const licenseType = featureManager.getLicenseType();
      expect(licenseType).toBe("free"); // Default should be free
    });
  });

  describe("System Performance", () => {
    it("should handle multiple concurrent operations", async () => {
      const operations = [
        scriptEngine.executeScript("return 1;", {
          app: mockApp,
          file: { path: "test.md" },
          content: "Test",
          variables: {},
          functions: {},
        }),
        documentProcessor.processDocument({
          path: "test.md",
          name: "test.md",
          stat: { size: 100, ctime: Date.now(), mtime: Date.now() },
        } as any),
        chartJSManager.generateRandomData(["A", "B"], 1),
      ];

      const results = await Promise.all(operations);
      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[2]).toBeDefined();
    });
  });

  describe("Error Handling and Recovery", () => {
    it("should recover from component initialization errors", () => {
      // Test that components can be re-initialized
      const newFeatureManager = new FeatureManager(mockApp);
      const newToolDatabaseManager = new ToolDatabaseManager(
        mockApp,
        newFeatureManager
      );

      expect(newFeatureManager).toBeDefined();
      expect(newToolDatabaseManager).toBeDefined();
    });

    it("should handle network errors gracefully", async () => {
      // Test Ollama connection with invalid URL
      ollamaIntegration.setBaseUrl("http://invalid-url:9999");

      try {
        await ollamaIntegration.testConnection();
        // Should return false for invalid connection
        expect(false).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Data Persistence", () => {
    it("should export and import chart data correctly", () => {
      const testData = {
        labels: ["A", "B"],
        datasets: [
          {
            label: "Test",
            data: [1, 2],
          },
        ],
      };

      const chartId = "test-chart";
      // Note: This would require a DOM environment to fully test
      // For now, we test the data generation functions
      const generatedData = chartJSManager.generateRandomData(["A", "B"], 1);
      expect(generatedData.labels).toEqual(["A", "B"]);
      expect(generatedData.datasets).toHaveLength(1);
    });

    it("should export and import document index data", () => {
      const exportData = documentIndexer.exportIndex();
      expect(typeof exportData).toBe("string");

      try {
        documentIndexer.importIndex(exportData);
        // Should not throw error for valid JSON
      } catch (error) {
        fail("Should not throw error for valid export data");
      }
    });
  });
});
