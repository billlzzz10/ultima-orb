import { App } from 'obsidian';

/**
 * 📦 Storage Manager Service
 * จัดการการเก็บข้อมูลและการตั้งค่าของ plugin
 */

export interface StorageData {
  [key: string]: any;
}

export class StorageManager {
  private app: App;
  private storageKey: string = 'ultima-orb-data';
  private cache: Map<string, any> = new Map();

  constructor(app: App) {
    this.app = app;
  }

  /**
   * บันทึกข้อมูล
   */
  public async set(key: string, value: any): Promise<void> {
    try {
      // บันทึกลง cache
      this.cache.set(key, value);

      // บันทึกลง Obsidian storage
      const data = await this.loadData();
      data[key] = value;
      await this.saveData(data);
    } catch (error) {
      console.error(`Failed to set storage key "${key}":`, error);
      throw error;
    }
  }

  /**
   * อ่านข้อมูล
   */
  public async get(key: string): Promise<any> {
    try {
      // ตรวจสอบ cache ก่อน
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }

      // อ่านจาก storage
      const data = await this.loadData();
      const value = data[key];
      
      // บันทึกลง cache
      this.cache.set(key, value);
      
      return value;
    } catch (error) {
      console.error(`Failed to get storage key "${key}":`, error);
      return undefined;
    }
  }

  /**
   * ลบข้อมูล
   */
  public async remove(key: string): Promise<void> {
    try {
      // ลบจาก cache
      this.cache.delete(key);

      // ลบจาก storage
      const data = await this.loadData();
      delete data[key];
      await this.saveData(data);
    } catch (error) {
      console.error(`Failed to remove storage key "${key}":`, error);
      throw error;
    }
  }

  /**
   * ตรวจสอบว่ามีข้อมูลหรือไม่
   */
  public async has(key: string): Promise<boolean> {
    try {
      const value = await this.get(key);
      return value !== undefined && value !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * อ่านข้อมูลทั้งหมด
   */
  public async getAll(): Promise<StorageData> {
    try {
      return await this.loadData();
    } catch (error) {
      console.error('Failed to get all storage data:', error);
      return {};
    }
  }

  /**
   * ลบข้อมูลทั้งหมด
   */
  public async clear(): Promise<void> {
    try {
      this.cache.clear();
      await this.saveData({});
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  /**
   * อ่านข้อมูลจาก Obsidian storage
   */
  private async loadData(): Promise<StorageData> {
    try {
      const data = await this.app.loadData();
      return data[this.storageKey] || {};
    } catch (error) {
      console.error('Failed to load data from Obsidian storage:', error);
      return {};
    }
  }

  /**
   * บันทึกข้อมูลลง Obsidian storage
   */
  private async saveData(data: StorageData): Promise<void> {
    try {
      const allData = await this.app.loadData();
      allData[this.storageKey] = data;
      await this.app.saveData(allData);
    } catch (error) {
      console.error('Failed to save data to Obsidian storage:', error);
      throw error;
    }
  }

  /**
   * อ่านข้อมูลแบบ sync (สำหรับการใช้งานที่ไม่ต้องการ async)
   */
  public getSync(key: string): any {
    return this.cache.get(key);
  }

  /**
   * บันทึกข้อมูลแบบ sync (สำหรับการใช้งานที่ไม่ต้องการ async)
   */
  public setSync(key: string, value: any): void {
    this.cache.set(key, value);
    // บันทึกแบบ async ใน background
    this.set(key, value).catch(error => {
      console.error('Background save failed:', error);
    });
  }

  /**
   * ตรวจสอบขนาดของ cache
   */
  public getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * ล้าง cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Export ข้อมูลทั้งหมด
   */
  public async exportData(): Promise<string> {
    try {
      const data = await this.getAll();
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }

  /**
   * Import ข้อมูล
   */
  public async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      // ตรวจสอบว่าเป็น object หรือไม่
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid data format');
      }

      // บันทึกข้อมูลทั้งหมด
      for (const [key, value] of Object.entries(data)) {
        await this.set(key, value);
      }
    } catch (error) {
      console.error('Failed to import data:', error);
      throw error;
    }
  }

  /**
   * Backup ข้อมูล
   */
  public async backup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const data = await this.getAll();
      const backup = {
        timestamp,
        version: '1.0.0',
        data
      };
      return JSON.stringify(backup, null, 2);
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }

  /**
   * Restore ข้อมูลจาก backup
   */
  public async restore(backupJson: string): Promise<void> {
    try {
      const backup = JSON.parse(backupJson);
      
      // ตรวจสอบ format ของ backup
      if (!backup.timestamp || !backup.data) {
        throw new Error('Invalid backup format');
      }

      // ลบข้อมูลปัจจุบัน
      await this.clear();

      // Restore ข้อมูล
      for (const [key, value] of Object.entries(backup.data)) {
        await this.set(key, value);
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw error;
    }
  }
}
