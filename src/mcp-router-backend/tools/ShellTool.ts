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
      const { stdout, stderr } = await execAsync(command);
      if (stderr) {
        return `Error: ${stderr}`;
      }
      return stdout;
    } catch (error: any) {
      return `Execution failed: ${error.message}`;
    }
  }
}