import { Logger } from '../services/Logger';

export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

export interface AirtableBase {
  id: string;
  name: string;
  description?: string;
}

export interface AirtableTable {
  id: string;
  name: string;
  description?: string;
  fields: AirtableField[];
}

export interface AirtableField {
  id: string;
  name: string;
  type: string;
  options?: any;
}

export interface AirtableConfig {
  apiKey: string;
  baseUrl?: string;
}

export class AirtableClient {
  private config: AirtableConfig;
  private logger: Logger;
  private baseUrl: string;

  constructor(config: AirtableConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.baseUrl = config.baseUrl || 'https://api.airtable.com/v0';
  }

  // Create a new record
  async createRecord(baseId: string, tableName: string, fields: Record<string, any>): Promise<AirtableRecord> {
    try {
      this.logger.info(`Creating record in ${baseId}/${tableName}`);
      
      const response = await fetch(`${this.baseUrl}/${baseId}/${tableName}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.records[0];
    } catch (error) {
      this.logger.error('Failed to create Airtable record:', error);
      throw error;
    }
  }

  // List records in a view
  async listRecordsInView(baseId: string, tableName: string, viewName?: string): Promise<AirtableRecord[]> {
    try {
      this.logger.info(`Listing records from ${baseId}/${tableName}${viewName ? ` (view: ${viewName})` : ''}`);
      
      let url = `${this.baseUrl}/${baseId}/${tableName}`;
      if (viewName) {
        url += `?view=${encodeURIComponent(viewName)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.records;
    } catch (error) {
      this.logger.error('Failed to list Airtable records:', error);
      throw error;
    }
  }

  // Search records
  async searchRecords(baseId: string, tableName: string, formula?: string): Promise<AirtableRecord[]> {
    try {
      this.logger.info(`Searching records in ${baseId}/${tableName}`);
      
      let url = `${this.baseUrl}/${baseId}/${tableName}`;
      if (formula) {
        url += `?filterByFormula=${encodeURIComponent(formula)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.records;
    } catch (error) {
      this.logger.error('Failed to search Airtable records:', error);
      throw error;
    }
  }

  // Update a record
  async updateRecord(baseId: string, tableName: string, recordId: string, fields: Record<string, any>): Promise<AirtableRecord> {
    try {
      this.logger.info(`Updating record ${recordId} in ${baseId}/${tableName}`);
      
      const response = await fetch(`${this.baseUrl}/${baseId}/${tableName}/${recordId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Failed to update Airtable record:', error);
      throw error;
    }
  }

  // Delete a record
  async deleteRecord(baseId: string, tableName: string, recordId: string): Promise<void> {
    try {
      this.logger.info(`Deleting record ${recordId} from ${baseId}/${tableName}`);
      
      const response = await fetch(`${this.baseUrl}/${baseId}/${tableName}/${recordId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error('Failed to delete Airtable record:', error);
      throw error;
    }
  }

  // Get base schema
  async getBaseSchema(baseId: string): Promise<AirtableTable[]> {
    try {
      this.logger.info(`Getting schema for base ${baseId}`);
      
      const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.tables;
    } catch (error) {
      this.logger.error('Failed to get Airtable base schema:', error);
      throw error;
    }
  }

  // Create a new table
  async createTable(baseId: string, tableName: string, fields: AirtableField[]): Promise<AirtableTable> {
    try {
      this.logger.info(`Creating table ${tableName} in base ${baseId}`);
      
      const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: tableName,
          fields
        })
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Failed to create Airtable table:', error);
      throw error;
    }
  }

  // Get table schema
  async getTableSchema(baseId: string, tableName: string): Promise<AirtableTable> {
    try {
      this.logger.info(`Getting schema for table ${tableName} in base ${baseId}`);
      
      const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables/${tableName}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      this.logger.error('Failed to get Airtable table schema:', error);
      throw error;
    }
  }

  // List bases
  async listBases(): Promise<AirtableBase[]> {
    try {
      this.logger.info('Listing Airtable bases');
      
      const response = await fetch('https://api.airtable.com/v0/meta/bases', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.bases;
    } catch (error) {
      this.logger.error('Failed to list Airtable bases:', error);
      throw error;
    }
  }

  // List tables in a base
  async listTables(baseId: string): Promise<AirtableTable[]> {
    try {
      this.logger.info(`Listing tables in base ${baseId}`);
      
      const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.tables;
    } catch (error) {
      this.logger.error('Failed to list Airtable tables:', error);
      throw error;
    }
  }

  // Batch operations
  async batchOperations(baseId: string, tableName: string, operations: any[]): Promise<any[]> {
    try {
      this.logger.info(`Executing batch operations on ${baseId}/${tableName}`);
      
      const response = await fetch(`${this.baseUrl}/${baseId}/${tableName}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ records: operations })
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.records;
    } catch (error) {
      this.logger.error('Failed to execute Airtable batch operations:', error);
      throw error;
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const bases = await this.listBases();
      return bases.length >= 0; // If we can list bases, connection is working
    } catch (error) {
      this.logger.error('Airtable connection test failed:', error);
      return false;
    }
  }
}
