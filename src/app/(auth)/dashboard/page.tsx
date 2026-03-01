import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Dashboard page - displays user's files with empty state.
 *
 * Features:
 * - Lists all files owned by the current user
 * - Shows file metadata (path, visibility, stars, dates)
 * - Empty state with CTA to create first file
 * - Quick actions (edit, view, delete)
 */
export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  // Fetch user's files ordered by most recently updated
  const files = await db.file.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: 'desc',
    },
    select: {
      id: true,
      path: true,
      visibility: true,
      starCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Files</h1>
          <p className="mt-1 text-[var(--muted-foreground)]">
            Manage your markdown files
          </p>
        </div>
        <Link
          href="/new"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
        >
          <PlusIcon className="h-4 w-4" />
          New file
        </Link>
      </div>

      {/* Content */}
      {files.length === 0 ? (
        <EmptyState />
      ) : (
        <FileList files={files} />
      )}
    </div>
  );
}

/**
 * Empty state shown when user has no files.
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] py-16 px-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)]">
        <FileIcon className="h-8 w-8 text-[var(--muted-foreground)]" />
      </div>
      <h2 className="text-xl font-semibold">No files yet</h2>
      <p className="mt-2 max-w-sm text-center text-[var(--muted-foreground)]">
        Get started by creating your first markdown file. Share SOUL.md, AGENTS.md, system prompts,
        and more.
      </p>
      <Link
        href="/new"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
      >
        <PlusIcon className="h-4 w-4" />
        Create your first file
      </Link>
    </div>
  );
}

/**
 * File list component displaying all user files.
 */
function FileList({
  files,
}: {
  files: {
    id: string;
    path: string;
    visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE';
    starCount: number;
    createdAt: Date;
    updatedAt: Date;
  }[];
}) {
  return (
    <div className="space-y-3">
      {files.map((file) => (
        <FileCard key={file.id} file={file} />
      ))}
    </div>
  );
}

/**
 * Individual file card with metadata and actions.
 */
function FileCard({
  file,
}: {
  file: {
    id: string;
    path: string;
    visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE';
    starCount: number;
    createdAt: Date;
    updatedAt: Date;
  };
}) {
  const visibilityConfig = {
    PUBLIC: {
      label: 'Public',
      icon: GlobeIcon,
      className: 'text-green-600 dark:text-green-400',
    },
    UNLISTED: {
      label: 'Unlisted',
      icon: LinkIcon,
      className: 'text-yellow-600 dark:text-yellow-400',
    },
    PRIVATE: {
      label: 'Private',
      icon: LockIcon,
      className: 'text-[var(--muted-foreground)]',
    },
  };

  const visibility = visibilityConfig[file.visibility];
  const VisibilityIcon = visibility.icon;

  return (
    <div className="flex items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:bg-[var(--secondary)]/50">
      {/* File icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)]">
        <MarkdownIcon className="h-5 w-5 text-[var(--muted-foreground)]" />
      </div>

      {/* File info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/edit/${file.id}`}
            className="truncate font-medium hover:text-[var(--primary)] transition-colors"
          >
            {file.path}
          </Link>
          <span
            className={`inline-flex items-center gap-1 text-xs ${visibility.className}`}
            title={visibility.label}
          >
            <VisibilityIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{visibility.label}</span>
          </span>
        </div>
        <div className="mt-1 flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
          <span className="inline-flex items-center gap-1">
            <StarIcon className="h-3.5 w-3.5" />
            {file.starCount}
          </span>
          <span>Updated {formatRelativeTime(file.updatedAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/edit/${file.id}`}
          className="rounded-md p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          title="Edit"
        >
          <EditIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "yesterday").
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays === 1) {
    return 'yesterday';
  } else if (diffDays < 30) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// =============================================================================
// ICONS
// =============================================================================

function PlusIcon({ className }: { className?: string }) {
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
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
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
    </svg>
  );
}

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

function StarIcon({ className }: { className?: string }) {
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
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
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
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
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
