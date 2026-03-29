import { db } from "@/lib/db";
import { Suspense } from "react";
import AdvancedJobFilter from "@/components/jobs/AdvancedJobFilter";
import BookmarkButton from "@/components/jobs/BookmarkButton";
import Pagination from "@/components/ui/Pagination";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// --- HELPER PHÂN TÍCH LƯƠNG (Dùng chung logic với API) ---
function parseSalary(salary: string | null): number | null {
  if (!salary) return null;
  let cleaned = salary.trim();
  if (cleaned.includes("-")) cleaned = cleaned.split("-")[0].trim();
  if (cleaned.endsWith("M") || cleaned.endsWith("m")) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? null : num * 1_000_000;
  }
  if (cleaned.endsWith("K") || cleaned.endsWith("k")) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? null : num * 1_000;
  }
  cleaned = cleaned.replace(/,/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  // 1. LẤY PARAMS TỪ URL (Next 15+ bắt buộc await searchParams)
  const params = await searchParams;
  const q = params.q?.trim() || "";
  const location = params.location?.trim() || "";
  const jobType = params.jobType?.trim() || "";
  const minSalary = params.minSalary ? parseInt(params.minSalary) : null;
  const maxSalary = params.maxSalary ? parseInt(params.maxSalary) : null;
  const currentPage = Math.max(1, parseInt(params.page || "1"));
  const limit = 10; // Cố định 10 job / trang

  // 2. BUILD ĐIỀU KIỆN QUERY DATABASE (PRISMA)
  const where: Prisma.JobWhereInput = { status: "Open" };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
    ];
  }
  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }
  if (jobType) {
    // Tách chuỗi "FULL_TIME,PART_TIME" thành mảng nếu user chọn nhiều Checkbox
    const typesArray = jobType.split(",");
    where.jobType = { in: typesArray as any[] };
  }

  // 3. KÉO DATA TỪ DB VÀ LỌC LƯƠNG BẰNG JS (Vì salary là text)
  const rawJobs = await db.job.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      company: true,
      location: true,
      salary: true,
      jobType: true,
      createdAt: true,
    },
  });

  let filteredJobs = rawJobs;
  if (minSalary !== null || maxSalary !== null) {
    filteredJobs = rawJobs.filter((job) => {
      const salaryNum = parseSalary(job.salary);
      if (salaryNum === null) return false;
      if (minSalary !== null && salaryNum < minSalary) return false;
      if (maxSalary !== null && salaryNum > maxSalary) return false;
      return true;
    });
  }

  // 4. TÍNH TOÁN PHÂN TRANG (PAGINATION)
  const total = filteredJobs.length;
  const totalPages = Math.ceil(total / limit);
  const skip = (currentPage - 1) * limit;
  const paginatedJobs = filteredJobs.slice(skip, skip + limit);

  // 5. CHECK TRẠNG THÁI BOOKMARK CỦA USER ĐANG ĐĂNG NHẬP
  const session = await auth();
  let savedJobIds: string[] = [];

  // Nếu user là Candidate, lấy danh sách các job họ đã thả tim
  if (session?.user?.id && session.user.role === "CANDIDATE") {
    const savedJobs = await db.savedJob.findMany({
      where: { userId: session.user.id },
      select: { jobId: true },
    });
    savedJobIds = savedJobs.map((s) => s.jobId);
  }

  // Map lại mảng job cuối cùng để nhét cờ isSavedByUser vào
  const jobs = paginatedJobs.map((job) => ({
    ...job,
    isSavedByUser: savedJobIds.includes(job.id),
  }));

  // === RENDER GIAO DIỆN ===
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
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 font-medium">{job.company}</p>
                  
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