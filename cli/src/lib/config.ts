/**
 * Configuration storage for Markhub CLI
 * Stores auth tokens and user preferences in ~/.markhub/config.json
 */

import Conf from "conf";

interface MarkhubConfig {
  token?: string;
  user?: {
    id: string;
    username: string;
    name?: string;
    avatar?: string;
  };
  apiUrl: string;
}

const defaults: Partial<MarkhubConfig> = {
  apiUrl: "https://markhub.md",
};

export const config = new Conf<MarkhubConfig>({
  projectName: "markhub",
  defaults: defaults as MarkhubConfig,
});

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!config.get("token");
}

/**
 * Get the API URL
 */
export function getApiUrl(): string {
  return config.get("apiUrl");
}

/**
 * Get the auth token
 */
export function getToken(): string | undefined {
  return config.get("token");
}

/**
 * Set auth token and user info
 */
export function setAuth(
  token: string,
  user: MarkhubConfig["user"]
): void {
  config.set("token", token);
  config.set("user", user);
}

/**
 * Clear auth data (logout)
 */
export function clearAuth(): void {
  config.delete("token");
  config.delete("user");
}

/**
 * Get current user info
 */
export function getUser(): MarkhubConfig["user"] | undefined {
  return config.get("user");
}
