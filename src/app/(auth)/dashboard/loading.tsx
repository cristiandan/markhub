import { Skeleton, SkeletonFileCard } from '@/components/ui';

/**
 * Dashboard loading skeleton.
 * Shown while dashboard page is server-rendering and fetching files.
 */
export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-56" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>

      {/* File list skeleton */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <SkeletonFileCard key={i} />
        ))}
      </div>
    </div>
  );
}
