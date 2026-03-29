"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeaderSearch() {
  const [keyword, setKeyword] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    
    // Gõ xong enter là bay thẳng sang trang /jobs
    router.push(`/jobs?q=${encodeURIComponent(keyword.trim())}`);
  };

  return (
    <form 
      onSubmit={handleSearch} 
      // Ẩn trên mobile để đỡ chật, hiện trên màn hình to (md) trở lên
      className="hidden md:flex items-center bg-slate-50 px-4 py-2.5 rounded-full border border-slate-200 focus-within:border-primary focus-within:bg-white transition-all w-full max-w-sm ml-8"
    >
      <span className="material-symbols-outlined text-slate-400 text-[20px] mr-2">search</span>
      <input 
        type="text" 
        placeholder="Tìm kiếm chức danh, công ty..." 
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none text-slate-700 font-medium placeholder:text-slate-400" 
      />
      {/* Nút submit ẩn, người dùng chỉ cần gõ Enter */}
      <button type="submit" className="hidden">Tìm</button>
    </form>
  );
}