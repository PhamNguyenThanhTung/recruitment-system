export default function JobSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          {/* Company Logo Skeleton */}
          <div className="h-16 w-16 rounded-lg bg-gray-200"></div>
          
          <div className="flex flex-col gap-2">
            {/* Job Title Skeleton */}
            <div className="h-5 w-48 rounded bg-gray-200"></div>
            {/* Company Name Skeleton */}
            <div className="h-4 w-32 rounded bg-gray-200"></div>
          </div>
        </div>
        {/* Bookmark Button Skeleton */}
        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
      </div>

      <div className="mt-2 flex gap-3">
        {/* Badges Skeletons */}
        <div className="h-6 w-20 rounded-full bg-gray-200"></div>
        <div className="h-6 w-24 rounded-full bg-gray-200"></div>
        <div className="h-6 w-24 rounded-full bg-gray-200"></div>
      </div>
    </div>
  );
}