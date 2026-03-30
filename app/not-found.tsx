"use client";

import { useEffect, useState, Suspense } from "react"; // 🔥 Đã thêm Suspense

// 1. Tách phần nội dung chính ra một Component riêng
function NotFoundContent() {
  const [previousPath, setPreviousPath] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const referrer = document.referrer;
      if (referrer.includes(window.location.origin)) {
        setPreviousPath(referrer);
      }
    }
  }, []);

  const handleHardBack = () => {
    if (previousPath) {
      window.location.href = previousPath;
    } else {
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

// 2. Export hàm NotFound chính được bọc trong Suspense
export default function NotFound() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center font-bold text-primary">
        Đang tải...
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  );
}