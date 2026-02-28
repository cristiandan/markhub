/**
 * NextAuth.js API route handler.
 *
 * Handles all authentication routes:
 * - GET /api/auth/signin - Sign in page
 * - GET /api/auth/signout - Sign out page
 * - GET /api/auth/callback/:provider - OAuth callback
 * - GET /api/auth/session - Get session
 * - POST /api/auth/signin/:provider - Initiate OAuth sign in
 * - POST /api/auth/signout - Sign out
 *
 * @see https://authjs.dev/getting-started/installation#configure
 */

import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
