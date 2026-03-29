'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast'; // Đảm bảo sếp đã cài react-hot-toast

interface BookmarkButtonProps {
  jobId: string;
  initialIsSaved: boolean;
}

export default function BookmarkButton({ jobId, initialIsSaved }: BookmarkButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); // Tránh bị trigger link nếu bọc trong thẻ <Link>
    if (isLoading) return;

    // 1. Áp dụng Optimistic UI update ngay lập tức
    const previousState = isSaved;
    setIsSaved(!isSaved);
    setIsLoading(true);

    try {
      // 2. Gọi API ngầm phía sau
      const res = await fetch('/api/saved-jobs', {
        method: isSaved ? 'DELETE' : 'POST', // Đang lưu thì gọi DELETE, chưa lưu thì POST
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      if (!res.ok) {
        // Bắt lỗi 401, 403, etc...
        const data = await res.json();
        throw new Error(data.error || 'Thao tác thất bại');
      }

      toast.success(isSaved ? 'Đã bỏ lưu công việc' : 'Đã lưu công việc thành công');
    } catch (error) {
      // 3. Rollback UI nếu gọi API thất bại
      setIsSaved(previousState);
      toast.error(error instanceof Error ? error.message : 'Vui lòng đăng nhập để lưu job');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleSave}
      disabled={isLoading}
      className="group flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white transition-all hover:border-red-100 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-70"
      aria-label="Lưu công việc"
    >
      <span
        className={`material-symbols-outlined text-2xl transition-colors ${
          isSaved ? 'text-red-500 [font-variation-settings:"FILL"1]' : 'text-gray-400 group-hover:text-red-400'
        }`}
      >
        favorite
      </span>
    </button>
  );
}