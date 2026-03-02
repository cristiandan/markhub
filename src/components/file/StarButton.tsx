'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * Interactive star button for files.
 *
 * Features:
 * - Shows current star state (filled/unfilled)
 * - Toggles star on click (requires authentication)
 * - Optimistic UI updates with rollback on error
 * - Redirects to sign-in if not authenticated
 */

interface StarButtonProps {
  fileId: string;
  initialStarCount: number;
}

export function StarButton({ fileId, initialStarCount }: StarButtonProps) {
  const { data: session, status } = useSession();
  const [starred, setStarred] = useState(false);
  const [starCount, setStarCount] = useState(initialStarCount);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch current star status on mount (only if authenticated)
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user) {
      setHasFetched(true);
      return;
    }

    async function fetchStarStatus() {
      try {
        const response = await fetch(`/api/files/${fileId}/star`);
        if (response.ok) {
          const data = await response.json();
          setStarred(data.starred);
          setStarCount(data.starCount);
        }
      } catch (error) {
        console.error('Failed to fetch star status:', error);
      } finally {
        setHasFetched(true);
      }
    }

    fetchStarStatus();
  }, [fileId, session, status]);

  async function handleToggleStar() {
    // Redirect to sign-in if not authenticated
    if (!session?.user) {
      window.location.href = `/api/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    if (isLoading) return;

    // Optimistic update
    const previousStarred = starred;
    const previousCount = starCount;
    setStarred(!starred);
    setStarCount(starred ? starCount - 1 : starCount + 1);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/files/${fileId}/star`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle star');
      }

      const data = await response.json();
      setStarred(data.starred);
      setStarCount(data.starCount);
    } catch (error) {
      // Rollback on error
      console.error('Failed to toggle star:', error);
      setStarred(previousStarred);
      setStarCount(previousCount);
    } finally {
      setIsLoading(false);
    }
  }

  // Show loading state while fetching session or star status
  const showLoading = status === 'loading' || !hasFetched;

  return (
    <button
      onClick={handleToggleStar}
      disabled={isLoading}
      className={`
        inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium
        transition-all duration-150
        border border-[var(--border)]
        ${starred
          ? 'bg-yellow-50 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
          : 'bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${showLoading ? 'animate-pulse' : ''}
      `}
      title={starred ? 'Unstar this file' : 'Star this file'}
      aria-label={starred ? 'Unstar this file' : 'Star this file'}
    >
      {starred ? <StarFilledIcon className="h-4 w-4" /> : <StarIcon className="h-4 w-4" />}
      <span>{starCount}</span>
    </button>
  );
}

// =============================================================================
// ICONS
// =============================================================================

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

function StarFilledIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
