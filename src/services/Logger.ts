/**
 * 📝 Logger Service
 * Service สำหรับ logging ที่ปรับระดับความสำคัญได้
 */

/** ระดับของ log ที่รองรับ */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export class Logger {
  private prefix: string;
  private level: LogLevel;

  constructor(prefix = '[Ultima-Orb]', level: LogLevel = LogLevel.INFO) {
    this.prefix = prefix;
    this.level = level;
  }

  /** เปลี่ยนระดับของ log ขณะรันไทม์ */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  info<T extends unknown[]>(message: string, ...args: T): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`${this.prefix} [INFO] ${message}`, ...args);
    }
  }

  warn<T extends unknown[]>(message: string, ...args: T): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`${this.prefix} [WARN] ${message}`, ...args);
    }
  }

  error(message: string, error?: Error): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`${this.prefix} [ERROR] ${message}`, error);
    }
  }

  debug<T extends unknown[]>(message: string, ...args: T): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`${this.prefix} [DEBUG] ${message}`, ...args);
    }
  }
}
