import { StorageManager } from './StorageManager';
import { Logger } from './Logger';

/**
 * 🔐 Credential Manager Service
 * จัดการ API credentials และการ authentication
 */

export interface Credential {
  id: string;
  type: string;
  value: string;
  encrypted: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface CredentialValidation {
  isValid: boolean;
  error?: string;
  expiresAt?: string;
}

export class CredentialManager {
  private storage: StorageManager;
  private logger: Logger;
  private encryptionKey: string = 'ultima-orb-secret-key';

  constructor(storage: StorageManager) {
    this.storage = storage;
    this.logger = new Logger();
  }

  /**
   * เก็บ credentials
   */
  public async storeCredentials(provider: string, value: string, expiresAt?: string): Promise<void> {
    try {
      const credential: Credential = {
        id: `${provider}_${Date.now()}`,
        type: provider,
        value: this.encryptValue(value),
        encrypted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt
      };

      await this.storage.set(`credential_${provider}`, credential);
      this.logger.info(`Stored credentials for ${provider}`);
    } catch (error) {
      this.logger.error(`Failed to store credentials for ${provider}`, error as Error);
      throw error;
    }
  }

  /**
   * อ่าน credentials
   */
  public async getCredentials(provider: string): Promise<string | null> {
    try {
      const credential = await this.storage.get(`credential_${provider}`) as Credential;
      
      if (!credential) {
        return null;
      }

      // ตรวจสอบ expiration
      if (credential.expiresAt && new Date(credential.expiresAt) < new Date()) {
        await this.removeCredentials(provider);
        return null;
      }

      return this.decryptValue(credential.value);
    } catch (error) {
      this.logger.error(`Failed to get credentials for ${provider}`, error as Error);
      return null;
    }
  }

  /**
   * ตรวจสอบว่ามี credentials หรือไม่
   */
  public async hasCredentials(provider: string): Promise<boolean> {
    try {
      const credential = await this.getCredentials(provider);
      return credential !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * ลบ credentials
   */
  public async removeCredentials(provider: string): Promise<void> {
    try {
      await this.storage.remove(`credential_${provider}`);
      this.logger.info(`Removed credentials for ${provider}`);
    } catch (error) {
      this.logger.error(`Failed to remove credentials for ${provider}`, error as Error);
      throw error;
    }
  }

  /**
   * ตรวจสอบความถูกต้องของ credentials
   */
  public async validateCredentials(provider: string): Promise<CredentialValidation> {
    try {
      const credential = await this.storage.get(`credential_${provider}`) as Credential;
      
      if (!credential) {
        return { isValid: false, error: 'No credentials found' };
      }

      // ตรวจสอบ expiration
      if (credential.expiresAt && new Date(credential.expiresAt) < new Date()) {
        await this.removeCredentials(provider);
        return { isValid: false, error: 'Credentials expired' };
      }

      // ตรวจสอบ format ตาม provider
      const value = this.decryptValue(credential.value);
      const isValid = this.validateCredentialFormat(provider, value);

      return {
        isValid,
        error: isValid ? undefined : 'Invalid credential format',
        expiresAt: credential.expiresAt
      };
    } catch (error) {
      this.logger.error(`Failed to validate credentials for ${provider}`, error as Error);
      return { isValid: false, error: 'Validation failed' };
    }
  }

  /**
   * รายการ providers ที่มี credentials
   */
  public async getAvailableProviders(): Promise<string[]> {
    try {
      const allData = await this.storage.getAll();
      const providers: string[] = [];

      for (const key of Object.keys(allData)) {
        if (key.startsWith('credential_')) {
          const provider = key.replace('credential_', '');
          if (await this.hasCredentials(provider)) {
            providers.push(provider);
          }
        }
      }

      return providers;
    } catch (error) {
      this.logger.error('Failed to get available providers', error as Error);
      return [];
    }
  }

  /**
   * อัปเดต credentials
   */
  public async updateCredentials(provider: string, value: string, expiresAt?: string): Promise<void> {
    try {
      const existingCredential = await this.storage.get(`credential_${provider}`) as Credential;
      
      if (!existingCredential) {
        throw new Error(`No existing credentials found for ${provider}`);
      }

      const updatedCredential: Credential = {
        ...existingCredential,
        value: this.encryptValue(value),
        updatedAt: new Date().toISOString(),
        expiresAt
      };

      await this.storage.set(`credential_${provider}`, updatedCredential);
      this.logger.info(`Updated credentials for ${provider}`);
    } catch (error) {
      this.logger.error(`Failed to update credentials for ${provider}`, error as Error);
      throw error;
    }
  }

  /**
   * ลบ credentials ทั้งหมด
   */
  public async clearAllCredentials(): Promise<void> {
    try {
      const providers = await this.getAvailableProviders();
      
      for (const provider of providers) {
        await this.removeCredentials(provider);
      }

      this.logger.info('Cleared all credentials');
    } catch (error) {
      this.logger.error('Failed to clear all credentials', error as Error);
      throw error;
    }
  }

  /**
   * Export credentials (สำหรับ backup)
   */
  public async exportCredentials(): Promise<string> {
    try {
      const providers = await this.getAvailableProviders();
      const credentials: Record<string, any> = {};

      for (const provider of providers) {
        const credential = await this.storage.get(`credential_${provider}`) as Credential;
        if (credential) {
          credentials[provider] = {
            ...credential,
            value: this.decryptValue(credential.value) // Export decrypted value
          };
        }
      }

      return JSON.stringify(credentials, null, 2);
    } catch (error) {
      this.logger.error('Failed to export credentials', error as Error);
      throw error;
    }
  }

  /**
   * Import credentials (สำหรับ restore)
   */
  public async importCredentials(jsonData: string): Promise<void> {
    try {
      const credentials = JSON.parse(jsonData);
      
      for (const [provider, credentialData] of Object.entries(credentials)) {
        const credential = credentialData as any;
        await this.storeCredentials(provider, credential.value, credential.expiresAt);
      }

      this.logger.info('Imported credentials successfully');
    } catch (error) {
      this.logger.error('Failed to import credentials', error as Error);
      throw error;
    }
  }

  /**
   * เข้ารหัสค่า
   */
  private encryptValue(value: string): string {
    try {
      // Simple encryption (in production, use proper encryption)
      return btoa(value + this.encryptionKey);
    } catch (error) {
      this.logger.error('Failed to encrypt value', error as Error);
      return value; // Fallback to plain text
    }
  }

  /**
   * ถอดรหัสค่า
   */
  private decryptValue(encryptedValue: string): string {
    try {
      // Simple decryption (in production, use proper decryption)
      const decoded = atob(encryptedValue);
      return decoded.replace(this.encryptionKey, '');
    } catch (error) {
      this.logger.error('Failed to decrypt value', error as Error);
      return encryptedValue; // Fallback to original value
    }
  }

  /**
   * ตรวจสอบ format ของ credentials ตาม provider
   */
  private validateCredentialFormat(provider: string, value: string): boolean {
    switch (provider.toLowerCase()) {
      case 'openai':
        return value.startsWith('sk-') && value.length > 20;
      case 'anthropic':
      case 'claude':
        return value.startsWith('sk-ant-') && value.length > 20;
      case 'gemini':
        return value.startsWith('AIza') && value.length > 20;
      case 'ollama':
        return value.length > 0; // Ollama doesn't require specific format
      case 'anythingllm':
        return value.startsWith('http') || value.length > 0;
      default:
        return value.length > 0;
    }
  }

  /**
   * ตั้งค่า encryption key
   */
  public setEncryptionKey(key: string): void {
    this.encryptionKey = key;
  }

  /**
   * ตรวจสอบสถานะของ CredentialManager
   */
  public async getStatus(): Promise<{
    totalCredentials: number;
    providers: string[];
    hasEncryption: boolean;
  }> {
    const providers = await this.getAvailableProviders();
    
    return {
      totalCredentials: providers.length,
      providers,
      hasEncryption: this.encryptionKey !== 'ultima-orb-secret-key'
    };
  }
}
