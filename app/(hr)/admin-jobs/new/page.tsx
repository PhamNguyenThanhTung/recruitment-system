// 🛑 TUYỆT ĐỐI KHÔNG CÓ DÒNG "use client" Ở ĐÂY!
import { Suspense } from "react";
import JobForm from "./JobForm";

// 🔥 KIM BÀI MIỄN TỬ: Ép Next.js không được build tĩnh trang này, tránh mọi lỗi useSearchParams
export const dynamic = "force-dynamic";

export default function NewJobPage() {
  return (
    // Bọc Suspense để "che mắt" thằng build worker nếu có useSearchParams ngầm
    <Suspense fallback={<div className="p-20 text-center font-bold text-primary">Đang chuẩn bị biểu mẫu...</div>}>
      <JobForm />
    </Suspense>
  );
}