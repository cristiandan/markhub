/**
 * POST /api/auth/device/code
 * Initiates GitHub Device Flow authentication.
 *
 * Returns a device_code and user_code for the CLI to display.
 * User visits verification_uri and enters user_code to authenticate.
 *
 * @see https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow
 */

import { NextResponse } from 'next/server';

const GITHUB_DEVICE_CODE_URL = 'https://github.com/login/device/code';

interface GitHubDeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface GitHubErrorResponse {
  error: string;
  error_description?: string;
}

export async function POST() {
  try {
    const clientId = process.env.GITHUB_ID;

    if (!clientId) {
      return NextResponse.json(
        { error: 'server_error', error_description: 'GitHub OAuth not configured' },
        { status: 500 }
      );
    }

    // Request device code from GitHub
    const response = await fetch(GITHUB_DEVICE_CODE_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        scope: 'read:user user:email',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({})) as GitHubErrorResponse;
      console.error('GitHub device code error:', error);
      return NextResponse.json(
        {
          error: error.error || 'github_error',
          error_description: error.error_description || 'Failed to get device code from GitHub',
        },
        { status: response.status }
      );
    }

    const data = await response.json() as GitHubDeviceCodeResponse;

    // Return device code info to CLI
    return NextResponse.json({
      device_code: data.device_code,
      user_code: data.user_code,
      verification_uri: data.verification_uri,
      expires_in: data.expires_in,
      interval: data.interval,
    });
  } catch (error) {
    console.error('Device code error:', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    );
  }
}
