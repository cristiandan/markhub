import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

/**
 * User profile page - displays user info and their public files.
 *
 * Features:
 * - User avatar, username, bio
 * - Member since date
 * - List of PUBLIC files (not unlisted or private)
 * - Links to individual file pages
 */
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // Fetch user with their public files
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      avatar: true,
      bio: true,
      createdAt: true,
      files: {
        where: {
          visibility: 'PUBLIC',
        },
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          id: true,
          path: true,
          starCount: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8 flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-6">
        {/* Avatar */}
        <div className="shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.username}'s avatar`}
              className="h-24 w-24 rounded-full ring-4 ring-[var(--border)]"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--muted)] ring-4 ring-[var(--border)]">
              <UserIcon className="h-12 w-12 text-[var(--muted-foreground)]" />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {user.name || user.username}
          </h1>
          <p className="mt-1 text-lg text-[var(--muted-foreground)]">
            @{user.username}
          </p>
          {user.bio && (
            <p className="mt-3 max-w-2xl text-[var(--foreground)]">
              {user.bio}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--muted-foreground)] sm:justify-start">
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4" />
              Joined {formatDate(user.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileIcon className="h-4 w-4" />
              {user.files.length} public file{user.files.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-[var(--border)]" />

      {/* Public Files */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Public Files</h2>
        {user.files.length === 0 ? (
          <EmptyState username={user.username} />
        ) : (
          <FileList files={user.files} username={user.username} />
        )}
      </div>
    </div>
  );
}

/**
 * Generate metadata for the profile page.
 */
export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  
  const user = await db.user.findUnique({
    where: { username },
    select: {
      username: true,
      name: true,
      bio: true,
    },
  });

  if (!user) {
    return {
      title: 'User Not Found | Markhub',
    };
  }

  const displayName = user.name || user.username;
  const description = user.bio || `View ${displayName}'s markdown files on Markhub`;

  return {
    title: `${displayName} (@${user.username}) | Markhub`,
    description,
    openGraph: {
      title: `${displayName} (@${user.username})`,
      description,
      type: 'profile',
      username: user.username,
    },
    twitter: {
      card: 'summary',
      title: `${displayName} (@${user.username})`,
      description,
    },
  };
}

/**
 * Empty state shown when user has no public files.
 */
function EmptyState({ username }: { username: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] py-12 px-4">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--muted)]">
        <FileIcon className="h-6 w-6 text-[var(--muted-foreground)]" />
      </div>
      <p className="text-center text-[var(--muted-foreground)]">
        @{username} hasn&apos;t published any public files yet.
      </p>
    </div>
  );
}

/**
 * File list component displaying user's public files.
 */
function FileList({
  files,
  username,
}: {
  files: {
    id: string;
    path: string;
    starCount: number;
    createdAt: Date;
    updatedAt: Date;
  }[];
  username: string;
}) {
  return (
    <div className="space-y-3">
      {files.map((file) => (
        <FileCard key={file.id} file={file} username={username} />
      ))}
    </div>
  );
}

/**
 * Individual file card with metadata.
 */
function FileCard({
  file,
  username,
}: {
  file: {
    id: string;
    path: string;
    starCount: number;
    createdAt: Date;
    updatedAt: Date;
  };
  username: string;
}) {
  return (
    <Link
      href={`/${username}/${file.path}`}
      className="flex items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 transition-colors hover:bg-[var(--secondary)]/50"
    >
      {/* File icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)]">
        <MarkdownIcon className="h-5 w-5 text-[var(--muted-foreground)]" />
      </div>

      {/* File info */}
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{file.path}</div>
        <div className="mt-1 flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
          <span className="inline-flex items-center gap-1">
            <StarIcon className="h-3.5 w-3.5" />
            {file.starCount}
          </span>
          <span>Updated {formatRelativeTime(file.updatedAt)}</span>
        </div>
      </div>

      {/* Arrow */}
      <ChevronRightIcon className="h-5 w-5 shrink-0 text-[var(--muted-foreground)]" />
    </Link>
  );
}

/**
 * Format a date as "Month Year" (e.g., "March 2026").
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
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

function CalendarIcon({ className }: { className?: string }) {
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
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
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

function ChevronRightIcon({ className }: { className?: string }) {
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
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
