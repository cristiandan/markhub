'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * New file page - form for creating a new markdown file.
 *
 * Features:
 * - Path input with validation (.md extension)
 * - Content textarea with monospace font
 * - Visibility selector (Public, Unlisted, Private)
 * - Client-side validation
 * - Submit to POST /api/files
 */
export default function NewFilePage() {
  const router = useRouter();
  const [path, setPath] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'PUBLIC' | 'UNLISTED' | 'PRIVATE'>('PUBLIC');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    const trimmedPath = path.trim();
    if (!trimmedPath) {
      setError('File path is required');
      return;
    }

    if (!trimmedPath.endsWith('.md')) {
      setError('File path must end with .md');
      return;
    }

    if (trimmedPath.startsWith('/') || trimmedPath.startsWith('.')) {
      setError('File path cannot start with / or .');
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: trimmedPath,
          content: content,
          visibility: visibility,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to create file (${res.status})`);
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Create new file</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          Share your markdown with the world
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Error display */}
        {error && (
          <div className="rounded-lg border border-[var(--destructive)]/50 bg-[var(--destructive)]/10 px-4 py-3 text-sm text-[var(--destructive)]">
            {error}
          </div>
        )}

        {/* Path input */}
        <div className="space-y-2">
          <label htmlFor="path" className="block text-sm font-medium">
            File path
          </label>
          <div className="relative">
            <input
              id="path"
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="agents.md or projects/README.md"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              disabled={isSubmitting}
            />
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Must end with .md — supports nested paths like folder/file.md
          </p>
        </div>

        {/* Content textarea */}
        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm font-medium">
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="# My File&#10;&#10;Write your markdown here..."
            rows={16}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 font-mono text-sm placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 resize-y"
            disabled={isSubmitting}
          />
        </div>

        {/* Visibility selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Visibility</label>
          <div className="grid gap-3 sm:grid-cols-3">
            <VisibilityOption
              value="PUBLIC"
              selected={visibility === 'PUBLIC'}
              onSelect={() => setVisibility('PUBLIC')}
              icon={GlobeIcon}
              title="Public"
              description="Visible to everyone"
              disabled={isSubmitting}
            />
            <VisibilityOption
              value="UNLISTED"
              selected={visibility === 'UNLISTED'}
              onSelect={() => setVisibility('UNLISTED')}
              icon={LinkIcon}
              title="Unlisted"
              description="Anyone with link"
              disabled={isSubmitting}
            />
            <VisibilityOption
              value="PRIVATE"
              selected={visibility === 'PRIVATE'}
              onSelect={() => setVisibility('PRIVATE')}
              icon={LockIcon}
              title="Private"
              description="Only you can see"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-[var(--primary-foreground)] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <SpinnerIcon className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4" />
                Create file
              </>
            )}
          </button>
          <Link
            href="/dashboard"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

/**
 * Visibility option card for the selector.
 */
function VisibilityOption({
  value,
  selected,
  onSelect,
  icon: Icon,
  title,
  description,
  disabled,
}: {
  value: string;
  selected: boolean;
  onSelect: () => void;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`relative flex flex-col items-start rounded-lg border p-4 text-left transition-colors ${
        selected
          ? 'border-[var(--accent)] bg-[var(--accent)]/5'
          : 'border-[var(--border)] hover:border-[var(--muted-foreground)]/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={`h-4 w-4 ${
            selected ? 'text-[var(--accent)]' : 'text-[var(--muted-foreground)]'
          }`}
        />
        <span className={`text-sm font-medium ${selected ? 'text-[var(--accent)]' : ''}`}>
          {title}
        </span>
      </div>
      <span className="mt-1 text-xs text-[var(--muted-foreground)]">{description}</span>
      {selected && (
        <div className="absolute right-2 top-2">
          <CheckIcon className="h-4 w-4 text-[var(--accent)]" />
        </div>
      )}
    </button>
  );
}

// =============================================================================
// ICONS
// =============================================================================

function ArrowLeftIcon({ className }: { className?: string }) {
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
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

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

function CheckIcon({ className }: { className?: string }) {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
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
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  );
}
