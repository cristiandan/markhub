/**
 * markhub pull
 * Download a file from Markhub to local filesystem
 *
 * Usage:
 *   markhub pull username/file.md        # Download to ./file.md
 *   markhub pull username/docs/readme.md # Download to ./readme.md
 *   markhub pull username/file.md -o local.md  # Download to ./local.md
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import * as fs from "fs";
import * as path from "path";
import { fetchRawFile, ApiError } from "../lib/api.js";

interface PullOptions {
  output?: string;
  force?: boolean;
}

/**
 * Parse the file reference (username/path or username/nested/path.md)
 * Returns { username, filePath }
 */
function parseFileRef(ref: string): { username: string; filePath: string } {
  // Must contain at least one /
  const firstSlash = ref.indexOf("/");
  if (firstSlash === -1) {
    throw new Error(
      `Invalid file reference: ${ref}\n` +
      `  Expected format: username/file.md or username/path/to/file.md`
    );
  }

  const username = ref.slice(0, firstSlash);
  const filePath = ref.slice(firstSlash + 1);

  // Validate username
  if (!username || username.length === 0) {
    throw new Error("Username cannot be empty");
  }

  // Validate file path
  if (!filePath || filePath.length === 0) {
    throw new Error("File path cannot be empty");
  }

  if (!filePath.endsWith(".md")) {
    throw new Error(`File path must end with .md: ${filePath}`);
  }

  if (filePath.includes("..")) {
    throw new Error("File path cannot contain ..");
  }

  return { username, filePath };
}

/**
 * Determine the output filename
 * - If --output specified, use that
 * - Otherwise, use the basename of the remote path
 */
function getOutputPath(filePath: string, outputOption?: string): string {
  if (outputOption) {
    return outputOption;
  }
  // Use the last segment of the path (basename)
  return path.basename(filePath);
}

export const pullCommand = new Command("pull")
  .description("Download a file from Markhub")
  .argument("<path>", "File path (e.g., username/file.md or username/docs/readme.md)")
  .option("-o, --output <file>", "Output file path (defaults to filename)")
  .option("-f, --force", "Overwrite existing file without prompting")
  .action(async (fileRef: string, options: PullOptions) => {
    const spinner = ora();

    try {
      // Parse the file reference
      let username: string;
      let filePath: string;

      try {
        const parsed = parseFileRef(fileRef);
        username = parsed.username;
        filePath = parsed.filePath;
      } catch (error) {
        console.error(chalk.red((error as Error).message));
        process.exit(1);
      }

      // Determine output path
      const outputPath = getOutputPath(filePath, options.output);
      const absoluteOutput = path.resolve(outputPath);

      // Check if output file already exists
      if (fs.existsSync(absoluteOutput) && !options.force) {
        console.error(chalk.red(`File already exists: ${outputPath}`));
        console.log(chalk.dim("  Use --force to overwrite, or specify a different output with --output"));
        process.exit(1);
      }

      // Ensure output directory exists
      const outputDir = path.dirname(absoluteOutput);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Download the file
      spinner.start(`Downloading ${chalk.cyan(`${username}/${filePath}`)}...`);

      const content = await fetchRawFile(username, filePath);

      // Write to local filesystem
      spinner.text = `Writing to ${chalk.cyan(outputPath)}...`;
      fs.writeFileSync(absoluteOutput, content, "utf-8");

      spinner.succeed(chalk.green(`Downloaded to ${chalk.bold(outputPath)}`));
      
      // Show file stats
      const stats = fs.statSync(absoluteOutput);
      const sizeKb = (stats.size / 1024).toFixed(2);
      console.log();
      console.log(`  ${chalk.dim("Source:")} ${chalk.cyan(`https://markhub.md/${username}/${filePath}`)}`);
      console.log(`  ${chalk.dim("Size:")} ${sizeKb} KB`);
      console.log(`  ${chalk.dim("Saved to:")} ${absoluteOutput}`);

    } catch (error) {
      spinner.fail(chalk.red("Pull failed"));

      if (error instanceof ApiError) {
        console.error(chalk.red(`  ${error.message}`));

        if (error.status === 404) {
          console.log(chalk.dim("  The file may not exist, or it might be private."));
        } else if (error.status === 403) {
          console.log(chalk.dim("  This file is private and you don't have access."));
        }
      } else if (error instanceof Error) {
        console.error(chalk.red(`  ${error.message}`));
      }

      process.exit(1);
    }
  });
