import { describe, it, expect, beforeEach } from "vitest";
import { ObsidianBasesTool } from "../../tools/ObsidianBasesTool";
import { App } from "obsidian";

const mockApp = {
  vault: {
    create: async (fileName: string, content: string) => {
      return { fileName, content };
    },
    getMarkdownFiles: () => [],
    getAbstractFileByPath: (path: string) => null,
    read: async (file: any) => "",
    modify: async (file: any, content: string) => {},
  },
} as any;

describe("ObsidianBasesTool", () => {
  let obsidianBases: ObsidianBasesTool;

  beforeEach(() => {
    obsidianBases = new ObsidianBasesTool(mockApp);
  });

  describe("Tool Metadata", () => {
    it("should have correct metadata", () => {
      const metadata = obsidianBases.getMetadata();

      expect(metadata.id).toBe("obsidian-bases");
      expect(metadata.name).toBe("Obsidian Bases");
      expect(metadata.category).toBe("Obsidian");
      expect(metadata.icon).toBe("📊");
      expect(metadata.tags).toContain("obsidian");
      expect(metadata.tags).toContain("bases");
      expect(metadata.tags).toContain("formula");
    });

    it("should have commands defined", () => {
      const metadata = obsidianBases.getMetadata();

      expect(metadata.commands).toBeDefined();
      expect(metadata.commands!.length).toBeGreaterThan(0);

      const commandNames = metadata.commands!.map((cmd) => cmd.name);
      expect(commandNames).toContain("create_smart_kanban");
      expect(commandNames).toContain("create_time_heatmap");
      expect(commandNames).toContain("validate_formula");
      expect(commandNames).toContain("generate_formula");
    });
  });

  describe("Execute Method", () => {
    it("should handle create_smart_kanban action", async () => {
      const result = await obsidianBases.execute({
        action: "create_smart_kanban",
        baseName: "test-kanban",
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.fileName).toBe("test-kanban.base");
      expect(result.message).toContain("Created base file");
    });

    it("should handle create_time_heatmap action", async () => {
      const result = await obsidianBases.execute({
        action: "create_time_heatmap",
        baseName: "test-heatmap",
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.fileName).toBe("test-heatmap.base");
    });

    it("should handle validate_formula action", async () => {
      const result = await obsidianBases.execute({
        action: "validate_formula",
        formula: "let x = 1; if (x > 0) x else 0",
      });

      expect(result.success).toBe(true);
      expect(result.data.isValid).toBe(true);
    });

    it("should handle generate_formula action", async () => {
      const result = await obsidianBases.execute({
        action: "generate_formula",
        template: "priority_calculation",
      });

      expect(result.success).toBe(true);
      expect(result.data.formula).toBeDefined();
      expect(result.message).toContain("Generated formula");
    });

    it("should handle list_bases action", async () => {
      const result = await obsidianBases.execute({
        action: "list_bases",
      });

      expect(result.success).toBe(true);
      expect(result.data.bases).toBeDefined();
      expect(result.data.count).toBe(0);
    });

    it("should handle unknown action", async () => {
      const result = await obsidianBases.execute({
        action: "unknown_action",
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown action");
    });
  });

  describe("Formula Validation", () => {
    it("should validate correct formulas", async () => {
      const validFormulas = [
        "let x = 1; x",
        "if (status == 'Done') 'Completed' else 'Pending'",
        "file.name.contains('test')",
        "today() > due",
      ];

      for (const formula of validFormulas) {
        const result = await obsidianBases.execute({
          action: "validate_formula",
          formula,
        });
        expect(result.success).toBe(true);
      }
    });

    it("should reject invalid formulas", async () => {
      const invalidFormulas = [
        "invalid_function()",
        "random_text_without_logic",
        "",
      ];

      for (const formula of invalidFormulas) {
        const result = await obsidianBases.execute({
          action: "validate_formula",
          formula,
        });
        expect(result.success).toBe(false);
      }
    });
  });

  describe("Formula Generation", () => {
    it("should generate formulas from templates", async () => {
      const templates = [
        "priority_calculation",
        "status_auto",
        "link_analysis",
        "time_heatmap",
      ];

      for (const template of templates) {
        const result = await obsidianBases.execute({
          action: "generate_formula",
          template,
        });
        expect(result.success).toBe(true);
        expect(result.data.formula).toBeDefined();
      }
    });

    it("should handle unknown template", async () => {
      const result = await obsidianBases.execute({
        action: "generate_formula",
        template: "unknown_template",
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("Unknown template");
    });
  });

  describe("Base Creation", () => {
    it("should create smart kanban with correct properties", async () => {
      const result = await obsidianBases.execute({
        action: "create_smart_kanban",
        baseName: "test-kanban",
      });

      expect(result.success).toBe(true);
      expect(result.data.content).toContain("title:");
      expect(result.data.content).toContain("status:");
      expect(result.data.content).toContain("priority:");
      expect(result.data.content).toContain("stage:");
      expect(result.data.content).toContain("rank:");
    });

    it("should create time heatmap with correct properties", async () => {
      const result = await obsidianBases.execute({
        action: "create_time_heatmap",
        baseName: "test-heatmap",
      });

      expect(result.success).toBe(true);
      expect(result.data.content).toContain("date:");
      expect(result.data.content).toContain("intensity:");
      expect(result.data.content).toContain("heatmap_value:");
    });

    it("should create relationship matrix with correct properties", async () => {
      const result = await obsidianBases.execute({
        action: "create_relationship_matrix",
        baseName: "test-matrix",
      });

      expect(result.success).toBe(true);
      expect(result.data.content).toContain("links_out:");
      expect(result.data.content).toContain("links_in:");
      expect(result.data.content).toContain("centrality:");
      expect(result.data.content).toContain("influence_score:");
    });

    it("should create multi context dashboard with correct properties", async () => {
      const result = await obsidianBases.execute({
        action: "create_multi_context_dashboard",
        baseName: "test-dashboard",
      });

      expect(result.success).toBe(true);
      expect(result.data.content).toContain("context:");
      expect(result.data.content).toContain("context_filter:");
      expect(result.data.content).toContain("urgency_score:");
    });
  });
});
