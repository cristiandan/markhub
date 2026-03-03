'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

/**
 * Explore page - search and discover public markdown files.
 *
 * Features:
 * - Full-text search with highlighted snippets
 * - Trending/popular files section (top starred)
 * - Results display with author info and star counts
 * - Pagination (load more)
 * - Empty states for no query and no results
 */
export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  // Trending files state
  const [trendingFiles, setTrendingFiles] = useState<TrendingFile[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const LIMIT = 20;

  // Fetch trending files on mount
  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await fetch('/api/trending?limit=12');
        const data = await res.json();
        if (res.ok) {
          setTrendingFiles(data.files);
        }
      } catch (error) {
        console.error('Failed to fetch trending files:', error);
      } finally {
        setTrendingLoading(false);
      }
    }
    fetchTrending();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Execute search when debounced query changes
  const search = useCallback(async (searchQuery: string, searchOffset: number, append = false) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotal(0);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        limit: LIMIT.toString(),
        offset: searchOffset.toString(),
      });

      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();

      if (res.ok) {
        setResults(append ? [...results, ...data.files] : data.files);
        setTotal(data.total);
        setOffset(searchOffset);
      } else {
        console.error('Search failed:', data.error);
        setResults([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [results]);

  // Search on debounced query change
  useEffect(() => {
    search(debouncedQuery, 0);
  }, [debouncedQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load more results
  const loadMore = () => {
    search(debouncedQuery, offset + LIMIT, true);
  };

  const hasMore = results.length < total;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Explore</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Discover markdown files shared by the community
        </p>
      </div>

      {/* Search Input */}
      <div className="mx-auto mb-8 max-w-2xl">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files, prompts, agents..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] py-4 pl-12 pr-4 text-lg placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-shadow"
            autoFocus
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Spinner />
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {!hasSearched && !query.trim() ? (
        <EmptySearchState trendingFiles={trendingFiles} trendingLoading={trendingLoading} />
      ) : results.length === 0 && hasSearched && !loading ? (
        <NoResultsState query={debouncedQuery} />
      ) : (
        <>
          {/* Results count */}
          {hasSearched && !loading && (
            <p className="mb-4 text-sm text-[var(--muted-foreground)]">
              {total} result{total !== 1 ? 's' : ''} for &quot;{debouncedQuery}&quot;
            </p>
          )}

          {/* Results list */}
          <div className="space-y-4">
            {results.map((result) => (
              <SearchResultCard key={result.id} result={result} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-6 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--secondary)] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Spinner className="h-4 w-4" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load more
                    <span className="text-[var(--muted-foreground)]">
                      ({results.length} of {total})
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// =============================================================================
// TYPES
// =============================================================================

interface SearchResult {
  id: string;
  path: string;
  visibility: string;
  starCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    username: string;
    name: string | null;
    avatar: string | null;
  };
  headline: string;
  rank: number;
}

interface TrendingFile {
  id: string;
  path: string;
  starCount: number;
  createdAt: string;
  updatedAt: string;
  user: {
    username: string;
    name: string | null;
    avatar: string | null;
  };
}

// =============================================================================
// COMPONENTS
// =============================================================================

/**
 * Individual search result card with highlighted snippet.
 */
function SearchResultCard({ result }: { result: SearchResult }) {
  const fileUrl = `/${result.user.username}/${result.path}`;

  return (
    <Link
      href={fileUrl}
      className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-colors hover:bg-[var(--secondary)]/50"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Author avatar */}
        <div className="shrink-0">
          {result.user.avatar ? (
            <img
              src={result.user.avatar}
              alt={result.user.name || result.user.username}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--muted)]">
              <UserIcon className="h-5 w-5 text-[var(--muted-foreground)]" />
            </div>
          )}
        </div>

        {/* File info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-semibold text-[var(--primary)] hover:underline">
              {result.user.username}/{result.path}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
            <span>{result.user.name || result.user.username}</span>
            <span className="inline-flex items-center gap-1">
              <StarIcon className="h-3.5 w-3.5" />
              {result.starCount}
            </span>
            <span>{formatRelativeTime(new Date(result.updatedAt))}</span>
          </div>
        </div>
      </div>

      {/* Snippet with highlighted matches */}
      <div
        className="mt-3 text-sm text-[var(--muted-foreground)] line-clamp-3 [&_mark]:bg-yellow-200 [&_mark]:text-[var(--foreground)] dark:[&_mark]:bg-yellow-500/30"
        dangerouslySetInnerHTML={{ __html: result.headline }}
      />
    </Link>
  );
}

/**
 * Trending files section showing most popular files by star count.
 */
function TrendingSection({ files, loading }: { files: TrendingFile[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="mb-12">
        <div className="mb-6 flex items-center gap-2">
          <TrendingIcon className="h-5 w-5 text-[var(--primary)]" />
          <h2 className="text-xl font-semibold">Trending</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <div className="mb-6 flex items-center gap-2">
        <TrendingIcon className="h-5 w-5 text-[var(--primary)]" />
        <h2 className="text-xl font-semibold">Trending</h2>
        <span className="text-sm text-[var(--muted-foreground)]">Most starred files</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file, index) => (
          <TrendingFileCard key={file.id} file={file} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual trending file card with rank badge.
 */
function TrendingFileCard({ file, rank }: { file: TrendingFile; rank: number }) {
  const fileUrl = `/${file.user.username}/${file.path}`;

  return (
    <Link
      href={fileUrl}
      className="group relative flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition-all hover:bg-[var(--secondary)]/50 hover:border-[var(--primary)]/30"
    >
      {/* Rank badge */}
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
        rank === 1
          ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
          : rank === 2
          ? 'bg-gray-300/30 text-gray-600 dark:text-gray-400'
          : rank === 3
          ? 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
          : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
      }`}>
        {rank}
      </div>

      {/* File info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-medium text-[var(--primary)] group-hover:underline">
            {file.path}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          {file.user.avatar ? (
            <img
              src={file.user.avatar}
              alt={file.user.username}
              className="h-4 w-4 rounded-full"
            />
          ) : (
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--muted)]">
              <UserIcon className="h-2.5 w-2.5" />
            </div>
          )}
          <span className="truncate">{file.user.username}</span>
        </div>
      </div>

      {/* Star count */}
      <div className="flex items-center gap-1 text-sm font-medium text-[var(--muted-foreground)]">
        <StarFilledIcon className="h-4 w-4 text-yellow-500" />
        {file.starCount}
      </div>
    </Link>
  );
}

/**
 * Empty state shown before user starts searching.
 */
function EmptySearchState({ trendingFiles, trendingLoading }: { trendingFiles: TrendingFile[]; trendingLoading: boolean }) {
  return (
    <div>
      {/* Trending section */}
      <TrendingSection files={trendingFiles} loading={trendingLoading} />

      {/* Search suggestions */}
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)]">
          <CompassIcon className="h-8 w-8 text-[var(--muted-foreground)]" />
        </div>
        <h2 className="text-xl font-semibold">Start exploring</h2>
        <p className="mt-2 max-w-sm text-center text-[var(--muted-foreground)]">
          Search for SOUL.md files, AGENTS.md configurations, system prompts, and other markdown
          shared by the community.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <SuggestionPill query="SOUL.md" />
          <SuggestionPill query="AGENTS.md" />
          <SuggestionPill query="system prompt" />
          <SuggestionPill query="coding agent" />
        </div>
      </div>
    </div>
  );
}

/**
 * Suggestion pill that fills the search input when clicked.
 */
function SuggestionPill({ query }: { query: string }) {
  return (
    <button
      onClick={() => {
        // Find the input and set its value
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (input) {
          input.value = query;
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }}
      className="rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-1.5 text-sm transition-colors hover:bg-[var(--secondary)]"
    >
      {query}
    </button>
  );
}

/**
 * Empty state shown when search returns no results.
 */
function NoResultsState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)]">
        <SearchIcon className="h-8 w-8 text-[var(--muted-foreground)]" />
      </div>
      <h2 className="text-xl font-semibold">No results found</h2>
      <p className="mt-2 max-w-sm text-center text-[var(--muted-foreground)]">
        We couldn&apos;t find any files matching &quot;{query}&quot;. Try a different search term.
      </p>
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
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return 'yesterday';
  } else if (diffDays < 30) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// =============================================================================
// ICONS
// =============================================================================

function SearchIcon({ className }: { className?: string }) {
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
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
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

function CompassIcon({ className }: { className?: string }) {
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
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function TrendingIcon({ className }: { className?: string }) {
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
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function StarFilledIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
