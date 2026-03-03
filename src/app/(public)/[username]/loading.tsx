import { Skeleton, SkeletonProfileHeader, SkeletonFileCard } from '@/components/ui';

/**
 * User profile page loading skeleton.
 * Shown while fetching user data and files.
 */
export default function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile header */}
      <SkeletonProfileHeader />

      {/* Files section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* File list skeleton */}
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <SkeletonFileCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
