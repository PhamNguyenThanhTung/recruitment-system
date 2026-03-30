import { db } from "@/lib/db";
import { Suspense } from "react";
import AdvancedJobFilter from "@/components/jobs/AdvancedJobFilter";
import BookmarkButton from "@/components/jobs/BookmarkButton";
import Pagination from "@/components/ui/Pagination";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import Link from "next/link";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const location = params.location?.trim() || "";
  const jobType = params.jobType?.trim() || "";
  
  // Lấy mức lương user filter từ URL (Dạng số)
  const filterMinSalary = params.minSalary ? parseInt(params.minSalary) : null;
  
  const currentPage = Math.max(1, parseInt(params.page || "1"));
  const limit = 10;
  const skip = (currentPage - 1) * limit;

  // === 1. GIAO CHO PRISMA XỬ LÝ TOÀN BỘ ĐIỀU KIỆN (ĐÃ FIX LỖI FILTER) ===
  const where: Prisma.JobWhereInput = { status: "Open" };
  const andConditions: Prisma.JobWhereInput[] = [];

  // Lọc Từ khóa
  if (q) {
    andConditions.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  
  // Lọc Địa điểm
  if (location) {
    andConditions.push({ location: { contains: location, mode: "insensitive" } });
  }
  
  // Lọc Loại công việc
  if (jobType) {
    andConditions.push({ jobType: { in: jobType.split(",") as any[] } });
  }
  
  // Lọc Lương (Tìm các Job có minSalary hoặc maxSalary thỏa mãn)
  if (filterMinSalary !== null) {
    andConditions.push({
      OR: [
        { minSalary: { gte: filterMinSalary } }, 
        { maxSalary: { gte: filterMinSalary } }  
      ],
    });
  }

  // Nếu có bất kỳ điều kiện lọc nào, nhét tất cả vào AND để bắt buộc thỏa mãn ĐỒNG THỜI
  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  // === 2. GỌI DB ĐÚNG 1 LẦN (Lấy Data + Lấy Tổng số để phân trang) ===
  const [rawJobs, total] = await Promise.all([
    db.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,       // Cắt trang thẳng từ DB
      take: limit, // Chỉ lấy đúng 10 records, không lấy thừa!
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        salary: true, // Vẫn lấy string ra để render giao diện cho đẹp
        jobType: true,
        createdAt: true,
      },
    }),
    db.job.count({ where }), // Đếm tổng số để tính Pagination
  ]);

  const totalPages = Math.ceil(total / limit);

  // === 3. KIỂM TRA BOOKMARK NHƯ CŨ ===
  const session = await auth();
  let savedJobIds: string[] = [];

  if (session?.user?.id && session.user.role === "CANDIDATE") {
    const savedJobs = await db.savedJob.findMany({
      where: { userId: session.user.id },
      select: { jobId: true },
    });
    savedJobIds = savedJobs.map((s) => s.jobId);
  }

  const jobs = rawJobs.map((job) => ({
    ...job,
    isSavedByUser: savedJobIds.includes(job.id),
  }));

  // === GIAO DIỆN ===
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        
        {/* CỘT TRÁI: BỘ LỌC */}
        <aside className="lg:col-span-1">
          <Suspense fallback={<div className="h-[500px] w-full animate-pulse rounded-xl bg-gray-100"></div>}>
            <AdvancedJobFilter />
          </Suspense>
        </aside>

        {/* CỘT PHẢI: DANH SÁCH VIỆC LÀM */}
        <main className="flex flex-col gap-4 lg:col-span-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">Việc làm phù hợp</h2>
            <span className="text-sm text-gray-500">Tìm thấy {total} kết quả</span>
          </div>

          {jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16">
              <span className="material-symbols-outlined mb-2 text-4xl text-gray-400">search_off</span>
              <p className="text-gray-600 font-medium">Không tìm thấy công việc nào phù hợp.</p>
              <p className="text-sm text-gray-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="group relative flex gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md">
                <div className="flex-1">
                  {/* Bọc Link vào đây để click chuyển sang trang Detail */}
                  <Link href={`/jobs/${job.id}`}>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer inline-block">
                      {job.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 font-medium mt-1">{job.company}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {/* Badge Lương */}
                    <span className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                      <span className="material-symbols-outlined text-[14px]">payments</span>
                      {job.salary || "Thỏa thuận"}
                    </span>
                    {/* Badge Địa điểm */}
                    <span className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {job.location}
                    </span>
                    {/* Badge Loại Job */}
                    <span className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                      <span className="material-symbols-outlined text-[14px]">work</span>
                      {job.jobType.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* NÚT THẢ TIM (BOOKMARK) */}
                <div className="absolute right-6 top-6">
                  <BookmarkButton 
                    jobId={job.id} 
                    initialIsSaved={job.isSavedByUser} 
                  />
                </div>
              </div>
            ))
          )}

          {/* PHÂN TRANG */}
          <Suspense fallback={null}>
            <Pagination totalPages={totalPages} currentPage={currentPage} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}