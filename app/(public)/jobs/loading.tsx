// app/jobs/loading.tsx
import JobSkeleton from "@/components/ui/JobSkeleton";

export default function LoadingJobs() {
  return (
    <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1 h-96 bg-gray-100 animate-pulse rounded-xl"></div>
      <div className="lg:col-span-3 flex flex-col gap-4">
         {/* Render giả 5 cái khung loading */}
         <JobSkeleton />
         <JobSkeleton />
         <JobSkeleton />
         <JobSkeleton />
         <JobSkeleton />
      </div>
    </div>
  );
}