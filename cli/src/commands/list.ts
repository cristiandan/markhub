/**
 * markhub list
 * List your files on Markhub
 */

import { Command } from "commander";
import chalk from "chalk";

export const listCommand = new Command("list")
  .alias("ls")
  .description("List your files on Markhub")
  .option("-a, --all", "Include private and unlisted files")
  .action(async (options) => {
    // TODO: Implement list (P3-08)
    console.log(chalk.yellow("List command not yet implemented"));
    console.log(chalk.dim("Will list your files on Markhub"));
    if (options.all) {
      console.log(chalk.dim("Including private and unlisted files"));
    }
  });
