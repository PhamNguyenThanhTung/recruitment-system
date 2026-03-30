'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CldUploadWidget } from 'next-cloudinary'; // ✅ Import nút Upload xịn

export default function CompanyProfileForm({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load dữ liệu cũ (nếu có)
  const [formData, setFormData] = useState({
    companyName: initialData?.companyName || '',
    website: initialData?.website || '',
    address: initialData?.address || '',
    size: initialData?.size || '',
    foundedYear: initialData?.foundedYear || '',
    description: initialData?.description || '',
    logoUrl: initialData?.logoUrl || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    // Ép kiểu size và foundedYear sang số để khớp với Zod Schema của sếp
    const payload = {
      ...formData,
      size: formData.size ? Number(formData.size) : undefined,
      foundedYear: formData.foundedYear ? Number(formData.foundedYear) : undefined,
    };

    try {
      const res = await fetch('/api/profile/company', {
        method: 'PUT', // Dùng hàm PUT theo đúng API sếp viết
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Cập nhật thất bại');
      }
      
      setMessage({ type: 'success', text: 'Cập nhật hồ sơ công ty thành công!' });
      router.refresh(); // Tải lại trang để cập nhật data
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Có lỗi xảy ra, vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-[0px_10px_40px_rgba(0,89,187,0.06)] border border-outline-variant/10 space-y-6">
      {message.text && (
        <div className={`p-4 rounded-lg text-sm font-bold ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Tên công ty <span className="text-red-500">*</span></label>
          <input required name="companyName" value={formData.companyName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="VD: Công ty TNHH Recruity" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Link Website</label>
          <input name="website" value={formData.website} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="https://..." />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Quy mô (Số nhân viên)</label>
          <input type="number" name="size" value={formData.size} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="VD: 50" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Năm thành lập</label>
          <input type="number" name="foundedYear" value={formData.foundedYear} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="VD: 2020" />
        </div>

{/* Khu vực Upload Logo */}
      <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200">
        <label className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 block">
          Logo Công ty
        </label>
        
        <div className="flex items-center gap-6">
          {/* Preview ảnh */}
          <div className="w-24 h-24 rounded-2xl bg-white border shadow-sm overflow-hidden flex items-center justify-center">
            {formData.logoUrl ? (
              <img src={formData.logoUrl} className="w-full h-full object-cover" alt="Logo" />
            ) : (
              <span className="material-symbols-outlined text-4xl text-slate-300">business</span>
            )}
          </div>

          {/* Widget bấm là hiện cửa sổ chọn ảnh */}
          <CldUploadWidget 
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            onSuccess={(result: any) => {
              if (result?.info?.secure_url) {
                setFormData({ ...formData, logoUrl: result.info.secure_url });
                alert("Đã tải ảnh lên thành công!");
              }
            }}
          >
            {({ open }) => (
              <button 
                type="button" 
                onClick={() => open()}
                className="px-6 py-3 bg-white border-2 border-slate-200 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">image_search</span>
                {formData.logoUrl ? "Đổi Logo khác" : "Chọn Logo từ máy"}
              </button>
            )}
          </CldUploadWidget>
    
    {/* Link ẩn để validate, sếp không cần quan tâm cái này */}
    <input type="hidden" name="logoUrl" value={formData.logoUrl} required />
  </div>
  <p className="text-xs text-gray-500">Hỗ trợ định dạng JPG, PNG. Tối đa 2MB.</p>
</div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-gray-700">Địa chỉ trụ sở <span className="text-red-500">*</span></label>
          <input required minLength={5} name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all" placeholder="Nhập địa chỉ chi tiết..." />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-gray-700">Mô tả công ty</label>
          <textarea rows={5} name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none transition-all resize-none" placeholder="Giới thiệu về môi trường làm việc, văn hóa công ty..."></textarea>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button disabled={isLoading} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2">
          {isLoading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">save</span>}
          {isLoading ? 'Đang lưu...' : 'Lưu thông tin'}
        </button>
      </div>
    </form>
  );
}