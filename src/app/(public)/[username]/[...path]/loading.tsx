import { Skeleton, SkeletonMarkdown, SkeletonComment } from '@/components/ui';

/**
 * File view page loading skeleton.
 * Shown while fetching file content.
 */
export default function FileLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <span className="text-[var(--muted-foreground)]">/</span>
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>

        {/* Timestamp */}
        <Skeleton className="mt-2 h-4 w-32" />
      </div>

      {/* Content card */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
        {/* Action bar */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>

        {/* Markdown content skeleton */}
        <SkeletonMarkdown />
      </div>

      {/* Comments section skeleton */}
      <div className="mt-8">
        <Skeleton className="h-6 w-24 mb-4" />
        <div className="divide-y divide-[var(--border)]">
          {[...Array(3)].map((_, i) => (
            <SkeletonComment key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
