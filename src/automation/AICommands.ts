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
    this.aiOrchestrator = new AIOrchestrator();
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
          await this.brainstorm(editor);
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

      const prompt = `Improve the following text to make it more clear, engaging, and professional while maintaining the original meaning:

"${text}"

Please provide the improved version:`;

      const response = await this.aiOrchestrator.generateResponse({
        prompt,
        model: "gpt-4",
        maxTokens: 1000,
        temperature: 0.7,
      });

      editor.replaceSelection(response.content);
      new Notice("Text improved successfully!");
    } catch (error) {
      new Notice("Failed to improve text: " + error.message);
    }
  }

  private async translateText(text: string, editor: Editor): Promise<void> {
    try {
      new Notice("Translating text...");

      const prompt = `Translate the following text to English (if it's not already in English) or to a more formal version:

"${text}"

Please provide the translation:`;

      const response = await this.aiOrchestrator.generateResponse({
        prompt,
        model: "gpt-4",
        maxTokens: 1000,
        temperature: 0.3,
      });

      editor.replaceSelection(response.content);
      new Notice("Text translated successfully!");
    } catch (error) {
      new Notice("Failed to translate text: " + error.message);
    }
  }

  private async fixGrammar(text: string, editor: Editor): Promise<void> {
    try {
      new Notice("Fixing grammar...");

      const prompt = `Fix the grammar, spelling, and punctuation in the following text:

"${text}"

Please provide the corrected version:`;

      const response = await this.aiOrchestrator.generateResponse({
        prompt,
        model: "gpt-4",
        maxTokens: 1000,
        temperature: 0.1,
      });

      editor.replaceSelection(response.content);
      new Notice("Grammar fixed successfully!");
    } catch (error) {
      new Notice("Failed to fix grammar: " + error.message);
    }
  }

  private async summarizeText(text: string, editor: Editor): Promise<void> {
    try {
      new Notice("Creating summary...");

      const prompt = `Create a concise summary of the following text:

"${text}"

Please provide a clear and informative summary:`;

      const response = await this.aiOrchestrator.generateResponse({
        prompt,
        model: "gpt-4",
        maxTokens: 500,
        temperature: 0.3,
      });

      editor.replaceSelection(response.content);
      new Notice("Summary created successfully!");
    } catch (error) {
      new Notice("Failed to create summary: " + error.message);
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

Please provide a clear explanation of what this code does:`;

      const response = await this.aiOrchestrator.generateResponse({
        prompt,
        model: "gpt-4",
        maxTokens: 1000,
        temperature: 0.3,
      });

      // Insert explanation as a comment
      const explanation = `\n\n<!-- AI Explanation:\n${response.content}\n-->\n`;
      editor.replaceSelection(code + explanation);
      new Notice("Code explained successfully!");
    } catch (error) {
      new Notice("Failed to explain code: " + error.message);
    }
  }

  private async optimizeCode(code: string, editor: Editor): Promise<void> {
    try {
      new Notice("Optimizing code...");

      const prompt = `Optimize the following code for better performance, readability, and best practices:

\`\`\`
${code}
\`\`\`

Please provide the optimized version with explanations:`;

      const response = await this.aiOrchestrator.generateResponse({
        prompt,
        model: "gpt-4",
        maxTokens: 1500,
        temperature: 0.2,
      });

      editor.replaceSelection(response.content);
      new Notice("Code optimized successfully!");
    } catch (error) {
      new Notice("Failed to optimize code: " + error.message);
    }
  }

  private async debugCode(code: string, editor: Editor): Promise<void> {
    try {
      new Notice("Debugging code...");

      const prompt = `Find and fix potential bugs in the following code:

\`\`\`
${code}
\`\`\`

Please identify issues and provide the corrected version:`;

      const response = await this.aiOrchestrator.generateResponse({
        prompt,
        model: "gpt-4",
        maxTokens: 1500,
        temperature: 0.1,
      });

      editor.replaceSelection(response.content);
      new Notice("Code debugged successfully!");
    } catch (error) {
      new Notice("Failed to debug code: " + error.message);
    }
  }

  // Analysis Commands Implementation
  private async analyzeContent(content: string, editor: Editor): Promise<void> {
    try {
      new Notice("Analyzing content...");

      const prompt = `Analyze the following content and provide insights about:
1. Main topics/themes
2. Writing style and tone
3. Structure and organization
4. Potential improvements
5. Key takeaways

Content:
"${content.substring(0, 2000)}..."

Please provide a comprehensive analysis:`;

      const response = await this.aiOrchestrator.generateResponse({
        prompt,
        model: "gpt-4",
        maxTokens: 1500,
        temperature: 0.3,
      });

      // Add analysis at the end of the file
      const analysis = `\n\n## AI Content Analysis\n\n${response.content}\n`;
      editor.setValue(content + analysis);
      new Notice("Content analyzed successfully!");
    } catch (error) {
      new Notice("Failed to analyze content: " + error.message);
    }
  }

  private async extractInsights(
    content: string,
    editor: Editor
  ): Promise<void> {
    try {
      new Notice("Extracting insights...");

      const prompt = `Extract key insights, patterns, and actionable items from the following content:

"${content.substring(0, 2000)}..."

Please provide:
1. Key insights
2. Important patterns
3. Action items
4. Recommendations`;

      const response = await this.aiOrchestrator.generateResponse({
        prompt,
        model: "gpt-4",
        maxTokens: 1000,
        temperature: 0.3,
      });

      // Add insights at the end of the file
      const insights = `\n\n## Key Insights\n\n${response.content}\n`;
      editor.setValue(content + insights);
      new Notice("Insights extracted successfully!");
    } catch (error) {
      new Notice("Failed to extract insights: " + error.message);
    }
  }

  // Creative Commands Implementation
  private async generateIdeas(content: string, editor: Editor): Promise<void> {
    try {
      new Notice("Generating ideas...");

      const prompt = `Based on the following content, generate creative ideas for:
1. Related topics to explore
2. Different angles to approach the subject
3. Potential projects or applications
4. Questions to investigate further

Content:
"${content.substring(0, 1500)}..."

Please provide creative and innovative ideas:`;

      const response = await this.aiOrchestrator.generateResponse({
        prompt,
        model: "gpt-4",
        maxTokens: 1000,
        temperature: 0.8,
      });

      // Add ideas at the end of the file
      const ideas = `\n\n## Generated Ideas\n\n${response.content}\n`;
      editor.setValue(content + ideas);
      new Notice("Ideas generated successfully!");
    } catch (error) {
      new Notice("Failed to generate ideas: " + error.message);
    }
  }

  private async brainstorm(editor: Editor): Promise<void> {
    try {
      new Notice("Starting brainstorming session...");

      const prompt = `Start a brainstorming session. Please provide:
1. A creative prompt or question to explore
2. Multiple different approaches to think about it
3. Potential solutions or ideas
4. Next steps for further exploration

Make it engaging and thought-provoking:`;

      const response = await this.aiOrchestrator.generateResponse({
        prompt,
        model: "gpt-4",
        maxTokens: 1200,
        temperature: 0.9,
      });

      // Create a new brainstorming section
      const brainstorming = `# Brainstorming Session\n\n${response.content}\n\n---\n`;
      editor.setValue(brainstorming);
      new Notice("Brainstorming session started!");
    } catch (error) {
      new Notice("Failed to start brainstorming: " + error.message);
    }
  }

  // Integration Commands Implementation
  private async createNotionPage(content: string): Promise<void> {
    try {
      new Notice("Creating Notion page...");
      // Implementation for Notion integration
      new Notice("Notion integration coming soon!");
    } catch (error) {
      new Notice("Failed to create Notion page: " + error.message);
    }
  }

  private async createClickUpTask(content: string): Promise<void> {
    try {
      new Notice("Creating ClickUp task...");
      // Implementation for ClickUp integration
      new Notice("ClickUp integration coming soon!");
    } catch (error) {
      new Notice("Failed to create ClickUp task: " + error.message);
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
