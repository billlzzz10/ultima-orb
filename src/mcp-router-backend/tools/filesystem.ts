import { promises as fs } from "node:fs";
import { join, resolve } from "node:path";

export class FilesystemTool {
  private readonly baseDir: string;

  constructor(baseDir = "sandbox") {
    this.baseDir = resolve(baseDir);
  }

  private getSafePath(path: string): string {
    const resolvedPath = resolve(join(this.baseDir, path));
    if (!resolvedPath.startsWith(this.baseDir)) {
      throw new Error("Path traversal attempt detected");
    }
    return resolvedPath;
  }

  async read(path: string): Promise<string> {
    const safePath = this.getSafePath(path);
    return await fs.readFile(safePath, "utf8");
  }

  async write(path: string, content: string): Promise<void> {
    const safePath = this.getSafePath(path);
    await fs.mkdir(resolve(safePath, ".."), { recursive: true });
    await fs.writeFile(safePath, content, "utf8");
  }

  async list(path: string): Promise<string[]> {
    const safePath = this.getSafePath(path);
    try {
      return await fs.readdir(safePath);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }

  async search(path: string, query: string): Promise<string[]> {
    const safePath = this.getSafePath(path);
    try {
      const files = await fs.readdir(safePath);
      return files.filter(file => file.includes(query));
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return [];
      }
      throw error;
    }
  }
}
