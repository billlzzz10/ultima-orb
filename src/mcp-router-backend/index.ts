import { Router } from "./Router.js";
import { ProviderManager } from "./ProviderManager.js";
import { promises as fs } from "node:fs";
import { TimeTool } from "./tools/time.js";
import { MemoryTool } from "./tools/memory.js";
import { FilesystemTool } from "./tools/filesystem.js";
import { CloudDriveTool } from "./tools/clouddrive.js";
import { ShellTool } from "./tools/ShellTool.js";

async function main() {
  const settings = JSON.parse(await fs.readFile("src/mcp-router-backend/settings.json", "utf8"));
  const config = JSON.parse(await fs.readFile("src/mcp-router-backend/config.json", "utf8"));

  const providerManager = new ProviderManager(settings);

  const router = new Router(providerManager, config);

  const args = process.argv.slice(2);
  const query = args.find(arg => !arg.startsWith("--")) || "";
  const task = args.find(arg => arg.startsWith("--task="))?.split("=")[1];
  const mime = args.find(arg => arg.startsWith("--mime="))?.split("=")[1];

  if (!query) {
    console.log("Usage: node build/index.js <query> [--task <task>] [--mime <mime>]");
    return;
  }

  const tools = [
    new TimeTool(),
    new MemoryTool(),
    new FilesystemTool(),
    new CloudDriveTool(),
    ...(settings.allowShell === true ? [new ShellTool(true)] : []),
  ];

  const params: {
    query: string;
    task?: string;
    mime?: string;
    tools: any[];
  } = {
    query,
    tools,
  };
  if (task) {
    params.task = task;
  }
  if (mime) {
    params.mime = mime;
  }
  const result = await router.handleQuery(params);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
