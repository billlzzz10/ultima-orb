import { NotionMCPClient, NotionPage, NotionDatabase, NotionBlock } from '../integrations/NotionMCPClient';
import { Logger } from '../services/Logger';
import type { NotionPropertyValue, NotionFilter, NotionSort } from '../types/notion-api';

export interface NotionToolParams {
    databaseId?: string;
    pageId?: string;
    parentId?: string;
    title?: string;
    properties?: Record<string, NotionPropertyValue>;
    query?: string;
    filter?: NotionFilter;
    sorts?: NotionSort[];
    blocks?: NotionBlock[];
}

export class NotionTools {
  private notionClient: NotionMCPClient;
  private logger: Logger;

  constructor(notionClient: NotionMCPClient, logger: Logger) {
    this.notionClient = notionClient;
    this.logger = logger;
  }

  // Tool: Query Notion Database
  async queryDatabase(params: NotionToolParams): Promise<NotionPage[]> {
    try {
      if (!params.databaseId) {
        throw new Error('Database ID is required');
      }

      this.logger.info(`Executing queryDatabase tool with database: ${params.databaseId}`);
      return await this.notionClient.queryDatabase(
        params.databaseId,
        params.filter,
        params.sorts
      );
    } catch (error) {
      this.logger.error('queryDatabase tool failed:', error);
      throw error;
    }
  }

  // Tool: Create Notion Page
  async createPage(params: NotionToolParams): Promise<NotionPage> {
    try {
      if (!params.parentId || !params.properties) {
        throw new Error('Parent ID and properties are required');
      }

      this.logger.info(`Executing createPage tool with parent: ${params.parentId}`);
      return await this.notionClient.createPage(params.parentId, params.properties);
    } catch (error) {
      this.logger.error('createPage tool failed:', error);
      throw error;
    }
  }

  // Tool: Update Notion Page
  async updatePage(params: NotionToolParams): Promise<NotionPage> {
    try {
      if (!params.pageId || !params.properties) {
        throw new Error('Page ID and properties are required');
      }

      this.logger.info(`Executing updatePage tool with page: ${params.pageId}`);
      return await this.notionClient.updatePage(params.pageId, params.properties);
    } catch (error) {
      this.logger.error('updatePage tool failed:', error);
      throw error;
    }
  }

  // Tool: Get Notion Page
  async getPage(params: NotionToolParams): Promise<NotionPage> {
    try {
      if (!params.pageId) {
        throw new Error('Page ID is required');
      }

      this.logger.info(`Executing getPage tool with page: ${params.pageId}`);
      return await this.notionClient.getPage(params.pageId);
    } catch (error) {
      this.logger.error('getPage tool failed:', error);
      throw error;
    }
  }

  // Tool: Get Page Blocks
  async getPageBlocks(params: NotionToolParams): Promise<NotionBlock[]> {
    try {
      if (!params.pageId) {
        throw new Error('Page ID is required');
      }

      this.logger.info(`Executing getPageBlocks tool with page: ${params.pageId}`);
      return await this.notionClient.getPageBlocks(params.pageId);
    } catch (error) {
      this.logger.error('getPageBlocks tool failed:', error);
      throw error;
    }
  }

  // Tool: Append Blocks to Page
  async appendBlocks(params: NotionToolParams): Promise<void> {
    try {
      if (!params.pageId || !params.blocks) {
        throw new Error('Page ID and blocks are required');
      }

      this.logger.info(`Executing appendBlocks tool with page: ${params.pageId}`);
      await this.notionClient.appendBlocks(params.pageId, params.blocks);
    } catch (error) {
      this.logger.error('appendBlocks tool failed:', error);
      throw error;
    }
  }

  // Tool: Search Pages
  async searchPages(params: NotionToolParams): Promise<NotionPage[]> {
    try {
      if (!params.query) {
        throw new Error('Search query is required');
      }

      this.logger.info(`Executing searchPages tool with query: ${params.query}`);
      return await this.notionClient.searchPages(params.query, params.filter);
    } catch (error) {
      this.logger.error('searchPages tool failed:', error);
      throw error;
    }
  }

  // Tool: Search Databases
  async searchDatabases(params: NotionToolParams): Promise<NotionDatabase[]> {
    try {
      if (!params.query) {
        throw new Error('Search query is required');
      }

      this.logger.info(`Executing searchDatabases tool with query: ${params.query}`);
      return await this.notionClient.searchDatabases(params.query);
    } catch (error) {
      this.logger.error('searchDatabases tool failed:', error);
      throw error;
    }
  }

  // Tool: Create Database
  async createDatabase(params: NotionToolParams): Promise<NotionDatabase> {
    try {
      if (!params.parentId || !params.title || !params.properties) {
        throw new Error('Parent ID, title, and properties are required');
      }

      this.logger.info(`Executing createDatabase tool with title: ${params.title}`);
      return await this.notionClient.createDatabase(
        params.parentId,
        params.title,
        params.properties
      );
    } catch (error) {
      this.logger.error('createDatabase tool failed:', error);
      throw error;
    }
  }

  // Tool: Update Database
  async updateDatabase(params: NotionToolParams): Promise<NotionDatabase> {
    try {
      if (!params.databaseId || !params.properties) {
        throw new Error('Database ID and properties are required');
      }

      this.logger.info(`Executing updateDatabase tool with database: ${params.databaseId}`);
      return await this.notionClient.updateDatabase(params.databaseId, params.properties);
    } catch (error) {
      this.logger.error('updateDatabase tool failed:', error);
      throw error;
    }
  }

  // Tool: Delete Page
  async deletePage(params: NotionToolParams): Promise<void> {
    try {
      if (!params.pageId) {
        throw new Error('Page ID is required');
      }

      this.logger.info(`Executing deletePage tool with page: ${params.pageId}`);
      await this.notionClient.deletePage(params.pageId);
    } catch (error) {
      this.logger.error('deletePage tool failed:', error);
      throw error;
    }
  }

  // Tool: Get Database
  async getDatabase(params: NotionToolParams): Promise<NotionDatabase> {
    try {
      if (!params.databaseId) {
        throw new Error('Database ID is required');
      }

      this.logger.info(`Executing getDatabase tool with database: ${params.databaseId}`);
      return await this.notionClient.getDatabase(params.databaseId);
    } catch (error) {
      this.logger.error('getDatabase tool failed:', error);
      throw error;
    }
  }

  // Tool: Get Users
  async getUsers(): Promise<any[]> {
    try {
      this.logger.info('Executing getUsers tool');
      return await this.notionClient.getUsers();
    } catch (error) {
      this.logger.error('getUsers tool failed:', error);
      throw error;
    }
  }

  // Tool: Get Block Children
  async getBlockChildren(params: NotionToolParams): Promise<NotionBlock[]> {
    try {
      if (!params.pageId) {
        throw new Error('Page ID is required');
      }

      this.logger.info(`Executing getBlockChildren tool with page: ${params.pageId}`);
      return await this.notionClient.getBlockChildren(params.pageId);
    } catch (error) {
      this.logger.error('getBlockChildren tool failed:', error);
      throw error;
    }
  }

  // Get all available tools
  getAvailableTools(): string[] {
    return [
      'notion:query_database',
      'notion:create_page',
      'notion:update_page',
      'notion:get_page',
      'notion:get_page_blocks',
      'notion:append_blocks',
      'notion:search_pages',
      'notion:search_databases',
      'notion:create_database',
      'notion:update_database',
      'notion:delete_page',
      'notion:get_database',
      'notion:get_users',
      'notion:get_block_children'
    ];
  }

  // Execute tool by name
  async executeTool(toolName: string, params: NotionToolParams): Promise<unknown> {
    switch (toolName) {
    case 'notion:query_database':
      return await this.queryDatabase(params);
    case 'notion:create_page':
      return await this.createPage(params);
    case 'notion:update_page':
      return await this.updatePage(params);
    case 'notion:get_page':
      return await this.getPage(params);
    case 'notion:get_page_blocks':
      return await this.getPageBlocks(params);
    case 'notion:append_blocks':
      return await this.appendBlocks(params);
    case 'notion:search_pages':
      return await this.searchPages(params);
    case 'notion:search_databases':
      return await this.searchDatabases(params);
    case 'notion:create_database':
      return await this.createDatabase(params);
    case 'notion:update_database':
      return await this.updateDatabase(params);
    case 'notion:delete_page':
      return await this.deletePage(params);
    case 'notion:get_database':
      return await this.getDatabase(params);
    case 'notion:get_users':
      return await this.getUsers();
    case 'notion:get_block_children':
      return await this.getBlockChildren(params);
    default:
      throw new Error(`Unknown Notion tool: ${toolName}`);
    }
  }
}
