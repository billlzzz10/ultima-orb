import { App, Notice } from "obsidian";
import { FeatureManager } from "../../core/FeatureManager";

export interface NotionDatabase {
  id: string;
  title: string;
  description?: string;
  properties: Record<string, NotionProperty>;
  created_time: string;
  last_edited_time: string;
  parent: {
    type: string;
    page_id?: string;
    database_id?: string;
  };
  url: string;
  archived: boolean;
}

export interface NotionProperty {
  id: string;
  type: string;
  name: string;
  title?: {
    type: string;
    text: {
      content: string;
      link?: {
        url: string;
      };
    };
    annotations?: {
      bold: boolean;
      italic: boolean;
      strikethrough: boolean;
      underline: boolean;
      code: boolean;
      color: string;
    };
  };
  rich_text?: {
    type: string;
    text: {
      content: string;
      link?: {
        url: string;
      };
    };
  };
  number?: number;
  select?: {
    id: string;
    name: string;
    color: string;
  };
  multi_select?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  date?: {
    start: string;
    end?: string;
    time_zone?: string;
  };
  checkbox?: boolean;
  url?: string;
  email?: string;
  phone_number?: string;
  formula?: {
    type: string;
    string?: string;
    number?: number;
    boolean?: boolean;
    date?: {
      start: string;
      end?: string;
    };
  };
  relation?: Array<{
    id: string;
  }>;
  rollup?: {
    type: string;
    number?: number;
    date?: {
      start: string;
      end?: string;
    };
    array?: Array<{
      type: string;
      title?: Array<{
        type: string;
        text: {
          content: string;
        };
      }>;
    }>;
  };
  people?: Array<{
    id: string;
    name: string;
    avatar_url?: string;
    type: string;
    person?: {
      email: string;
    };
  }>;
  files?: Array<{
    name: string;
    type: string;
    file?: {
      url: string;
      expiry_time: string;
    };
    external?: {
      url: string;
    };
  }>;
}

export interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  created_by: {
    id: string;
    name: string;
    avatar_url?: string;
    type: string;
  };
  last_edited_by: {
    id: string;
    name: string;
    avatar_url?: string;
    type: string;
  };
  parent: {
    type: string;
    page_id?: string;
    database_id?: string;
  };
  archived: boolean;
  url: string;
  public_url?: string;
  properties: Record<string, NotionProperty>;
}

export interface NotionQuery {
  filter?: {
    property: string;
    condition: string;
    value: any;
  };
  sorts?: Array<{
    property: string;
    direction: "ascending" | "descending";
  }>;
  page_size?: number;
  start_cursor?: string;
}

export class NotionDatabaseManager {
  private app: App;
  private featureManager: FeatureManager;
  private apiKey: string;
  private baseUrl: string;

  constructor(app: App, featureManager: FeatureManager) {
    this.app = app;
    this.featureManager = featureManager;
    this.apiKey = "";
    this.baseUrl = "https://api.notion.com/v1";
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    if (!this.apiKey) {
      throw new Error("Notion API key not set");
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(
          `Notion API error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Notion API request failed:", error);
      throw error;
    }
  }

  async listDatabases(): Promise<NotionDatabase[]> {
    const response = await this.makeRequest("/search", {
      method: "POST",
      body: JSON.stringify({
        filter: {
          property: "object",
          value: "database",
        },
      }),
    });

    return response.results || [];
  }

  async getDatabase(databaseId: string): Promise<NotionDatabase> {
    try {
      const response = await this.makeRequest(`/databases/${databaseId}`);
      return response;
    } catch (error) {
      console.error("Error getting Notion database:", error);
      throw error;
    }
  }

  async queryDatabase(
    databaseId: string,
    query: NotionQuery = {}
  ): Promise<NotionPage[]> {
    try {
      const response = await this.makeRequest(
        `/databases/${databaseId}/query`,
        {
          method: "POST",
          body: JSON.stringify(query),
        }
      );

      return response.results || [];
    } catch (error) {
      console.error("Error querying Notion database:", error);
      throw error;
    }
  }

  async createDatabase(
    parentId: string,
    title: string,
    properties: Record<string, NotionProperty>
  ): Promise<NotionDatabase> {
    try {
      const response = await this.makeRequest("/databases", {
        method: "POST",
        body: JSON.stringify({
          parent: {
            page_id: parentId,
          },
          title: [
            {
              type: "text",
              text: {
                content: title,
              },
            },
          ],
          properties,
        }),
      });

      new Notice(`Database "${title}" created successfully`);
      return response;
    } catch (error) {
      console.error("Error creating Notion database:", error);
      new Notice("Error creating Notion database");
      throw error;
    }
  }

  async updateDatabase(
    databaseId: string,
    updates: Partial<NotionDatabase>
  ): Promise<NotionDatabase> {
    try {
      const response = await this.makeRequest(`/databases/${databaseId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      new Notice("Database updated successfully");
      return response;
    } catch (error) {
      console.error("Error updating Notion database:", error);
      new Notice("Error updating Notion database");
      throw error;
    }
  }

  async deleteDatabase(databaseId: string): Promise<void> {
    try {
      await this.makeRequest(`/databases/${databaseId}`, {
        method: "PATCH",
        body: JSON.stringify({
          archived: true,
        }),
      });

      new Notice("Database archived successfully");
    } catch (error) {
      console.error("Error archiving Notion database:", error);
      new Notice("Error archiving Notion database");
      throw error;
    }
  }

  async createPage(
    databaseId: string,
    properties: Record<string, NotionProperty>
  ): Promise<NotionPage> {
    try {
      const response = await this.makeRequest("/pages", {
        method: "POST",
        body: JSON.stringify({
          parent: {
            database_id: databaseId,
          },
          properties,
        }),
      });

      new Notice("Page created successfully");
      return response;
    } catch (error) {
      console.error("Error creating Notion page:", error);
      new Notice("Error creating Notion page");
      throw error;
    }
  }

  async updatePage(
    pageId: string,
    properties: Record<string, NotionProperty>
  ): Promise<NotionPage> {
    try {
      const response = await this.makeRequest(`/pages/${pageId}`, {
        method: "PATCH",
        body: JSON.stringify({
          properties,
        }),
      });

      new Notice("Page updated successfully");
      return response;
    } catch (error) {
      console.error("Error updating Notion page:", error);
      new Notice("Error updating Notion page");
      throw error;
    }
  }

  async getPage(pageId: string): Promise<NotionPage> {
    try {
      const response = await this.makeRequest(`/pages/${pageId}`);
      return response;
    } catch (error) {
      console.error("Error getting Notion page:", error);
      throw error;
    }
  }

  async deletePage(pageId: string): Promise<void> {
    try {
      await this.makeRequest(`/pages/${pageId}`, {
        method: "PATCH",
        body: JSON.stringify({
          archived: true,
        }),
      });

      new Notice("Page archived successfully");
    } catch (error) {
      console.error("Error archiving Notion page:", error);
      new Notice("Error archiving Notion page");
      throw error;
    }
  }

  async searchDatabases(query: string): Promise<NotionDatabase[]> {
    try {
      const response = await this.makeRequest("/search", {
        method: "POST",
        body: JSON.stringify({
          query,
          filter: {
            property: "object",
            value: "database",
          },
        }),
      });

      return response.results || [];
    } catch (error) {
      console.error("Error searching Notion databases:", error);
      return [];
    }
  }

  async getDatabaseStats(databaseId: string): Promise<{
    totalPages: number;
    lastUpdated: string;
    properties: string[];
  }> {
    try {
      const database = await this.getDatabase(databaseId);
      const pages = await this.queryDatabase(databaseId, { page_size: 1 });

      return {
        totalPages: pages.length,
        lastUpdated: database.last_edited_time,
        properties: Object.keys(database.properties),
      };
    } catch (error) {
      console.error("Error getting database stats:", error);
      throw error;
    }
  }

  async exportDatabase(databaseId: string): Promise<string> {
    try {
      const database = await this.getDatabase(databaseId);
      const pages = await this.queryDatabase(databaseId);

      const exportData = {
        database,
        pages,
        exportedAt: new Date().toISOString(),
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("Error exporting database:", error);
      throw error;
    }
  }

  async importDatabase(importData: string): Promise<NotionDatabase> {
    try {
      const data = JSON.parse(importData);
      const { database, pages } = data;

      // Create new database
      const newDatabase = await this.createDatabase(
        database.parent.page_id || "",
        database.title[0]?.text?.content || "Imported Database",
        database.properties
      );

      // Import pages
      for (const page of pages) {
        await this.createPage(newDatabase.id, page.properties);
      }

      new Notice(`Database imported successfully with ${pages.length} pages`);
      return newDatabase;
    } catch (error) {
      console.error("Error importing database:", error);
      new Notice("Error importing database");
      throw error;
    }
  }

  // Utility methods for property creation
  createTitleProperty(name: string): NotionProperty {
    return {
      id: "",
      type: "title",
      name,
      title: {
        type: "text",
        text: {
          content: "",
        },
      },
    };
  }

  createTextProperty(name: string): NotionProperty {
    return {
      id: "",
      type: "rich_text",
      name,
      rich_text: {
        type: "text",
        text: {
          content: "",
        },
      },
    };
  }

  createNumberProperty(name: string): NotionProperty {
    return {
      id: "",
      type: "number",
      name,
      number: 0,
    };
  }

  createSelectProperty(name: string, options: string[]): NotionProperty {
    return {
      id: "",
      type: "select",
      name,
      select: {
        id: "",
        name: options[0] || "",
        color: "default",
      },
    };
  }

  createMultiSelectProperty(name: string, options: string[]): NotionProperty {
    return {
      id: "",
      type: "multi_select",
      name,
      multi_select: options.map((option, index) => ({
        id: `option-${index}`,
        name: option,
        color: "default",
      })),
    };
  }

  createDateProperty(name: string): NotionProperty {
    return {
      id: "",
      type: "date",
      name,
      date: {
        start: new Date().toISOString(),
      },
    };
  }

  createCheckboxProperty(name: string): NotionProperty {
    return {
      id: "",
      type: "checkbox",
      name,
      checkbox: false,
    };
  }

  createUrlProperty(name: string): NotionProperty {
    return {
      id: "",
      type: "url",
      name,
      url: "",
    };
  }

  createEmailProperty(name: string): NotionProperty {
    return {
      id: "",
      type: "email",
      name,
      email: "",
    };
  }

  createPhoneProperty(name: string): NotionProperty {
    return {
      id: "",
      type: "phone_number",
      name,
      phone_number: "",
    };
  }
}
