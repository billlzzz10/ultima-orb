import { CredentialManager } from '../services/CredentialManager';
import { Logger } from '../services/Logger';

export class IntegrationManager {
  private credentialManager: CredentialManager;
  private logger: Logger;

  constructor(credentialManager: CredentialManager, logger: Logger) {
    this.credentialManager = credentialManager;
    this.logger = logger;
  }

  async testConnection(service: string): Promise<boolean> {
    try {
      this.logger.info(`Testing connection to ${service}`);
      // TODO: Implement actual connection testing
      return true;
    } catch (error) {
      this.logger.error(`Failed to test connection to ${service}:`, error);
      return false;
    }
  }

  async getAvailableServices(): Promise<string[]> {
    return ['notion', 'airtable', 'clickup', 'anythingllm'];
  }

  async isServiceConfigured(service: string): Promise<boolean> {
    return await this.credentialManager.hasCredentials(service);
  }
}
