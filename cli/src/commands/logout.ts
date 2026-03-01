/**
 * markhub logout
 * Clear local credentials
 */

import { Command } from "commander";
import chalk from "chalk";

export const logoutCommand = new Command("logout")
  .description("Clear local credentials")
  .action(async () => {
    // TODO: Implement logout (P3-10)
    console.log(chalk.yellow("Logout command not yet implemented"));
    console.log(chalk.dim("Will clear stored credentials from ~/.markhub/"));
  });
