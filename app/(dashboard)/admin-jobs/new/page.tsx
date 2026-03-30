"use client";
import { Suspense } from "react";
import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CldUploadWidget } from 'next-cloudinary';
export const dynamic = 'force-dynamic';
export function NewJobPageContent() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // State phục vụ Live Preview và Form Input
  const [previewTitle, setPreviewTitle] = React.useState("Chức danh công việc");
  const [previewSalary, setPreviewSalary] = React.useState("Mức lương");
  const [previewLogoUrl, setPreviewLogoUrl] = React.useState("");
  
  const [isMounted, setIsMounted] = React.useState(false);
  // 🔥 Thêm 2 state này để quản lý Tên công ty và Địa điểm (Có thể chỉnh sửa)
  const [previewCompany, setPreviewCompany] = React.useState("Đang tải...");
  const [previewLocation, setPreviewLocation] = React.useState("Đang tải...");

  // ===== Fetch dữ liệu CompanyProfile từ API =====
  React.useEffect(() => {
    setIsMounted(true);
    async function fetchCompanyProfile() {
      try {
        const res = await fetch('/api/profile/company');
        if (res.ok) {
          const profile = await res.json();
          if (profile) {
            // Đổ dữ liệu DB vào state để làm giá trị mặc định cho Input
            setPreviewCompany(profile.companyName || "");
            setPreviewLocation(profile.address || "");
            
            if(profile.logoUrl) {
                setPreviewLogoUrl(profile.logoUrl);
            }
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
    const finalSalary = (minSalary && maxSalary) ? `$${minSalary} - $${maxSalary}` : (minSalary ? `Từ $${minSalary}` : "Thỏa thuận");

    // 🔥 Truyền thêm company và location lấy từ Form lên API
    const data = {
      title: formData.get("title"),
      company: formData.get("company"),       // Tên công ty (có thể đã bị HR sửa)
      location: formData.get("location"),     // Địa điểm (có thể đã bị HR sửa)
      salary: finalSalary,
      status: formData.get("status"),
      description: formData.get("description"),
      requirements: formData.get("requirements"),
      deadline: formData.get("deadline") || undefined,
      companyLogoUrl: formData.get("companyLogoUrl") || undefined,
    };

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Something went wrong");
      } else {
        router.push("/admin-jobs");
        router.refresh();
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  // BỔ SUNG 3 DÒNG NÀY NGAY TRƯỚC LÚC RETURN GIAO DIỆN
  if (!isMounted) {
    return null;
  }
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-2">Tạo tin tuyển dụng mới</h1>
        <p className="text-on-surface-variant text-lg">Tiếp cận hàng ngàn ứng viên tiềm năng trên hệ thống RecruitSync.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0px_10px_40px_rgba(0,89,187,0.06)] border border-outline-variant/10">
            <form onSubmit={onSubmit} className="space-y-10">
              
              {/* Box thông báo đã được tinh chỉnh lại cho hợp lý với Headhunter */}
              <div className="p-4 bg-primary-fixed/30 text-primary-fixed-dim rounded-xl text-sm border border-primary-fixed/50 flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                <div>
                  <strong className="text-on-surface">Mẹo tuyển dụng:</strong> Hệ thống đã tự động điền thông tin doanh nghiệp của bạn. Nếu bạn đang tuyển dụng hộ đối tác, hãy thay đổi <strong>Tên công ty</strong> và <strong>Logo</strong> cho phù hợp nhé!
                </div>
              </div>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">work</span>
                  </div>
                  <h2 className="font-headline text-xl font-bold">Thông tin cơ bản</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Chức danh */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block font-label text-xs font-bold text-on-surface-variant tracking-wider uppercase">Chức danh công việc *</label>
                    <input 
                      name="title" 
                      required
                      disabled={isLoading}
                      onChange={(e) => setPreviewTitle(e.target.value)}
                      className="w-full bg-surface-container-low border-0 rounded-lg py-3 px-4 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary transition-all outline-none" 
                      placeholder="VD: Senior React Developer" 
                      type="text"
                    />
                  </div>

                  {/* 🔥 CỘT MỚI 1: TÊN CÔNG TY */}
                  <div className="space-y-2">
                    <label className="block font-label text-xs font-bold text-on-surface-variant tracking-wider uppercase">Tên công ty tuyển dụng *</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">domain</span>
                      <input 
                        name="company" 
                        required
                        disabled={isLoading}
                        value={previewCompany}
                        onChange={(e) => setPreviewCompany(e.target.value)}
                        className="w-full bg-surface-container-low border-0 rounded-lg py-3 pl-10 pr-4 text-on-surface focus:ring-2 focus:ring-primary transition-all outline-none" 
                        placeholder="Tên công ty" 
                        type="text"
                      />
                    </div>
                  </div>

                  {/* 🔥 CỘT MỚI 2: ĐỊA ĐIỂM LÀM VIỆC */}
                  <div className="space-y-2">
                    <label className="block font-label text-xs font-bold text-on-surface-variant tracking-wider uppercase">Địa điểm làm việc *</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">location_on</span>
                      <input 
                        name="location" 
                        required
                        disabled={isLoading}
                        value={previewLocation}
                        onChange={(e) => setPreviewLocation(e.target.value)}
                        className="w-full bg-surface-container-low border-0 rounded-lg py-3 pl-10 pr-4 text-on-surface focus:ring-2 focus:ring-primary transition-all outline-none" 
                        placeholder="VD: Hà Nội, Hồ Chí Minh..." 
                        type="text"
                      />
                    </div>
                  </div>

                  {/* Upload Logo */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block font-label text-xs font-bold text-on-surface-variant tracking-wider uppercase">Logo Công Ty (Tùy chọn)</label>
                    <input type="hidden" name="companyLogoUrl" value={previewLogoUrl} />

                    <CldUploadWidget 
                      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                      onSuccess={(result: any) => {
                        if (result.info?.secure_url) {
                          setPreviewLogoUrl(result.info.secure_url);
                        }
                      }}
                    >
                      {({ open }) => {
                        return (
                          <button 
                            type="button" 
                            onClick={() => open()}
                            className="w-full bg-surface-container-low border-2 border-dashed border-outline-variant/30 rounded-lg py-6 flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container hover:border-primary/50 transition-all cursor-pointer group"
                          >
                            <span className="material-symbols-outlined text-3xl mb-2 text-primary group-hover:-translate-y-1 transition-transform">cloud_upload</span>
                            <span className="font-bold">Nhấn để tải ảnh lên</span>
                            <span className="text-xs mt-1 opacity-70">Hỗ trợ JPG, PNG, WEBP</span>
                          </button>
                        );
                      }}
                    </CldUploadWidget>
                  </div>
                  
                  {/* Hạn nộp & Trạng thái */}
                  <div className="space-y-2">
                    <label className="block font-label text-xs font-bold text-on-surface-variant tracking-wider uppercase">Hạn nộp hồ sơ</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">calendar_today</span>
                      <input 
                        name="deadline" 
                        disabled={isLoading}
                        className="w-full bg-surface-container-low border-0 rounded-lg py-3 pl-10 pr-4 text-on-surface focus:ring-2 focus:ring-primary transition-all outline-none" 
                        type="date"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-label text-xs font-bold text-on-surface-variant tracking-wider uppercase">Trạng thái tin</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">toggle_on</span>
                      <select 
                        name="status" 
                        disabled={isLoading}
                        className="w-full bg-surface-container-low border-0 rounded-lg py-3 pl-10 pr-4 text-on-surface focus:ring-2 focus:ring-primary transition-all outline-none appearance-none"
                      >
                        <option value="OPEN">Mở tuyển (Public)</option>
                        <option value="DRAFT">Bản nháp (Draft)</option>
                        <option value="CLOSED">Đóng tuyển (Closed)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* Mức lương */}
              <section>
                <div className="flex items-center gap-3 mb-6 pt-4 border-t border-outline-variant/10">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">payments</span>
                  </div>
                  <h2 className="font-headline text-xl font-bold">Mức lương (Tùy chọn)</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block font-label text-xs font-bold text-on-surface-variant tracking-wider uppercase">Lương tối thiểu</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-outline">$</span>
                      <input 
                        name="salaryMin" 
                        disabled={isLoading}
                        onChange={(e) => setPreviewSalary(`Từ $${e.target.value}`)}
                        className="w-full bg-surface-container-low border-0 rounded-lg py-3 pl-8 pr-4 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary transition-all outline-none" 
                        placeholder="VD: 1000" 
                        type="number"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block font-label text-xs font-bold text-on-surface-variant tracking-wider uppercase">Lương tối đa</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-outline">$</span>
                      <input 
                        name="salaryMax" 
                        disabled={isLoading}
                        onChange={(e) => setPreviewSalary((prev) => prev.split(' - ')[0] + ` - $${e.target.value}`)}
                        className="w-full bg-surface-container-low border-0 rounded-lg py-3 pl-8 pr-4 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary transition-all outline-none" 
                        placeholder="VD: 2500" 
                        type="number"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Chi tiết công việc */}
              <section>
                <div className="flex items-center gap-3 mb-6 pt-4 border-t border-outline-variant/10">
                  <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary">description</span>
                  </div>
                  <h2 className="font-headline text-xl font-bold">Chi tiết công việc</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block font-label text-xs font-bold text-on-surface-variant tracking-wider uppercase">Mô tả công việc *</label>
                    <textarea 
                      name="description" 
                      required
                      disabled={isLoading}
                      className="w-full bg-surface-container-low border-0 rounded-lg py-4 px-4 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary transition-all outline-none resize-y min-h-[150px]" 
                      placeholder="Mô tả các trách nhiệm chính, môi trường làm việc..." 
                    ></textarea>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block font-label text-xs font-bold text-on-surface-variant tracking-wider uppercase">Yêu cầu ứng viên (Tùy chọn)</label>
                    <textarea 
                      name="requirements" 
                      disabled={isLoading}
                      className="w-full bg-surface-container-low border-0 rounded-lg py-4 px-4 text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary transition-all outline-none resize-y min-h-[120px]" 
                      placeholder="Kinh nghiệm, kỹ năng, bằng cấp..." 
                    ></textarea>
                  </div>
                </div>
              </section>

              {/* Báo lỗi API */}
              {error && (
                <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined">error</span>
                  {error}
                </div>
              )}

              {/* Nút Submit */}
              <div className="flex justify-end items-center gap-4 pt-6 border-t border-outline-variant/10">
                <Link href="/admin-jobs">
                  <button type="button" disabled={isLoading} className="px-6 py-3 font-headline font-bold text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50">
                    Hủy bỏ
                  </button>
                </Link>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-primary text-on-primary font-headline font-bold text-lg px-10 py-3.5 rounded-xl hover:bg-primary-container active:scale-95 transition-all shadow-lg shadow-primary/30 disabled:opacity-70 flex items-center gap-2"
                >
                  {isLoading ? "Đang xử lý..." : "Đăng tin tuyển dụng"}
                  {!isLoading && <span className="material-symbols-outlined text-base">send</span>}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* ================= CỘT PHẢI: PREVIEW ================= */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="bg-primary-container p-8 rounded-xl text-on-primary relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <span className="bg-white/20 text-white text-[10px] font-bold tracking-widest px-2 py-1 rounded mb-4 inline-block uppercase backdrop-blur-sm">
                Live Preview
              </span>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white rounded-xl shadow flex items-center justify-center shrink-0 overflow-hidden">
                  {previewLogoUrl ? (
                    <img src={previewLogoUrl} alt="Logo preview" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-primary font-bold text-2xl">
                      {/* 🔥 Cập nhật Avatar chữ cái theo tên công ty mới nhất */}
                      {previewCompany ? previewCompany.charAt(0).toUpperCase() : "?"}
                    </span>
                  )}
                </div>
                <h3 className="font-headline text-2xl font-bold truncate">{previewTitle || "Chức danh công việc"}</h3>
              </div>

              {/* 🔥 Tên và địa chỉ cập nhật theo thời gian thực */}
              <p className="opacity-80 mb-6 truncate">{previewCompany} • {previewLocation}</p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md">
                  Đang mở tuyển
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md truncate max-w-full">
                  {previewSalary || "Mức lương"}
                </span>
              </div>
              
              <div className="w-full h-[1px] bg-white/20 mb-6"></div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                  <span className="text-sm">Hiển thị tức thì</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                  <span className="text-sm">Tiếp cận 1000+ ứng viên</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-8 space-y-6">
            <h4 className="font-headline text-lg font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">tips_and_updates</span>
              Mẹo cho Nhà tuyển dụng
            </h4>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-secondary mt-0.5">lightbulb</span>
                <p className="text-sm text-on-surface-variant leading-relaxed">Tin tuyển dụng có ghi rõ khoảng lương nhận được <strong className="text-secondary">nhiều hơn 45% hồ sơ</strong> ứng tuyển.</p>
              </div>
              <div className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-primary mt-0.5">bolt</span>
                <p className="text-sm text-on-surface-variant leading-relaxed">Sử dụng các động từ mạnh như "Phát triển", "Dẫn dắt", "Thiết kế" trong tiêu đề để thu hút nhân sự cấp cao.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
export default function NewJobPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-on-surface-variant">Đang tải biểu mẫu...</div>}>
      <NewJobPageContent />
    </Suspense>
  );
}