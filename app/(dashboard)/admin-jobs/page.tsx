import * as React from "react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { JobStatus } from "@prisma/client"; // ✅ 1. IMPORT ENUM

export default async function JobsPage() {
  const session = await auth();
  
  if (!session?.user) redirect('/login');

  // Lấy danh sách việc làm và đếm luôn số CV của mỗi việc làm đó
  const jobs = await db.job.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { applications: true }
      }
    }
  });

  // ✅ 2. SỬA HÀM NÀY ĐỂ NHẬN ENUM JobStatus
  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case JobStatus.OPEN:
        return <span className="bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Đang mở tuyển</span>;
      case JobStatus.DRAFT:
        return <span className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Bản nháp</span>;
      case JobStatus.CLOSED:
        return <span className="bg-error/10 text-error px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Đã đóng</span>;
      default:
        return <span className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <>
      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight font-headline">Quản lý Việc làm</h1>
          <p className="text-on-surface-variant font-medium mt-2">
            Bạn đang có <span className="text-primary font-bold">{jobs.length}</span> tin tuyển dụng trên hệ thống.
          </p>
        </div>
        <Link href="/admin-jobs/new">
          <button className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors">
            <span className="material-symbols-outlined">add</span>
            Tạo Job mới
          </button>
        </Link>
      </div>

      {/* ================= FILTERS & BẢNG TÓM TẮT (Dummy Filter Layout) ================= */}
      <section className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 mb-8 shadow-[0px_4px_20px_rgba(0,89,187,0.02)] flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
          <input 
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant/20 bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-outline/60 text-sm font-medium" 
            placeholder="Tìm kiếm tin tuyển dụng..." 
            type="text"
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="flex items-center gap-2 bg-surface-container-low py-3 px-5 rounded-xl border-0 text-sm font-bold text-on-surface hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Bộ lọc
          </button>
        </div>
      </section>

      {/* ================= BẢNG DỮ LIỆU (JOBS TABLE) ================= */}
      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 text-center px-4">
          <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-outline">work_off</span>
          </div>
          <h3 className="text-xl font-bold font-headline mb-2">Chưa có tin tuyển dụng nào</h3>
          <p className="text-on-surface-variant mb-6">Bắt đầu thu hút nhân tài bằng cách tạo tin tuyển dụng đầu tiên của bạn.</p>
          <Link href="/admin-jobs/new">
            <button className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">Đăng tin ngay</button>
          </Link>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl overflow-x-auto shadow-[0px_10px_40px_rgba(0,89,187,0.06)] border border-outline-variant/10">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-surface-container-low/50 border-b border-outline-variant/10">
              <tr>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label w-1/3">Vị trí tuyển dụng</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label text-center">Trạng thái</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label text-center">Ứng viên</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Ngày đăng</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-surface-container-low/30 transition-colors group">
                  
                  {/* Cột 1: Tên Job & Location */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <Link href={`/admin-jobs/${job.id}/edit`} className="font-bold text-on-surface font-headline hover:text-primary transition-colors text-base line-clamp-1">
                        {job.title}
                      </Link>
                      <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {job.location || "Chưa xác định"}
                      </p>
                    </div>
                  </td>
                  
                  {/* Cột 2: Status */}
                  <td className="px-6 py-5 text-center">
                    {getStatusBadge(job.status)}
                  </td>

                  {/* Cột 3: Đếm số lượng ứng viên (Sẽ click được sang trang Application) */}
                  <td className="px-6 py-5 text-center">
                    <Link href={`/admin-jobs/${job.id}/applications`}>
                      <div className="inline-flex flex-col items-center justify-center p-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer group/badge">
                        <span className="font-headline font-black text-lg text-on-surface group-hover/badge:text-primary transition-colors">
                          {job._count.applications}
                        </span>
                        <span className="text-[10px] font-bold uppercase text-outline group-hover/badge:text-primary/70">Hồ sơ</span>
                      </div>
                    </Link>
                  </td>
                  
                  {/* Cột 4: Ngày tháng */}
                  <td className="px-6 py-5">
                    <p className="text-sm font-medium text-on-surface">{new Date(job.createdAt).toLocaleDateString('vi-VN')}</p>
                    <p className="text-xs text-outline mt-1 line-clamp-1">{job.salary || "Lương thỏa thuận"}</p>
                  </td>
                  
                  {/* 🔥 CỘT 5: HÀNH ĐỘNG (SỬA LẠI ĐỂ HIỆN RÕ RÀNG NÚT KANBAN VÀ SỬA) 🔥 */}
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      
                      {/* NÚT XEM HỒ SƠ (Thay cho nút Kanban cũ) */}
                      <Link href={`/admin-jobs/${job.id}/applications`}>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors text-xs font-bold border border-blue-100">
                          <span className="material-symbols-outlined text-[16px]">folder_shared</span>
                          Xem CV
                        </button>
                      </Link>

                      {/* NÚT SỬA */}
                      <Link href={`/admin-jobs/${job.id}/edit`}>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high rounded-md transition-colors text-xs font-bold border border-outline-variant/20">
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                          Sửa tin
                        </button>
                      </Link>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination (Trang trí UI) */}
          <div className="px-6 py-5 bg-surface-container-low/30 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant/10">
            <p className="text-sm text-on-surface-variant font-medium">
              Hiển thị <span className="font-bold text-on-surface">{jobs.length}</span> kết quả
            </p>
          </div>
        </div>
      )}
    </>
  );
}