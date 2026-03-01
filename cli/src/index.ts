#!/usr/bin/env node
/**
 * Markhub CLI
 * Share and discover agent markdown files
 *
 * Commands:
 *   login     Authenticate with GitHub
 *   logout    Clear local credentials
 *   whoami    Show current user
 *   list      List your files
 *   push      Upload a file
 *   pull      Download a file
 */

import { Command } from "commander";
import chalk from "chalk";

// Import commands (will be implemented in subsequent tasks)
import { loginCommand } from "./commands/login.js";
import { logoutCommand } from "./commands/logout.js";
import { whoamiCommand } from "./commands/whoami.js";
import { listCommand } from "./commands/list.js";
import { pushCommand } from "./commands/push.js";
import { pullCommand } from "./commands/pull.js";

const program = new Command();

program
  .name("markhub")
  .description("CLI for Markhub - share and discover agent markdown files")
  .version("0.1.0");

// Register commands
program.addCommand(loginCommand);
program.addCommand(logoutCommand);
program.addCommand(whoamiCommand);
program.addCommand(listCommand);
program.addCommand(pushCommand);
program.addCommand(pullCommand);

// Error handling
program.configureOutput({
  outputError: (str, write) => write(chalk.red(str)),
});

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
