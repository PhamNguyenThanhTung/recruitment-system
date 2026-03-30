"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EditJobForm({ job }: { job: any }) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Format lại ngày tháng chuẩn YYYY-MM-DD để hiển thị vào input type="date"
  const formattedDeadline = job.deadline 
    ? new Date(job.deadline).toISOString().split('T')[0] 
    : "";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    
    const data = {
      title: formData.get("title"),
      salary: formData.get("salary"),
      status: formData.get("status"),
      description: formData.get("description"),
      requirements: formData.get("requirements"),
      deadline: formData.get("deadline") || null, // Trả về null nếu không chọn ngày
    };

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT", // Sử dụng đúng PUT theo API của bạn
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Something went wrong");
      } else {
        toast.success("Cập nhật thành công!");
        router.push("/admin-jobs");
        router.refresh();
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  // Chức năng Xóa Job giữ nguyên logic gốc
  async function onDelete() {
    if (!confirm("Bạn có chắc muốn xóa tin này không? Hành động này không thể hoàn tác!")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.message || "Failed to delete");
      } else {
        toast.success("Đã xóa tin tuyển dụng");
        router.push("/admin-jobs");
        router.refresh();
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-12 gap-8">
      
      {/* ================= HEADER ACTIONS ================= */}
      <div className="col-span-12 flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-4">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase font-label">Jobs</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-xs font-semibold tracking-wider uppercase font-label text-primary">Chỉnh sửa</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight text-on-surface truncate max-w-xl">
            {job.title}
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">Cập nhật lần cuối: {new Date(job.updatedAt).toLocaleDateString('vi-VN')}</p>
        </div>
        
        <div className="flex gap-4 shrink-0">
          <Link href="/admin-jobs">
            <button type="button" disabled={isLoading} className="px-6 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-all active:scale-95 disabled:opacity-50">
              Hủy bỏ
            </button>
          </Link>
          <button type="submit" disabled={isLoading} className="px-8 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:translate-y-[-2px] transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2">
            {isLoading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : null}
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* ================= MAIN FORM COLUMN ================= */}
      <div className="col-span-12 lg:col-span-8 space-y-8">
        
        {/* Section: Thông báo lỗi */}
        {error && (
          <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm font-bold flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {/* Section: Thông tin cơ bản */}
        <section className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0px_10px_40px_rgba(0,89,187,0.06)] border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-lg">work</span>
            <h2 className="text-2xl font-bold font-headline text-on-surface">Thông tin cơ bản</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider">Chức danh công việc</label>
              <input 
                name="title"
                defaultValue={job.title}
                required
                disabled={isLoading}
                className="w-full bg-surface-container-low border-0 focus:ring-2 focus:ring-primary rounded-xl p-4 text-on-surface font-medium outline-variant/15 outline outline-1 outline-none transition-all" 
                type="text" 
              />
            </div>
            
            <div className="space-y-2 border-t md:border-none pt-4 md:pt-0 border-outline-variant/10">
              <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider">Công ty</label>
              <div className="relative">
                <input 
                  defaultValue={job.company}
                  disabled
                  className="w-full bg-surface-container-low/50 border-0 rounded-xl p-4 pl-12 text-on-surface-variant font-medium outline-variant/15 outline outline-1 cursor-not-allowed" 
                  type="text" 
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">corporate_fare</span>
              </div>
              <p className="text-xs text-outline mt-1">*Thông tin được lấy từ hồ sơ công ty</p>
            </div>
            
            <div className="space-y-2 border-t md:border-none pt-4 md:pt-0 border-outline-variant/10">
              <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider">Địa điểm</label>
              <div className="relative">
                <input 
                  defaultValue={job.location}
                  disabled
                  className="w-full bg-surface-container-low/50 border-0 rounded-xl p-4 pl-12 text-on-surface-variant font-medium outline-variant/15 outline outline-1 cursor-not-allowed" 
                  type="text" 
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">location_on</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider">Hạn nộp hồ sơ</label>
              <div className="relative">
                <input 
                  name="deadline"
                  defaultValue={formattedDeadline}
                  disabled={isLoading}
                  className="w-full bg-surface-container-low border-0 focus:ring-2 focus:ring-primary rounded-xl p-4 pl-12 text-on-surface font-medium outline-variant/15 outline outline-1 outline-none transition-all" 
                  type="date" 
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">calendar_today</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider">Trạng thái tin</label>
              <div className="relative">
                <select 
                  name="status"
                  defaultValue={job.status}
                  disabled={isLoading}
                  className="w-full bg-surface-container-low border-0 focus:ring-2 focus:ring-primary rounded-xl p-4 pl-12 text-on-surface font-medium outline-variant/15 outline outline-1 appearance-none outline-none transition-all"
                >
                  <option value="Open">Mở tuyển (Active)</option>
                  <option value="Draft">Bản nháp (Draft)</option>
                  <option value="Closed">Đóng tuyển (Closed)</option>
                </select>
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">toggle_on</span>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Lương */}
        <section className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0px_10px_40px_rgba(0,89,187,0.06)] border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-secondary bg-secondary-container p-2 rounded-lg">payments</span>
            <h2 className="text-2xl font-bold font-headline text-on-surface">Mức lương</h2>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider">Khoảng lương / Mức lương</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-outline">$</span>
              <input 
                name="salary"
                defaultValue={job.salary}
                disabled={isLoading}
                className="w-full bg-surface-container-low border-0 focus:ring-2 focus:ring-primary rounded-xl p-4 pl-10 text-on-surface font-medium outline-variant/15 outline outline-1 outline-none transition-all" 
                type="text" 
                placeholder="VD: $1000 - $2500 hoặc Thỏa thuận"
              />
            </div>
          </div>
        </section>

        {/* Section: Chi tiết công việc */}
        <section className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0px_10px_40px_rgba(0,89,187,0.06)] border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-tertiary bg-tertiary-fixed p-2 rounded-lg">description</span>
            <h2 className="text-2xl font-bold font-headline text-on-surface">Chi tiết công việc</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider">Mô tả công việc</label>
              <textarea 
                name="description"
                defaultValue={job.description}
                required
                disabled={isLoading}
                className="w-full bg-surface-container-low border-0 focus:ring-2 focus:ring-primary rounded-xl p-6 text-on-surface font-medium outline-variant/15 outline outline-1 min-h-[250px] outline-none transition-all resize-y leading-relaxed"
                placeholder="Nhập mô tả công việc chi tiết..."
              ></textarea>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider">Yêu cầu ứng viên</label>
              <textarea 
                name="requirements"
                defaultValue={job.requirements}
                disabled={isLoading}
                className="w-full bg-surface-container-low border-0 focus:ring-2 focus:ring-primary rounded-xl p-6 text-on-surface font-medium outline-variant/15 outline outline-1 min-h-[150px] outline-none transition-all resize-y leading-relaxed"
                placeholder="Nhập yêu cầu kinh nghiệm, kỹ năng..."
              ></textarea>
            </div>
          </div>
        </section>
      </div>

      {/* ================= SIDEBAR / META COLUMN ================= */}
      <aside className="col-span-12 lg:col-span-4 space-y-8">
        
        {/* Summary Card */}
        <div className={`p-8 rounded-2xl text-white shadow-xl bg-gradient-to-br ${job.status === 'Open' ? 'from-primary-container to-primary' : 'from-slate-500 to-slate-700'}`}>
          <h3 className="text-xl font-headline font-extrabold mb-4">Trạng thái Tin tuyển dụng</h3>
          <div className="flex items-center gap-3 mb-6">
            {job.status === 'OPEN' && <span className="w-3 h-3 bg-secondary-fixed rounded-full animate-pulse"></span>}
            <span className="font-bold tracking-tight text-lg">
              {job.status === 'OPEN' ? 'Đang mở tuyển (Active)' : job.status === 'Draft' ? 'Bản nháp (Draft)' : 'Đã đóng (Closed)'}
            </span>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-3 border-b border-white/20">
              <span className="text-sm font-medium opacity-90">Mã Job ID</span>
              <span className="font-bold text-sm truncate max-w-[120px]">{job.id}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/20">
              <span className="text-sm font-medium opacity-90">Ngày đăng</span>
              <span className="font-bold text-sm">{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
          
          <Link href={`/jobs/${job.id}`} target="_blank">
            <button type="button" className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-white/20">
              <span className="material-symbols-outlined">visibility</span>
              Xem trang hiển thị
            </button>
          </Link>
        </div>

        {/* Nút Xóa Job (Danger Zone) */}
        <div className="bg-error-container/30 border border-error/20 p-6 rounded-2xl">
          <div className="flex items-center gap-2 text-error mb-2">
            <span className="material-symbols-outlined">warning</span>
            <h4 className="font-headline font-bold">Khu vực nguy hiểm</h4>
          </div>
          <p className="text-on-surface-variant text-sm mb-4 leading-relaxed">
            Hành động xóa tin tuyển dụng này là vĩnh viễn và không thể hoàn tác. Mọi đơn ứng tuyển liên quan cũng sẽ bị xóa.
          </p>
          <button 
            type="button" 
            onClick={onDelete} 
            disabled={isLoading}
            className="w-full py-3 bg-error text-on-error rounded-xl font-bold hover:bg-error/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Xóa tin tuyển dụng
          </button>
        </div>
      </aside>
    </form>
  );
}