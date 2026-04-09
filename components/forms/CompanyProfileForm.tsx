'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CompanyProfileForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // State quản lý file Logo
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(initialData?.logoUrl || "");

  // Load dữ liệu cũ
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || '',
    website: initialData?.website || '',
    address: initialData?.address || '',
    size: initialData?.size || '',
    foundedYear: initialData?.foundedYear || '',
    description: initialData?.description || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hàm xử lý khi chọn ảnh giống hệt Candidate
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error("Ảnh không được quá 2MB");
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Dùng FormData để gói cả text và file y như Candidate
      const data = new FormData();
      data.append("companyName", formData.companyName);
      data.append("address", formData.address);
      data.append("website", formData.website);
      data.append("description", formData.description);
      
      if (formData.size) data.append("size", formData.size.toString());
      if (formData.foundedYear) data.append("foundedYear", formData.foundedYear.toString());
      
      // Nếu có chọn ảnh mới thì đính kèm vào
      if (logoFile) data.append("logo", logoFile);

      const res = await fetch('/api/profile/company', {
        method: 'PUT', // Hoặc POST tùy vào Backend sếp viết
        body: data, // Không cần headers Content-Type khi gửi FormData
      });

      const resultData = await res.json();

      if (!res.ok) {
        throw new Error(resultData.error || 'Cập nhật thất bại');
      }
      
      toast.success('Cập nhật hồ sơ công ty thành công!');
      router.refresh(); 
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ===== HEADER: AVATAR & INFO ===== */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-28 h-28 rounded-full border-4 border-blue-50 bg-primary text-white flex items-center justify-center font-headline font-black text-4xl overflow-hidden shadow-2xl transition-all group-hover:scale-105 group-hover:brightness-90">
              {logoPreview ? (
                <img src={logoPreview} className="w-full h-full object-cover bg-white" alt="Company Logo" />
              ) : (
                <span className="material-symbols-outlined text-4xl">business</span>
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full transition-all">
              <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
            </div>
            {/* Input ẩn để chọn file */}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
          </div>

          <div>
            <h2 className="text-3xl font-black font-headline tracking-tight text-on-surface">
              {formData.companyName || "Chưa cập nhật tên"}
            </h2>
            <p className="text-primary text-xs font-black uppercase tracking-[2px] mt-1 italic opacity-70">
               {formData.address || "Trụ sở chưa xác định"}
            </p>
          </div>
        </div>

        <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-[#1a1c1e] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl">
          Đổi Logo Công Ty
        </button>
      </div>

      {/* ===== FORM NỘI DUNG CHÍNH (Giữ nguyên y hệt) ===== */}
      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-8">
        {/* CỘT TRÁI (7/12) */}
        <div className="col-span-12 lg:col-span-7 space-y-8">
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black font-headline mb-8 flex items-center gap-3">
              <span className="w-2 h-6 bg-primary rounded-full"></span>
              Thông tin doanh nghiệp
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tên công ty <span className="text-red-500">*</span></label>
                <input required name="companyName" value={formData.companyName} onChange={handleChange} className="w-full p-5 rounded-3xl bg-slate-50 focus:bg-white border-2 border-transparent focus:border-primary outline-none transition-all font-bold text-slate-700" placeholder="VD: Công ty Cổ phần Công nghệ ABC" />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Địa chỉ trụ sở <span className="text-red-500">*</span></label>
                <input required minLength={5} name="address" value={formData.address} onChange={handleChange} className="w-full p-5 rounded-3xl bg-slate-50 focus:bg-white border-2 border-transparent focus:border-primary outline-none transition-all font-bold text-slate-700" placeholder="Nhập địa chỉ chi tiết..." />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Link Website</label>
                <input name="website" value={formData.website} onChange={handleChange} className="w-full p-5 rounded-3xl bg-slate-50 focus:bg-white border-2 border-transparent focus:border-primary outline-none transition-all font-bold text-slate-700" placeholder="https://yourcompany.com" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Quy mô (Nhân sự)</label>
                  <input type="number" name="size" value={formData.size} onChange={handleChange} className="w-full p-5 rounded-3xl bg-slate-50 focus:bg-white border-2 border-transparent focus:border-primary outline-none transition-all font-bold text-slate-700" placeholder="VD: 150" />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Năm thành lập</label>
                  <input type="number" name="foundedYear" value={formData.foundedYear} onChange={handleChange} className="w-full p-5 rounded-3xl bg-slate-50 focus:bg-white border-2 border-transparent focus:border-primary outline-none transition-all font-bold text-slate-700" placeholder="VD: 2020" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (5/12) */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black font-headline mb-8 flex items-center gap-3">
              <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
              Văn hóa & Môi trường
            </h3>

            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Giới thiệu tổng quan</label>
              <textarea rows={11} name="description" value={formData.description} onChange={handleChange} className="w-full p-6 rounded-[32px] bg-slate-50 focus:bg-white border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-bold resize-none text-slate-700 shadow-inner" placeholder="Giới thiệu về sứ mệnh, tầm nhìn..." />
            </div>
            
            <button type="submit" disabled={isLoading} className="w-full mt-10 bg-primary text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[2px] shadow-2xl shadow-blue-200 hover:translate-y-[-2px] active:scale-95 transition-all disabled:opacity-50">
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  Đang lưu thay đổi...
                </div>
              ) : "Cập nhật hồ sơ ngay"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}