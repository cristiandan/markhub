'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { MarkdownRenderer } from '@/components/markdown/MarkdownRenderer';

/**
 * Comment data structure from API.
 */
interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    name: string | null;
    avatar: string | null;
  };
}

/**
 * Props for CommentsSection component.
 */
interface CommentsSectionProps {
  fileId: string;
  currentUserId?: string;
}

/**
 * Comments section for file view page.
 *
 * Displays comments sorted by date (oldest first) and allows authenticated
 * users to add new comments.
 */
export function CommentsSection({ fileId, currentUserId }: CommentsSectionProps) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Fetch comments from the API.
   */
  const fetchComments = useCallback(async (cursor?: string) => {
    try {
      const url = new URL(`/api/files/${fileId}/comments`, window.location.origin);
      url.searchParams.set('limit', '50');
      if (cursor) {
        url.searchParams.set('cursor', cursor);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      
      if (cursor) {
        // Append to existing comments
        setComments((prev) => [...prev, ...data.comments]);
      } else {
        // Replace comments
        setComments(data.comments);
      }
      
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  }, [fileId]);

  // Initial fetch
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  /**
   * Submit a new comment.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const content = newComment.trim();
    if (!content || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/files/${fileId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to post comment');
      }

      const comment = await response.json();
      setComments((prev) => [...prev, comment]);
      setNewComment('');
      setShowPreview(false);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Delete a comment.
   */
  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete comment');
      }

      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
    }
  };

  /**
   * Auto-resize textarea as user types.
   */
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
    
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  /**
   * Load more comments.
   */
  const loadMore = () => {
    if (hasMore && nextCursor) {
      fetchComments(nextCursor);
    }
  };

  const isAuthenticated = status === 'authenticated' && session?.user;

  return (
    <div className="mt-8">
      {/* Header */}
      <h2 className="flex items-center gap-2 text-lg font-semibold mb-4">
        <CommentIcon className="h-5 w-5" />
        Comments
        {comments.length > 0 && (
          <span className="text-sm font-normal text-[var(--muted-foreground)]">
            ({comments.length}{hasMore ? '+' : ''})
          </span>
        )}
      </h2>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-[var(--muted-foreground)]">
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                isOwner={currentUserId === comment.author.id}
                onDelete={handleDelete}
              />
            ))}
            
            {/* Load more button */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={loadMore}
                  className="text-sm text-[var(--primary)] hover:underline"
                >
                  Load more comments
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Comment form */}
      {isAuthenticated && session?.user ? (
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex gap-3">
            {/* User avatar */}
            <div className="flex-shrink-0">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'You'}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-[var(--muted)] flex items-center justify-center">
                  <span className="text-xs font-medium">
                    {(session.user.name || 'U')[0].toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Input area with preview toggle */}
            <div className="flex-1">
              {/* Write/Preview tabs */}
              <div className="flex border-b border-[var(--border)] mb-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className={`px-3 py-1.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    !showPreview
                      ? 'border-[var(--primary)] text-[var(--foreground)]'
                      : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <EditIcon className="h-4 w-4" />
                    Write
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className={`px-3 py-1.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    showPreview
                      ? 'border-[var(--primary)] text-[var(--foreground)]'
                      : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <EyeIcon className="h-4 w-4" />
                    Preview
                  </span>
                </button>
              </div>

              {/* Textarea or Preview */}
              {showPreview ? (
                <div className="min-h-[80px] rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2">
                  {newComment.trim() ? (
                    <MarkdownRenderer content={newComment} className="text-sm" />
                  ) : (
                    <p className="text-sm text-[var(--muted-foreground)] italic">
                      Nothing to preview
                    </p>
                  )}
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={handleTextareaChange}
                  placeholder="Write a comment... (Markdown supported)"
                  rows={3}
                  maxLength={10000}
                  disabled={isSubmitting}
                  className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent disabled:opacity-50"
                />
              )}
              
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-[var(--muted-foreground)]">
                  {newComment.length > 0 ? (
                    <>
                      {newComment.length.toLocaleString()}/10,000
                      <span className="mx-2">·</span>
                      <span>Markdown supported</span>
                    </>
                  ) : (
                    'Supports **bold**, *italic*, `code`, and more'
                  )}
                </span>
                
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <SendIcon className="h-4 w-4" />
                      Comment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mt-6 p-4 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            <Link
              href="/api/auth/signin"
              className="text-[var(--primary)] hover:underline font-medium"
            >
              Sign in
            </Link>
            {' '}to leave a comment
          </p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * Individual comment card.
 */
function CommentCard({
  comment,
  isOwner,
  onDelete,
}: {
  comment: Comment;
  isOwner: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex gap-3 group">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <Link href={`/${comment.author.username}`}>
          {comment.author.avatar ? (
            <img
              src={comment.author.avatar}
              alt={comment.author.name || comment.author.username}
              className="h-8 w-8 rounded-full hover:ring-2 hover:ring-[var(--primary)] transition-all"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-[var(--muted)] flex items-center justify-center hover:ring-2 hover:ring-[var(--primary)] transition-all">
              <span className="text-xs font-medium">
                {(comment.author.name || comment.author.username)[0].toUpperCase()}
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/${comment.author.username}`}
            className="text-sm font-medium hover:underline"
          >
            {comment.author.name || comment.author.username}
          </Link>
          <span className="text-xs text-[var(--muted-foreground)]">
            {formatRelativeTime(new Date(comment.createdAt))}
          </span>
          {isOwner && (
            <button
              onClick={() => onDelete(comment.id)}
              className="ml-auto opacity-0 group-hover:opacity-100 text-[var(--muted-foreground)] hover:text-red-500 transition-all"
              title="Delete comment"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-1 text-sm">
          <MarkdownRenderer content={comment.content} className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0" />
        </div>
      </div>
    </div>
  );
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
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return 'yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// =============================================================================
// ICONS
// =============================================================================

function CommentIcon({ className }: { className?: string }) {
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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

function EyeIcon({ className }: { className?: string }) {
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
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
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
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
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
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className || 'h-5 w-5'}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
