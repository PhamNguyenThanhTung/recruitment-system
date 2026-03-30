// File: app/(dashboard)/admin-jobs/new/page.tsx
// 🛑 TUYỆT ĐỐI KHÔNG CÓ DÒNG "use client" Ở ĐÂY!

import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dùng dynamic import để "nhốt" cái Form lại, không cho nó chạy lúc Build
const JobForm = dynamic(() => import("./JobForm"), { 
  ssr: false, 
});

export default function NewJobPage() {
  return (
    // Mặc áo giáp Suspense ở cấp độ cao nhất
    <Suspense fallback={<div className="p-20 text-center font-bold">Đang chuẩn bị biểu mẫu...</div>}>
      <JobForm />
    </Suspense>
  );
}