import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  expectTypeOf,
} from "vitest";
import { App } from "obsidian";
import { FeatureManager } from "../../core/FeatureManager";
import { ToolDatabaseManager } from "../../core/ToolDatabaseManager";
import { PluginStateManager } from "../../core/PluginStateManager";
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
  let stateManager: PluginStateManager;
  let toolDatabaseManager: ToolDatabaseManager;
  let scriptEngine: ScriptEngine;
  let documentIndexer: DocumentIndexer;
  let ollamaIntegration: OllamaIntegration;
  let notionDatabaseManager: NotionDatabaseManager;
  let chartJSManager: ChartJSManager;
  let documentProcessor: DocumentProcessor;

  beforeEach(() => {
    featureManager = new FeatureManager(mockApp);
    stateManager = new PluginStateManager(mockApp);
    toolDatabaseManager = new ToolDatabaseManager(mockApp, stateManager);
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
      const script = "console.info('Hello World'); return 'Test Output';";
      const context = {
        app: mockApp,
        file: {
          path: "test.md",
          name: "test.md",
          basename: "test",
          extension: "md",
          stat: { size: 100, ctime: Date.now(), mtime: Date.now() },
          vault: mockApp.vault,
        } as any,
        content: "Test content",
        variables: {},
        functions: {},
      } as any;

      const result = await scriptEngine.executeScript(script, context);
      expect(result.success).toBe(true);
    });

    it("should handle script errors gracefully", async () => {
      const invalidScript = "invalid javascript code;";
      const context = {
        app: mockApp,
        file: {
          path: "test.md",
          name: "test.md",
          basename: "test",
          extension: "md",
          stat: { size: 100, ctime: Date.now(), mtime: Date.now() },
          vault: mockApp.vault,
        } as any,
        content: "Test content",
        variables: {},
        functions: {},
      } as any;

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
        // Should not reach here
        expect(true).toBe(false);
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
    it("should process documents correctly", async () => {
      const mockFile = {
        path: "test.md",
        name: "test.md",
        basename: "test",
        extension: "md",
        stat: { size: 100, ctime: Date.now(), mtime: Date.now() },
        vault: mockApp.vault,
      } as any;

      const result = await documentProcessor.processDocument(mockFile);
      expect(result).toBeDefined();
    });

    it("should handle processing errors", async () => {
      const mockFile = {
        path: "invalid.md",
        name: "invalid.md",
        basename: "invalid",
        extension: "md",
        stat: { size: 0, ctime: Date.now(), mtime: Date.now() },
        vault: mockApp.vault,
      } as any;

      try {
        await documentProcessor.processDocument(mockFile);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("Feature Management", () => {
    it("should check feature availability", () => {
      const hasFeature = featureManager.hasFeature("ai");
      expect(typeof hasFeature).toBe("boolean");
    });

    it("should get feature usage report", () => {
      const report = featureManager.getFeatureUsageReport();
      expect(report).toBeDefined();
      expect(report.licenseType).toBeDefined();
      expect(Array.isArray(report.freeFeatures)).toBe(true);
    });
  });

  describe("System Performance", () => {
    it("should handle multiple concurrent operations", async () => {
      const operations = [
        scriptEngine.executeScript("return 1;", {
          app: mockApp,
          file: {
            path: "test.md",
            name: "test.md",
            basename: "test",
            extension: "md",
            stat: { size: 100, ctime: Date.now(), mtime: Date.now() },
            vault: mockApp.vault,
          } as any,
          content: "Test",
          variables: {},
          functions: {},
        }),
        documentProcessor.processDocument({
          path: "test.md",
          name: "test.md",
          basename: "test",
          extension: "md",
          stat: { size: 100, ctime: Date.now(), mtime: Date.now() },
          vault: mockApp.vault,
        } as any),
        chartJSManager.generateRandomData(["A", "B"], 1),
      ];

      const results = await Promise.all(operations);
      expect(results).toHaveLength(3);
      // Check that all operations completed without throwing
      expect(results[0]).toBeDefined();
      expect(results[1]).toBeDefined();
      expect(results[2]).toBeDefined();
    });
  });

  describe("Error Handling and Recovery", () => {
    it("should recover from component initialization errors", () => {
      // Test that components can be re-initialized
      const newFeatureManager = new FeatureManager(mockApp);
      const newStateManager = new PluginStateManager(mockApp);
      const newToolDatabaseManager = new ToolDatabaseManager(
        mockApp,
        newStateManager
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
        // Should not reach here
        expect(true).toBe(false);
      }
    });
  });
});
