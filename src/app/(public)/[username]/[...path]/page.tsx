import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { CommentsSection, FileActions, StarButton } from '@/components/file';
import { MarkdownRenderer } from '@/components/markdown';

/**
 * Public file view page.
 *
 * Routes: /{username}/{path} where path can be nested (e.g., /user/folder/file.md)
 *
 * Visibility rules:
 * - PUBLIC: Visible to everyone
 * - UNLISTED: Visible to everyone (via direct link)
 * - PRIVATE: Only visible to owner
 */

interface FilePageProps {
  params: Promise<{
    username: string;
    path: string[];
  }>;
}

export default async function FilePage({ params }: FilePageProps) {
  const { username, path: pathSegments } = await params;
  const filePath = pathSegments.join('/');

  // Look up the user
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      avatar: true,
    },
  });

  if (!user) {
    notFound();
  }

  // Look up the file
  const file = await db.file.findUnique({
    where: {
      userId_path: {
        userId: user.id,
        path: filePath,
      },
    },
    select: {
      id: true,
      path: true,
      content: true,
      visibility: true,
      starCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!file) {
    notFound();
  }

  // Get current user session (for visibility check and comment ownership)
  const session = await auth();
  const currentUserId = session?.user?.id;

  // Check visibility - PRIVATE files only visible to owner
  if (file.visibility === 'PRIVATE') {
    if (!currentUserId || currentUserId !== user.id) {
      notFound();
    }
  }

  // File is visible (PUBLIC, UNLISTED, or PRIVATE owner viewing)
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-2">
          <Link
            href={`/${user.username}`}
            className="inline-flex items-center gap-2 hover:text-[var(--foreground)] transition-colors"
          >
            {user.avatar && (
              <img
                src={user.avatar}
                alt={user.name || user.username}
                className="h-5 w-5 rounded-full"
              />
            )}
            <span>{user.username}</span>
          </Link>
          <span>/</span>
          <span className="text-[var(--foreground)]">{file.path}</span>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{getFileName(file.path)}</h1>
          <div className="flex items-center gap-4">
            <StarButton fileId={file.id} initialStarCount={file.starCount} />
            <VisibilityBadge visibility={file.visibility} />
          </div>
        </div>

        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Updated {formatRelativeTime(file.updatedAt)}
        </p>
      </div>

      {/* Content */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
        {/* Action bar (client component for copy functionality) */}
        <FileActions
          rawUrl={`/api/raw/${user.username}/${file.path}`}
          content={file.content}
        />

        {/* Rendered markdown content */}
        <div className="p-6">
          <MarkdownRenderer content={file.content} />
        </div>
      </div>

      {/* Comments */}
      <CommentsSection fileId={file.id} currentUserId={currentUserId} />
    </div>
  );
}

/**
 * Extract filename from path.
 */
function getFileName(path: string): string {
  const segments = path.split('/');
  return segments[segments.length - 1];
}

/**
 * Format a date as relative time.
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

/**
 * Visibility badge component.
 */
function VisibilityBadge({
  visibility,
}: {
  visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE';
}) {
  const config = {
    PUBLIC: {
      label: 'Public',
      icon: GlobeIcon,
      className: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950',
    },
    UNLISTED: {
      label: 'Unlisted',
      icon: LinkIcon,
      className:
        'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950',
    },
    PRIVATE: {
      label: 'Private',
      icon: LockIcon,
      className: 'text-[var(--muted-foreground)] bg-[var(--muted)]',
    },
  };

  const { label, icon: Icon, className } = config[visibility];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

// =============================================================================
// ICONS
// =============================================================================

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
