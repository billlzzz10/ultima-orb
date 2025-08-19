import { ItemView, WorkspaceLeaf, Notice } from "obsidian";
import { UltimaOrbPlugin } from "../../UltimaOrbPlugin";

export const TOOL_TEMPLATE_VIEW_TYPE = "ultima-orb-tool-template-view";

interface ToolTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt: string;
  parameters: ToolParameter[];
  examples: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "select";
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
}

export class ToolTemplateView extends ItemView {
  plugin: UltimaOrbPlugin;
  templateContainer: HTMLElement;
  searchInput: HTMLInputElement;
  categoryFilter: HTMLSelectElement;
  templates: ToolTemplate[] = [];
  filteredTemplates: ToolTemplate[] = [];

  constructor(leaf: WorkspaceLeaf, plugin: UltimaOrbPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return TOOL_TEMPLATE_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Ultima-Orb Tool Templates";
  }

  getIcon(): string {
    return "wrench";
  }

  async onOpen(): Promise<void> {
    const container = this.containerEl.children[1];
    container.empty();
    container.createEl("h4", { text: "🛠️ Tool Templates" });

    // Create tool template interface
    this.createToolTemplateInterface(container);

    // Load existing templates
    await this.loadTemplates();
  }

  async onClose(): Promise<void> {
    // Save templates
    await this.saveTemplates();
  }

  private createToolTemplateInterface(container: HTMLElement): void {
    // Header with search, filter, and add button
    const header = container.createEl("div", { cls: "tool-template-header" });

    // Search input
    this.searchInput = header.createEl("input", {
      type: "text",
      placeholder: "🔍 Search templates...",
      cls: "template-search",
    });
    this.searchInput.addEventListener("input", () => this.filterTemplates());

    // Category filter
    this.categoryFilter = header.createEl("select", { cls: "category-filter" });
    this.categoryFilter.createEl("option", {
      text: "All Categories",
      value: "",
    });
    this.categoryFilter.createEl("option", {
      text: "Writing",
      value: "writing",
    });
    this.categoryFilter.createEl("option", {
      text: "Analysis",
      value: "analysis",
    });
    this.categoryFilter.createEl("option", { text: "Code", value: "code" });
    this.categoryFilter.createEl("option", {
      text: "Business",
      value: "business",
    });
    this.categoryFilter.createEl("option", {
      text: "Creative",
      value: "creative",
    });
    this.categoryFilter.addEventListener("change", () =>
      this.filterTemplates()
    );

    // Add template button
    const addButton = header.createEl("button", {
      text: "➕ Add Template",
      cls: "add-template-btn",
    });
    addButton.onclick = () => this.showAddTemplateModal();

    // Templates container
    this.templateContainer = container.createEl("div", {
      cls: "tool-templates",
    });
  }

  private async loadTemplates(): Promise<void> {
    try {
      const savedTemplates = await this.plugin.loadData();
      this.templates =
        savedTemplates?.toolTemplates || this.getDefaultTemplates();
      this.filteredTemplates = [...this.templates];
      this.renderTemplates();
    } catch (error) {
      console.error("Failed to load templates:", error);
      this.templates = this.getDefaultTemplates();
      this.filteredTemplates = [...this.templates];
    }
  }

  private async saveTemplates(): Promise<void> {
    try {
      await this.plugin.saveData({ toolTemplates: this.templates });
    } catch (error) {
      console.error("Failed to save templates:", error);
    }
  }

  private getDefaultTemplates(): ToolTemplate[] {
    return [
      {
        id: "1",
        name: "Blog Post Writer",
        description: "Generate engaging blog posts on any topic",
        category: "writing",
        prompt:
          "Write a comprehensive blog post about {{topic}}. Include an introduction, main points, and conclusion. Make it engaging and informative.",
        parameters: [
          {
            name: "topic",
            type: "string",
            description: "The main topic of the blog post",
            required: true,
          },
          {
            name: "tone",
            type: "select",
            description: "The tone of the writing",
            required: false,
            defaultValue: "professional",
            options: ["professional", "casual", "academic", "conversational"],
          },
          {
            name: "length",
            type: "select",
            description: "Length of the blog post",
            required: false,
            defaultValue: "medium",
            options: ["short", "medium", "long"],
          },
        ],
        examples: [
          "Write a blog post about artificial intelligence trends in 2024",
          "Create a blog post about healthy eating habits with a casual tone",
        ],
        tags: ["writing", "blog", "content"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        name: "Code Review Assistant",
        description: "Review and improve code quality",
        category: "code",
        prompt:
          "Review this code and provide suggestions for improvement:\n\n{{code}}\n\nFocus on: {{focus_areas}}",
        parameters: [
          {
            name: "code",
            type: "string",
            description: "The code to review",
            required: true,
          },
          {
            name: "focus_areas",
            type: "select",
            description: "Areas to focus on during review",
            required: false,
            defaultValue: "all",
            options: [
              "all",
              "performance",
              "security",
              "readability",
              "best_practices",
            ],
          },
          {
            name: "language",
            type: "string",
            description: "Programming language",
            required: false,
            defaultValue: "JavaScript",
          },
        ],
        examples: [
          "Review this JavaScript function for performance issues",
          "Check this Python code for security vulnerabilities",
        ],
        tags: ["code", "review", "development"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3",
        name: "Meeting Notes Generator",
        description: "Generate structured meeting notes from discussion points",
        category: "business",
        prompt:
          "Create meeting notes for a {{meeting_type}} meeting with the following discussion points:\n\n{{discussion_points}}\n\nInclude: agenda, key decisions, action items, and next steps.",
        parameters: [
          {
            name: "meeting_type",
            type: "select",
            description: "Type of meeting",
            required: true,
            options: ["project", "team", "client", "planning", "review"],
          },
          {
            name: "discussion_points",
            type: "string",
            description: "Main discussion points",
            required: true,
          },
          {
            name: "participants",
            type: "string",
            description: "Meeting participants",
            required: false,
          },
        ],
        examples: [
          "Generate notes for a project planning meeting about website redesign",
          "Create meeting notes for a client presentation about new features",
        ],
        tags: ["business", "meeting", "notes"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  private renderTemplates(): void {
    this.templateContainer.empty();

    if (this.filteredTemplates.length === 0) {
      this.templateContainer.createEl("div", {
        text: "No templates found. Add some templates to get started!",
        cls: "no-templates-message",
      });
      return;
    }

    this.filteredTemplates.forEach((template) => {
      this.createTemplateElement(template);
    });
  }

  private createTemplateElement(template: ToolTemplate): void {
    const templateEl = this.templateContainer.createEl("div", {
      cls: "tool-template-item",
    });

    // Header
    const header = templateEl.createEl("div", { cls: "template-header" });

    const title = header.createEl("h5", {
      text: template.name,
      cls: "template-title",
    });

    const category = header.createEl("span", {
      text: template.category,
      cls: "template-category",
    });

    const actions = header.createEl("div", { cls: "template-actions" });

    // Use template button
    const useBtn = actions.createEl("button", {
      text: "🚀 Use",
      cls: "use-template-btn",
    });
    useBtn.onclick = () => this.useTemplate(template);

    // Edit button
    const editBtn = actions.createEl("button", {
      text: "✏️",
      cls: "edit-template-btn",
    });
    editBtn.onclick = () => this.editTemplate(template);

    // Delete button
    const deleteBtn = actions.createEl("button", {
      text: "🗑️",
      cls: "delete-template-btn",
    });
    deleteBtn.onclick = () => this.deleteTemplate(template.id);

    // Description
    const description = templateEl.createEl("div", {
      text: template.description,
      cls: "template-description",
    });

    // Parameters preview
    if (template.parameters.length > 0) {
      const paramsContainer = templateEl.createEl("div", {
        cls: "template-parameters",
      });
      paramsContainer.createEl("strong", { text: "Parameters: " });
      template.parameters.forEach((param) => {
        const paramEl = paramsContainer.createEl("span", {
          text: `${param.name}${param.required ? "*" : ""}`,
          cls: `parameter ${param.required ? "required" : "optional"}`,
        });
      });
    }

    // Examples
    if (template.examples.length > 0) {
      const examplesContainer = templateEl.createEl("div", {
        cls: "template-examples",
      });
      examplesContainer.createEl("strong", { text: "Examples:" });
      template.examples.forEach((example) => {
        examplesContainer.createEl("div", {
          text: `• ${example}`,
          cls: "template-example",
        });
      });
    }

    // Tags
    if (template.tags.length > 0) {
      const tagsContainer = templateEl.createEl("div", {
        cls: "template-tags",
      });
      template.tags.forEach((tag) => {
        tagsContainer.createEl("span", {
          text: `#${tag}`,
          cls: "template-tag",
        });
      });
    }
  }

  private useTemplate(template: ToolTemplate): void {
    const modal = new (this.app as any).Modal(this.app);
    modal.titleEl.setText(`Use Template: ${template.name}`);
    modal.containerEl.addClass("template-modal");

    const content = modal.contentEl.createEl("div", {
      cls: "template-modal-content",
    });

    // Description
    content.createEl("p", {
      text: template.description,
      cls: "template-modal-description",
    });

    // Parameters form
    const form = content.createEl("form", { cls: "template-form" });

    template.parameters.forEach((param) => {
      const paramContainer = form.createEl("div", { cls: "form-param" });

      const label = paramContainer.createEl("label", {
        text: `${param.name}${param.required ? " *" : ""}`,
        cls: "param-label",
      });

      let input: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

      switch (param.type) {
        case "select":
          input = paramContainer.createEl("select", { cls: "param-input" });
          param.options?.forEach((option) => {
            input.createEl("option", { text: option, value: option });
          });
          if (param.defaultValue) {
            input.value = param.defaultValue;
          }
          break;
        case "boolean":
          input = paramContainer.createEl("input", {
            type: "checkbox",
            cls: "param-input",
          }) as HTMLInputElement;
          if (param.defaultValue) {
            input.checked = param.defaultValue;
          }
          break;
        default:
          input = paramContainer.createEl("input", {
            type: param.type,
            placeholder: param.description,
            cls: "param-input",
          });
          if (param.defaultValue) {
            input.value = param.defaultValue;
          }
      }

      if (param.description) {
        paramContainer.createEl("small", {
          text: param.description,
          cls: "param-description",
        });
      }
    });

    // Generate button
    const generateBtn = form.createEl("button", {
      text: "🚀 Generate",
      type: "submit",
      cls: "generate-template-btn",
    });

    form.onsubmit = (e) => {
      e.preventDefault();

      // Collect form data
      const formData = new FormData(form);
      const params: Record<string, any> = {};

      template.parameters.forEach((param) => {
        const value = formData.get(param.name);
        if (param.type === "boolean") {
          params[param.name] = value === "on";
        } else {
          params[param.name] = value;
        }
      });

      // Generate prompt with parameters
      let generatedPrompt = template.prompt;
      Object.entries(params).forEach(([key, value]) => {
        generatedPrompt = generatedPrompt.replace(
          new RegExp(`{{${key}}}`, "g"),
          String(value)
        );
      });

      // Copy to clipboard
      navigator.clipboard.writeText(generatedPrompt).then(() => {
        new Notice("Generated prompt copied to clipboard!");
        modal.close();
      });
    };

    modal.open();
  }

  private showAddTemplateModal(): void {
    const modal = new (this.app as any).Modal(this.app);
    modal.titleEl.setText("Add New Tool Template");
    modal.containerEl.addClass("template-modal");

    const content = modal.contentEl.createEl("div", {
      cls: "template-modal-content",
    });

    // Name input
    const nameInput = content.createEl("input", {
      type: "text",
      placeholder: "Template name...",
      cls: "template-input",
    });

    // Description input
    const descInput = content.createEl("textarea", {
      placeholder: "Template description...",
      cls: "template-textarea",
    });

    // Category select
    const categorySelect = content.createEl("select", {
      cls: "template-select",
    });
    categorySelect.createEl("option", { text: "Writing", value: "writing" });
    categorySelect.createEl("option", { text: "Analysis", value: "analysis" });
    categorySelect.createEl("option", { text: "Code", value: "code" });
    categorySelect.createEl("option", { text: "Business", value: "business" });
    categorySelect.createEl("option", { text: "Creative", value: "creative" });

    // Prompt textarea
    const promptTextarea = content.createEl("textarea", {
      placeholder: "Template prompt with {{parameters}}...",
      cls: "template-textarea",
    });

    // Tags input
    const tagsInput = content.createEl("input", {
      type: "text",
      placeholder: "Tags (comma-separated)",
      cls: "template-input",
    });

    // Buttons
    const buttons = content.createEl("div", { cls: "template-modal-buttons" });

    const saveBtn = buttons.createEl("button", {
      text: "Save Template",
      cls: "save-template-btn",
    });
    saveBtn.onclick = () => {
      const name = nameInput.value.trim();
      const description = descInput.value.trim();
      const category = categorySelect.value;
      const prompt = promptTextarea.value.trim();
      const tags = tagsInput.value
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      if (name && description && prompt) {
        this.addTemplate({
          id: Date.now().toString(),
          name,
          description,
          category,
          prompt,
          parameters: [], // Can be enhanced later
          examples: [],
          tags,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        modal.close();
        new Notice("Template added successfully!");
      } else {
        new Notice("Please fill in all required fields!");
      }
    };

    const cancelBtn = buttons.createEl("button", {
      text: "Cancel",
      cls: "cancel-template-btn",
    });
    cancelBtn.onclick = () => modal.close();

    modal.open();
  }

  private addTemplate(template: ToolTemplate): void {
    this.templates.push(template);
    this.filteredTemplates = [...this.templates];
    this.renderTemplates();
    this.saveTemplates();
  }

  private editTemplate(template: ToolTemplate): void {
    // Similar to add modal but pre-filled
    new Notice("Edit functionality coming soon!");
  }

  private deleteTemplate(id: string): void {
    this.templates = this.templates.filter((template) => template.id !== id);
    this.filteredTemplates = [...this.templates];
    this.renderTemplates();
    this.saveTemplates();
    new Notice("Template deleted!");
  }

  private filterTemplates(): void {
    const searchTerm = this.searchInput.value.toLowerCase();
    const selectedCategory = this.categoryFilter.value;

    this.filteredTemplates = this.templates.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchTerm) ||
        template.description.toLowerCase().includes(searchTerm) ||
        template.tags.some((tag) => tag.toLowerCase().includes(searchTerm));

      const matchesCategory =
        !selectedCategory || template.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    this.renderTemplates();
  }

  // Public methods for external access
  public getTemplates(): ToolTemplate[] {
    return [...this.templates];
  }

  public getTemplatesByCategory(category: string): ToolTemplate[] {
    return this.templates.filter((template) => template.category === category);
  }

  public searchTemplates(query: string): ToolTemplate[] {
    const searchTerm = query.toLowerCase();
    return this.templates.filter(
      (template) =>
        template.name.toLowerCase().includes(searchTerm) ||
        template.description.toLowerCase().includes(searchTerm) ||
        template.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    );
  }
}
