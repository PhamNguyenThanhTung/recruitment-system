"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CldUploadWidget } from 'next-cloudinary';

export default function JobForm() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const [previewTitle, setPreviewTitle] = React.useState("");
  const [previewSalary, setPreviewSalary] = React.useState("Thỏa thuận");
  const [previewLogoUrl, setPreviewLogoUrl] = React.useState("");
  const [previewCompany, setPreviewCompany] = React.useState("Đang tải...");
  const [previewLocation, setPreviewLocation] = React.useState("Đang tải...");

  React.useEffect(() => {
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
    const min = formData.get("salaryMin");
    const max = formData.get("salaryMax");
    const finalSalary = (min && max) ? `$${min} - $${max}` : (min ? `Từ $${min}` : "Thỏa thuận");

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
          companyLogoUrl: previewLogoUrl,
        }),
      });
      if (response.ok) {
        router.push("/admin-jobs");
        router.refresh();
      } else {
        const result = await response.json();
        setError(result.error || "Lỗi khi tạo job");
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
       {/* Toàn bộ nội dung Form sếp cứ giữ nguyên như cũ của sếp ở đây nhé... */}
       {/* Tôi chỉ tóm gọn lại để sếp nhìn cho rõ cấu trúc file */}
       <form onSubmit={onSubmit} className="space-y-10">
          <h1 className="text-3xl font-bold mb-6">Tạo tin tuyển dụng mới</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-8">
                  {/* Các ô Input của sếp... */}
                  <input name="title" required onChange={(e) => setPreviewTitle(e.target.value)} className="w-full p-3 bg-gray-100 rounded" placeholder="Chức danh..." />
                  
                  {/* Cloudinary Widget */}
                  <CldUploadWidget 
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                    onSuccess={(result: any) => setPreviewLogoUrl(result.info.secure_url)}
                  >
                    {({ open }) => (
                      <button type="button" onClick={() => open()} className="w-full border-2 border-dashed p-6">
                        Tải logo lên
                      </button>
                    )}
                  </CldUploadWidget>

                  <button type="submit" disabled={isLoading} className="bg-primary text-white px-8 py-3 rounded-xl font-bold">
                    {isLoading ? "Đang xử lý..." : "Đăng tin ngay"}
                  </button>
              </div>

              {/* Cột Preview bên phải... */}
              <div className="lg:col-span-4 bg-primary-container p-6 rounded-xl h-fit sticky top-10">
                  <h3 className="font-bold text-xl">{previewTitle || "Tiêu đề công việc"}</h3>
                  <p>{previewCompany} • {previewLocation}</p>
                  <img src={previewLogoUrl || "/default-logo.png"} className="w-16 h-16 object-contain mt-4" />
              </div>
          </div>
       </form>
    </div>
  );
}