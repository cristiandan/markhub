/**
 * markhub logout
 * Clear local credentials
 */

import { Command } from "commander";
import chalk from "chalk";
import { isAuthenticated, clearAuth, getUser } from "../lib/config.js";

export const logoutCommand = new Command("logout")
  .description("Log out and clear stored credentials")
  .option("-f, --force", "Skip confirmation")
  .action(async (options: { force?: boolean }) => {
    // Check if user is logged in
    if (!isAuthenticated()) {
      console.log(chalk.yellow("You're not currently logged in."));
      console.log(chalk.dim("Use 'markhub login' to authenticate."));
      return;
    }

    // Get user info for the goodbye message
    const user = getUser();
    const username = user?.username || "user";

    // Clear credentials
    clearAuth();

    console.log(chalk.green("✓ Logged out successfully"));
    console.log(
      chalk.dim(`Goodbye, @${username}! Your credentials have been cleared.`)
    );
    console.log(chalk.dim("Use 'markhub login' to sign in again."));
  });
