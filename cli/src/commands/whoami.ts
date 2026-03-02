/**
 * markhub whoami
 * Show current authenticated user
 */

import { Command } from "commander";
import chalk from "chalk";
import { isAuthenticated, getUser, getApiUrl } from "../lib/config.js";

export const whoamiCommand = new Command("whoami")
  .description("Show current authenticated user")
  .option("--json", "Output as JSON")
  .action(async (options) => {
    if (!isAuthenticated()) {
      console.log(chalk.yellow("Not logged in"));
      console.log(chalk.dim("Run `markhub login` to authenticate with GitHub"));
      process.exit(1);
    }

    const user = getUser();
    if (!user) {
      console.log(chalk.red("Error: No user data found"));
      console.log(chalk.dim("Try logging in again with `markhub login --force`"));
      process.exit(1);
    }

    if (options.json) {
      console.log(JSON.stringify({
        username: user.username,
        name: user.name || null,
        id: user.id,
        avatar: user.avatar || null,
        profileUrl: `${getApiUrl()}/${user.username}`,
      }, null, 2));
      return;
    }

    // Display user info
    console.log();
    console.log(chalk.bold("  Logged in as:"));
    console.log();
    console.log(`  ${chalk.cyan("Username:")}  @${user.username}`);
    if (user.name) {
      console.log(`  ${chalk.cyan("Name:")}      ${user.name}`);
    }
    console.log(`  ${chalk.cyan("Profile:")}   ${chalk.underline(`${getApiUrl()}/${user.username}`)}`);
    if (user.avatar) {
      console.log(`  ${chalk.cyan("Avatar:")}    ${chalk.dim(user.avatar)}`);
    }
    console.log();
  });
