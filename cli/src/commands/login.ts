/**
 * markhub login
 * Authenticate with GitHub using device flow
 */

import { Command } from "commander";
import chalk from "chalk";

export const loginCommand = new Command("login")
  .description("Authenticate with GitHub")
  .action(async () => {
    // TODO: Implement GitHub device flow (P3-04)
    console.log(chalk.yellow("Login command not yet implemented"));
    console.log(chalk.dim("Will use GitHub device flow for authentication"));
  });
