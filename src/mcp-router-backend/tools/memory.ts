export class MemoryTool {
  private memory: Map<string, any> = new Map();

  recall(key: string): any {
    return this.memory.get(key);
  }

  store(key: string, value: any): void {
    this.memory.set(key, value);
  }

  list(): string[] {
    return Array.from(this.memory.keys());
  }
}
