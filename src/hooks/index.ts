/**
 * Barrel export for custom hooks.
 * Import hooks from '@/hooks' for convenience.
 *
 * @example
 * import { useSession } from '@/hooks';
 * import { useTheme } from '@/hooks';
 */

export { useSession, signIn, signOut, type SessionUser, type UseSessionReturn } from './useSession';

// Re-export useTheme from next-themes for convenience
export { useTheme } from 'next-themes';
