/**
 * markhub whoami
 * Show current authenticated user
 */

import { Command } from "commander";
import chalk from "chalk";

export const whoamiCommand = new Command("whoami")
  .description("Show current authenticated user")
  .action(async () => {
    // TODO: Implement whoami (P3-09)
    console.log(chalk.yellow("Whoami command not yet implemented"));
    console.log(chalk.dim("Will show currently authenticated user"));
  });
