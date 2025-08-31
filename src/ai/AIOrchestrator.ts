import { App, Notice } from "obsidian";
import { FeatureManager } from "../core/FeatureManager";
import { UltimaOrbSettings } from "../settings";
import { OpenAIProvider } from "./providers/OpenAIProvider";
import { OllamaIntegration } from "./local/OllamaIntegration";
import { ModeSystem } from "./ModeSystem";

export class AIOrchestrator {
  private app: App;
  private featureManager: FeatureManager;
  private settings: UltimaOrbSettings;
  private openAIProvider?: OpenAIProvider;
  private ollamaIntegration?: OllamaIntegration;
  private activeProvider: string = "openai";
  private modeSystem: ModeSystem;

  constructor(
    app: App,
    featureManager: FeatureManager,
    settings: UltimaOrbSettings
  ) {
    this.app = app;
    this.featureManager = featureManager;
    this.settings = settings;
    this.modeSystem = new ModeSystem();
    this.initializeProviders();
  }

  private async initializeProviders() {
    try {
      // Initialize OpenAI Provider
      if (this.settings.openaiApiKey) {
        this.openAIProvider = new OpenAIProvider(this.app, this.featureManager);
        this.openAIProvider.setApiKey(this.settings.openaiApiKey);
        this.openAIProvider.setDefaultModel(this.settings.defaultModel);
      }

      // Initialize Ollama Integration
      if (this.settings.ollamaEndpoint) {
        this.ollamaIntegration = new OllamaIntegration(
          this.app,
          this.featureManager
        );
        this.ollamaIntegration.setBaseUrl(this.settings.ollamaEndpoint);
      }

      console.info("✅ AI Providers initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize AI providers:", error);
      new Notice("Failed to initialize AI providers");
    }
  }

  async chat(message: string): Promise<string> {
    return await this.generateResponse(message);
  }

  /**
   * 🎯 Set Mode System (for external access)
   */
  setModeSystem(modeSystem: ModeSystem): void {
    this.modeSystem = modeSystem;
  }

  /**
   * 🎯 Get Mode System
   */
  getModeSystem(): ModeSystem {
    return this.modeSystem;
  }

  /**
   * 🎯 Switch Active Mode
   */
  setActiveMode(modeId: string): boolean {
    return this.modeSystem.setActiveMode(modeId);
  }

  /**
   * 🎯 Get Active Mode
   */
  getActiveMode() {
    return this.modeSystem.getActiveMode();
  }

  /**
   * 🎯 Generate Response with Mode Context
   */
  async generateResponse(
    message: string,
    customInstructions?: string
  ): Promise<string> {
    try {
      const context = this.modeSystem.buildContext(customInstructions);
      const aiSettings = this.modeSystem.getAISettings();

      // Use mode-specific AI settings
      const provider = aiSettings.provider || this.activeProvider;
      const model = aiSettings.model || this.settings.defaultModel;

      const fullPrompt = `${context}\n\nUser: ${message}`;

      if (provider === "openai" && this.openAIProvider) {
        const response = await this.openAIProvider.chatCompletion({
          model: model,
          messages: [{ role: "user" as const, content: fullPrompt }],
          temperature: aiSettings.temperature,
          max_tokens: aiSettings.maxTokens,
        });
        return response.choices[0]?.message?.content || "No response from AI";
      } else if (provider === "ollama" && this.ollamaIntegration) {
        return await this.ollamaIntegration.chat([
          { role: "user", content: fullPrompt },
        ]);
      } else {
        throw new Error(`No AI provider available for: ${provider}`);
      }
    } catch (error) {
      console.error("Generate response error:", error);
      throw error;
    }
  }

  async completeCode(
    code: string,
    language: string = "typescript"
  ): Promise<string> {
    try {
      const prompt = `Complete the following ${language} code:\n\n${code}\n\nProvide only the completed code without explanations.`;

      if (this.activeProvider === "openai" && this.openAIProvider) {
        const response = await this.openAIProvider.chatCompletion({
          model: this.settings.defaultModel,
          messages: [{ role: "user", content: prompt }],
        });
        return response.choices[0]?.message?.content || "";
      } else if (this.activeProvider === "ollama" && this.ollamaIntegration) {
        return await this.ollamaIntegration.codeCompletion(code, language);
      } else {
        throw new Error("No AI provider available");
      }
    } catch (error) {
      console.error("Code completion error:", error);
      throw error;
    }
  }

  async explainCode(
    code: string,
    language: string = "typescript"
  ): Promise<string> {
    try {
      const prompt = `Explain the following ${language} code in detail:\n\n${code}`;

      if (this.activeProvider === "openai" && this.openAIProvider) {
        const response = await this.openAIProvider.chatCompletion({
          model: this.settings.defaultModel,
          messages: [{ role: "user", content: prompt }],
        });
        return response.choices[0]?.message?.content || "";
      } else if (this.activeProvider === "ollama" && this.ollamaIntegration) {
        return await this.ollamaIntegration.questionAnswering(
          code,
          "Explain this code"
        );
      } else {
        throw new Error("No AI provider available");
      }
    } catch (error) {
      console.error("Code explanation error:", error);
      throw error;
    }
  }

  async refactorCode(
    code: string,
    language: string = "typescript"
  ): Promise<string> {
    try {
      const prompt = `Refactor the following ${language} code to make it cleaner, more efficient, and follow best practices:\n\n${code}\n\nProvide only the refactored code.`;

      if (this.activeProvider === "openai" && this.openAIProvider) {
        const response = await this.openAIProvider.chatCompletion({
          model: this.settings.defaultModel,
          messages: [{ role: "user", content: prompt }],
        });
        return response.choices[0]?.message?.content || "";
      } else if (this.activeProvider === "ollama" && this.ollamaIntegration) {
        return await this.ollamaIntegration.codeCompletion(code, language);
      } else {
        throw new Error("No AI provider available");
      }
    } catch (error) {
      console.error("Code refactoring error:", error);
      throw error;
    }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      if (this.openAIProvider) {
        return await this.openAIProvider.generateEmbeddings(text);
      } else if (this.ollamaIntegration) {
        return await this.ollamaIntegration.generateEmbeddings(text);
      } else {
        throw new Error("No AI provider available for embeddings");
      }
    } catch (error) {
      console.error("Embeddings generation error:", error);
      throw error;
    }
  }

  async generateImage(prompt: string): Promise<string[]> {
    try {
      if (this.openAIProvider) {
        return await this.openAIProvider.generateImage(prompt);
      } else {
        throw new Error("Image generation not available with current provider");
      }
    } catch (error) {
      console.error("Image generation error:", error);
      throw error;
    }
  }

  async transcribeAudio(audioFile: File): Promise<string> {
    try {
      if (this.openAIProvider) {
        return await this.openAIProvider.transcribeAudio(audioFile);
      } else {
        throw new Error(
          "Audio transcription not available with current provider"
        );
      }
    } catch (error) {
      console.error("Audio transcription error:", error);
      throw error;
    }
  }

  setActiveProvider(provider: string) {
    this.activeProvider = provider;
    new Notice(`Switched to ${provider} provider`);
  }

  getActiveProvider(): string {
    return this.activeProvider;
  }

  async testConnection(): Promise<boolean> {
    try {
      if (this.activeProvider === "openai" && this.openAIProvider) {
        return await this.openAIProvider.testConnection();
      } else if (this.activeProvider === "ollama" && this.ollamaIntegration) {
        return await this.ollamaIntegration.testConnection();
      } else {
        return false;
      }
    } catch (error) {
      console.error("Connection test error:", error);
      return false;
    }
  }

  async cleanup() {
    // Cleanup resources
    console.info("Cleaning up AI Orchestrator...");
  }
}
