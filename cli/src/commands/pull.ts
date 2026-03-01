/**
 * markhub pull
 * Download a file from Markhub
 */

import { Command } from "commander";
import chalk from "chalk";

export const pullCommand = new Command("pull")
  .description("Download a file from Markhub")
  .argument("<path>", "File path (e.g., username/file.md)")
  .option("-o, --output <file>", "Output file path (defaults to filename)")
  .action(async (path, options) => {
    // TODO: Implement pull (P3-07)
    console.log(chalk.yellow("Pull command not yet implemented"));
    console.log(chalk.dim(`Would download: ${path}`));
    if (options.output) {
      console.log(chalk.dim(`Output to: ${options.output}`));
    }
  });
