// File: app/(dashboard)/admin-jobs/new/page.tsx
import dynamic from "next/dynamic";

// TUYỆT CHIÊU TẢI ĐỘNG: Cấm Next.js đụng vào file Form lúc Build Server
const JobForm = dynamic(() => import("./JobForm"), { 
  ssr: false,
  loading: () => <div className="p-20 text-center text-primary font-bold">Đang tải biểu mẫu...</div>
});

export default function NewJobPage() {
  return <JobForm />;
}