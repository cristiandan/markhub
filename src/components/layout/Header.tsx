'use client';

import Link from 'next/link';
import { useSession } from '@/hooks';
import { ThemeToggle } from '@/components/theme';

/**
 * Header component with logo, navigation, and auth state.
 *
 * Displays:
 * - Markhub logo (links to home)
 * - Navigation links (Explore)
 * - Theme toggle
 * - Login button or user avatar based on auth state
 */
export function Header() {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60">
      <div className="container mx-auto flex h-14 items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-6">
          <MarkdownIcon className="h-6 w-6 text-[var(--primary)]" />
          <span className="font-semibold text-lg">Markhub</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/explore"
            className="text-[var(--foreground)]/70 hover:text-[var(--foreground)] transition-colors"
          >
            Explore
          </Link>
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side: theme toggle + auth */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isLoading ? (
            // Loading placeholder
            <div className="h-8 w-8 rounded-full bg-[var(--muted)] animate-pulse" />
          ) : isAuthenticated && user ? (
            // User dropdown
            <UserMenu user={user} onSignOut={() => signOut()} />
          ) : (
            // Login button
            <button
              onClick={() => signIn('github')}
              className="inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              <GitHubIcon className="h-4 w-4" />
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * User dropdown menu showing avatar and sign out option.
 */
function UserMenu({
  user,
  onSignOut,
}: {
  user: { name?: string | null; image?: string | null };
  onSignOut: () => void;
}) {
  return (
    <div className="relative group">
      <button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name || 'User avatar'}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-[var(--muted)] flex items-center justify-center text-sm font-medium">
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
      </button>

      {/* Dropdown menu */}
      <div className="absolute right-0 mt-2 w-48 py-1 bg-[var(--card)] rounded-md shadow-lg border border-[var(--border)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
        <div className="px-4 py-2 border-b border-[var(--border)]">
          <p className="text-sm font-medium truncate">{user.name}</p>
        </div>
        <Link
          href="/dashboard"
          className="block px-4 py-2 text-sm text-[var(--foreground)]/70 hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Dashboard
        </Link>
        <button
          onClick={onSignOut}
          className="w-full text-left px-4 py-2 text-sm text-[var(--foreground)]/70 hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

/**
 * Markdown file icon for logo.
 */
function MarkdownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="9" y1="15" x2="15" y2="15" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <polyline points="9,12 12,15 15,12" />
    </svg>
  );
}

/**
 * GitHub icon for sign in button.
 */
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
