/**
 * API client for Markhub
 */

import { getApiUrl, getToken } from "./config.js";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  authenticated?: boolean;
}

/**
 * Make an API request to Markhub
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, authenticated = true } = options;

  const url = `${getApiUrl()}/api${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (authenticated) {
    const token = getToken();
    if (!token) {
      throw new ApiError(401, "Not authenticated. Run `markhub login` first.");
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new ApiError(
      response.status,
      error.error || `Request failed with status ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Fetch raw file content
 */
export async function fetchRawFile(username: string, path: string): Promise<string> {
  const url = `${getApiUrl()}/api/raw/${username}/${path}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError(404, `File not found: ${username}/${path}`);
    }
    throw new ApiError(response.status, `Failed to fetch file`);
  }

  return response.text();
}
