import { Skeleton, SkeletonText } from '@/components/ui';

/**
 * Edit file page loading skeleton.
 * Shown while fetching file content for editing.
 */
export default function EditFileLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <Skeleton className="h-5 w-32 mb-6" />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      {/* Form skeleton */}
      <div className="space-y-6">
        {/* Content textarea skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>

        {/* Visibility selector skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
