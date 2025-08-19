import { EventsBus } from '../services/EventsBus';
import { Logger } from '../services/Logger';
import { NotionTools } from '../tools/NotionTools';
import { NotionMCPClient } from '../integrations/NotionMCPClient';

export class ToolManager {
  private eventsBus: EventsBus;
  private logger: Logger;
  private notionTools: NotionTools | null = null;

  constructor(eventsBus: EventsBus, logger: Logger) {
    this.eventsBus = eventsBus;
    this.logger = logger;
  }

  // Initialize Notion tools
  async initializeNotionTools(notionToken: string): Promise<void> {
    try {
      const notionClient = new NotionMCPClient(this.logger, notionToken);
      await notionClient.initialize();
      this.notionTools = new NotionTools(notionClient, this.logger);
      this.logger.info('Notion tools initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Notion tools:', error);
      throw error;
    }
  }

  async executeTool(toolName: string, params: Record<string, unknown>): Promise<unknown> {
    try {
      this.eventsBus.emit('tool:execute:start', toolName, params);
      this.logger.info(`Executing tool: ${toolName}`);
            
      let result: unknown;

      // Check if it's a Notion tool
      if (toolName.startsWith('notion:')) {
        if (!this.notionTools) {
          throw new Error('Notion tools not initialized. Please configure Notion integration first.');
        }
        result = await this.notionTools.executeTool(toolName, params);
      } else {
        // TODO: Implement other tool types
        result = { success: true, data: `Tool ${toolName} executed` };
      }
            
      this.eventsBus.emit('tool:execute:complete', toolName, result);
      return result;
    } catch (error) {
      this.eventsBus.emit('tool:execute:error', toolName, error as Error);
      this.logger.error(`Failed to execute tool ${toolName}:`, error);
      throw error;
    }
  }

  async getAvailableTools(): Promise<string[]> {
    const tools: string[] = [];

    // Add Notion tools if available
    if (this.notionTools) {
      tools.push(...this.notionTools.getAvailableTools());
    }

    // Add other tools
    tools.push(
      'airtable:create_record',
      'airtable:list_records_in_view',
      'airtable:search_records',
      'clickup:create_task',
      'clickup:get_tasks_in_list',
      'clickup:start_time_entry',
      'anythingllm:chat_with_workspace',
      'anythingllm:create_workspace',
      'anythingllm:upload_document'
    );

    return tools;
  }

  // Get Notion-specific tools
  async getNotionTools(): Promise<string[]> {
    if (!this.notionTools) {
      return [];
    }
    return this.notionTools.getAvailableTools();
  }

  // Test Notion connection
  async testNotionConnection(): Promise<boolean> {
    if (!this.notionTools) {
      return false;
    }
    try {
      // Try to execute a simple tool to test connection
      await this.notionTools.executeTool('notion:search_pages', { query: 'test' });
      return true;
    } catch (error) {
      this.logger.error('Notion connection test failed:', error);
      return false;
    }
  }

  dispose(): void {
    this.logger.info('ToolManager disposed');
    // TODO: Dispose Notion tools if needed
  }
}
