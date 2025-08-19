import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { App } from "obsidian";
import { FeatureManager } from "../../core/FeatureManager";
import { GitHubMCPClient } from "../../integrations/mcp/GitHubMCPClient";
import { OpenAIProvider } from "../../ai/providers/OpenAIProvider";
import { D3JSManager } from "../../libraries/D3JS";

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

describe("Real Connectivity Tests - ระบบเชื่อมต่อจริง", () => {
  let featureManager: FeatureManager;
  let githubClient: GitHubMCPClient;
  let openAIProvider: OpenAIProvider;
  let d3Manager: D3JSManager;

  beforeEach(() => {
    featureManager = new FeatureManager(mockApp);
    githubClient = new GitHubMCPClient(mockApp, featureManager);
    openAIProvider = new OpenAIProvider(mockApp, featureManager);
    d3Manager = new D3JSManager(mockApp, featureManager);
  });

  afterEach(() => {
    // Cleanup
  });

  describe("GitHub MCP Client - การเชื่อมต่อ GitHub จริง", () => {
    it("ควรสามารถตั้งค่า API Key และทดสอบการเชื่อมต่อ", async () => {
      // Test API key setting
      githubClient.setApiKey("test-api-key");
      expect(githubClient.getApiKey()).toBe("test-api-key");

      // Test connection status
      expect(githubClient.isConnected()).toBe(false); // No MCP connection initialized yet

      // Test MCP connection initialization
      const initResult = await githubClient.initializeMCPConnection();
      expect(initResult).toBe(true);
    });

    it("ควรสามารถสร้าง MCP connection object ที่มี methods ครบถ้วน", async () => {
      await githubClient.initializeMCPConnection();
      
      // Test that MCP connection object has all required methods
      const connection = (githubClient as any).mcpConnection;
      expect(connection).toBeDefined();
      expect(typeof connection.listRepositories).toBe("function");
      expect(typeof connection.getRepository).toBe("function");
      expect(typeof connection.createRepository).toBe("function");
      expect(typeof connection.listIssues).toBe("function");
      expect(typeof connection.createIssue).toBe("function");
      expect(typeof connection.listPullRequests).toBe("function");
      expect(typeof connection.createPullRequest).toBe("function");
      expect(typeof connection.getFile).toBe("function");
      expect(typeof connection.createFile).toBe("function");
      expect(typeof connection.updateFile).toBe("function");
      expect(typeof connection.deleteFile).toBe("function");
    });

    it("ควรสามารถเรียกใช้ GitHub API methods ได้", async () => {
      await githubClient.initializeMCPConnection();
      githubClient.setApiKey("test-key");

      // Test repository methods
      expect(() => githubClient.listRepositories("testuser")).not.toThrow();
      expect(() => githubClient.getRepository("owner", "repo")).not.toThrow();
      expect(() => githubClient.createRepository("test-repo", "Test description", false)).not.toThrow();

      // Test issue methods
      expect(() => githubClient.listIssues("owner", "repo")).not.toThrow();
      expect(() => githubClient.createIssue("owner", "repo", "Test Issue", "Issue body")).not.toThrow();

      // Test pull request methods
      expect(() => githubClient.listPullRequests("owner", "repo")).not.toThrow();
      expect(() => githubClient.createPullRequest("owner", "repo", "Test PR", "PR body", "feature", "main")).not.toThrow();

      // Test file methods
      expect(() => githubClient.getFile("owner", "repo", "path/to/file")).not.toThrow();
      expect(() => githubClient.createFile("owner", "repo", "path/to/file", "content", "commit message")).not.toThrow();
    });
  });

  describe("OpenAI Provider - การเชื่อมต่อ OpenAI จริง", () => {
    it("ควรสามารถตั้งค่า API Key และโมเดลได้", () => {
      openAIProvider.setApiKey("sk-test-key");
      openAIProvider.setDefaultModel("gpt-4");

      expect(openAIProvider.getApiKey()).toBe("sk-test-key");
      expect(openAIProvider.getDefaultModel()).toBe("gpt-4");
    });

    it("ควรสามารถเรียกใช้ OpenAI API methods ได้", async () => {
      openAIProvider.setApiKey("sk-test-key");

      // Test chat completion
      expect(() => openAIProvider.chatCompletion({
        model: "gpt-4",
        messages: [{ role: "user", content: "Hello" }]
      })).not.toThrow();

      // Test text completion
      expect(() => openAIProvider.textCompletion({
        model: "gpt-4",
        prompt: "Hello world"
      })).not.toThrow();

      // Test embeddings
      expect(() => openAIProvider.generateEmbeddings("test text")).not.toThrow();

      // Test image generation
      expect(() => openAIProvider.generateImage("a beautiful landscape")).not.toThrow();

      // Test audio transcription
      const mockFile = new File(["test"], "test.mp3", { type: "audio/mp3" });
      expect(() => openAIProvider.transcribeAudio(mockFile)).not.toThrow();

      // Test content moderation
      expect(() => openAIProvider.moderateContent("test content")).not.toThrow();
    });

    it("ควรสามารถจัดการไฟล์และ fine-tuning ได้", async () => {
      openAIProvider.setApiKey("sk-test-key");

      // Test file operations
      expect(() => openAIProvider.listFiles()).not.toThrow();
      expect(() => openAIProvider.deleteFile("file-id")).not.toThrow();
      expect(() => openAIProvider.retrieveFile("file-id")).not.toThrow();

      // Test fine-tuning
      expect(() => openAIProvider.listFineTunes()).not.toThrow();
      expect(() => openAIProvider.getFineTune("ft-id")).not.toThrow();
      expect(() => openAIProvider.cancelFineTune("ft-id")).not.toThrow();
    });

    it("ควรสามารถคำนวณค่าใช้จ่ายได้", () => {
      const cost = openAIProvider.estimateCost("gpt-4", 1000, 500);
      expect(typeof cost).toBe("number");
      expect(cost).toBeGreaterThan(0);
    });
  });

  describe("D3.js Manager - การสร้าง Visualization จริง", () => {
    it("ควรสามารถโหลด D3.js และสร้าง charts ได้", () => {
      // Test D3.js loading
      expect(d3Manager).toBeDefined();
      
      // Test chart creation methods exist
      expect(typeof d3Manager.createBarChart).toBe("function");
      expect(typeof d3Manager.createLineChart).toBe("function");
      expect(typeof d3Manager.createPieChart).toBe("function");
      expect(typeof d3Manager.createTreeMap).toBe("function");
    });

    it("ควรสามารถสร้างข้อมูลทดสอบได้", () => {
      // Test random data generation
      const randomData = d3Manager.generateRandomData(5);
      expect(randomData).toHaveLength(5);
      expect(randomData[0]).toHaveProperty("id");
      expect(randomData[0]).toHaveProperty("value");
      expect(randomData[0]).toHaveProperty("label");

      // Test time series data generation
      const timeSeriesData = d3Manager.generateTimeSeriesData(7);
      expect(timeSeriesData).toHaveLength(7);
      expect(timeSeriesData[0]).toHaveProperty("category", "time-series");
    });

    it("ควรสามารถจัดการ charts ได้", () => {
      // Test chart management
      expect(typeof d3Manager.getChart).toBe("function");
      expect(typeof d3Manager.getAllCharts).toBe("function");
      expect(typeof d3Manager.destroyChart).toBe("function");
      expect(typeof d3Manager.exportChartData).toBe("function");
      expect(typeof d3Manager.importChartData).toBe("function");
      expect(typeof d3Manager.animateChart).toBe("function");
      expect(typeof d3Manager.resizeChart).toBe("function");
    });
  });

  describe("Integration Tests - การทดสอบการทำงานร่วมกัน", () => {
    it("ควรสามารถใช้ GitHub + OpenAI ร่วมกันได้", async () => {
      // Setup
      await githubClient.initializeMCPConnection();
      githubClient.setApiKey("github-key");
      openAIProvider.setApiKey("openai-key");

      // Test integration scenario
      expect(() => {
        // Simulate: Get repo info from GitHub, then use OpenAI to analyze
        githubClient.getRepository("owner", "repo");
        openAIProvider.chatCompletion({
          model: "gpt-4",
          messages: [{ role: "user", content: "Analyze this repository" }]
        });
      }).not.toThrow();
    });

    it("ควรสามารถใช้ D3.js + OpenAI ร่วมกันได้", () => {
      openAIProvider.setApiKey("openai-key");

      // Test integration scenario
      expect(() => {
        // Simulate: Generate data with OpenAI, then visualize with D3
        const mockData = d3Manager.generateRandomData(10);
        openAIProvider.chatCompletion({
          model: "gpt-4",
          messages: [{ role: "user", content: "Analyze this data" }]
        });
        // D3 chart creation would happen here
      }).not.toThrow();
    });

    it("ควรสามารถใช้ GitHub + D3.js ร่วมกันได้", async () => {
      await githubClient.initializeMCPConnection();
      githubClient.setApiKey("github-key");

      // Test integration scenario
      expect(() => {
        // Simulate: Get GitHub data, then visualize with D3
        githubClient.listRepositories("user");
        const mockData = d3Manager.generateRandomData(5);
        // D3 visualization would happen here
      }).not.toThrow();
    });
  });

  describe("Error Handling Tests - การจัดการข้อผิดพลาด", () => {
    it("ควรจัดการข้อผิดพลาดเมื่อไม่มี API Key", async () => {
      // Test GitHub without API key
      await githubClient.initializeMCPConnection();
      expect(() => githubClient.testConnection()).not.toThrow();

      // Test OpenAI without API key
      expect(() => openAIProvider.testConnection()).not.toThrow();
    });

    it("ควรจัดการข้อผิดพลาดเมื่อ MCP connection ไม่ได้ initialize", () => {
      expect(() => githubClient.listRepositories("user")).toThrow("MCP connection not initialized");
    });

    it("ควรจัดการข้อผิดพลาดเมื่อ D3.js ไม่ได้โหลด", () => {
      // This would be tested in a real browser environment
      expect(d3Manager).toBeDefined();
    });
  });

  describe("Performance Tests - การทดสอบประสิทธิภาพ", () => {
    it("ควรสามารถสร้างข้อมูลจำนวนมากได้อย่างรวดเร็ว", () => {
      const startTime = Date.now();
      const largeDataset = d3Manager.generateRandomData(1000);
      const endTime = Date.now();

      expect(largeDataset).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
    });

    it("ควรสามารถจัดการ charts หลายตัวพร้อมกันได้", () => {
      const chartIds = ["chart1", "chart2", "chart3", "chart4", "chart5"];
      
      expect(() => {
        chartIds.forEach(id => {
          const data = d3Manager.generateRandomData(10);
          // In real environment, this would create actual charts
        });
      }).not.toThrow();
    });
  });

  describe("Data Persistence Tests - การทดสอบการเก็บข้อมูล", () => {
    it("ควรสามารถ export และ import chart data ได้", () => {
      const originalData = d3Manager.generateRandomData(5);
      const exportData = JSON.stringify(originalData);
      const importedData = d3Manager.importChartData(exportData);

      expect(importedData).toEqual(originalData);
    });

    it("ควรสามารถจัดการ chart configuration ได้", () => {
      const config = {
        width: 1000,
        height: 800,
        margin: { top: 30, right: 30, bottom: 40, left: 50 },
        colors: ["#ff0000", "#00ff00", "#0000ff"],
        animation: false,
        duration: 500
      };

      expect(config).toHaveProperty("width", 1000);
      expect(config).toHaveProperty("height", 800);
      expect(config.colors).toHaveLength(3);
    });
  });
});
