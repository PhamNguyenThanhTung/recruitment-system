"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchForm() {
  const [keyword, setKeyword] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn trang bị reload khi ấn Enter
    if (!keyword.trim()) return;
    
    // Chuyển hướng sang trang /jobs kèm theo query string
    // Ví dụ: /jobs?q=react
    router.push(`/jobs?q=${encodeURIComponent(keyword.trim())}`);
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className="w-full max-w-3xl bg-white p-2 rounded-2xl flex flex-col md:flex-row gap-2 shadow-2xl"
    >
      <div className="flex-1 flex items-center px-4">
        <span className="material-symbols-outlined text-outline">work</span>
        <input 
          type="text" 
          placeholder="Chức danh, từ khóa..." 
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full bg-transparent border-none focus:ring-0 text-on-surface ml-2 outline-none font-medium" 
        />
      </div>
      <button 
        type="submit" 
        className="bg-primary text-white px-8 py-4 rounded-xl font-bold font-headline hover:bg-primary-container hover:text-on-primary-container transition-all"
      >
        Tìm việc ngay
      </button>
    </form>
  );
}