/**
 * markhub push
 * Upload a markdown file to Markhub
 *
 * Usage:
 *   markhub push README.md              # Push as README.md
 *   markhub push README.md -p docs/readme.md  # Push with custom path
 *   markhub push README.md -v private   # Push as private
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import * as fs from "fs";
import * as path from "path";
import { apiRequest, ApiError } from "../lib/api.js";
import { isAuthenticated, getUser } from "../lib/config.js";

type Visibility = "public" | "unlisted" | "private";

interface PushResponse {
  id: string;
  path: string;
  visibility: string;
  url: string;
  createdAt: string;
}

/**
 * Validate visibility option
 */
function parseVisibility(value: string): Visibility {
  const normalized = value.toLowerCase();
  if (normalized === "public" || normalized === "unlisted" || normalized === "private") {
    return normalized;
  }
  throw new Error(`Invalid visibility: ${value}. Must be public, unlisted, or private.`);
}

/**
 * Ensure path ends with .md
 */
function ensureMdExtension(filePath: string): string {
  if (!filePath.endsWith(".md")) {
    return `${filePath}.md`;
  }
  return filePath;
}

export const pushCommand = new Command("push")
  .description("Upload a markdown file to Markhub")
  .argument("<file>", "Path to the markdown file to upload")
  .option(
    "-v, --visibility <visibility>",
    "File visibility (public, unlisted, private)",
    "public"
  )
  .option("-p, --path <path>", "Custom path on Markhub (defaults to filename)")
  .option("-f, --force", "Overwrite existing file if it exists")
  .action(async (file: string, options: { visibility: string; path?: string; force?: boolean }) => {
    // Check authentication
    if (!isAuthenticated()) {
      console.error(chalk.red("Not logged in. Run `markhub login` first."));
      process.exit(1);
    }

    const user = getUser();
    const spinner = ora();

    try {
      // Validate visibility
      let visibility: Visibility;
      try {
        visibility = parseVisibility(options.visibility);
      } catch (error) {
        console.error(chalk.red((error as Error).message));
        process.exit(1);
      }

      // Check if file exists
      if (!fs.existsSync(file)) {
        console.error(chalk.red(`File not found: ${file}`));
        process.exit(1);
      }

      // Check if it's a file (not directory)
      const stats = fs.statSync(file);
      if (!stats.isFile()) {
        console.error(chalk.red(`Not a file: ${file}`));
        process.exit(1);
      }

      // Check file size (max 1MB)
      const MAX_SIZE = 1024 * 1024; // 1MB
      if (stats.size > MAX_SIZE) {
        console.error(chalk.red(`File too large: ${(stats.size / 1024 / 1024).toFixed(2)}MB (max 1MB)`));
        process.exit(1);
      }

      // Read file content
      spinner.start("Reading file...");
      const content = fs.readFileSync(file, "utf-8");
      spinner.stop();

      // Determine remote path
      let remotePath: string;
      if (options.path) {
        remotePath = ensureMdExtension(options.path);
      } else {
        // Use basename of the file
        remotePath = path.basename(file);
        if (!remotePath.endsWith(".md")) {
          console.error(chalk.red("File must have .md extension, or use --path to specify a path ending in .md"));
          process.exit(1);
        }
      }

      // Validate path format
      if (remotePath.startsWith("/") || remotePath.startsWith(".")) {
        console.error(chalk.red("Path cannot start with / or ."));
        process.exit(1);
      }

      if (remotePath.includes("..")) {
        console.error(chalk.red("Path cannot contain .."));
        process.exit(1);
      }

      // Push to API
      spinner.start(`Pushing ${chalk.cyan(remotePath)}...`);

      try {
        const response = await apiRequest<PushResponse>("/files", {
          method: "POST",
          body: {
            path: remotePath,
            content,
            visibility: visibility.toUpperCase(),
          },
        });

        spinner.succeed(chalk.green(`Pushed ${chalk.bold(remotePath)}`));
        console.log();
        console.log(`  ${chalk.dim("URL:")} ${chalk.cyan(`https://markhub.md${response.url}`)}`);
        console.log(`  ${chalk.dim("Visibility:")} ${formatVisibility(visibility)}`);

        if (user?.username) {
          console.log(`  ${chalk.dim("Raw:")} ${chalk.dim(`https://markhub.md/api/raw/${user.username}/${remotePath}`)}`);
        }
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 409 && options.force) {
            // File exists and --force is set, update instead
            spinner.text = `Updating ${chalk.cyan(remotePath)}...`;

            // First, we need to get the file ID to update it
            // For now, we'll inform the user that --force update requires PATCH endpoint
            spinner.fail(chalk.yellow("File already exists"));
            console.log(chalk.dim("  Update support coming soon. Delete the file first or use a different path."));
            process.exit(1);
          }
          throw error;
        }
        throw error;
      }
    } catch (error) {
      spinner.fail(chalk.red("Push failed"));

      if (error instanceof ApiError) {
        console.error(chalk.red(`  ${error.message}`));
        
        if (error.status === 409) {
          console.log(chalk.dim("  A file with this path already exists."));
        } else if (error.status === 401) {
          console.log(chalk.dim("  Try logging in again: markhub login --force"));
        }
      } else if (error instanceof Error) {
        console.error(chalk.red(`  ${error.message}`));
      }

      process.exit(1);
    }
  });

/**
 * Format visibility for display
 */
function formatVisibility(visibility: Visibility): string {
  switch (visibility) {
    case "public":
      return chalk.green("public");
    case "unlisted":
      return chalk.yellow("unlisted");
    case "private":
      return chalk.red("private");
  }
}
