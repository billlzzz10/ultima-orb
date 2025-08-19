import { App, Notice } from "obsidian";
import { FeatureManager } from "../../core/FeatureManager";

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  fork: boolean;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  html_url: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
  };
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
}

export class GitHubMCPClient {
  private app: App;
  private featureManager: FeatureManager;
  private apiKey: string;
  private baseUrl: string;
  private mcpConnection: any;

  constructor(app: App, featureManager: FeatureManager) {
    this.app = app;
    this.featureManager = featureManager;
    this.baseUrl = "https://api.github.com";
    this.apiKey = "";
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  async initializeMCPConnection(): Promise<boolean> {
    try {
      // Initialize MCP connection to GitHub
      this.mcpConnection = await this.createMCPConnection();
      return true;
    } catch (error) {
      new Notice(`Failed to initialize GitHub MCP connection: ${error}`);
      return false;
    }
  }

  private async createMCPConnection(): Promise<any> {
    // MCP connection setup for GitHub
    return {
      // Repository operations
      listRepositories: async (username: string) => {
        return await this.makeRequest(`/users/${username}/repos`);
      },
      
      getRepository: async (owner: string, repo: string) => {
        return await this.makeRequest(`/repos/${owner}/${repo}`);
      },
      
      createRepository: async (name: string, description: string, private: boolean = false) => {
        return await this.makeRequest("/user/repos", {
          method: "POST",
          body: JSON.stringify({ name, description, private })
        });
      },
      
      // Issue operations
      listIssues: async (owner: string, repo: string, state: string = "open") => {
        return await this.makeRequest(`/repos/${owner}/${repo}/issues?state=${state}`);
      },
      
      createIssue: async (owner: string, repo: string, title: string, body: string) => {
        return await this.makeRequest(`/repos/${owner}/${repo}/issues`, {
          method: "POST",
          body: JSON.stringify({ title, body })
        });
      },
      
      // Pull Request operations
      listPullRequests: async (owner: string, repo: string, state: string = "open") => {
        return await this.makeRequest(`/repos/${owner}/${repo}/pulls?state=${state}`);
      },
      
      createPullRequest: async (owner: string, repo: string, title: string, body: string, head: string, base: string) => {
        return await this.makeRequest(`/repos/${owner}/${repo}/pulls`, {
          method: "POST",
          body: JSON.stringify({ title, body, head, base })
        });
      },
      
      // File operations
      getFile: async (owner: string, repo: string, path: string) => {
        return await this.makeRequest(`/repos/${owner}/${repo}/contents/${path}`);
      },
      
      createFile: async (owner: string, repo: string, path: string, content: string, message: string) => {
        return await this.makeRequest(`/repos/${owner}/${repo}/contents/${path}`, {
          method: "PUT",
          body: JSON.stringify({ message, content: Buffer.from(content).toString('base64') })
        });
      },
      
      updateFile: async (owner: string, repo: string, path: string, content: string, message: string, sha: string) => {
        return await this.makeRequest(`/repos/${owner}/${repo}/contents/${path}`, {
          method: "PUT",
          body: JSON.stringify({ message, content: Buffer.from(content).toString('base64'), sha })
        });
      },
      
      deleteFile: async (owner: string, repo: string, path: string, message: string, sha: string) => {
        return await this.makeRequest(`/repos/${owner}/${repo}/contents/${path}`, {
          method: "DELETE",
          body: JSON.stringify({ message, sha })
        });
      }
    };
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      ...options.headers
    };

    if (this.apiKey) {
      headers["Authorization"] = `token ${this.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Repository methods
  async listRepositories(username: string): Promise<GitHubRepository[]> {
    if (!this.mcpConnection) {
      throw new Error("MCP connection not initialized");
    }
    return await this.mcpConnection.listRepositories(username);
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    if (!this.mcpConnection) {
      throw new Error("MCP connection not initialized");
    }
    return await this.mcpConnection.getRepository(owner, repo);
  }

  async createRepository(name: string, description: string, private: boolean = false): Promise<GitHubRepository> {
    if (!this.mcpConnection) {
      throw new Error("MCP connection not initialized");
    }
    return await this.mcpConnection.createRepository(name, description, private);
  }

  // Issue methods
  async listIssues(owner: string, repo: string, state: string = "open"): Promise<GitHubIssue[]> {
    if (!this.mcpConnection) {
      throw new Error("MCP connection not initialized");
    }
    return await this.mcpConnection.listIssues(owner, repo, state);
  }

  async createIssue(owner: string, repo: string, title: string, body: string): Promise<GitHubIssue> {
    if (!this.mcpConnection) {
      throw new Error("MCP connection not initialized");
    }
    return await this.mcpConnection.createIssue(owner, repo, title, body);
  }

  // Pull Request methods
  async listPullRequests(owner: string, repo: string, state: string = "open"): Promise<GitHubPullRequest[]> {
    if (!this.mcpConnection) {
      throw new Error("MCP connection not initialized");
    }
    return await this.mcpConnection.listPullRequests(owner, repo, state);
  }

  async createPullRequest(owner: string, repo: string, title: string, body: string, head: string, base: string): Promise<GitHubPullRequest> {
    if (!this.mcpConnection) {
      throw new Error("MCP connection not initialized");
    }
    return await this.mcpConnection.createPullRequest(owner, repo, title, body, head, base);
  }

  // File methods
  async getFile(owner: string, repo: string, path: string): Promise<any> {
    if (!this.mcpConnection) {
      throw new Error("MCP connection not initialized");
    }
    return await this.mcpConnection.getFile(owner, repo, path);
  }

  async createFile(owner: string, repo: string, path: string, content: string, message: string): Promise<any> {
    if (!this.mcpConnection) {
      throw new Error("MCP connection not initialized");
    }
    return await this.mcpConnection.createFile(owner, repo, path, content, message);
  }

  async updateFile(owner: string, repo: string, path: string, content: string, message: string, sha: string): Promise<any> {
    if (!this.mcpConnection) {
      throw new Error("MCP connection not initialized");
    }
    return await this.mcpConnection.updateFile(owner, repo, path, content, message, sha);
  }

  async deleteFile(owner: string, repo: string, path: string, message: string, sha: string): Promise<any> {
    if (!this.mcpConnection) {
      throw new Error("MCP connection not initialized");
    }
    return await this.mcpConnection.deleteFile(owner, repo, path, message, sha);
  }

  // Utility methods
  async testConnection(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        throw new Error("GitHub API key not set");
      }
      await this.makeRequest("/user");
      return true;
    } catch (error) {
      new Notice(`GitHub connection test failed: ${error}`);
      return false;
    }
  }

  getApiKey(): string {
    return this.apiKey;
  }

  isConnected(): boolean {
    return !!this.mcpConnection && !!this.apiKey;
  }
}
