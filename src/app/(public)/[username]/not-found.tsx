import Link from 'next/link';

/**
 * Custom 404 page for user profiles.
 * Shown when the requested username doesn't exist.
 */
export default function UserNotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--muted)]">
        <UserIcon className="h-10 w-10 text-[var(--muted-foreground)]" />
      </div>
      <h1 className="text-3xl font-bold">User Not Found</h1>
      <p className="mt-3 max-w-md text-[var(--muted-foreground)]">
        The user you&apos;re looking for doesn&apos;t exist or may have been removed.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
        >
          Go Home
        </Link>
        <Link
          href="/explore"
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-6 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--secondary)]"
        >
          Explore Files
        </Link>
      </div>
    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
