import { promises as fs } from "node:fs";
import { join } from "node:path";

export class FilesystemTool {
  async read(path: string): Promise<string> {
    return await fs.readFile(path, "utf8");
  }

  async write(path: string, content: string): Promise<void> {
    await fs.writeFile(path, content, "utf8");
  }

  async list(path: string): Promise<string[]> {
    return await fs.readdir(path);
  }

  async search(path: string, query: string): Promise<string[]> {
    const files = await fs.readdir(path);
    return files.filter(file => file.includes(query));
  }
}
