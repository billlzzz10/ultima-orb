import { App, Editor, MarkdownView, Notice, TFile } from "obsidian";
import { UltimaOrbPlugin } from "../UltimaOrbPlugin";
import { AIOrchestrator } from "../ai/AIOrchestrator";

export interface AICommand {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  shortcut?: string;
  execute: (app: App, editor: Editor, plugin: UltimaOrbPlugin) => Promise<void>;
}

export class AICommands {
  private plugin: UltimaOrbPlugin;
  private aiOrchestrator: AIOrchestrator;
  private commands: AICommand[] = [];

  constructor(plugin: UltimaOrbPlugin) {
    this.plugin = plugin;
    // สร้าง AIOrchestrator ใหม่โดยไม่ใช้ plugin properties ที่ไม่สามารถเข้าถึงได้
    this.aiOrchestrator = new AIOrchestrator(
      plugin.app,
      {} as any, // FeatureManager placeholder
      {} as any // Settings placeholder
    );
    this.initializeCommands();
  }

  private initializeCommands(): void {
    // Writing & Content Commands
    this.commands.push(
      {
        id: "improve-text",
        name: "Improve Text",
        description: "Improve the selected text with AI",
        category: "writing",
        icon: "✏️",
        shortcut: "Ctrl+Shift+I",
        execute: async (app, editor, plugin) => {
          const selectedText = editor.getSelection();
          if (!selectedText) {
            new Notice("Please select text to improve");
            return;
          }
          await this.improveText(selectedText, editor);
        },
      },
      {
        id: "translate-text",
        name: "Translate Text",
        description: "Translate selected text to another language",
        category: "writing",
        icon: "🌐",
        shortcut: "Ctrl+Shift+T",
        execute: async (app, editor, plugin) => {
          const selectedText = editor.getSelection();
          if (!selectedText) {
            new Notice("Please select text to translate");
            return;
          }
          await this.translateText(selectedText, editor);
        },
      },
      {
        id: "fix-grammar",
        name: "Fix Grammar",
        description: "Fix grammar and spelling in selected text",
        category: "writing",
        icon: "🔧",
        shortcut: "Ctrl+Shift+G",
        execute: async (app, editor, plugin) => {
          const selectedText = editor.getSelection();
          if (!selectedText) {
            new Notice("Please select text to fix");
            return;
          }
          await this.fixGrammar(selectedText, editor);
        },
      },
      {
        id: "summarize-text",
        name: "Summarize Text",
        description: "Create a summary of the selected text",
        category: "writing",
        icon: "📝",
        shortcut: "Ctrl+Shift+S",
        execute: async (app, editor, plugin) => {
          const selectedText = editor.getSelection();
          if (!selectedText) {
            new Notice("Please select text to summarize");
            return;
          }
          await this.summarizeText(selectedText, editor);
        },
      }
    );

    // Code Commands
    this.commands.push(
      {
        id: "explain-code",
        name: "Explain Code",
        description: "Explain the selected code",
        category: "code",
        icon: "💻",
        shortcut: "Ctrl+Shift+E",
        execute: async (app, editor, plugin) => {
          const selectedText = editor.getSelection();
          if (!selectedText) {
            new Notice("Please select code to explain");
            return;
          }
          await this.explainCode(selectedText, editor);
        },
      },
      {
        id: "optimize-code",
        name: "Optimize Code",
        description: "Optimize the selected code for performance",
        category: "code",
        icon: "⚡",
        shortcut: "Ctrl+Shift+O",
        execute: async (app, editor, plugin) => {
          const selectedText = editor.getSelection();
          if (!selectedText) {
            new Notice("Please select code to optimize");
            return;
          }
          await this.optimizeCode(selectedText, editor);
        },
      },
      {
        id: "debug-code",
        name: "Debug Code",
        description: "Find and fix bugs in the selected code",
        category: "code",
        icon: "🐛",
        shortcut: "Ctrl+Shift+D",
        execute: async (app, editor, plugin) => {
          const selectedText = editor.getSelection();
          if (!selectedText) {
            new Notice("Please select code to debug");
            return;
          }
          await this.debugCode(selectedText, editor);
        },
      }
    );

    // Analysis Commands
    this.commands.push(
      {
        id: "analyze-content",
        name: "Analyze Content",
        description: "Analyze the current file content",
        category: "analysis",
        icon: "📊",
        shortcut: "Ctrl+Shift+A",
        execute: async (app, editor, plugin) => {
          const content = editor.getValue();
          await this.analyzeContent(content, editor);
        },
      },
      {
        id: "extract-insights",
        name: "Extract Insights",
        description: "Extract key insights from the current file",
        category: "analysis",
        icon: "💡",
        shortcut: "Ctrl+Shift+X",
        execute: async (app, editor, plugin) => {
          const content = editor.getValue();
          await this.extractInsights(content, editor);
        },
      }
    );

    // Creative Commands
    this.commands.push(
      {
        id: "generate-ideas",
        name: "Generate Ideas",
        description: "Generate creative ideas based on current content",
        category: "creative",
        icon: "🎨",
        shortcut: "Ctrl+Shift+C",
        execute: async (app, editor, plugin) => {
          const content = editor.getValue();
          await this.generateIdeas(content, editor);
        },
      },
      {
        id: "brainstorm",
        name: "Brainstorm",
        description: "Start a brainstorming session",
        category: "creative",
        icon: "🧠",
        shortcut: "Ctrl+Shift+B",
        execute: async (app, editor, plugin) => {
          const selectedText = editor.getSelection() || "general brainstorming";
          await this.brainstorm(selectedText, editor);
        },
      }
    );

    // Integration Commands
    this.commands.push(
      {
        id: "create-notion-page",
        name: "Create Notion Page",
        description: "Create a new page in Notion with current content",
        category: "integration",
        icon: "📝",
        execute: async (app, editor, plugin) => {
          const content = editor.getValue();
          await this.createNotionPage(content);
        },
      },
      {
        id: "create-clickup-task",
        name: "Create ClickUp Task",
        description: "Create a new task in ClickUp",
        category: "integration",
        icon: "📋",
        execute: async (app, editor, plugin) => {
          const content = editor.getValue();
          await this.createClickUpTask(content);
        },
      }
    );
  }

  // Writing Commands Implementation
  private async improveText(text: string, editor: Editor): Promise<void> {
    try {
      new Notice("Improving text...");

      const prompt = `Improve the following text to make it more clear, engaging, and professional:

"${text}"

Please provide the improved version:`;

      const response = await this.aiOrchestrator.generateResponse(prompt);

      editor.replaceSelection(response);
      new Notice("Text improved successfully!");
    } catch (error) {
      new Notice("Failed to improve text: " + (error as Error).message);
    }
  }

  private async translateText(text: string, editor: Editor): Promise<void> {
    try {
      new Notice("Translating text...");

      const prompt = `Translate the following text to English (if it's not already in English) or to a more formal version:

"${text}"

Please provide the translation:`;

      const response = await this.aiOrchestrator.generateResponse(prompt);

      editor.replaceSelection(response);
      new Notice("Text translated successfully!");
    } catch (error) {
      new Notice("Failed to translate text: " + (error as Error).message);
    }
  }

  private async fixGrammar(text: string, editor: Editor): Promise<void> {
    try {
      new Notice("Fixing grammar...");

      const prompt = `Fix the grammar, spelling, and punctuation in the following text:

"${text}"

Please provide the corrected version:`;

      const response = await this.aiOrchestrator.generateResponse(prompt);

      editor.replaceSelection(response);
      new Notice("Grammar fixed successfully!");
    } catch (error) {
      new Notice("Failed to fix grammar: " + (error as Error).message);
    }
  }

  private async summarizeText(text: string, editor: Editor): Promise<void> {
    try {
      new Notice("Creating summary...");

      const prompt = `Create a concise summary of the following text:

"${text}"

Please provide a clear and informative summary:`;

      const response = await this.aiOrchestrator.generateResponse(prompt);

      editor.replaceSelection(response);
      new Notice("Summary created successfully!");
    } catch (error) {
      new Notice("Failed to create summary: " + (error as Error).message);
    }
  }

  // Code Commands Implementation
  private async explainCode(code: string, editor: Editor): Promise<void> {
    try {
      new Notice("Explaining code...");

      const prompt = `Explain the following code in detail:

\`\`\`
${code}
\`\`\`

Please provide a clear explanation:`;

      const response = await this.aiOrchestrator.generateResponse(prompt);

      editor.replaceSelection(response);
      new Notice("Code explained successfully!");
    } catch (error) {
      new Notice("Failed to explain code: " + (error as Error).message);
    }
  }

  private async optimizeCode(code: string, editor: Editor): Promise<void> {
    try {
      new Notice("Optimizing code...");

      const prompt = `Optimize the following code for better performance and readability:

\`\`\`
${code}
\`\`\`

Please provide the optimized version:`;

      const response = await this.aiOrchestrator.generateResponse(prompt);

      editor.replaceSelection(response);
      new Notice("Code optimized successfully!");
    } catch (error) {
      new Notice("Failed to optimize code: " + (error as Error).message);
    }
  }

  private async debugCode(code: string, editor: Editor): Promise<void> {
    try {
      new Notice("Debugging code...");

      const prompt = `Debug the following code and identify potential issues:

\`\`\`
${code}
\`\`\`

Please provide debugging suggestions:`;

      const response = await this.aiOrchestrator.generateResponse(prompt);

      editor.replaceSelection(response);
      new Notice("Code debugged successfully!");
    } catch (error) {
      new Notice("Failed to debug code: " + (error as Error).message);
    }
  }

  // Analysis Commands Implementation
  private async analyzeContent(content: string, editor: Editor): Promise<void> {
    try {
      new Notice("Analyzing content...");

      const prompt = `Analyze the following content and provide insights:

"${content}"

Please provide a detailed analysis:`;

      const response = await this.aiOrchestrator.generateResponse(prompt);

      editor.replaceSelection(response);
      new Notice("Content analyzed successfully!");
    } catch (error) {
      new Notice("Failed to analyze content: " + (error as Error).message);
    }
  }

  private async extractInsights(
    content: string,
    editor: Editor
  ): Promise<void> {
    try {
      new Notice("Extracting insights...");

      const prompt = `Extract key insights from the following content:

"${content}"

Please provide the main insights:`;

      const response = await this.aiOrchestrator.generateResponse(prompt);

      editor.replaceSelection(response);
      new Notice("Insights extracted successfully!");
    } catch (error) {
      new Notice("Failed to extract insights: " + (error as Error).message);
    }
  }

  // Creative Commands Implementation
  private async generateIdeas(topic: string, editor: Editor): Promise<void> {
    try {
      new Notice("Generating ideas...");

      const prompt = `Generate creative ideas related to: ${topic}

Please provide a list of innovative ideas:`;

      const response = await this.aiOrchestrator.generateResponse(prompt);

      editor.replaceSelection(response);
      new Notice("Ideas generated successfully!");
    } catch (error) {
      new Notice("Failed to generate ideas: " + (error as Error).message);
    }
  }

  private async brainstorm(topic: string, editor: Editor): Promise<void> {
    try {
      new Notice("Starting brainstorming session...");

      const prompt = `Brainstorm ideas for: ${topic}

Please provide a comprehensive brainstorming session:`;

      const response = await this.aiOrchestrator.generateResponse(prompt);

      editor.replaceSelection(response);
      new Notice("Brainstorming session started!");
    } catch (error) {
      new Notice("Failed to start brainstorming: " + (error as Error).message);
    }
  }

  // Integration Commands Implementation
  private async createNotionPage(content: string): Promise<void> {
    try {
      new Notice("Creating Notion page...");
      // Implementation for Notion integration
      new Notice("Notion integration coming soon!");
    } catch (error) {
      new Notice("Failed to create Notion page: " + (error as Error).message);
    }
  }

  private async createClickUpTask(content: string): Promise<void> {
    try {
      new Notice("Creating ClickUp task...");
      // Implementation for ClickUp integration
      new Notice("ClickUp integration coming soon!");
    } catch (error) {
      new Notice("Failed to create ClickUp task: " + (error as Error).message);
    }
  }

  // Public methods
  public getCommands(): AICommand[] {
    return [...this.commands];
  }

  public getCommandsByCategory(category: string): AICommand[] {
    return this.commands.filter((cmd) => cmd.category === category);
  }

  public async executeCommand(
    commandId: string,
    app: App,
    editor: Editor
  ): Promise<void> {
    const command = this.commands.find((cmd) => cmd.id === commandId);
    if (command) {
      await command.execute(app, editor, this.plugin);
    } else {
      new Notice(`Command ${commandId} not found`);
    }
  }

  public searchCommands(query: string): AICommand[] {
    const searchTerm = query.toLowerCase();
    return this.commands.filter(
      (cmd) =>
        cmd.name.toLowerCase().includes(searchTerm) ||
        cmd.description.toLowerCase().includes(searchTerm) ||
        cmd.category.toLowerCase().includes(searchTerm)
    );
  }
}
