import { App, Editor, MarkdownView, Notice } from "obsidian";
import { AIOrchestrator } from "./AIOrchestrator";

/**
 * 🔮 AI Features - ฟีเจอร์หลักจาก Continue + Cursor
 */
export class AIFeatures {
  private app: App;
  private aiOrchestrator: AIOrchestrator;

  constructor(app: App, aiOrchestrator: AIOrchestrator) {
    this.app = app;
    this.aiOrchestrator = aiOrchestrator;
  }

  // ===== CONTINUE FEATURES =====

  /**
   * 💬 Chat with AI (Continue Style)
   */
  async chatWithAI(message: string, context?: string): Promise<string> {
    try {
      const prompt = context
        ? `Context: ${context}\n\nUser: ${message}`
        : message;

      const response = await this.aiOrchestrator.generateResponse(prompt);
      return response;
    } catch (error) {
      new Notice("❌ Error chatting with AI");
      return "Sorry, I encountered an error. Please try again.";
    }
  }

  /**
   * 🔍 Explain Code (Cursor Style)
   */
  async explainCode(code: string, language?: string): Promise<string> {
    try {
      const prompt = `Please explain this ${language || "code"} in detail:

\`\`\`${language || ""}
${code}
\`\`\`

Explain:
1. What this code does
2. How it works
3. Key concepts used
4. Potential improvements`;

      const response = await this.aiOrchestrator.generateResponse(prompt);
      return response;
    } catch (error) {
      new Notice("❌ Error explaining code");
      return "Sorry, I couldn't explain the code.";
    }
  }

  /**
   * 🐛 Debug Code (Cursor Style)
   */
  async debugCode(code: string, language?: string): Promise<string> {
    try {
      const prompt = `Please debug this ${
        language || "code"
      } and identify potential issues:

\`\`\`${language || ""}
${code}
\`\`\`

Please identify:
1. Syntax errors
2. Logic errors
3. Performance issues
4. Security vulnerabilities
5. Best practices violations`;

      const response = await this.aiOrchestrator.generateResponse(prompt);
      return response;
    } catch (error) {
      new Notice("❌ Error debugging code");
      return "Sorry, I couldn't debug the code.";
    }
  }

  /**
   * 🔧 Refactor Code (Cursor Style)
   */
  async refactorCode(code: string, language?: string): Promise<string> {
    try {
      const prompt = `Please refactor this ${language || "code"} to improve it:

\`\`\`${language || ""}
${code}
\`\`\`

Please provide:
1. Improved version with better structure
2. Explanation of changes
3. Performance improvements
4. Readability enhancements`;

      const response = await this.aiOrchestrator.generateResponse(prompt);
      return response;
    } catch (error) {
      new Notice("❌ Error refactoring code");
      return "Sorry, I couldn't refactor the code.";
    }
  }

  /**
   * 🧪 Generate Tests (Cursor Style)
   */
  async generateTests(code: string, language?: string): Promise<string> {
    try {
      const prompt = `Please generate comprehensive tests for this ${
        language || "code"
      }:

\`\`\`${language || ""}
${code}
\`\`\`

Please provide:
1. Unit tests
2. Edge cases
3. Error handling tests
4. Integration tests (if applicable)`;

      const response = await this.aiOrchestrator.generateResponse(prompt);
      return response;
    } catch (error) {
      new Notice("❌ Error generating tests");
      return "Sorry, I couldn't generate tests.";
    }
  }

  // ===== CONTINUE FEATURES =====

  /**
   * ✏️ Inline Edit (Continue Style)
   */
  async inlineEdit(selectedText: string, instruction: string): Promise<string> {
    try {
      const prompt = `Please edit this text according to the instruction:

Original Text:
${selectedText}

Instruction: ${instruction}

Please provide the edited version:`;

      const response = await this.aiOrchestrator.generateResponse(prompt);
      return response;
    } catch (error) {
      new Notice("❌ Error with inline edit");
      return selectedText; // Return original if error
    }
  }

  /**
   * 📝 Improve Text (Continue Style)
   */
  async improveText(
    text: string,
    improvementType: "grammar" | "style" | "clarity" | "tone"
  ): Promise<string> {
    try {
      const prompt = `Please improve this text for better ${improvementType}:

Original Text:
${text}

Please provide an improved version with better ${improvementType}:`;

      const response = await this.aiOrchestrator.generateResponse(prompt);
      return response;
    } catch (error) {
      new Notice("❌ Error improving text");
      return text; // Return original if error
    }
  }

  /**
   * 📊 Analyze Content (Continue Style)
   */
  async analyzeContent(content: string): Promise<string> {
    try {
      const prompt = `Please analyze this content:

${content}

Please provide:
1. Main topics/themes
2. Key insights
3. Writing style analysis
4. Suggestions for improvement
5. Summary`;

      const response = await this.aiOrchestrator.generateResponse(prompt);
      return response;
    } catch (error) {
      new Notice("❌ Error analyzing content");
      return "Sorry, I couldn't analyze the content.";
    }
  }

  /**
   * 💡 Generate Ideas (Continue Style)
   */
  async generateIdeas(topic: string, count: number = 5): Promise<string> {
    try {
      const prompt = `Please generate ${count} creative ideas about: ${topic}

Please provide:
1. Brief description of each idea
2. Potential benefits
3. Implementation suggestions
4. Related concepts`;

      const response = await this.aiOrchestrator.generateResponse(prompt);
      return response;
    } catch (error) {
      new Notice("❌ Error generating ideas");
      return "Sorry, I couldn't generate ideas.";
    }
  }

  /**
   * 🔄 Multi-step Action (Continue Style)
   */
  async multiStepAction(steps: string[]): Promise<string[]> {
    try {
      const results: string[] = [];

      for (const step of steps) {
        const response = await this.aiOrchestrator.generateResponse(step);
        results.push(response);
      }

      return results;
    } catch (error) {
      new Notice("❌ Error in multi-step action");
      return steps.map(() => "Step failed");
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Get current editor content
   */
  getCurrentEditorContent(): string {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView && activeView.editor) {
      return activeView.editor.getValue();
    }
    return "";
  }

  /**
   * Get selected text from editor
   */
  getSelectedText(): string {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView && activeView.editor) {
      const selection = activeView.editor.getSelection();
      return selection || "";
    }
    return "";
  }

  /**
   * Replace selected text in editor
   */
  replaceSelectedText(newText: string): void {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView && activeView.editor) {
      const selection = activeView.editor.getSelection();
      if (selection) {
        activeView.editor.replaceSelection(newText);
      }
    }
  }

  /**
   * Insert text at cursor position
   */
  insertTextAtCursor(text: string): void {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView && activeView.editor) {
      const cursor = activeView.editor.getCursor();
      activeView.editor.replaceRange(text, cursor);
    }
  }
}
