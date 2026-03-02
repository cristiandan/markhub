/**
 * markhub list
 * List your files on Markhub
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { apiRequest, ApiError } from "../lib/api.js";
import { isAuthenticated, getUser, getApiUrl } from "../lib/config.js";

interface FileItem {
  id: string;
  path: string;
  visibility: "PUBLIC" | "UNLISTED" | "PRIVATE";
  url: string;
  stars: number;
  createdAt: string;
  updatedAt: string;
}

interface ListResponse {
  files: FileItem[];
}

/**
 * Format visibility with icon and color
 */
function formatVisibility(visibility: FileItem["visibility"]): string {
  switch (visibility) {
    case "PUBLIC":
      return chalk.green("🌐 public");
    case "UNLISTED":
      return chalk.yellow("🔗 unlisted");
    case "PRIVATE":
      return chalk.red("🔒 private");
    default:
      return visibility;
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) {
    return date.toLocaleDateString();
  } else if (diffDay > 0) {
    return `${diffDay}d ago`;
  } else if (diffHour > 0) {
    return `${diffHour}h ago`;
  } else if (diffMin > 0) {
    return `${diffMin}m ago`;
  } else {
    return "just now";
  }
}

export const listCommand = new Command("list")
  .alias("ls")
  .description("List your files on Markhub")
  .option("-a, --all", "Show all files including private and unlisted (default)")
  .option("--public", "Show only public files")
  .option("--unlisted", "Show only unlisted files")
  .option("--private", "Show only private files")
  .option("-j, --json", "Output as JSON")
  .action(async (options) => {
    // Check authentication
    if (!isAuthenticated()) {
      console.error(chalk.red("Not logged in. Run `markhub login` first."));
      process.exit(1);
    }

    const spinner = ora("Fetching your files...").start();

    try {
      // Build query string for visibility filter
      let queryString = "";
      if (options.public) {
        queryString = "?visibility=PUBLIC";
      } else if (options.unlisted) {
        queryString = "?visibility=UNLISTED";
      } else if (options.private) {
        queryString = "?visibility=PRIVATE";
      }

      const response = await apiRequest<ListResponse>(`/files${queryString}`);
      const { files } = response;

      spinner.stop();

      // JSON output
      if (options.json) {
        console.log(JSON.stringify(files, null, 2));
        return;
      }

      // No files
      if (files.length === 0) {
        const user = getUser();
        console.log(chalk.dim("No files found."));
        console.log(
          chalk.dim(
            `Create your first file with: ${chalk.cyan("markhub push <file.md>")}`
          )
        );
        return;
      }

      // Print header
      const user = getUser();
      const apiUrl = getApiUrl();
      console.log(chalk.bold(`\n📁 ${user?.username}'s files`));
      console.log(chalk.dim(`${files.length} file${files.length === 1 ? "" : "s"}\n`));

      // Print files
      for (const file of files) {
        const visibility = formatVisibility(file.visibility);
        const stars = file.stars > 0 ? chalk.yellow(` ⭐ ${file.stars}`) : "";
        const time = chalk.dim(formatRelativeTime(file.updatedAt));
        const url = chalk.cyan(`${apiUrl}${file.url}`);

        console.log(`  ${chalk.bold(file.path)}`);
        console.log(`    ${visibility}${stars}  ${time}`);
        console.log(`    ${url}`);
        console.log();
      }
    } catch (error) {
      spinner.stop();

      if (error instanceof ApiError) {
        if (error.status === 401) {
          console.error(chalk.red("Session expired. Run `markhub login` again."));
        } else {
          console.error(chalk.red(`Error: ${error.message}`));
        }
      } else {
        console.error(chalk.red("Failed to fetch files. Check your connection."));
      }
      process.exit(1);
    }
  });
