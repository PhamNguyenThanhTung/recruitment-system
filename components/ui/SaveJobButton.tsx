'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SaveJobButtonProps {
  jobId: string;
  initialIsSaved: boolean; // Server sẽ truyền vào xem Job này đã được user lưu chưa
}

export default function SaveJobButton({ jobId, initialIsSaved }: SaveJobButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); // Tránh bị nhảy link khi nút nằm trong thẻ <Link>
    setIsLoading(true);

    try {
      // Logic: Nếu đang lưu -> gọi DELETE (bỏ lưu). Nếu chưa lưu -> gọi POST (để lưu)
      const method = isSaved ? 'DELETE' : 'POST';
      
      const res = await fetch('/api/saved-jobs', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      if (res.status === 401 || res.status === 403) {
        alert("Bạn cần đăng nhập với tài khoản Ứng viên để sử dụng tính năng này!");
        return;
      }

      if (res.ok) {
        // Đảo ngược trạng thái tim (Đỏ -> Xám hoặc Xám -> Đỏ)
        setIsSaved(!isSaved); 
        router.refresh(); // F5 data server ngầm để cập nhật số lượng (nếu có)
      } else {
        const data = await res.json();
        // Xử lý riêng lỗi P2002 (Đã lưu trước đó) - Dù báo lỗi nhưng cứ set tim thành đỏ
        if (res.status === 409) {
          setIsSaved(true);
        } else {
           alert(data.error || "Có lỗi xảy ra");
        }
      }
    } catch (error) {
      console.error("Lỗi khi tương tác với lưu công việc", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleSave}
      disabled={isLoading}
      className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
        isSaved 
          ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100' // Đỏ chót khi đã lưu
          : 'bg-white border-outline-variant/20 text-outline hover:bg-surface-container-low hover:text-primary' // Xám xịt khi chưa lưu
      } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
      title={isSaved ? "Bỏ lưu công việc" : "Lưu công việc"}
    >
      {/* Icon Trái tim (Điền màu khi đã lưu) */}
      <span className={`material-symbols-outlined ${isSaved ? 'fill-current' : ''}`}>
        favorite
      </span>
    </button>
  );
}