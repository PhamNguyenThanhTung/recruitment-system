"use client";

import { useEffect, useState } from "react";

export default function NotFound() {
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  useEffect(() => {
    // Lấy URL trang trước đó từ Document.referrer
    // Nếu user đến từ một trang trong cùng domain, ta sẽ có link
    if (typeof window !== "undefined") {
      const referrer = document.referrer;
      if (referrer.includes(window.location.origin)) {
        setPreviousPath(referrer);
      }
    }
  }, []);

  const handleHardBack = () => {
    if (previousPath) {
      // Dùng window.location.href thay vì router.push/back
      // Lệnh này ép trình duyệt hủy bỏ toàn bộ cache cũ và tải lại trang từ Server
      window.location.href = previousPath;
    } else {
      // Nếu không tìm thấy lịch sử, đẩy về profile và tải lại toàn bộ
      window.location.href = "/candidate/profile";
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <h1 className="text-[120px] font-black text-primary/10 headline-font leading-none">404</h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-primary animate-pulse">
              location_off
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-black headline-font text-on-surface">Không tìm thấy trang</h2>
          <p className="text-slate-500 font-medium">
            Có vẻ đường dẫn này đã bị lỗi hoặc không tồn tại trong hệ thống.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* NÚT QUAN TRỌNG: Dùng window.location.href để phá cache */}
          <button
            onClick={handleHardBack}
            className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">keyboard_backspace</span>
            Quay lại & Tải lại trang
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="w-full py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}