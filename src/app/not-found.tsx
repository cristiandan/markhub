import Link from 'next/link';

/**
 * Global 404 page for missing routes.
 * Shown when a requested page doesn't exist.
 */
export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--muted)]">
        <FileQuestionIcon className="h-12 w-12 text-[var(--muted-foreground)]" />
      </div>
      <h1 className="text-6xl font-bold text-[var(--primary)]">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mt-3 max-w-md text-[var(--muted-foreground)]">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
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

function FileQuestionIcon({ className }: { className?: string }) {
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
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <path d="M10 10.3c.2-.4.5-.8.9-1a2.1 2.1 0 0 1 2.6.4c.3.4.5.8.5 1.3 0 1.3-2 2-2 2" />
      <path d="M12 17h.01" />
    </svg>
  );
}
