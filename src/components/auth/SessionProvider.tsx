'use client';

/**
 * Session provider for client-side authentication.
 * Wraps the app to provide session context to all client components.
 *
 * Uses NextAuth.js v5 (Auth.js) SessionProvider.
 *
 * @example
 * // In layout.tsx:
 * import { SessionProvider } from '@/components/auth/SessionProvider';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <SessionProvider>{children}</SessionProvider>
 *       </body>
 *     </html>
 *   );
 * }
 */

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

interface SessionProviderProps {
  children: React.ReactNode;
  /** Optional initial session from server (for hydration optimization) */
  session?: Session | null;
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>
  );
}
