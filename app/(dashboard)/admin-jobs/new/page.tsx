"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewJobPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // ===== State để lưu tên công ty và địa chỉ từ CompanyProfile =====
  const [companyData, setCompanyData] = React.useState({ name: "Đang tải...", address: "Đang tải..." });
  
  // State phục vụ Live Preview
  const [previewTitle, setPreviewTitle] = React.useState("Chức danh công việc");
  const [previewSalary, setPreviewSalary] = React.useState("Mức lương");

  // ===== Fetch dữ liệu CompanyProfile từ API =====
  React.useEffect(() => {
    async function fetchCompanyProfile() {
      try {
        const res = await fetch('/api/profile/company');
        if (res.ok) {
          const profile = await res.json();
          if (profile) {
            setCompanyData({ 
              name: profile.companyName, 
              address: profile.address 
            });
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
    
    // Gộp lương Min/Max thành một string lưu vào DB (dựa theo UI mới)
    const minSalary = formData.get("salaryMin") as string;
    const maxSalary = formData.get("salaryMax") as string;
    const finalSalary = (minSalary && maxSalary) ? `$${minSalary} - $${maxSalary}` : (minSalary ? `Từ $${minSalary}` : "Thỏa thuận");

    const data = {
      title: formData.get("title"),
      salary: finalSalary,
      status: formData.get("status"),
      description: formData.get("description"),
      requirements: formData.get("requirements"),
      deadline: formData.get("deadline") || undefined,
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Tiêu đề trang */}
      <div className="mb-10">
        <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-2">Tạo tin tuyển dụng mới</h1>
        <p className="text-on-surface-variant text-lg">Tiếp cận hàng ngàn ứng viên tiềm năng trên hệ thống RecruitSync.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ================= CỘT TRÁI: FORM NHẬP LIỆU ================= */}
        <div className="lg:col-span-8">
          <div className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0px_10px_40px_rgba(0,89,187,0.06)] border border-outline-variant/10">
            <form onSubmit={onSubmit} className="space-y-10">
              
              {/* Box Thông báo Công ty Tự động */}
              <div className="p-4 bg-primary-fixed/30 text-primary-fixed-dim rounded-xl text-sm border border-primary-fixed/50 flex items-start gap-3">
                <span className="material-symbols-outlined text-primary mt-0.5">info</span>
                <div>
                  <strong className="text-on-surface">Lưu ý:</strong> Tên công ty (<strong className="text-primary">{companyData.name}</strong>) và Địa điểm làm việc sẽ được hệ thống <strong>tự động đính kèm</strong> vào tin tuyển dụng này dựa trên Hồ sơ Công ty của bạn.
                </div>
              </div>

              {/* Section 1: Thông tin cơ bản */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">work</span>
                  </div>
                  <h2 className="font-headline text-xl font-bold">Thông tin cơ bản</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <option value="Open">Mở tuyển (Public)</option>
                        <option value="Draft">Bản nháp (Draft)</option>
                        <option value="Closed">Đóng tuyển (Closed)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Mức lương */}
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

              {/* Section 3: Mô tả chi tiết */}
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

        {/* ================= CỘT PHẢI: PREVIEW & TIPS ================= */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Box Live Preview */}
          <div className="bg-primary-container p-8 rounded-xl text-on-primary relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <span className="bg-white/20 text-white text-[10px] font-bold tracking-widest px-2 py-1 rounded mb-4 inline-block uppercase backdrop-blur-sm">
                Live Preview
              </span>
              <h3 className="font-headline text-2xl font-bold mb-1 truncate">{previewTitle || "Chức danh công việc"}</h3>
              <p className="opacity-80 mb-6 truncate">{companyData.name} • {companyData.address}</p>
              
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
            {/* Hiệu ứng mờ góc dưới */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          {/* Box Mẹo tuyển dụng */}
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