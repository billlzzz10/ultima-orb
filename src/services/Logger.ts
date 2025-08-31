/**
 * 📝 Logger Service
 * Service สำหรับ logging ที่เรียบง่าย
 */

export class Logger {
  private prefix = "[Ultima-Orb]";

  info(message: string, ...args: any[]): void {
    console.info(`${this.prefix} [INFO] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`${this.prefix} [WARN] ${message}`, ...args);
  }

  error(message: string, error?: Error): void {
    console.error(`${this.prefix} [ERROR] ${message}`, error);
  }

  debug(message: string, ...args: any[]): void {
    console.debug(`${this.prefix} [DEBUG] ${message}`, ...args);
  }
}
