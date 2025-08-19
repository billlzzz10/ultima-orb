import { App, Command, Plugin } from "obsidian";
import { Logger } from "../services/Logger";

/**
 * ⚙️ Command Manager
 * ลงทะเบียน Obsidian Commands
 * Components: CommandRegistrar, CommandExecutor, CommandParser
 */

export interface UltimaOrbCommand {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  hotkeys?: Array<{
    modifiers: Array<"Mod" | "Ctrl" | "Meta" | "Shift" | "Alt">;
    key: string;
  }>;
  callback: () => void | Promise<void>;
  checkCallback?: (checking: boolean) => boolean | void;
  editorCallback?: (editor: any, view: any) => void;
  category?: "ai" | "ui" | "tools" | "integrations" | "automation";
  requiredSettings?: string[];
  isEnabled?: () => boolean;
}

/**
 * Command Registrar
 * จัดการการลงทะเบียน commands
 */
export class CommandRegistrar {
  private app: App;
  private plugin: Plugin;
  private logger: Logger;
  private registeredCommands: Map<string, UltimaOrbCommand>;

  constructor(app: App, plugin: Plugin) {
    this.app = app;
    this.plugin = plugin;
    this.logger = new Logger();
    this.registeredCommands = new Map();
  }

  /**
   * Register command
   */
  registerCommand(command: UltimaOrbCommand): void {
    try {
      // Validate command
      if (!this.validateCommand(command)) {
        throw new Error(`Invalid command: ${command.id}`);
      }

      // Check if already registered
      if (this.registeredCommands.has(command.id)) {
        this.logger.warn(`Command ${command.id} already registered, skipping`);
        return;
      }

      // Create Obsidian command
      const obsidianCommand: Command = {
        id: command.id,
        name: command.name,
        icon: command.icon,
        callback: command.callback,
        checkCallback: command.checkCallback,
        editorCallback: command.editorCallback,
      };

      // Add hotkeys if specified
      if (command.hotkeys && command.hotkeys.length > 0) {
        obsidianCommand.hotkeys = command.hotkeys;
      }

      // Register with Obsidian
      this.plugin.addCommand(obsidianCommand);

      // Store in registry
      this.registeredCommands.set(command.id, command);

      this.logger.info(`Command registered: ${command.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to register command ${command.id}:`,
        error as Error
      );
    }
  }

  /**
   * Register multiple commands
   */
  registerCommands(commands: UltimaOrbCommand[]): void {
    commands.forEach((command) => this.registerCommand(command));
  }

  /**
   * Unregister command
   */
  unregisterCommand(commandId: string): void {
    if (this.registeredCommands.has(commandId)) {
      this.registeredCommands.delete(commandId);
      this.logger.info(`Command unregistered: ${commandId}`);
    }
  }

  /**
   * Get registered commands
   */
  getRegisteredCommands(): UltimaOrbCommand[] {
    return Array.from(this.registeredCommands.values());
  }

  /**
   * Validate command
   */
  private validateCommand(command: UltimaOrbCommand): boolean {
    if (!command.id || !command.name || !command.callback) {
      return false;
    }

    // Check for duplicate IDs
    if (this.registeredCommands.has(command.id)) {
      return false;
    }

    return true;
  }
}

/**
 * Command Executor
 * จัดการการ execute commands
 */
export class CommandExecutor {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Execute command safely with error handling
   */
  async executeCommand(
    command: UltimaOrbCommand,
    context?: any
  ): Promise<void> {
    try {
      this.logger.info(`Executing command: ${command.id}`);

      // Check if command is enabled
      if (command.isEnabled && !command.isEnabled()) {
        this.logger.warn(`Command ${command.id} is disabled`);
        return;
      }

      // Execute callback
      const result = command.callback();

      // Handle async callbacks
      if (result instanceof Promise) {
        await result;
      }

      this.logger.info(`Command executed successfully: ${command.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to execute command ${command.id}:`,
        error as Error
      );
      throw error;
    }
  }

  /**
   * Execute command by ID
   */
  async executeCommandById(
    commandId: string,
    registrar: CommandRegistrar
  ): Promise<void> {
    const commands = registrar.getRegisteredCommands();
    const command = commands.find((cmd) => cmd.id === commandId);

    if (!command) {
      throw new Error(`Command not found: ${commandId}`);
    }

    await this.executeCommand(command);
  }
}

/**
 * Command Parser
 * จัดการการ parse command strings และ parameters
 */
export class CommandParser {
  private logger: Logger;

  constructor() {
    this.logger = new Logger();
  }

  /**
   * Parse command string
   */
  parseCommandString(commandString: string): {
    commandId: string;
    args: string[];
  } {
    const parts = commandString.trim().split(/\s+/);
    const commandId = parts[0];
    const args = parts.slice(1);

    return { commandId, args };
  }

  /**
   * Parse command with parameters
   */
  parseCommandWithParams(commandString: string): {
    commandId: string;
    params: Record<string, any>;
  } {
    try {
      const [commandPart, ...paramParts] = commandString.split(" --");
      const commandId = commandPart.trim();
      const params: Record<string, any> = {};

      paramParts.forEach((part) => {
        const [key, value] = part.split("=", 2);
        if (key && value) {
          params[key.trim()] = this.parseValue(value.trim());
        }
      });

      return { commandId, params };
    } catch (error) {
      this.logger.error("Failed to parse command with params:", error as Error);
      return { commandId: commandString, params: {} };
    }
  }

  /**
   * Parse value to appropriate type
   */
  private parseValue(value: string): any {
    // Try to parse as number
    if (!isNaN(Number(value))) {
      return Number(value);
    }

    // Try to parse as boolean
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;

    // Try to parse as JSON
    try {
      return JSON.parse(value);
    } catch {
      // Return as string
      return value;
    }
  }
}

/**
 * Main Command Manager
 * รวมทุก component เข้าด้วยกัน
 */
export class CommandManager {
  private registrar: CommandRegistrar;
  private executor: CommandExecutor;
  private parser: CommandParser;
  private logger: Logger;

  constructor(app: App, plugin: Plugin) {
    this.registrar = new CommandRegistrar(app, plugin);
    this.executor = new CommandExecutor();
    this.parser = new CommandParser();
    this.logger = new Logger();
  }

  /**
   * Initialize command manager
   */
  initialize(): void {
    this.logger.info("Initializing Command Manager...");

    // Register default commands
    this.registerDefaultCommands();

    this.logger.info("Command Manager initialized successfully");
  }

  /**
   * Register default commands
   */
  private registerDefaultCommands(): void {
    const defaultCommands: UltimaOrbCommand[] = [
      {
        id: "ultima-orb-open-chat",
        name: "Open Ultima-Orb Chat",
        description: "Open the AI chat interface",
        icon: "message-circle",
        category: "ai",
        hotkeys: [{ modifiers: ["Mod", "Shift"], key: "c" }],
        callback: () => {
          this.logger.info("Opening chat view...");
          // TODO: Implement chat view opening
        },
      },
      {
        id: "ultima-orb-open-tools",
        name: "Open Tool Template",
        description: "Open tool template management",
        icon: "wrench",
        category: "tools",
        hotkeys: [{ modifiers: ["Mod", "Shift"], key: "t" }],
        callback: () => {
          this.logger.info("Opening tool template view...");
          // TODO: Implement tool template view
        },
      },
      {
        id: "ultima-orb-open-knowledge",
        name: "Open Knowledge Base",
        description: "Open knowledge base management",
        icon: "book-open",
        category: "ai",
        hotkeys: [{ modifiers: ["Mod", "Shift"], key: "k" }],
        callback: () => {
          this.logger.info("Opening knowledge view...");
          // TODO: Implement knowledge view
        },
      },
      {
        id: "ultima-orb-refresh-context",
        name: "Refresh Context",
        description: "Refresh current context information",
        icon: "refresh-cw",
        category: "automation",
        hotkeys: [{ modifiers: ["Mod", "Shift"], key: "r" }],
        callback: () => {
          this.logger.info("Refreshing context...");
          // TODO: Implement context refresh
        },
      },
    ];

    this.registrar.registerCommands(defaultCommands);
  }

  /**
   * Get registrar
   */
  getRegistrar(): CommandRegistrar {
    return this.registrar;
  }

  /**
   * Get executor
   */
  getExecutor(): CommandExecutor {
    return this.executor;
  }

  /**
   * Get parser
   */
  getParser(): CommandParser {
    return this.parser;
  }

  /**
   * Execute command by string
   */
  async executeCommandByString(commandString: string): Promise<void> {
    const { commandId } = this.parser.parseCommandString(commandString);
    await this.executor.executeCommandById(commandId, this.registrar);
  }

  /**
   * Get all registered commands
   */
  getAllCommands(): UltimaOrbCommand[] {
    return this.registrar.getRegisteredCommands();
  }

  /**
   * Get commands by category
   */
  getCommandsByCategory(
    category: UltimaOrbCommand["category"]
  ): UltimaOrbCommand[] {
    return this.registrar
      .getRegisteredCommands()
      .filter((cmd) => cmd.category === category);
  }
}
