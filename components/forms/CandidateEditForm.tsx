"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

interface Props {
  initialData: any;
  user: any;
  onProfileUpdate?: (newData: any) => void;
}

export default function CandidateEditForm({ initialData, user, onProfileUpdate }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const { update } = useSession();

  const [formData, setFormData] = useState({
    address: initialData?.address || "",
    phone: user?.phone || "",
    skills: initialData?.skills || "",
    bio: initialData?.bio || "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.image || "");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 FIX LỖI CÚ PHÁP Ở ĐÂY: Dùng Arrow function cho prev state
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        address: initialData.address || "",
        phone: prev.phone || user?.phone || "", // Ưu tiên số đang gõ trên form
        skills: initialData.skills || "",
        bio: initialData.bio || "",
      }));
    }
  }, [initialData, user]);

  // 🔥 HÀM FORMAT SĐT CHUẨN 10 SỐ (0xxx xxx xxx)
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 10); // Lấy tối đa 10 số
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`;
  };

  const handleInputChange = (field: string, value: string) => {
    let finalValue = value;
    
    // Nếu là ô phone, ép format ngay lập tức
    if (field === 'phone') {
      finalValue = formatPhoneNumber(value);
    }

    setFormData(prev => ({ ...prev, [field]: finalValue }));
    if (onProfileUpdate) onProfileUpdate({ [field]: finalValue });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return toast.error("Ảnh không được quá 2MB");
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        if (onProfileUpdate) onProfileUpdate({ avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") return toast.error("Chỉ chấp nhận file PDF");
      if (file.size > 5 * 1024 * 1024) return toast.error("File CV không được quá 5MB");
      setCvFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 🔥 VALIDATE SỐ ĐIỆN THOẠI TRƯỚC KHI GỬI API
    const cleanPhone = formData.phone.replace(/\s/g, ''); // Xóa khoảng trắng để đếm số
    
    if (cleanPhone) {
      if (cleanPhone.length !== 10) {
        return toast.error("Số điện thoại không hợp lệ (phải đủ 10 số)");
      }
      if (!cleanPhone.startsWith('0')) {
        return toast.error("Số điện thoại phải bắt đầu bằng số 0");
      }
    }
    setIsLoading(true);

    try {
      const data = new FormData();
      data.append("address", formData.address);
      
      // Xóa khoảng trắng để gửi lên DB số sạch (VD: 0912345678)
      const cleanPhone = formData.phone.replace(/\s/g, '');
      data.append("phone", cleanPhone);
      
      data.append("skills", formData.skills);
      data.append("bio", formData.bio);
      
      if (avatarFile) data.append("avatar", avatarFile);
      if (cvFile) data.append("cv", cvFile);

      const res = await fetch("/api/profile/candidate", {
        method: "POST",
        body: data, 
      });

      if (res.ok) {
        const resultData = await res.json();
        
        // Bắn tín hiệu update Cookie để giữ ảnh
        await update({ 
          ...(resultData.imageUrl && { image: resultData.imageUrl }),
          phone: cleanPhone 
        });

        toast.success("Hồ sơ đã được lưu vĩnh viễn!");
        // 🔥 ĐÃ FIX: Không set null nữa để file vẫn hiện trên màn hình
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Lỗi khi lưu dữ liệu");
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Header & Avatar Upload */}
      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div 
            className="relative group cursor-pointer" 
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-28 h-28 rounded-full border-4 border-blue-50 bg-primary text-white flex items-center justify-center font-headline font-black text-4xl overflow-hidden shadow-2xl transition-all group-hover:scale-105 group-hover:brightness-90">
              {avatarPreview ? (
                <img src={avatarPreview} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full transition-all">
              <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <div>
            <h2 className="text-3xl font-black font-headline tracking-tight text-on-surface">{user?.name}</h2>
            <p className="text-primary text-xs font-black uppercase tracking-[2px] mt-1 italic opacity-70">
               {formData.address || "Vị trí chưa xác định"}
            </p>
          </div>
        </div>
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          className="bg-[#1a1c1e] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl"
        >
          Đổi ảnh đại diện
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-8">
        {/* 2. Cột trái: Thông tin chính */}
        <div className="col-span-12 lg:col-span-7 space-y-8">
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black font-headline mb-8 flex items-center gap-3">
              <span className="w-2 h-6 bg-primary rounded-full"></span>
              Thông tin cá nhân
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Địa chỉ hiện tại</label>
                <input 
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full p-5 rounded-3xl bg-slate-50 focus:bg-white border-2 border-transparent focus:border-primary outline-none transition-all font-bold text-slate-700" 
                  placeholder="VD: Hà Nội, Việt Nam" 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Số điện thoại</label>
                <input 
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  type="tel"
                  className="w-full p-5 rounded-3xl bg-slate-50 focus:bg-white border-2 border-transparent focus:border-primary outline-none transition-all font-bold text-slate-700" 
                  placeholder="VD: 0912 345 678" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Hồ sơ năng lực (CV - PDF)</label>
              <div 
                onClick={() => cvInputRef.current?.click()}
                className={`group border-2 border-dashed rounded-[32px] p-10 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${cvFile || initialData?.defaultCvUrl ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 hover:border-primary bg-slate-50/50'}`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${cvFile || initialData?.defaultCvUrl ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white text-slate-400 shadow-sm group-hover:text-primary'}`}>
                   <span className="material-symbols-outlined text-3xl">
                    {cvFile || initialData?.defaultCvUrl ? 'task' : 'upload_file'}
                   </span>
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-slate-700">
                    {cvFile ? cvFile.name : (initialData?.defaultCvUrl ? "Đã cập nhật CV" : "Chưa có file CV")}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter mt-1">Hỗ trợ PDF tối đa 5MB</p>
                </div>
                <input type="file" ref={cvInputRef} className="hidden" accept=".pdf" onChange={handleCvChange} />
              </div>
            </div>

            <div className="mt-10 space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Giới thiệu ngắn</label>
              <textarea 
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full p-6 rounded-[32px] bg-slate-50 focus:bg-white border-2 border-transparent focus:border-primary outline-none transition-all font-bold resize-none text-slate-700 shadow-inner"
                placeholder="Tôi là một lập trình viên đam mê..."
              />
            </div>
          </div>
        </div>

        {/* 3. Cột phải: Kỹ năng & Action */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black font-headline mb-8 flex items-center gap-3">
              <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
              Kỹ năng chính
            </h3>
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Chuyên môn chính</label>
              <textarea 
                value={formData.skills}
                onChange={(e) => handleInputChange('skills', e.target.value)}
                rows={8}
                className="w-full p-6 rounded-[32px] bg-slate-50 focus:bg-white border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-bold resize-none text-slate-700 shadow-inner"
                placeholder="React, Next.js, Node.js, Python..."
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-10 bg-primary text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[2px] shadow-2xl shadow-blue-200 hover:translate-y-[-2px] active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  Đang đồng bộ...
                </div>
              ) : "Cập nhật hồ sơ ngay"}
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-slate-400">
                <span className="material-symbols-outlined text-sm text-emerald-500">verified</span>
                <span className="text-[9px] font-black uppercase tracking-tighter">Thông tin được bảo mật bởi Blue Ocean</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}