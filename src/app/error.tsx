'use client';

import { useEffect } from 'react';

/**
 * Global error boundary for the application.
 * Catches React errors and displays a user-friendly error page.
 * 
 * This is a Client Component because error boundaries must be able to
 * catch errors during rendering and provide recovery options.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--destructive)]/10">
        <AlertTriangleIcon className="h-12 w-12 text-[var(--destructive)]" />
      </div>
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 max-w-md text-[var(--muted-foreground)]">
        An unexpected error occurred. Don&apos;t worry, our team has been notified.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-[var(--muted-foreground)]">
          Error ID: {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          onClick={reset}
          className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
        >
          Try Again
        </button>
        <a
          href="/"
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-6 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--secondary)]"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
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
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
