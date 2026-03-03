/**
 * Skeleton loading component for placeholder content.
 * 
 * Usage:
 * <Skeleton className="h-4 w-32" />
 * <Skeleton className="h-10 w-full rounded-lg" />
 */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-[var(--muted)] ${className}`}
    />
  );
}

/**
 * Skeleton text block - multiple lines of text.
 */
export function SkeletonText({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-4/5' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for file cards in dashboard/profile.
 */
export function SkeletonFileCard() {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
      {/* Icon placeholder */}
      <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-48" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      {/* Action placeholder */}
      <Skeleton className="h-8 w-8 rounded-md" />
    </div>
  );
}

/**
 * Skeleton for explore/trending file cards.
 */
export function SkeletonExploreCard() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      {/* Avatar/rank placeholder */}
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Star count placeholder */}
      <Skeleton className="h-4 w-8" />
    </div>
  );
}

/**
 * Skeleton for search result cards.
 */
export function SkeletonSearchResult() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

/**
 * Skeleton for markdown content area.
 */
export function SkeletonMarkdown() {
  return (
    <div className="space-y-4 p-6">
      {/* Heading */}
      <Skeleton className="h-8 w-64" />
      
      {/* Paragraph */}
      <SkeletonText lines={4} />
      
      {/* Code block */}
      <Skeleton className="h-32 w-full rounded-lg" />
      
      {/* Another paragraph */}
      <SkeletonText lines={3} />
      
      {/* List items */}
      <div className="space-y-2 pl-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}

/**
 * Skeleton for user profile header.
 */
export function SkeletonProfileHeader() {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Avatar */}
      <Skeleton className="h-24 w-24 rounded-full" />
      
      {/* Name */}
      <Skeleton className="mt-4 h-8 w-48" />
      
      {/* Username */}
      <Skeleton className="mt-2 h-4 w-24" />
      
      {/* Bio */}
      <Skeleton className="mt-3 h-4 w-64" />
      
      {/* Stats */}
      <div className="mt-4 flex items-center gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

/**
 * Skeleton for comment card.
 */
export function SkeletonComment() {
  return (
    <div className="flex gap-3 py-4">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}
