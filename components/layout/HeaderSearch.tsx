"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function HeaderSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 1. Lấy từ khóa từ URL xuống (nếu người dùng vừa search ở bộ lọc Advanced)
  const currentQuery = searchParams.get("q") || "";
  
  // 2. Khởi tạo state bằng giá trị từ URL
  const [keyword, setKeyword] = useState(currentQuery);

  // 3. Lắng nghe URL: Bất cứ khi nào URL thay đổi (do Advanced Filter làm), Header cũng phải nhảy theo
  useEffect(() => {
    setKeyword(currentQuery);
  }, [currentQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Nếu xóa trắng ô search rồi enter -> Trở về trang jobs mặc định
    if (!keyword.trim()) {
      router.push('/jobs');
      return;
    }
    
    // Gõ xong enter là bay thẳng sang trang /jobs với từ khóa
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