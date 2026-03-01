'use client';

/**
 * Client-side session hook for Markhub.
 * Provides authenticated user data and session utilities in client components.
 *
 * This is a typed wrapper around NextAuth's useSession hook with
 * convenience helpers for common auth patterns.
 *
 * @example
 * // Basic usage:
 * const { user, isAuthenticated, isLoading } = useSession();
 * if (isLoading) return <Spinner />;
 * if (!isAuthenticated) return <LoginPrompt />;
 * return <div>Hello, {user.name}!</div>;
 *
 * @example
 * // With sign in/out:
 * const { signIn, signOut } = useSession();
 * <button onClick={() => signIn('github')}>Login</button>
 * <button onClick={() => signOut()}>Logout</button>
 */

import { useSession as useNextAuthSession, signIn, signOut } from 'next-auth/react';

/**
 * User object shape from session.
 * Extends NextAuth's default user with our custom fields.
 */
export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

/**
 * Return type for useSession hook.
 */
export interface UseSessionReturn {
  /** Current authenticated user, or null if not logged in */
  user: SessionUser | null;
  /** True if user is authenticated */
  isAuthenticated: boolean;
  /** True while session is loading */
  isLoading: boolean;
  /** Session status: 'loading' | 'authenticated' | 'unauthenticated' */
  status: 'loading' | 'authenticated' | 'unauthenticated';
  /** Sign in with a provider (e.g., 'github') */
  signIn: typeof signIn;
  /** Sign out and clear session */
  signOut: typeof signOut;
}

/**
 * Hook to access session and user data in client components.
 *
 * Must be used within a SessionProvider (see layout.tsx).
 *
 * @returns Session state and auth utilities
 */
export function useSession(): UseSessionReturn {
  const { data: session, status } = useNextAuthSession();

  const user: SessionUser | null =
    status === 'authenticated' && session?.user
      ? {
          id: session.user.id as string,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }
      : null;

  return {
    user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    status,
    signIn,
    signOut,
  };
}

/**
 * Re-export sign in/out for direct use without hook.
 * Useful for event handlers in server actions or outside components.
 */
export { signIn, signOut };
