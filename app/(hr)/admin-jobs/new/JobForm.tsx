"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";

// Khởi tạo Cloudinary ở Client Component
const CldUploadWidget = dynamic(
  () => import('next-cloudinary').then((mod) => mod.CldUploadWidget),
  { ssr: false }
);

export default function JobForm() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // Trạng thái cho Sidebar Preview
  const [previewTitle, setPreviewTitle] = React.useState("Chức danh công việc");
  const [previewSalary, setPreviewSalary] = React.useState("Mức lương");
  const [previewLogoUrl, setPreviewLogoUrl] = React.useState("");
  const [previewCompany, setPreviewCompany] = React.useState("Đang tải...");
  const [previewLocation, setPreviewLocation] = React.useState("Đang tải...");

  React.useEffect(() => {
    setIsMounted(true);
    async function fetchCompanyProfile() {
      try {
        const res = await fetch('/api/profile/company');
        if (res.ok) {
          const profile = await res.json();
          if (profile) {
            setPreviewCompany(profile.companyName || "");
            setPreviewLocation(profile.address || "");
            if(profile.logoUrl) setPreviewLogoUrl(profile.logoUrl);
          }
        }
      } catch (error) {
        console.error("❌ Lỗi lấy thông tin công ty:", error);
      }
    }
    fetchCompanyProfile();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(event.currentTarget);
    
    const minSalary = formData.get("salaryMin") as string;
    const maxSalary = formData.get("salaryMax") as string;
    const finalSalary = (minSalary && maxSalary) 
      ? `$${minSalary} - $${maxSalary}` 
      : (minSalary ? `Từ $${minSalary}` : "Thỏa thuận");

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          company: formData.get("company"),
          location: formData.get("location"),
          salary: finalSalary,
          status: formData.get("status"),
          description: formData.get("description"),
          requirements: formData.get("requirements"), // Đã bổ sung
          deadline: formData.get("deadline") || undefined, // Đã bổ sung
          companyLogoUrl: previewLogoUrl || undefined,
        }),
      });

      if (response.ok) {
        toast.success("Tạo tin tuyển dụng thành công!");
        router.push("/admin-jobs");
        router.refresh();
      } else {
        const result = await response.json();
        setError(result.message || "Lỗi khi tạo tin");
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isMounted) return null;

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-12 gap-8 max-w-7xl mx-auto">
      
      {/* ================= HEADER ACTIONS ================= */}
      <div className="col-span-12 flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-4">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant mb-2">
            <span className="text-xs font-semibold tracking-wider uppercase font-label">Jobs</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-xs font-semibold tracking-wider uppercase font-label text-primary">Tạo mới</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            Tạo tin tuyển dụng mới
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm">Tiếp cận ứng viên tiềm năng trên hệ thống của bạn.</p>
        </div>
        
        <div className="flex gap-4 shrink-0">
          <Link href="/admin-jobs">
            <button type="button" disabled={isLoading} className="px-6 py-3 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-high transition-all">
              Hủy bỏ
            </button>
          </Link>
          <button type="submit" disabled={isLoading} className="px-8 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:translate-y-[-2px] transition-all flex items-center gap-2">
            {isLoading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : null}
            Đăng tin ngay
          </button>
        </div>
      </div>

      {/* ================= MAIN FORM COLUMN ================= */}
      <div className="col-span-12 lg:col-span-8 space-y-8">
        
        {error && (
          <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm font-bold flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {/* Section 1: Thông tin cơ bản */}
        <section className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0px_10px_40px_rgba(0,89,187,0.06)] border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-lg">work</span>
            <h2 className="text-2xl font-bold font-headline text-on-surface">Thông tin cơ bản</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider">Chức danh công việc *</label>
              <input 
                name="title"
                required
                onChange={(e) => setPreviewTitle(e.target.value)}
                disabled={isLoading}
                className="w-full bg-surface-container-low border-0 focus:ring-2 focus:ring-primary rounded-xl p-4 text-on-surface font-medium outline-variant/15 outline outline-1 transition-all" 
                placeholder="VD: Senior React Developer"
              />
            </div>
            
            <div className="space-y-2 border-t md:border-none pt-4 md:pt-0 border-outline-variant/10">
              <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider">Công ty</label>
              <div className="relative">
                <input 
                  name="company"
                  value={previewCompany}
                  readOnly
                  className="w-full bg-surface-container-low/50 border-0 rounded-xl p-4 pl-12 text-on-surface-variant font-medium outline-variant/15 outline outline-1 cursor-not-allowed" 
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">corporate_fare</span>
              </div>
            </div>
            
            <div className="space-y-2 border-t md:border-none pt-4 md:pt-0 border-outline-variant/10">
              <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider">Địa điểm</label>
              <div className="relative">
                <input 
                  name="location"
                  value={previewLocation}
                  readOnly
                  className="w-full bg-surface-container-low/50 border-0 rounded-xl p-4 pl-12 text-on-surface-variant font-medium outline-variant/15 outline outline-1 cursor-not-allowed" 
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">location_on</span>
              </div>
            </div>

            
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider">Trạng thái ban đầu</label>
              <div className="relative">
                <select 
                  name="status"
                  disabled={isLoading}
                  className="w-full bg-surface-container-low border-0 focus:ring-2 focus:ring-primary rounded-xl p-4 pl-12 text-on-surface font-medium outline-variant/15 outline outline-1 appearance-none transition-all"
                >
                  <option value="OPEN">Mở tuyển ngay (Active)</option>
                  <option value="DRAFT">Lưu bản nháp (Draft)</option>
                </select>
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">toggle_on</span>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider">Cập nhật Logo Công Ty (Tùy chọn)</label>
              <CldUploadWidget 
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                onSuccess={(result: any) => setPreviewLogoUrl(result.info.secure_url)}
              >
                {({ open }) => (
                  <button type="button" onClick={() => open()} className="w-full border-2 border-dashed border-outline-variant/30 rounded-xl py-6 flex flex-col items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <span className="material-symbols-outlined text-3xl mb-2 text-primary">cloud_upload</span>
                    <span className="font-bold text-sm text-on-surface-variant">Nhấn để tải ảnh lên</span>
                  </button>
                )}
              </CldUploadWidget>
            </div>
          </div>
        </section>

        {/* Section 2: Lương */}
        <section className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0px_10px_40px_rgba(0,89,187,0.06)] border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-secondary bg-secondary-container p-2 rounded-lg">payments</span>
            <h2 className="text-2xl font-bold font-headline text-on-surface">Mức lương</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider">Lương tối thiểu ($)</label>
              <input 
                name="salaryMin" 
                type="number"
                onChange={(e) => setPreviewSalary(prev => {
                  const parts = prev.split(' - ');
                  return `$${e.target.value} - ${parts[1] || '$...'}`;
                })}
                disabled={isLoading}
                className="w-full bg-surface-container-low border-0 focus:ring-2 focus:ring-primary rounded-xl p-4 text-on-surface font-medium outline-variant/15 outline outline-1 transition-all" 
                placeholder="VD: 500" 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider">Lương tối đa ($)</label>
              <input 
                name="salaryMax" 
                type="number"
                onChange={(e) => setPreviewSalary(prev => {
                  const parts = prev.split(' - ');
                  return `${parts[0] || '$...'} - $${e.target.value}`;
                })}
                disabled={isLoading}
                className="w-full bg-surface-container-low border-0 focus:ring-2 focus:ring-primary rounded-xl p-4 text-on-surface font-medium outline-variant/15 outline outline-1 transition-all" 
                placeholder="VD: 1500" 
              />
            </div>
          </div>
        </section>

        {/* Section 3: Chi tiết công việc */}
        <section className="bg-surface-container-lowest p-6 md:p-8 rounded-xl shadow-[0px_10px_40px_rgba(0,89,187,0.06)] border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-8">
            <span className="material-symbols-outlined text-tertiary bg-tertiary-fixed p-2 rounded-lg">description</span>
            <h2 className="text-2xl font-bold font-headline text-on-surface">Chi tiết công việc</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider">Mô tả công việc *</label>
              <textarea 
                name="description"
                required
                disabled={isLoading}
                className="w-full bg-surface-container-low border-0 focus:ring-2 focus:ring-primary rounded-xl p-6 text-on-surface font-medium outline-variant/15 outline outline-1 min-h-[200px] transition-all resize-y leading-relaxed"
                placeholder="Nhập mô tả chi tiết công việc..."
              ></textarea>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant font-label uppercase tracking-wider">Yêu cầu ứng viên *</label>
              <textarea 
                name="requirements"
                required
                disabled={isLoading}
                className="w-full bg-surface-container-low border-0 focus:ring-2 focus:ring-primary rounded-xl p-6 text-on-surface font-medium outline-variant/15 outline outline-1 min-h-[150px] transition-all resize-y leading-relaxed"
                placeholder="Nhập yêu cầu về kỹ năng, kinh nghiệm..."
              ></textarea>
            </div>
          </div>
        </section>
      </div>

      {/* ================= SIDEBAR / PREVIEW COLUMN ================= */}
      <aside className="col-span-12 lg:col-span-4">
        <div className="bg-primary-container p-8 rounded-2xl text-on-primary sticky top-10 shadow-xl bg-gradient-to-br from-primary-container to-primary">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-6 opacity-80 border-b border-white/20 pb-3">Xem trước bài đăng</h3>
          
          <div className="flex flex-col gap-4 mb-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-md">
              {previewLogoUrl ? (
                <img src={previewLogoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <span className="text-primary font-black text-3xl">{previewCompany.charAt(0)}</span>
              )}
            </div>
            <h3 className="text-2xl font-black font-headline tracking-tight leading-tight">
              {previewTitle || "Tên công việc"}
            </h3>
          </div>
          
          <div className="space-y-2 mb-8">
            <p className="flex items-center gap-2 text-sm font-medium opacity-90">
              <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
              {previewCompany || "Tên công ty"}
            </p>
            <p className="flex items-center gap-2 text-sm font-medium opacity-90">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              {previewLocation || "Địa điểm làm việc"}
            </p>
          </div>
          
          <div className="inline-block bg-white/20 px-4 py-2 rounded-xl text-sm font-bold border border-white/10 backdrop-blur-sm">
            {previewSalary}
          </div>
        </div>
      </aside>
    </form>
  );
}