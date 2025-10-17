import { promises as fs } from "node:fs";

type Provider = {
  call: (args: {
    model: string;
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
    tools?: any[];
  }) => Promise<{ text: string; tool_use?: any[] } | any>;
};

export class ProviderManager {
  private providers: Map<string, Provider> = new Map();
  private settings: any;

  constructor(settings: any) {
    this.settings = settings;
    this.initializeProviders();
  }

  private initializeProviders(): void {
    if (this.settings.providers.openai?.api_key) {
      this.registerProvider("openai", {
        call: async (args) => {
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${this.settings.providers.openai.api_key}`,
            },
            body: JSON.stringify({
              model: args.model,
              messages: args.messages,
              tools: args.tools,
            }),
          });
          if (!response.ok) throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
          return await response.json();
        },
      });
    }

    if (this.settings.providers.anthropic?.api_key) {
      this.registerProvider("anthropic", {
        call: async (args) => {
          const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": this.settings.providers.anthropic.api_key,
              "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify({
              model: args.model,
              messages: args.messages,
              max_tokens: 4096,
            }),
          });
          if (!response.ok) throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
          return await response.json();
        },
      });
    }

    if (this.settings.providers.google?.api_key) {
      this.registerProvider("google", {
        call: async (args) => {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${args.model}:generateContent?key=${this.settings.providers.google.api_key}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: args.messages.map(m => ({ parts: [{ text: m.content }] })),
            }),
          });
          if (!response.ok) throw new Error(`Google API error: ${response.status} ${response.statusText}`);
          return await response.json();
        },
      });
    }

    if (this.settings.providers.ollama?.host) {
      this.registerProvider("ollama", {
        call: async (args) => {
          const response = await fetch(`${this.settings.providers.ollama.host}/api/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: args.model,
              messages: args.messages,
              stream: false,
            }),
          });
          if (!response.ok) throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
          return await response.json();
        },
      });
    }

    // Duplicate MCP server registration removed (already registered earlier in initializeProviders).
  }

  listProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  get(name: string): Provider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Provider "${name}" not found.`);
    }
    return provider;
  }

  registerProvider(name: string, provider: Provider): void {
    this.providers.set(name, provider);
  }
}
