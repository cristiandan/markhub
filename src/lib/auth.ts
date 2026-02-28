/**
 * Authentication configuration for Markhub.
 * Uses NextAuth.js v5 (Auth.js) with GitHub OAuth provider.
 *
 * Setup:
 * 1. Set GITHUB_ID and GITHUB_SECRET in .env.local
 * 2. Set AUTH_SECRET (generate with `openssl rand -base64 32`)
 * 3. Set NEXTAUTH_URL for production
 *
 * @see https://authjs.dev/getting-started
 */

import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from './db';

/**
 * NextAuth.js configuration.
 *
 * Features:
 * - GitHub OAuth for authentication
 * - Prisma adapter for session/user storage
 * - JWT sessions for simplicity (can switch to database sessions if needed)
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),

  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],

  session: {
    // Use JWT for sessions (stateless, no DB lookup per request)
    strategy: 'jwt',
  },

  callbacks: {
    /**
     * Include user ID in the session object.
     * Allows accessing user.id on the client side.
     */
    session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },

    /**
     * Include user ID in the JWT token.
     * Called when JWT is created or updated.
     */
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },

  pages: {
    // Custom sign-in page (optional, can use default)
    // signIn: '/login',
  },

  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',
});

/**
 * Get the current session.
 * Use in Server Components, API routes, or middleware.
 *
 * @example
 * const session = await getSession();
 * if (!session) redirect('/login');
 */
export async function getSession() {
  return auth();
}

/**
 * Require authentication.
 * Throws if user is not authenticated.
 *
 * @example
 * const session = await requireAuth();
 * // session.user is guaranteed to exist
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}
