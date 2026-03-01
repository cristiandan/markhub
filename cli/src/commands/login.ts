/**
 * markhub login
 * Authenticate with GitHub using device flow
 *
 * Flow:
 * 1. Request device code from /api/auth/device/code
 * 2. Display verification URL and user code
 * 3. Poll /api/auth/device/token until user completes auth
 * 4. Store token and user info locally
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import open from "open";
import { getApiUrl, setAuth, isAuthenticated, getUser } from "../lib/config.js";

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface TokenResponse {
  token: string;
  user: {
    id: string;
    username: string;
    name?: string;
    avatar?: string;
  };
}

interface ErrorResponse {
  error: string;
  error_description?: string;
}

const POLL_INTERVAL_MS = 5000; // 5 seconds between polls
const MAX_POLL_ATTEMPTS = 60; // 5 minutes max wait

export const loginCommand = new Command("login")
  .description("Authenticate with GitHub")
  .option("-f, --force", "Force re-authentication even if already logged in")
  .action(async (options) => {
    // Check if already authenticated
    if (isAuthenticated() && !options.force) {
      const user = getUser();
      console.log(chalk.yellow(`Already logged in as ${chalk.bold(user?.username || "unknown")}`));
      console.log(chalk.dim("Use --force to re-authenticate"));
      return;
    }

    const apiUrl = getApiUrl();
    const spinner = ora();

    try {
      // Step 1: Request device code
      spinner.start("Requesting device code...");

      const codeResponse = await fetch(`${apiUrl}/api/auth/device/code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!codeResponse.ok) {
        const error = (await codeResponse.json().catch(() => ({}))) as ErrorResponse;
        throw new Error(error.error_description || error.error || "Failed to get device code");
      }

      const deviceData = (await codeResponse.json()) as DeviceCodeResponse;
      spinner.stop();

      // Step 2: Display instructions
      console.log();
      console.log(chalk.bold("To authenticate, visit:"));
      console.log(chalk.cyan(`  ${deviceData.verification_uri}`));
      console.log();
      console.log(chalk.bold("And enter this code:"));
      console.log(chalk.green.bold(`  ${deviceData.user_code}`));
      console.log();

      // Try to open browser automatically
      try {
        await open(deviceData.verification_uri);
        console.log(chalk.dim("(Browser opened automatically)"));
      } catch {
        // Ignore if browser can't be opened
      }

      console.log();

      // Step 3: Poll for token
      spinner.start("Waiting for authorization...");

      let attempts = 0;
      const pollInterval = Math.max(deviceData.interval * 1000, POLL_INTERVAL_MS);

      while (attempts < MAX_POLL_ATTEMPTS) {
        await sleep(pollInterval);
        attempts++;

        try {
          const tokenResponse = await fetch(`${apiUrl}/api/auth/device/token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ device_code: deviceData.device_code }),
          });

          if (tokenResponse.ok) {
            const tokenData = (await tokenResponse.json()) as TokenResponse;

            // Step 4: Store credentials
            setAuth(tokenData.token, tokenData.user);

            spinner.succeed(chalk.green(`Logged in as ${chalk.bold(tokenData.user.username)}`));

            if (tokenData.user.name) {
              console.log(chalk.dim(`  ${tokenData.user.name}`));
            }

            return;
          }

          // Handle polling errors
          const error = (await tokenResponse.json().catch(() => ({}))) as ErrorResponse;

          if (error.error === "authorization_pending") {
            // User hasn't completed auth yet, keep polling
            spinner.text = `Waiting for authorization... (${attempts * pollInterval / 1000}s)`;
            continue;
          }

          if (error.error === "slow_down") {
            // Back off polling interval
            await sleep(5000);
            continue;
          }

          if (error.error === "expired_token") {
            throw new Error("Device code expired. Please try again.");
          }

          if (error.error === "access_denied") {
            throw new Error("Authorization denied by user.");
          }

          // Unknown error
          throw new Error(error.error_description || error.error || "Authorization failed");
        } catch (fetchError) {
          // Network error during poll, continue trying
          if (fetchError instanceof TypeError) {
            spinner.text = "Waiting for authorization... (retrying connection)";
            continue;
          }
          throw fetchError;
        }
      }

      throw new Error("Timed out waiting for authorization. Please try again.");
    } catch (error) {
      spinner.fail(chalk.red("Login failed"));

      if (error instanceof Error) {
        console.error(chalk.red(`  ${error.message}`));
      }

      process.exit(1);
    }
  });

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
