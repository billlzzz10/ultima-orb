/**
 * 📝 Logger Service
 * จัดการการบันทึก log และ debugging ของ plugin
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: Error;
}

export class Logger {
  private logLevel: LogLevel = LogLevel.INFO;
  private maxLogEntries: number = 1000;
  private logEntries: LogEntry[] = [];
  private isEnabled: boolean = true;

  constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel;
  }

  /**
   * ตั้งค่า log level
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * เปิด/ปิดการ logging
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Debug log
   */
  public debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Info log
   */
  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Warning log
   */
  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Error log
   */
  public error(message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, message, data, error);
  }

  /**
   * Fatal log
   */
  public fatal(message: string, error?: Error, data?: any): void {
    this.log(LogLevel.FATAL, message, data, error);
  }

  /**
   * Log หลัก
   */
  private log(level: LogLevel, message: string, data?: any, error?: Error): void {
    if (!this.isEnabled || level < this.logLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error
    };

    // เพิ่มเข้า log entries
    this.logEntries.push(entry);

    // จำกัดจำนวน log entries
    if (this.logEntries.length > this.maxLogEntries) {
      this.logEntries = this.logEntries.slice(-this.maxLogEntries);
    }

    // แสดงใน console
    this.outputToConsole(entry);
  }

  /**
   * แสดง log ใน console
   */
  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp;
    const levelName = LogLevel[entry.level];
    const prefix = `[Ultima-Orb] [${timestamp}] [${levelName}]`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, entry.message, entry.data || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, entry.message, entry.error || '', entry.data || '');
        break;
      case LogLevel.FATAL:
        console.error(prefix, 'FATAL:', entry.message, entry.error || '', entry.data || '');
        break;
    }
  }

  /**
   * อ่าน log entries ทั้งหมด
   */
  public getLogEntries(): LogEntry[] {
    return [...this.logEntries];
  }

  /**
   * อ่าน log entries ตาม level
   */
  public getLogEntriesByLevel(level: LogLevel): LogEntry[] {
    return this.logEntries.filter(entry => entry.level === level);
  }

  /**
   * อ่าน log entries ตามช่วงเวลา
   */
  public getLogEntriesByTimeRange(startTime: Date, endTime: Date): LogEntry[] {
    return this.logEntries.filter(entry => {
      const entryTime = new Date(entry.timestamp);
      return entryTime >= startTime && entryTime <= endTime;
    });
  }

  /**
   * ค้นหา log entries ตามข้อความ
   */
  public searchLogEntries(searchTerm: string): LogEntry[] {
    const term = searchTerm.toLowerCase();
    return this.logEntries.filter(entry => 
      entry.message.toLowerCase().includes(term) ||
      (entry.data && JSON.stringify(entry.data).toLowerCase().includes(term))
    );
  }

  /**
   * ล้าง log entries ทั้งหมด
   */
  public clearLogs(): void {
    this.logEntries = [];
  }

  /**
   * Export logs เป็น JSON
   */
  public exportLogs(): string {
    return JSON.stringify(this.logEntries, null, 2);
  }

  /**
   * Import logs จาก JSON
   */
  public importLogs(jsonData: string): void {
    try {
      const entries = JSON.parse(jsonData);
      if (Array.isArray(entries)) {
        this.logEntries = entries;
      }
    } catch (error) {
      this.error('Failed to import logs', error as Error);
    }
  }

  /**
   * สร้าง performance log
   */
  public performance(label: string, fn: () => any): any {
    const startTime = performance.now();
    try {
      const result = fn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.debug(`Performance: ${label} took ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.error(`Performance: ${label} failed after ${duration.toFixed(2)}ms`, error as Error);
      throw error;
    }
  }

  /**
   * สร้าง async performance log
   */
  public async performanceAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await fn();
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.debug(`Performance: ${label} took ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.error(`Performance: ${label} failed after ${duration.toFixed(2)}ms`, error as Error);
      throw error;
    }
  }

  /**
   * สร้าง group log
   */
  public group(label: string, fn: () => void): void {
    console.group(`[Ultima-Orb] ${label}`);
    try {
      fn();
    } finally {
      console.groupEnd();
    }
  }

  /**
   * สร้าง async group log
   */
  public async groupAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    console.group(`[Ultima-Orb] ${label}`);
    try {
      const result = await fn();
      return result;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * สร้าง table log
   */
  public table(data: any[]): void {
    console.table(data);
  }

  /**
   * สร้าง trace log
   */
  public trace(message: string): void {
    console.trace(`[Ultima-Orb] ${message}`);
  }

  /**
   * ตรวจสอบสถิติของ logs
   */
  public getLogStats(): {
    total: number;
    byLevel: Record<string, number>;
    oldestEntry: string | null;
    newestEntry: string | null;
  } {
    const byLevel: Record<string, number> = {};
    
    for (const entry of this.logEntries) {
      const levelName = LogLevel[entry.level];
      byLevel[levelName] = (byLevel[levelName] || 0) + 1;
    }

    return {
      total: this.logEntries.length,
      byLevel,
      oldestEntry: this.logEntries[0]?.timestamp || null,
      newestEntry: this.logEntries[this.logEntries.length - 1]?.timestamp || null
    };
  }
}
