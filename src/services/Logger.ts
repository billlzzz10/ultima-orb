/**
 * 📝 Logger Service
 * Service สำหรับ logging ที่เรียบง่าย
 */

export class Logger {
  private prefix = "[Ultima-Orb]";

  info<T extends unknown[]>(message: string, ...args: T): void {
    console.info(`${this.prefix} [INFO] ${message}`, ...args);
  }

  warn<T extends unknown[]>(message: string, ...args: T): void {
    console.warn(`${this.prefix} [WARN] ${message}`, ...args);
  }

  error(message: string, error?: Error): void {
    console.error(`${this.prefix} [ERROR] ${message}`, error);
  }

  debug<T extends unknown[]>(message: string, ...args: T): void {
    console.debug(`${this.prefix} [DEBUG] ${message}`, ...args);
  }
}
