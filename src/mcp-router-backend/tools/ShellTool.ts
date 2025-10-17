import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export class ShellTool {
  private isDesktop: boolean;

  constructor(isDesktop: boolean) {
    this.isDesktop = isDesktop;
  }

  async execute(command: string): Promise<string> {
    if (!this.isDesktop) {
      return "Shell commands are not supported on mobile devices.";
    }

    try {
      const { stdout, stderr } = await execAsync(command, { maxBuffer: 10 * 1024 * 1024, timeout: 30_000 });
      const safeStdout = String(stdout ?? "").trim();
      const safeStderr = String(stderr ?? "").trim();
      if (safeStderr) {
        return `Error: ${safeStderr.slice(0, 1000)}`; // limit returned stderr to avoid leaking large/ sensitive output
      }
      return safeStdout;
    } catch (error: any) {
      const msg = error instanceof Error ? error.message : String(error);
      return `Execution failed: ${msg}`;
    }
  }
}