import { ToolBase } from "../core/tools/ToolBase";
import { Notice } from "obsidian";

export interface NotionDatabase {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  cover?: string;
  properties: NotionProperty[];
  parent: {
    type: string;
    page_id?: string;
    workspace?: boolean;
  };
  url: string;
  archived: boolean;
  created_time: string;
  last_edited_time: string;
  created_by: NotionUser;
  last_edited_by: NotionUser;
}

export interface NotionProperty {
  id: string;
  name: string;
  type: 'title' | 'rich_text' | 'number' | 'select' | 'multi_select' | 'date' | 'people' | 'files' | 'checkbox' | 'url' | 'email' | 'phone_number' | 'formula' | 'relation' | 'rollup' | 'created_time' | 'created_by' | 'last_edited_time' | 'last_edited_by';
  title?: any;
  rich_text?: any;
  number?: any;
  select?: any;
  multi_select?: any;
  date?: any;
  people?: any;
  files?: any;
  checkbox?: any;
  url?: any;
  email?: any;
  phone_number?: any;
  formula?: any;
  relation?: any;
  rollup?: any;
}

export interface NotionPage {
  id: string;
  object: 'page';
  created_time: string;
  last_edited_time: string;
  created_by: NotionUser;
  last_edited_by: NotionUser;
  parent: {
    type: string;
    database_id?: string;
    page_id?: string;
  };
  archived: boolean;
  properties: Record<string, any>;
  url: string;
}

export interface NotionUser {
  object: 'user';
  id: string;
  name?: string;
  avatar_url?: string;
  type: 'person' | 'bot';
  person?: {
    email: string;
  };
  bot?: {
    workspace_name: string;
  };
}

export interface NotionQuery {
  database_id: string;
  filter?: any;
  sorts?: any[];
  page_size?: number;
  start_cursor?: string;
}

export interface NotionResult {
  success: boolean;
  data?: any;
  error?: string;
  next_cursor?: string;
  has_more: boolean;
}

export class NotionDatabaseTool extends ToolBase {
  private apiKey: string = "";
  private baseUrl: string = "https://api.notion.com/v1";
  private databases: Map<string, NotionDatabase> = new Map();

  constructor() {
    super({
      id: "notion-database",
      name: "Notion Database",
      description: "Manage Notion databases, pages, and properties with full CRUD operations",
      category: "Integration",
      icon: "database",
      version: "1.0.0",
      author: "Ultima-Orb",
      tags: ["notion", "database", "integration", "crm", "project-management"]
    });
  }

  async execute(params: any): Promise<NotionResult> {
    try {
      const { action, ...data } = params;

      switch (action) {
        case 'set_api_key':
          return await this.setApiKey(data);
        case 'list_databases':
          return await this.listDatabases();
        case 'get_database':
          return await this.getDatabase(data);
        case 'create_database':
          return await this.createDatabase(data);
        case 'update_database':
          return await this.updateDatabase(data);
        case 'delete_database':
          return await this.deleteDatabase(data);
        case 'query_database':
          return await this.queryDatabase(data);
        case 'create_page':
          return await this.createPage(data);
        case 'get_page':
          return await this.getPage(data);
        case 'update_page':
          return await this.updatePage(data);
        case 'delete_page':
          return await this.deletePage(data);
        case 'search':
          return await this.search(data);
        case 'get_user':
          return await this.getUser(data);
        case 'get_block':
          return await this.getBlock(data);
        case 'update_block':
          return await this.updateBlock(data);
        case 'delete_block':
          return await this.deleteBlock(data);
        case 'get_block_children':
          return await this.getBlockChildren(data);
        case 'append_block_children':
          return await this.appendBlockChildren(data);
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        has_more: false
      };
    }
  }

  private async setApiKey(data: { apiKey: string }): Promise<NotionResult> {
    this.apiKey = data.apiKey;
    new Notice("Notion API key set successfully");
    
    return {
      success: true,
      has_more: false
    };
  }

  private async listDatabases(): Promise<NotionResult> {
    try {
      const response = await this.makeRequest('POST', '/search', {
        filter: {
          property: 'object',
          value: 'database'
        }
      });

      const databases = response.results || [];
      databases.forEach((db: NotionDatabase) => {
        this.databases.set(db.id, db);
      });

      return {
        success: true,
        data: databases,
        has_more: response.has_more || false,
        next_cursor: response.next_cursor
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        has_more: false
      };
    }
  }

  private async getDatabase(data: { database_id: string }): Promise<NotionResult> {
    try {
      const response = await this.makeRequest('GET', `/databases/${data.database_id}`);
      
      this.databases.set(response.id, response);
      
      return {
        success: true,
        data: response,
        has_more: false
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        has_more: false
      };
    }
  }

  private async createDatabase(data: { 
    parent: { type: string; page_id?: string }; 
    title: any[]; 
    properties: Record<string, NotionProperty>;
    description?: any[];
  }): Promise<NotionResult> {
    try {
      const response = await this.makeRequest('POST', '/databases', data);
      
      this.databases.set(response.id, response);
      new Notice(`Database "${response.title[0]?.plain_text || 'Untitled'}" created successfully`);
      
      return {
        success: true,
        data: response,
        has_more: false
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        has_more: false
      };
    }
  }

  private async updateDatabase(data: { 
    database_id: string; 
    title?: any[]; 
    properties?: Record<string, NotionProperty>;
    description?: any[];
  }): Promise<NotionResult> {
    try {
      const response = await this.makeRequest('PATCH', `/databases/${data.database_id}`, data);
      
      this.databases.set(response.id, response);
      new Notice(`Database "${response.title[0]?.plain_text || 'Untitled'}" updated successfully`);
      
      return {
        success: true,
        data: response,
        has_more: false
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        has_more: false
      };
    }
  }

  private async deleteDatabase(data: { database_id: string }): Promise<NotionResult> {
    try {
      await this.makeRequest('DELETE', `/databases/${data.database_id}`);
      
      this.databases.delete(data.database_id);
      new Notice("Database deleted successfully");
      
      return {
        success: true,
        has_more: false
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        has_more: false
      };
    }
  }

  private async queryDatabase(data: NotionQuery): Promise<NotionResult> {
    try {
      const response = await this.makeRequest('POST', `/databases/${data.database_id}/query`, {
        filter: data.filter,
        sorts: data.sorts,
        page_size: data.page_size || 100,
        start_cursor: data.start_cursor
      });

      return {
        success: true,
        data: response.results || [],
        has_more: response.has_more || false,
        next_cursor: response.next_cursor
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        has_more: false
      };
    }
  }

  private async createPage(data: { 
    parent: { type: string; database_id?: string; page_id?: string };
    properties: Record<string, any>;
    children?: any[];
  }): Promise<NotionResult> {
    try {
      const response = await this.makeRequest('POST', '/pages', data);
      
      new Notice("Page created successfully");
      
      return {
        success: true,
        data: response,
        has_more: false
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        has_more: false
      };
    }
  }

  private async getPage(data: { page_id: string }): Promise<NotionResult> {
    try {
      const response = await this.makeRequest('GET', `/pages/${data.page_id}`);
      
      return {
        success: true,
        data: response,
        has_more: false
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        has_more: false
      };
    }
  }

  private async updatePage(data: { 
    page_id: string; 
    properties?: Record<string, any>;
    archived?: boolean;
  }): Promise<NotionResult> {
    try {
      const response = await this.makeRequest('PATCH', `/pages/${data.page_id}`, data);
      
      new Notice("Page updated successfully");
      
      return {
        success: true,
        data: response,
        has_more: false
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        has_more: false
      };
    }
  }

  private async deletePage(data: { page_id: string }): Promise<NotionResult> {
    try {
      await this.makeRequest('PATCH', `/pages/${data.page_id}`, { archived: true });
      
      new Notice("Page deleted successfully");
      
      return {
        success: true,
        has_more: false
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        has_more: false
      };
    }
  }

  private async search(data: { 
    query?: string; 
    filter?: any; 
    sort?: any; 
    page_size?: number; 
    start_cursor?: string;
  }): Promise<NotionResult> {
    try {
      const response = await this.makeRequest('POST', '/search', data);

      return {
        success: true,
        data: response.results || [],
        has_more: response.has_more || false,
        next_cursor: response.next_cursor
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        has_more: false
      };
    }
  }

  private async getUser(data: { user_id?: string }): Promise<NotionResult> {
    try {
      const endpoint = data.user_id ? `/users/${data.user_id}` : '/users/me';
      const response = await this.makeRequest('GET', endpoint);
      
      return {
        success: true,
        data: response,
        has_more: false
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        has_more: false
      };
    }
  }

  private async getBlock(data: { block_id: string }): Promise<NotionResult> {
    try {
      const response = await this.makeRequest('GET', `/blocks/${data.block_id}`);
      
      return {
        success: true,
        data: response,
        has_more: false
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        has_more: false
      };
    }
  }

  private async updateBlock(data: { 
    block_id: string; 
    [key: string]: any;
  }): Promise<NotionResult> {
    try {
      const { block_id, ...updateData } = data;
      const response = await this.makeRequest('PATCH', `/blocks/${block_id}`, updateData);
      
      new Notice("Block updated successfully");
      
      return {
        success: true,
        data: response,
        has_more: false
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        has_more: false
      };
    }
  }

  private async deleteBlock(data: { block_id: string }): Promise<NotionResult> {
    try {
      await this.makeRequest('DELETE', `/blocks/${data.block_id}`);
      
      new Notice("Block deleted successfully");
      
      return {
        success: true,
        has_more: false
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        has_more: false
      };
    }
  }

  private async getBlockChildren(data: { 
    block_id: string; 
    page_size?: number; 
    start_cursor?: string;
  }): Promise<NotionResult> {
    try {
      const response = await this.makeRequest('GET', `/blocks/${data.block_id}/children`, {
        page_size: data.page_size || 100,
        start_cursor: data.start_cursor
      });

      return {
        success: true,
        data: response.results || [],
        has_more: response.has_more || false,
        next_cursor: response.next_cursor
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        has_more: false
      };
    }
  }

  private async appendBlockChildren(data: { 
    block_id: string; 
    children: any[];
  }): Promise<NotionResult> {
    try {
      const response = await this.makeRequest('PATCH', `/blocks/${data.block_id}/children`, {
        children: data.children
      });
      
      new Notice("Block children appended successfully");
      
      return {
        success: true,
        data: response,
        has_more: false
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        has_more: false
      };
    }
  }

  // Utility method for making API requests
  private async makeRequest(method: string, endpoint: string, body?: any): Promise<any> {
    if (!this.apiKey) {
      throw new Error("Notion API key not set. Please set the API key first.");
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Notion API error: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  }

  // Database management
  getDatabases(): NotionDatabase[] {
    return Array.from(this.databases.values());
  }

  getDatabaseById(id: string): NotionDatabase | null {
    return this.databases.get(id) || null;
  }

  // Property utilities
  createProperty(name: string, type: NotionProperty['type'], options?: any): NotionProperty {
    const property: NotionProperty = {
      id: this.generateId(),
      name,
      type,
      ...options
    };

    return property;
  }

  // Common property types
  createTitleProperty(name: string): NotionProperty {
    return this.createProperty(name, 'title', {
      title: {}
    });
  }

  createRichTextProperty(name: string): NotionProperty {
    return this.createProperty(name, 'rich_text', {
      rich_text: {}
    });
  }

  createNumberProperty(name: string): NotionProperty {
    return this.createProperty(name, 'number', {
      number: {}
    });
  }

  createSelectProperty(name: string, options: string[]): NotionProperty {
    return this.createProperty(name, 'select', {
      select: {
        options: options.map(option => ({ name: option, color: 'default' }))
      }
    });
  }

  createMultiSelectProperty(name: string, options: string[]): NotionProperty {
    return this.createProperty(name, 'multi_select', {
      multi_select: {
        options: options.map(option => ({ name: option, color: 'default' }))
      }
    });
  }

  createDateProperty(name: string): NotionProperty {
    return this.createProperty(name, 'date', {
      date: {}
    });
  }

  createPeopleProperty(name: string): NotionProperty {
    return this.createProperty(name, 'people', {
      people: {}
    });
  }

  createFilesProperty(name: string): NotionProperty {
    return this.createProperty(name, 'files', {
      files: {}
    });
  }

  createCheckboxProperty(name: string): NotionProperty {
    return this.createProperty(name, 'checkbox', {
      checkbox: {}
    });
  }

  createUrlProperty(name: string): NotionProperty {
    return this.createProperty(name, 'url', {
      url: {}
    });
  }

  createEmailProperty(name: string): NotionProperty {
    return this.createProperty(name, 'email', {
      email: {}
    });
  }

  createPhoneProperty(name: string): NotionProperty {
    return this.createProperty(name, 'phone_number', {
      phone_number: {}
    });
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Template databases
  createTaskDatabase(parentPageId: string): Promise<NotionResult> {
    const properties = {
      'Name': this.createTitleProperty('Name'),
      'Status': this.createSelectProperty('Status', ['Not Started', 'In Progress', 'Done']),
      'Priority': this.createSelectProperty('Priority', ['Low', 'Medium', 'High']),
      'Due Date': this.createDateProperty('Due Date'),
      'Assignee': this.createPeopleProperty('Assignee'),
      'Description': this.createRichTextProperty('Description'),
      'Tags': this.createMultiSelectProperty('Tags', ['Bug', 'Feature', 'Documentation']),
      'Done': this.createCheckboxProperty('Done')
    };

    return this.createDatabase({
      parent: { type: 'page_id', page_id: parentPageId },
      title: [{ type: 'text', text: { content: 'Task Database' } }],
      properties
    });
  }

  createProjectDatabase(parentPageId: string): Promise<NotionResult> {
    const properties = {
      'Project Name': this.createTitleProperty('Project Name'),
      'Status': this.createSelectProperty('Status', ['Planning', 'Active', 'Completed', 'On Hold']),
      'Start Date': this.createDateProperty('Start Date'),
      'End Date': this.createDateProperty('End Date'),
      'Project Manager': this.createPeopleProperty('Project Manager'),
      'Team': this.createPeopleProperty('Team'),
      'Description': this.createRichTextProperty('Description'),
      'Budget': this.createNumberProperty('Budget'),
      'Progress': this.createNumberProperty('Progress'),
      'Tags': this.createMultiSelectProperty('Tags', ['Web', 'Mobile', 'AI', 'Design'])
    };

    return this.createDatabase({
      parent: { type: 'page_id', page_id: parentPageId },
      title: [{ type: 'text', text: { content: 'Project Database' } }],
      properties
    });
  }

  createContactDatabase(parentPageId: string): Promise<NotionResult> {
    const properties = {
      'Name': this.createTitleProperty('Name'),
      'Email': this.createEmailProperty('Email'),
      'Phone': this.createPhoneProperty('Phone'),
      'Company': this.createRichTextProperty('Company'),
      'Position': this.createRichTextProperty('Position'),
      'Status': this.createSelectProperty('Status', ['Lead', 'Customer', 'Partner', 'Vendor']),
      'Tags': this.createMultiSelectProperty('Tags', ['VIP', 'Decision Maker', 'Technical']),
      'Last Contact': this.createDateProperty('Last Contact'),
      'Notes': this.createRichTextProperty('Notes')
    };

    return this.createDatabase({
      parent: { type: 'page_id', page_id: parentPageId },
      title: [{ type: 'text', text: { content: 'Contact Database' } }],
      properties
    });
  }
}
