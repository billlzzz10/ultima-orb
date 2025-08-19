import { App } from 'obsidian';

export class Storage {
  private app: App;
  private dataKey = 'ultima-orb-data';

  constructor(app: App) {
    this.app = app;
  }

  async loadData(): Promise<Record<string, unknown>> {
    try {
      const data = (await this.app.loadData()) as Record<string, unknown>;
      const scoped = (data[this.dataKey] as Record<string, unknown> | undefined) || {};
      return scoped;
    } catch (error) {
      console.error('Failed to load data:', error);
      return {};
    }
  }

  async saveData(data: Record<string, unknown>): Promise<void> {
    try {
      const existingData = ((await this.app.loadData()) as Record<string, unknown>) || {};
      (existingData as Record<string, unknown>)[this.dataKey] = data;
      await this.app.saveData(existingData);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  async get<TValue = unknown>(key: string): Promise<TValue | undefined> {
    const data = await this.loadData();
    return data[key] as TValue | undefined;
  }

  async set<TValue = unknown>(key: string, value: TValue): Promise<void> {
    const data = await this.loadData();
    data[key] = value;
    await this.saveData(data);
  }

  async remove(key: string): Promise<void> {
    const data = await this.loadData();
    delete data[key];
    await this.saveData(data);
  }

  async clear(): Promise<void> {
    await this.saveData({});
  }
}
