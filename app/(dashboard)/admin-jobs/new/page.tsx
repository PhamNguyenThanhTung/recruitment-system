"use client"; // 🔥 CHỐT HẠ: Thêm dòng này lên đầu để biến file này thành Client Component

import dynamic from "next/dynamic";

// Bây giờ ssr: false sẽ được chấp nhận hoàn toàn vì đã ở Client Component
const JobForm = dynamic(() => import("./JobForm"), { 
  ssr: false,
  loading: () => <div className="p-20 text-center text-primary font-bold">Đang tải biểu mẫu...</div>
});

export default function NewJobPage() {
  return <JobForm />;
}