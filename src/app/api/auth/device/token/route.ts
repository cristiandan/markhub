/**
 * POST /api/auth/device/token
 * Polls GitHub for device flow authentication completion.
 *
 * CLI calls this endpoint with the device_code until user completes auth.
 * Returns user info and API token on success.
 *
 * @see https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#device-flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signCliToken } from '@/lib/cli-token';

const GITHUB_ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';

interface GitHubTokenResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

interface GitHubUser {
  id: number;
  login: string;
  name?: string;
  avatar_url?: string;
  bio?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { device_code } = body;

    if (!device_code) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'device_code is required' },
        { status: 400 }
      );
    }

    const clientId = process.env.GITHUB_ID;
    const clientSecret = process.env.GITHUB_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'server_error', error_description: 'GitHub OAuth not configured' },
        { status: 500 }
      );
    }

    // Poll GitHub for access token
    const tokenResponse = await fetch(GITHUB_ACCESS_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        device_code: device_code,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });

    const tokenData = await tokenResponse.json() as GitHubTokenResponse;

    // Handle GitHub polling responses
    if (tokenData.error) {
      // Pass through GitHub's error codes (authorization_pending, slow_down, expired_token, etc.)
      const status = tokenData.error === 'authorization_pending' ? 202 : 400;
      return NextResponse.json(
        {
          error: tokenData.error,
          error_description: tokenData.error_description,
        },
        { status }
      );
    }

    if (!tokenData.access_token) {
      return NextResponse.json(
        { error: 'server_error', error_description: 'No access token in response' },
        { status: 500 }
      );
    }

    // Get user info from GitHub
    const userResponse = await fetch(GITHUB_USER_URL, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
        'User-Agent': 'Markhub',
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'github_error', error_description: 'Failed to get user info from GitHub' },
        { status: 500 }
      );
    }

    const githubUser = await userResponse.json() as GitHubUser;

    // Find or create user in database
    let user = await db.user.findUnique({
      where: { githubId: githubUser.id },
    });

    if (user) {
      // Update user info (name, avatar, bio may have changed)
      user = await db.user.update({
        where: { id: user.id },
        data: {
          username: githubUser.login,
          name: githubUser.name,
          avatar: githubUser.avatar_url,
          bio: githubUser.bio,
        },
      });
    } else {
      // Create new user
      user = await db.user.create({
        data: {
          githubId: githubUser.id,
          username: githubUser.login,
          name: githubUser.name,
          avatar: githubUser.avatar_url,
          bio: githubUser.bio,
        },
      });
    }

    // Generate CLI token (JWT signed with AUTH_SECRET)
    const token = await signCliToken(user.id);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Device token error:', error);
    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    );
  }
}
