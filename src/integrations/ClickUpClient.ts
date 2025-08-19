import { Logger } from '../services/Logger';

export interface ClickUpTask {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: number;
  dueDate?: string;
  assignees: string[];
  tags: string[];
  listId: string;
  spaceId: string;
  createdDate: string;
  updatedDate: string;
}

export interface ClickUpList {
  id: string;
  name: string;
  taskCount: number;
  spaceId: string;
  folderId?: string;
}

export interface ClickUpSpace {
  id: string;
  name: string;
  private: boolean;
  statuses: ClickUpStatus[];
  multipleAssignees: boolean;
  features: Record<string, any>;
}

export interface ClickUpStatus {
  id: string;
  status: string;
  type: string;
  orderIndex: number;
  color: string;
}

export interface ClickUpTimeEntry {
  id: string;
  taskId: string;
  start: string;
  end?: string;
  duration: number;
  description?: string;
  user: string;
}

export interface ClickUpComment {
  id: string;
  comment: string;
  user: string;
  date: string;
  taskId: string;
}

export interface ClickUpConfig {
  apiKey: string;
  baseUrl?: string;
}

export class ClickUpClient {
  private config: ClickUpConfig;
  private logger: Logger;
  private baseUrl: string;

  constructor(config: ClickUpConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.baseUrl = config.baseUrl || 'https://api.clickup.com/api/v2';
  }

  // Create a new task
  async createTask(listId: string, taskData: Partial<ClickUpTask>): Promise<ClickUpTask> {
    try {
      this.logger.info(`Creating task in list ${listId}`);
      
      const response = await fetch(`${this.baseUrl}/list/${listId}/task`, {
        method: 'POST',
        headers: {
          'Authorization': this.config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error(`ClickUp API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.task;
    } catch (error) {
      this.logger.error('Failed to create ClickUp task:', error);
      throw error;
    }
  }

  // Get tasks in a list
  async getTasksInList(listId: string, options?: {
    statuses?: string[];
    assignees?: string[];
    dueDateGt?: string;
    dueDateLt?: string;
    includeClosed?: boolean;
  }): Promise<ClickUpTask[]> {
    try {
      this.logger.info(`Getting tasks from list ${listId}`);
      
      let url = `${this.baseUrl}/list/${listId}/task`;
      const params = new URLSearchParams();
      
      if (options?.statuses) {
        params.append('statuses', options.statuses.join(','));
      }
      if (options?.assignees) {
        params.append('assignees', options.assignees.join(','));
      }
      if (options?.dueDateGt) {
        params.append('due_date_gt', options.dueDateGt);
      }
      if (options?.dueDateLt) {
        params.append('due_date_lt', options.dueDateLt);
      }
      if (options?.includeClosed !== undefined) {
        params.append('include_closed', options.includeClosed.toString());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.config.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`ClickUp API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.tasks;
    } catch (error) {
      this.logger.error('Failed to get ClickUp tasks:', error);
      throw error;
    }
  }

  // Start time entry
  async startTimeEntry(taskId: string, description?: string): Promise<ClickUpTimeEntry> {
    try {
      this.logger.info(`Starting time entry for task ${taskId}`);
      
      const response = await fetch(`${this.baseUrl}/task/${taskId}/time`, {
        method: 'POST',
        headers: {
          'Authorization': this.config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description,
          start: Date.now(),
          billable: false
        })
      });

      if (!response.ok) {
        throw new Error(`ClickUp API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      this.logger.error('Failed to start ClickUp time entry:', error);
      throw error;
    }
  }

  // Stop time entry
  async stopTimeEntry(taskId: string, timeEntryId: string): Promise<ClickUpTimeEntry> {
    try {
      this.logger.info(`Stopping time entry ${timeEntryId} for task ${taskId}`);
      
      const response = await fetch(`${this.baseUrl}/task/${taskId}/time/${timeEntryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': this.config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          end: Date.now()
        })
      });

      if (!response.ok) {
        throw new Error(`ClickUp API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      this.logger.error('Failed to stop ClickUp time entry:', error);
      throw error;
    }
  }

  // Update a task
  async updateTask(taskId: string, updates: Partial<ClickUpTask>): Promise<ClickUpTask> {
    try {
      this.logger.info(`Updating task ${taskId}`);
      
      const response = await fetch(`${this.baseUrl}/task/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': this.config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`ClickUp API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.task;
    } catch (error) {
      this.logger.error('Failed to update ClickUp task:', error);
      throw error;
    }
  }

  // Create a new list
  async createList(spaceId: string, listData: {
    name: string;
    content?: string;
    dueDate?: string;
    priority?: number;
    assignee?: string;
  }): Promise<ClickUpList> {
    try {
      this.logger.info(`Creating list in space ${spaceId}`);
      
      const response = await fetch(`${this.baseUrl}/space/${spaceId}/list`, {
        method: 'POST',
        headers: {
          'Authorization': this.config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(listData)
      });

      if (!response.ok) {
        throw new Error(`ClickUp API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.list;
    } catch (error) {
      this.logger.error('Failed to create ClickUp list:', error);
      throw error;
    }
  }

  // Get spaces
  async getSpaces(): Promise<ClickUpSpace[]> {
    try {
      this.logger.info('Getting ClickUp spaces');
      
      const response = await fetch(`${this.baseUrl}/team`, {
        method: 'GET',
        headers: {
          'Authorization': this.config.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`ClickUp API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.spaces;
    } catch (error) {
      this.logger.error('Failed to get ClickUp spaces:', error);
      throw error;
    }
  }

  // Create a comment
  async createComment(taskId: string, comment: string): Promise<ClickUpComment> {
    try {
      this.logger.info(`Creating comment for task ${taskId}`);
      
      const response = await fetch(`${this.baseUrl}/task/${taskId}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': this.config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment_text: comment })
      });

      if (!response.ok) {
        throw new Error(`ClickUp API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.comment;
    } catch (error) {
      this.logger.error('Failed to create ClickUp comment:', error);
      throw error;
    }
  }

  // Get task comments
  async getTaskComments(taskId: string): Promise<ClickUpComment[]> {
    try {
      this.logger.info(`Getting comments for task ${taskId}`);
      
      const response = await fetch(`${this.baseUrl}/task/${taskId}/comment`, {
        method: 'GET',
        headers: {
          'Authorization': this.config.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`ClickUp API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.comments;
    } catch (error) {
      this.logger.error('Failed to get ClickUp task comments:', error);
      throw error;
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const spaces = await this.getSpaces();
      return spaces.length >= 0; // If we can get spaces, connection is working
    } catch (error) {
      this.logger.error('ClickUp connection test failed:', error);
      return false;
    }
  }
}
