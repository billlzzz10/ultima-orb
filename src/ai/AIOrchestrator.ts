import { App, Notice } from "obsidian";
import { FeatureManager } from "../core/FeatureManager";
import { UltimaOrbSettings } from "../../main";
import { OpenAIProvider } from "./providers/OpenAIProvider";
import { OllamaIntegration } from "./local/OllamaIntegration";

export class AIOrchestrator {
  private app: App;
  private featureManager: FeatureManager;
  private settings: UltimaOrbSettings;
  private openAIProvider?: OpenAIProvider;
  private ollamaIntegration?: OllamaIntegration;
  private activeProvider: string = "openai";

  constructor(
    app: App,
    featureManager: FeatureManager,
    settings: UltimaOrbSettings
  ) {
    this.app = app;
    this.featureManager = featureManager;
    this.settings = settings;
    this.initializeProviders();
  }

  private async initializeProviders() {
    try {
      // Initialize OpenAI Provider
      if (this.settings.openaiApiKey) {
        this.openAIProvider = new OpenAIProvider(this.app, this.featureManager);
        this.openAIProvider.setApiKey(this.settings.openaiApiKey);
        this.openAIProvider.setDefaultModel(this.settings.defaultAIModel);
      }

      // Initialize Ollama Integration
      if (this.settings.enableOllama) {
        this.ollamaIntegration = new OllamaIntegration(
          this.app,
          this.featureManager
        );
        this.ollamaIntegration.setBaseUrl(this.settings.ollamaBaseUrl);
      }

      console.log("✅ AI Providers initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize AI providers:", error);
      new Notice("Failed to initialize AI providers");
    }
  }

  async chat(message: string): Promise<string> {
    try {
      if (this.activeProvider === "openai" && this.openAIProvider) {
        const response = await this.openAIProvider.chatCompletion({
          model: this.settings.defaultAIModel,
          messages: [{ role: "user" as const, content: message }],
        });
        return response.choices[0]?.message?.content || "No response from AI";
      } else if (this.activeProvider === "ollama" && this.ollamaIntegration) {
        return await this.ollamaIntegration.chat(message);
      } else {
        throw new Error("No AI provider available");
      }
    } catch (error) {
      console.error("Chat error:", error);
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
          model: this.settings.defaultAIModel,
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
          model: this.settings.defaultAIModel,
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
          model: this.settings.defaultAIModel,
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
    console.log("Cleaning up AI Orchestrator...");
  }
}
