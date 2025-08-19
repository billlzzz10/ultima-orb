import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotionMCPClient } from '../../src/integrations/NotionMCPClient';
import { Logger } from '../../src/services/Logger';

// Mock fetch globally
global.fetch = vi.fn();

describe('NotionMCPClient', () => {
  let notionClient: NotionMCPClient;
  let mockLogger: Logger;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      log: vi.fn()
    } as unknown as Logger;

    notionClient = new NotionMCPClient(mockLogger, 'test-token');
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          results: []
        })
      };
      (fetch as any).mockResolvedValue(mockResponse);

      await notionClient.initialize();

      expect(mockLogger.info).toHaveBeenCalledWith('Initializing Notion API client...');
      expect(mockLogger.info).toHaveBeenCalledWith('Notion API client initialized successfully');
    });

    it('should handle initialization errors', async () => {
      const error = new Error('API Error');
      (fetch as any).mockRejectedValue(error);

      await expect(notionClient.initialize()).rejects.toThrow('API Error');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to initialize Notion API client:', error);
    });
  });

  describe('searchPages', () => {
    it('should search pages successfully', async () => {
      const mockPages = [
        {
          id: 'page-1',
          url: 'https://notion.so/page-1',
          properties: {
            title: {
              id: 'title-id',
              type: 'title',
              title: [{ plain_text: 'Test Page' }]
            }
          },
          created_time: '2023-01-01T00:00:00Z',
          last_edited_time: '2023-01-01T00:00:00Z'
        }
      ];

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          results: mockPages
        })
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const result = await notionClient.searchPages('test query');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('page-1');
      expect(result[0].title).toBe('Test Page');
      expect(mockLogger.info).toHaveBeenCalledWith('Searching pages with query: test query');
    });

    it('should handle search errors', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      };
      (fetch as any).mockResolvedValue(mockResponse);

      await expect(notionClient.searchPages('test query')).rejects.toThrow('Notion API error: 401 Unauthorized');
    });
  });

  describe('createPage', () => {
    it('should create page successfully', async () => {
      const mockPage = {
        id: 'page-1',
        url: 'https://notion.so/page-1',
        properties: {
          title: {
            id: 'title-id',
            type: 'title',
            title: [{ plain_text: 'New Page' }]
          }
        },
        created_time: '2023-01-01T00:00:00Z',
        last_edited_time: '2023-01-01T00:00:00Z'
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockPage)
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const properties = {
        title: {
          id: 'title',
          type: 'title',
          title: [{ type: 'text' as const, text: { content: 'New Page' }, plain_text: 'New Page' }]
        }
      };

      const result = await notionClient.createPage('parent-id', properties);

      expect(result.id).toBe('page-1');
      expect(result.title).toBe('New Page');
      expect(mockLogger.info).toHaveBeenCalledWith('Creating page in parent: parent-id');
    });
  });

  describe('queryDatabase', () => {
    it('should query database successfully', async () => {
      const mockPages = [
        {
          id: 'page-1',
          url: 'https://notion.so/page-1',
          properties: {
            title: {
              id: 'title-id',
              type: 'title',
              title: [{ plain_text: 'Database Page' }]
            }
          },
          created_time: '2023-01-01T00:00:00Z',
          last_edited_time: '2023-01-01T00:00:00Z'
        }
      ];

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          results: mockPages
        })
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const result = await notionClient.queryDatabase('database-id');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('page-1');
      expect(result[0].title).toBe('Database Page');
      expect(mockLogger.info).toHaveBeenCalledWith('Querying database: database-id');
    });
  });

  describe('extractTitle', () => {
    it('should extract title from title property', () => {
      const properties = {
        title: {
          id: 'title-id',
          type: 'title',
          title: [{ plain_text: 'Test Title' }]
        }
      };

      const title = (notionClient as any).extractTitle(properties);
      expect(title).toBe('Test Title');
    });

    it('should extract title from rich_text property', () => {
      const properties = {
        description: {
          id: 'desc-id',
          type: 'rich_text',
          rich_text: [{ plain_text: 'Rich Text Title' }]
        }
      };

      const title = (notionClient as any).extractTitle(properties);
      expect(title).toBe('Rich Text Title');
    });

    it('should extract title from name property', () => {
      const properties = {
        name: {
          id: 'name-id',
          type: 'title',
          name: [{ plain_text: 'Name Title' }]
        }
      };

      const title = (notionClient as any).extractTitle(properties);
      expect(title).toBe('Name Title');
    });

    it('should return Untitled when no title found', () => {
      const properties = {
        other: {
          id: 'other-id',
          type: 'text',
          text: { content: 'Other Property' }
        }
      };

      const title = (notionClient as any).extractTitle(properties);
      expect(title).toBe('Untitled');
    });
  });

  describe('testConnection', () => {
    it('should test connection successfully', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          results: []
        })
      };
      (fetch as any).mockResolvedValue(mockResponse);

      const result = await notionClient.testConnection();

      expect(result).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('Testing Notion API connection...');
    });

    it('should handle connection test failure', async () => {
      const error = new Error('Connection failed');
      (fetch as any).mockRejectedValue(error);

      const result = await notionClient.testConnection();

      expect(result).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith('Notion API connection test failed:', error);
    });
  });

  describe('dispose', () => {
    it('should log disposal message', () => {
      notionClient.dispose();

      expect(mockLogger.info).toHaveBeenCalledWith('Notion API client disposed');
    });
  });
});
