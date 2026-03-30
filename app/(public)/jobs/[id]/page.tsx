import { db } from "@/lib/db";
import { auth } from "@/lib/auth"; 
import { notFound } from "next/navigation";
import Link from "next/link";
import { JobStatus } from "@prisma/client";
import ApplyModal from "@/components/jobs/ApplyModal";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth(); 

  // 1. KÉO DỮ LIỆU JOB HIỆN TẠI
  const job = await db.job.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          companyProfile: true, 
        },
      },
    },
  });

  if (!job || job.status !== JobStatus.OPEN) {
    notFound();
  }

  // 2. KÉO DỮ LIỆU CÁC JOB TƯƠNG TỰ
  const similarJobs = await db.job.findMany({
    where: {
      title: {
        contains: job.title,
        mode: 'insensitive',
      },
      id: {
        not: job.id, 
      },
      status: JobStatus.OPEN, 
    },
    take: 3, 
    include: {
      user: {
        include: { companyProfile: true },
      },
    },
    orderBy: { createdAt: 'desc' }
  });

  // 🔥 Fallback data: Ưu tiên lấy Logo từ Job -> Profile HR -> Rỗng
  const companyProfile = job.user?.companyProfile;
  const companyName = job.company || companyProfile?.companyName;
  const companyLogo = job.companyLogoUrl || companyProfile?.logoUrl || null;

  // Logic kiểm tra Role
  const canApply = !session || session.user?.role === "CANDIDATE";
  const isHR = session?.user?.role === "HR";

  let hasApplied = false;
  if (session?.user?.id && !isHR) {
    const existingApp = await db.application.findFirst({
      where: {
        jobId: job.id,
        userId: session.user.id,
      },
    });
    hasApplied = !!existingApp;
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <main className="pb-20 px-6 max-w-7xl mx-auto pt-8">
        
        {/* ================= BREADCRUMB ================= */}
        <div className="mb-8 flex items-center gap-2 text-on-surface-variant font-label text-sm tracking-wide uppercase">
          <Link href="/jobs" className="hover:text-primary transition-colors">Jobs</Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span>{job.location}</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-primary font-bold line-clamp-1">{job.title}</span>
        </div>

        {/* ================= GRID 2 CỘT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
          <div className="lg:col-span-8 space-y-8">
            {/* Hiển thị Header Công Ty */}
            <div className="flex items-center gap-6 mb-8 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
              
              {/* 🔥 BOX LOGO ĐÃ ĐƯỢC CHĂM CHÚT LẠI */}
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-container-high border border-outline-variant/10 flex items-center justify-center shrink-0">
                {companyLogo ? (
                  <img 
                    src={companyLogo} 
                    alt={companyName} 
                    className="w-full h-full object-contain p-2" // Thêm padding để logo không bị sát viền
                  />
                ) : (
                  // Nếu rỗng thì hiện chữ cái đầu cho đồng bộ với trang chủ
                  <span className="font-headline font-bold text-3xl text-primary">
                    {companyName?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                <div className="flex items-center gap-4 mt-2 text-gray-600">
                  <p className="font-medium text-blue-600">{companyName}</p>
                  
                  {companyProfile?.size && (
                    <span className="flex items-center gap-1 text-sm bg-gray-100 px-2 py-1 rounded-md">
                      <span className="material-symbols-outlined text-[16px]">groups</span>
                      {companyProfile.size} nhân viên
                    </span>
                  )}
                  
                  {companyProfile?.foundedYear && (
                    <span className="flex items-center gap-1 text-sm bg-gray-100 px-2 py-1 rounded-md">
                      <span className="material-symbols-outlined text-[16px]">history</span>
                      Thành lập {companyProfile.foundedYear}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_4px_20px_rgba(0,89,187,0.04)] border border-outline-variant/10">
              <h2 className="text-2xl font-extrabold font-headline mb-6 text-on-surface">Mô tả công việc</h2>
              <div className="space-y-4 text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>

            {/* Requirements Card */}
            {job.requirements && (
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_4px_20px_rgba(0,89,187,0.04)] border border-outline-variant/10">
                <h3 className="text-xl font-bold font-headline mb-6 text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">verified</span>
                  Yêu cầu ứng viên
                </h3>
                <div className="space-y-4 text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                  {job.requirements}
                </div>
              </div>
            )}
          </div>

          {/* CỘT PHẢI: CALL TO ACTION & COMPANY INFO */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-28">
            <div className="bg-primary text-on-primary p-8 rounded-xl shadow-[0px_20px_50px_rgba(0,89,187,0.15)] relative overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mb-10 -mr-10"></div>
              <div className="relative z-10">
                {!canApply ? (
                  <>
                    <h3 className="text-2xl font-extrabold font-headline mb-2">Bạn là HR</h3>
                    <p className="text-primary-fixed/80 text-sm mb-8 leading-relaxed">Nhà tuyển dụng không thể tự ứng tuyển công việc này.</p>
                  </>
                ) : hasApplied ? (
                  <>
                    <h3 className="text-2xl font-extrabold font-headline mb-2">Đã ứng tuyển</h3>
                    <p className="text-primary-fixed/80 text-sm mb-8 leading-relaxed">Bạn đã nộp CV cho vị trí này. Hãy theo dõi trạng thái trong Dashboard.</p>
                    <Link href="/candidate/profile">
                      <button className="w-full bg-surface-container-low text-primary font-headline font-extrabold py-4 rounded-xl mb-4 transition-all">
                        Xem đơn ứng tuyển
                      </button>
                    </Link>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-extrabold font-headline mb-2">Sẵn sàng ứng tuyển?</h3>
                    <p className="text-primary-fixed/80 text-sm mb-8 leading-relaxed">Nắm bắt cơ hội nghề nghiệp tuyệt vời này bằng cách gửi CV ngay hôm nay.</p>
                    <ApplyModal 
                    jobId={job.id} 
                    jobTitle={job.title} 
                    isLoggedIn={!!session?.user} 
                  />
                </>
                )}
                
                <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-xs font-label opacity-70">
                  
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined cursor-pointer hover:opacity-100">share</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0px_10px_40px_rgba(0,89,187,0.06)] border border-outline-variant/10">
              <h3 className="text-lg font-extrabold font-headline mb-6 text-on-surface">Về công ty</h3>
              {companyProfile ? (
                <div className="space-y-4">
                  
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-on-surface-variant text-sm shrink-0">Địa chỉ</span>
                    <span className="font-bold text-sm text-right line-clamp-3">{companyProfile.address}</span>
                  </div>
                  {companyProfile.description && (
                    <div className="mt-6 pt-6 border-t border-outline-variant/15">
                      <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-4">
                        {companyProfile.description}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-outline italic">Chưa có thông tin chi tiết về công ty này.</p>
              )}
            </div>
          </div>
        </div>

        {/* ================= SIMILAR OPPORTUNITIES ================= */}
        {similarJobs.length > 0 && (
          <section className="mt-20">
            <h2 className="text-3xl font-extrabold font-headline mb-10 text-on-surface">Việc làm tương tự</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarJobs.map((simJob) => {
                const simCompany = simJob.user?.companyProfile;
                const simCompanyName = simJob.company || simCompany?.companyName;
                // 🔥 Cập nhật logic Logo cho các Job tương tự luôn
                const simCompanyLogo = simJob.companyLogoUrl || simCompany?.logoUrl || null;
                
                return (
                  <Link href={`/jobs/${simJob.id}`} key={simJob.id} className="block group h-full">
                    <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_10px_40px_rgba(0,89,187,0.04)] group-hover:shadow-[0px_15px_50px_rgba(0,89,187,0.1)] transition-all h-full flex flex-col justify-between border border-transparent group-hover:border-outline-variant/20">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="w-12 h-12 rounded-lg bg-surface-container-high overflow-hidden flex items-center justify-center">
                            {simCompanyLogo ? (
                              <img className="w-full h-full object-contain p-1" alt={simCompanyName} src={simCompanyLogo} />
                            ) : (
                              <span className="font-headline font-bold text-xl text-primary">{simCompanyName?.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <button className="text-outline hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">bookmark</span>
                          </button>
                        </div>
                        <h3 className="font-headline font-extrabold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2">
                          {simJob.title}
                        </h3>
                        <p className="text-on-surface-variant text-sm mb-4 line-clamp-1">
                          {simCompanyName} · {simJob.location}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-outline-variant/15 mt-4">
                        <span className="text-primary font-bold text-sm truncate pr-2">
                          {simJob.salary || "Thỏa thuận"}
                        </span>
                        <span className="text-on-surface-variant text-xs font-label shrink-0">
                          {new Date(simJob.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}