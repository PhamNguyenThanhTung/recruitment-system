import * as React from "react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { HRDashboard } from "@/components/dashboard/HRDashboard";
import { JobStatus } from "@prisma/client";

export default async function DashboardOverviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Lấy 4 Job mới nhất để hiển thị ra bảng
  const recentJobs = await db.job.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: {
      _count: { select: { applications: true } } // Đếm số đơn của từng Job
    }
  });

  const totalApplicantsCount = await db.application.count({
    where: { job: { userId: session.user.id } },
  });

  return (
    <>
      {/* Thống kê + biểu đồ (Recharts) */}
      <section className="mb-10">
        <HRDashboard />
      </section>

      {/* ================= MAIN CONTENT GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: BẢNG TIN TUYỂN DỤNG MỚI NHẤT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-headline font-extrabold tracking-tight">Việc làm mới nhất</h3>
            <Link href="/admin-jobs" className="text-primary font-bold text-sm hover:underline">Xem tất cả</Link>
          </div>
          
          <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_40px_rgba(0,89,187,0.06)] overflow-hidden border border-outline-variant/10">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Vị trí</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Trạng thái</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-center">Ứng viên</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {recentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-on-surface-variant">Chưa có tin tuyển dụng nào.</td>
                  </tr>
                ) : (
                  recentJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-surface-container-low/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <Link href={`/admin-jobs/${job.id}/edit`} className="font-bold text-on-surface hover:text-primary transition-colors">
                            {job.title}
                          </Link>
                          <span className="text-xs text-on-surface-variant">{job.location || 'Remote'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          job.status === JobStatus.OPEN ? "bg-secondary/10 text-secondary" : "bg-outline-variant/30 text-on-surface-variant"
                        }`}>
                          {job.status === JobStatus.OPEN ? "Đang mở" : "Đã đóng"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="font-headline font-bold">{job._count.applications}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CỘT PHẢI: PIPELINE & LỊCH TRÌNH */}
        <div className="space-y-8">
          
          {/* Candidate Pipeline */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_10px_40px_rgba(0,89,187,0.06)] border border-outline-variant/10">
            <h4 className="font-headline font-bold text-lg mb-6">Tiến độ ứng viên</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  <span>Mới ứng tuyển</span>
                  <span>{totalApplicantsCount}</span>
                </div>
                <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[85%] rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  <span>Phỏng vấn</span>
                  <span>0</span>
                </div>
                <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full w-[0%] rounded-full"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  <span>Trúng tuyển</span>
                  <span>0</span>
                </div>
                <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                  <div className="bg-tertiary h-full w-[0%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Banner tuyển dụng */}
          <div className="bg-primary text-white p-6 rounded-xl shadow-[0px_10px_40px_rgba(0,89,187,0.06)] flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-4xl mb-2">campaign</span>
            <h4 className="font-headline font-bold text-lg mb-2">Đăng tin mới ngay</h4>
            <p className="text-sm text-primary-fixed mb-4">Mở rộng đội ngũ của bạn với những ứng viên tài năng nhất.</p>
            <Link href="/admin-jobs/new" className="w-full bg-white text-primary font-bold py-2 rounded-lg hover:bg-gray-10 transition-colors">
              Tạo Job mới
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}