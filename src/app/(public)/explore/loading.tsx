import { Skeleton, SkeletonExploreCard } from '@/components/ui';

/**
 * Explore page loading skeleton.
 * Shown during initial page load.
 */
export default function ExploreLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <Skeleton className="mx-auto h-9 w-32" />
        <Skeleton className="mx-auto mt-2 h-5 w-64" />
      </div>

      {/* Search Input skeleton */}
      <div className="mx-auto mb-8 max-w-2xl">
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>

      {/* Trending section skeleton */}
      <div className="mb-12">
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonExploreCard key={`trending-${i}`} />
          ))}
        </div>
      </div>

      {/* Recent section skeleton */}
      <div className="mb-12">
        <div className="mb-6 flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonExploreCard key={`recent-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
