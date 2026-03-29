import { db } from "@/lib/db";
import Link from "next/link";

export default async function JobsPage({
  searchParams,
}: {
  // Trong Next.js 15+, searchParams là một Promise nên cần khai báo chuẩn
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // 1. Đợi và lấy tham số 'q' (từ khóa tìm kiếm) từ URL
  const resolvedParams = await searchParams;
  const keyword = typeof resolvedParams.q === 'string' ? resolvedParams.q : "";

  // 2. Chọc vào Database tìm Job phù hợp
  const jobs = await db.job.findMany({
    where: {
      status: "Open", // Chỉ lấy job đang mở
      // Nếu có từ khóa, tìm trong Title HOẶC Tên công ty
      ...(keyword ? {
        OR: [
          { title: { contains: keyword, mode: "insensitive" } },
          { company: { contains: keyword, mode: "insensitive" } },
        ]
      } : {})
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        include: { companyProfile: true },
      },
    },
  });

  return (
    <div className="bg-surface min-h-screen font-body">
      <div className="max-w-7xl mx-auto px-6 py-32">
        
        {/* ================= HEADER KẾT QUẢ TÌM KIẾM ================= */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black font-headline text-on-surface tracking-tight">
            {keyword ? (
              <>Kết quả tìm kiếm cho: <span className="text-primary">"{keyword}"</span></>
            ) : (
              "Khám phá tất cả Việc làm"
            )}
          </h1>
          <p className="text-on-surface-variant text-lg mt-4 font-medium">
            Tìm thấy <span className="font-bold text-primary">{jobs.length}</span> công việc phù hợp với tiêu chí của bạn.
          </p>
        </div>

        {/* ================= DANH SÁCH CÔNG VIỆC ================= */}
        <div className="space-y-6">
          {jobs.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-3xl border border-outline-variant/10 shadow-sm">
              <span className="material-symbols-outlined text-7xl text-outline-variant/30 mb-4">search_off</span>
              <p className="text-on-surface-variant text-lg font-bold">Không tìm thấy công việc nào phù hợp với từ khóa này.</p>
              <p className="text-outline text-sm mt-2 mb-6">Hãy thử lại bằng một từ khóa khác ngắn gọn hoặc phổ biến hơn.</p>
              <Link href="/jobs">
                <button className="bg-primary-container text-on-primary-container px-6 py-3 rounded-xl font-bold hover:brightness-95 transition-all">
                  Xóa bộ lọc và xem tất cả
                </button>
              </Link>
            </div>
          ) : (
            jobs.map((job) => {
              const companyProfile = job.user?.companyProfile;
              const companyName = companyProfile?.companyName || job.company;
              const companyLogo = companyProfile?.logoUrl || null;
              
              return (
                <div key={job.id} className="bg-white p-6 md:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm border border-outline-variant/15 hover:shadow-xl hover:-translate-y-1 transition-all group">
                  <div className="flex items-start md:items-center gap-6">
                    <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center shrink-0 overflow-hidden text-primary font-bold text-2xl font-headline shadow-inner">
                      {companyLogo ? (
                        <img src={companyLogo} alt={companyName} className="w-full h-full object-cover" />
                      ) : (
                        companyName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <Link href={`/jobs/${job.id}`}>
                        <h3 className="text-2xl font-bold font-headline text-on-surface group-hover:text-primary transition-colors line-clamp-1">{job.title}</h3>
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-on-surface-variant font-medium">
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">apartment</span>{companyName}</span>
                        <span className="hidden md:inline text-outline-variant">•</span>
                        <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">location_on</span>{job.location || "Từ xa"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 justify-between md:justify-end w-full md:w-auto pt-4 md:pt-0 border-t md:border-0 border-outline-variant/10 mt-4 md:mt-0">
                    <div className="flex flex-col items-start md:items-end mr-4">
                      {job.salary ? (
                        <span className="text-secondary font-black text-lg">{job.salary}</span>
                      ) : (
                        <span className="text-outline font-bold text-sm uppercase">Thỏa thuận</span>
                      )}
                      <span className="text-xs text-outline font-medium mt-1">Đăng ngày {new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <Link href={`/jobs/${job.id}`}>
                      <button className="bg-surface-container-low text-primary px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all border border-outline-variant/20 shadow-sm active:scale-95">
                        Chi tiết
                      </button>
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  );
}