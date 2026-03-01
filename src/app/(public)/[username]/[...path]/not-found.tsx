import Link from 'next/link';

/**
 * 404 page for file not found.
 */
export default function FileNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--muted)]">
        <FileQuestionIcon className="h-10 w-10 text-[var(--muted-foreground)]" />
      </div>
      <h1 className="text-3xl font-bold">File not found</h1>
      <p className="mt-2 text-[var(--muted-foreground)]">
        This file doesn&apos;t exist or you don&apos;t have permission to view it.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Link
          href="/"
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
        >
          Go home
        </Link>
        <Link
          href="/explore"
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--muted)]"
        >
          Explore files
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M10 13a2 2 0 0 1 4 0c0 1-1.5 1.5-2 2.5" />
      <line x1="12" y1="19" x2="12.01" y2="19" />
    </svg>
  );
}
