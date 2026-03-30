"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic"; // 🔥 Import dynamic ở đây

// 🔥 VŨ KHÍ BÍ MẬT: Đưa ssr: false vào đây vì file này đã là "use client"
const CldUploadWidget = dynamic(
  () => import('next-cloudinary').then((mod) => mod.CldUploadWidget),
  { ssr: false }
);

export default function JobForm() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

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
    const formData = new FormData(event.currentTarget);
    const minSalary = formData.get("salaryMin") as string;
    const maxSalary = formData.get("salaryMax") as string;
    const finalSalary = (minSalary && maxSalary) ? `$${minSalary} - $${maxSalary}` : (minSalary ? `Từ $${minSalary}` : "Thỏa thuận");

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
          requirements: formData.get("requirements"),
          deadline: formData.get("deadline") || undefined,
          companyLogoUrl: previewLogoUrl || undefined,
        }),
      });

      if (response.ok) {
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

  // Chặn render trên server để tránh lỗi Hydration
  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold text-on-surface mb-2">Tạo tin tuyển dụng mới</h1>
          <p className="text-on-surface-variant text-lg">Tiếp cận ứng viên tiềm năng trên hệ thống RecruitSync.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
              <form onSubmit={onSubmit} className="space-y-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase">Chức danh công việc *</label>
                    <input name="title" required onChange={(e) => setPreviewTitle(e.target.value)} className="w-full bg-surface-container-low border-0 rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-primary" placeholder="VD: Senior React Developer" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase">Công ty *</label>
                      <input name="company" value={previewCompany} onChange={(e) => setPreviewCompany(e.target.value)} className="w-full bg-surface-container-low border-0 rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase">Địa điểm *</label>
                      <input name="location" value={previewLocation} onChange={(e) => setPreviewLocation(e.target.value)} className="w-full bg-surface-container-low border-0 rounded-lg py-3 px-4 outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase">Logo Công Ty</label>
                    <CldUploadWidget 
                      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                      onSuccess={(result: any) => setPreviewLogoUrl(result.info.secure_url)}
                    >
                      {({ open }) => (
                        <button type="button" onClick={() => open()} className="w-full border-2 border-dashed border-outline-variant/30 rounded-lg py-6 flex flex-col items-center justify-center hover:border-primary/50 transition-all">
                          <span className="material-symbols-outlined text-3xl mb-2 text-primary">cloud_upload</span>
                          <span className="font-bold">Nhấn để tải ảnh lên</span>
                        </button>
                      )}
                    </CldUploadWidget>
                  </div>
                </div>

                
                <div className="space-y-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase">Mô tả công việc *</label>
                    <textarea name="description" required className="w-full bg-surface-container-low border-0 rounded-lg py-4 px-4 min-h-[150px] outline-none focus:ring-2 focus:ring-primary"></textarea>
                </div>

                <div className="flex justify-end gap-4">
                  <Link href="/admin-jobs" className="px-6 py-3 font-bold text-on-surface-variant hover:text-on-surface">Hủy</Link>
                  <button type="submit" disabled={isLoading} className="bg-primary text-on-primary px-10 py-3 rounded-xl font-bold hover:bg-primary-container transition-all">
                    {isLoading ? "Đang xử lý..." : "Đăng tin ngay"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Preview Cột Phải */}
          <div className="lg:col-span-4">
            <div className="bg-primary-container p-8 rounded-xl text-on-primary sticky top-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                  {previewLogoUrl ? <img src={previewLogoUrl} className="w-full h-full object-contain" /> : <span className="text-primary font-bold text-2xl">{previewCompany.charAt(0)}</span>}
                </div>
                <h3 className="text-2xl font-bold truncate">{previewTitle || "Tiêu đề"}</h3>
              </div>
              <p className="opacity-80 mb-6">{previewCompany} • {previewLocation}</p>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs">{previewSalary}</span>
            </div>
          </div>
        </div>
    </div>
  );
}