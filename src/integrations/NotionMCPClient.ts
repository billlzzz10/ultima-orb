import { Logger } from '../services/Logger';
import type { 
  NotionAPIRequest, 
  NotionAPIResponse, 
  NotionFilter, 
  NotionSort, 
  NotionPropertyValue,
  NotionRichText,
  NotionBlock as NotionBlockType,
  NotionDatabaseRequest,
  NotionPageRequest
} from '../types/notion-api';

export interface NotionPage {
    id: string;
    title: string;
    url: string;
    properties: Record<string, NotionPropertyValue>;
    created_time: string;
    last_edited_time: string;
}

export interface NotionDatabase {
    id: string;
    title: string;
    url: string;
    properties: Record<string, NotionPropertyValue>;
}

export interface NotionBlock {
    id: string;
    type: string;
    content: Record<string, unknown>;
}

export class NotionMCPClient {
  private logger: Logger;
  private notionToken: string;
  private baseUrl = 'https://api.notion.com/v1';

  constructor(logger: Logger, notionToken: string) {
    this.logger = logger;
    this.notionToken = notionToken;
  }

  // Initialize client
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Notion API client...');
      // Test connection by making a simple API call
      await this.searchPages('test', undefined, 1);
      this.logger.info('Notion API client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Notion API client:', error);
      throw error;
    }
  }

  // Helper method for API calls
  private async makeRequest(endpoint: string, method: string = 'GET', body?: NotionAPIRequest): Promise<NotionAPIResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.notionToken}`,
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

    try {
      const response = await fetch(url, options);
            
      if (!response.ok) {
        throw new Error(`Notion API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Database operations
  async queryDatabase(databaseId: string, filter?: NotionFilter, sorts?: NotionSort[]): Promise<NotionPage[]> {
    try {
      this.logger.info(`Querying database: ${databaseId}`);
            
      const body: NotionAPIRequest = {};
      if (filter) body.filter = filter;
      if (sorts) body.sorts = sorts;

      const response = await this.makeRequest(`/databases/${databaseId}/query`, 'POST', body);
            
      return response.results.map((page: unknown) => {
        const p = page as NotionAPIResponse;
        return {
          id: p.id,
          title: this.extractTitle(p.properties),
          url: p.url,
          properties: p.properties,
          created_time: p.created_time,
          last_edited_time: p.last_edited_time
        };
      });
    } catch (error) {
      this.logger.error(`Failed to query database ${databaseId}:`, error);
      throw error;
    }
  }

  async createPage(parentId: string, properties: Record<string, NotionPropertyValue>): Promise<NotionPage> {
    try {
      this.logger.info(`Creating page in parent: ${parentId}`);
            
      const body = {
        parent: { page_id: parentId, type: 'page_id' as const },
        properties
      };

      const response = await this.makeRequest('/pages', 'POST', body);
            
      return {
        id: response.id,
        title: this.extractTitle(response.properties),
        url: response.url,
        properties: response.properties,
        created_time: response.created_time,
        last_edited_time: response.last_edited_time
      };
    } catch (error) {
      this.logger.error('Failed to create page:', error);
      throw error;
    }
  }

  async updatePage(pageId: string, properties: Record<string, NotionPropertyValue>): Promise<NotionPage> {
    try {
      this.logger.info(`Updating page: ${pageId}`);
            
      const body = { properties };
      const response = await this.makeRequest(`/pages/${pageId}`, 'PATCH', body);
            
      return {
        id: response.id,
        title: this.extractTitle(response.properties),
        url: response.url,
        properties: response.properties,
        created_time: response.created_time,
        last_edited_time: response.last_edited_time
      };
    } catch (error) {
      this.logger.error(`Failed to update page ${pageId}:`, error);
      throw error;
    }
  }

  async getPage(pageId: string): Promise<NotionPage> {
    try {
      this.logger.info(`Getting page: ${pageId}`);
            
      const response = await this.makeRequest(`/pages/${pageId}`);
            
      return {
        id: response.id,
        title: this.extractTitle(response.properties),
        url: response.url,
        properties: response.properties,
        created_time: response.created_time,
        last_edited_time: response.last_edited_time
      };
    } catch (error) {
      this.logger.error(`Failed to get page ${pageId}:`, error);
      throw error;
    }
  }

  async getPageBlocks(pageId: string): Promise<NotionBlock[]> {
    try {
      this.logger.info(`Getting blocks for page: ${pageId}`);
            
      const response = await this.makeRequest(`/blocks/${pageId}/children`);
            
      return response.results.map((block: unknown) => {
        const b = block as NotionBlockType;
        return {
          id: b.id,
          type: b.type,
          content: b[b.type] as Record<string, unknown>
        };
      });
    } catch (error) {
      this.logger.error(`Failed to get blocks for page ${pageId}:`, error);
      throw error;
    }
  }

  async appendBlocks(pageId: string, blocks: NotionBlock[]): Promise<void> {
    try {
      this.logger.info(`Appending blocks to page: ${pageId}`);
            
      const body = {
        children: blocks.map(block => ({
          id: block.id,
          object: 'block' as const,
          type: block.type,
          [block.type]: block.content
        }))
      };

      await this.makeRequest(`/blocks/${pageId}/children`, 'PATCH', body);
    } catch (error) {
      this.logger.error(`Failed to append blocks to page ${pageId}:`, error);
      throw error;
    }
  }

  // Search operations
  async searchPages(query: string, filter?: NotionFilter, pageSize: number = 10): Promise<NotionPage[]> {
    try {
      this.logger.info(`Searching pages with query: ${query}`);
            
      const body: NotionAPIRequest = {
        query,
        page_size: pageSize,
        filter: { property: 'object', value: 'page' }
      };

      if (filter) {
        body.filter = { ...body.filter, ...filter };
      }

      const response = await this.makeRequest('/search', 'POST', body);
            
      return response.results.map((page: unknown) => {
        const p = page as NotionAPIResponse;
        return {
          id: p.id,
          title: this.extractTitle(p.properties),
          url: p.url,
          properties: p.properties,
          created_time: p.created_time,
          last_edited_time: p.last_edited_time
        };
      });
    } catch (error) {
      this.logger.error('Failed to search pages:', error);
      throw error;
    }
  }

  async searchDatabases(query: string): Promise<NotionDatabase[]> {
    try {
      this.logger.info(`Searching databases with query: ${query}`);
            
      const body = {
        query,
        filter: { property: 'object', value: 'database' }
      };

      const response = await this.makeRequest('/search', 'POST', body);
            
      return response.results.map((db: unknown) => {
        const d = db as NotionAPIResponse;
        return {
          id: d.id,
          title: this.extractTitle(d.properties),
          url: d.url,
          properties: d.properties
        };
      });
    } catch (error) {
      this.logger.error('Failed to search databases:', error);
      throw error;
    }
  }

  // Database management
  async createDatabase(parentId: string, title: string, properties: Record<string, NotionPropertyValue>): Promise<NotionDatabase> {
    try {
      this.logger.info(`Creating database: ${title}`);
            
      const body = {
        parent: { page_id: parentId, type: 'page_id' as const },
        title: [{ text: { content: title } }],
        properties
      };

      const response = await this.makeRequest('/databases', 'POST', body);
            
      return {
        id: response.id,
        title: this.extractTitle(response.properties),
        url: response.url,
        properties: response.properties
      };
    } catch (error) {
      this.logger.error('Failed to create database:', error);
      throw error;
    }
  }

  async updateDatabase(databaseId: string, properties: Record<string, NotionPropertyValue>): Promise<NotionDatabase> {
    try {
      this.logger.info(`Updating database: ${databaseId}`);
            
      const body = { properties };
      const response = await this.makeRequest(`/databases/${databaseId}`, 'PATCH', body);
            
      return {
        id: response.id,
        title: this.extractTitle(response.properties),
        url: response.url,
        properties: response.properties
      };
    } catch (error) {
      this.logger.error(`Failed to update database ${databaseId}:`, error);
      throw error;
    }
  }

  // Utility methods
  private extractTitle(properties: Record<string, NotionPropertyValue>): string {
    // Try to extract title from various property types
    for (const [, prop] of Object.entries(properties)) {
      if (prop && typeof prop === 'object') {
        if (prop.title && Array.isArray(prop.title)) {
          return prop.title.map((t: NotionRichText) => t.plain_text).join('');
        }
        if (prop.rich_text && Array.isArray(prop.rich_text)) {
          return prop.rich_text.map((t: NotionRichText) => t.plain_text).join('');
        }
        if (prop.name && Array.isArray(prop.name)) {
          return prop.name.map((t: NotionRichText) => t.plain_text).join('');
        }
      }
    }
    return 'Untitled';
  }

  async testConnection(): Promise<boolean> {
    try {
      this.logger.info('Testing Notion API connection...');
      // Try to search for pages with a simple query
      await this.searchPages('test', undefined, 1);
      return true;
    } catch (error) {
      this.logger.error('Notion API connection test failed:', error);
      return false;
    }
  }

  dispose(): void {
    this.logger.info('Notion API client disposed');
  }
}
