"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function CandidateEditForm({ initialData, user }: { initialData: any, user: any }) {
  // 1. Khởi tạo state với dữ liệu có sẵn (nếu có)
  const [formData, setFormData] = useState({
    address: initialData?.address || "",
    skills: initialData?.skills || "",
    bio: initialData?.bio || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // 2. QUAN TRỌNG: Đồng bộ lại formData khi initialData từ Server trả về (tránh trường hợp fetch chậm)
  useEffect(() => {
    if (initialData) {
      setFormData({
        address: initialData.address || "",
        skills: initialData.skills || "",
        bio: initialData.bio || "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/profile/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Cập nhật hồ sơ thành công!");
      } else {
        toast.error("Không thể lưu thay đổi");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Profile Section */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full border-4 border-blue-50 bg-primary text-white flex items-center justify-center font-headline font-black text-4xl overflow-hidden shadow-inner">
              {user?.image ? (
                <img src={user.image} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>
            <button type="button" className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md border border-slate-100 text-primary hover:scale-110 transition-all">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-black font-headline tracking-tight text-on-surface">{user?.name}</h2>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">
               Ứng viên • {formData.address || "Chưa cập nhật địa chỉ"}
            </p>
          </div>
        </div>
        <button type="button" className="bg-[#1a1c1e] text-white px-8 py-3 rounded-2xl font-black text-sm hover:scale-[1.02] transition-all shadow-xl">
           Update Photo
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-8">
        {/* Cột trái: Thông tin chính */}
        <div className="col-span-12 lg:col-span-7 space-y-8">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black font-headline mb-8 flex items-center gap-3">
              <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Họ và Tên</label>
                <input 
                  disabled 
                  value={user?.name || ""} 
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold text-slate-400 cursor-not-allowed shadow-inner" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                <input 
                  disabled 
                  value={user?.email || ""} 
                  className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold text-slate-400 cursor-not-allowed shadow-inner" 
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Địa chỉ liên hệ</label>
                <input 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full p-4 rounded-2xl bg-slate-50 focus:bg-white border-2 border-transparent focus:border-blue-500 outline-none transition-all font-bold" 
                  placeholder="Quận, Thành phố..." 
                />
              </div>
            </div>
            
            <div className="mt-8 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Giới thiệu bản thân</label>
              <textarea 
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={4}
                className="w-full p-4 rounded-2xl bg-slate-50 focus:bg-white border-2 border-transparent focus:border-blue-500 outline-none transition-all font-bold resize-none"
                placeholder="Chia sẻ về kinh nghiệm của bạn..."
              />
            </div>
          </div>
        </div>

        {/* Cột phải: Kỹ năng */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black font-headline mb-8 flex items-center gap-3">
              <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
              Expertise
            </h3>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Kỹ năng chuyên môn</label>
              <textarea 
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                rows={6}
                className="w-full p-4 rounded-2xl bg-slate-50 focus:bg-white border-2 border-transparent focus:border-blue-500 outline-none transition-all font-bold resize-none"
                placeholder="React, Node.js, UI/UX..."
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-6 bg-blue-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-blue-200 hover:scale-[1.02] transition-all disabled:opacity-50 active:scale-95"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  Đang lưu...
                </div>
              ) : "Xác nhận cập nhật hồ sơ"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}