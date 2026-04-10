'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminReportsPage() {
  const [reportedJobs, setReportedJobs] = useState([]);

  const fetchReports = async () => {
    const res = await fetch('/api/admin/dashboard');
    if (res.ok) {
      const data = await res.json();
      setReportedJobs(data.reportedJobs.filter((j: any) => j.report && j.report.length > 0));
    }
  };

  useEffect(() => { fetchReports(); }, []);

  // Xóa tin vi phạm (API cũ đã viết ở phần trước)
  const handleDeleteJob = async (id: string) => {
    if (!confirm("Tin này lừa đảo thật! Xóa vĩnh viễn tin này khỏi hệ thống?")) return;
    const res = await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success("Đã trảm tin vi phạm!");
      fetchReports();
    }
  };

  // Bỏ qua báo cáo láo (Minh oan)
  const handleDismissReport = async (jobId: string) => {
    if (!confirm("Tin này hoàn toàn bình thường. Bỏ qua các báo cáo này và giữ tin hiển thị?")) return;
    const res = await fetch(`/api/admin/reports/${jobId}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success("Đã minh oan cho tin tuyển dụng!");
      fetchReports();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-red-600 flex items-center gap-2">
        <span className="material-symbols-outlined">warning</span>
        Xử lý khiếu nại / Tố cáo
      </h1>

      <div className="space-y-4">
        {reportedJobs.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl text-center font-bold text-slate-500 border border-slate-200">
            Hệ thống đang sạch sẽ, không có ai bị tố cáo!
          </div>
        ) : (
          reportedJobs.map((job: any) => (
            <div key={job.id} className="bg-white p-6 rounded-2xl border-l-4 border-l-red-500 shadow-sm flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-black text-lg text-slate-800">{job.title}</h3>
                  <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">
                    {job.report.length} tố cáo
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-bold mb-4">Công ty: {job.company} | Đăng bởi: {job.user.email}</p>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Lý do từ ứng viên:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {job.report.map((r: any, i: number) => (
                      <li key={i} className="text-sm text-slate-700 italic">"{r.reason}"</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Nhóm Nút Thao tác */}
              <div className="flex flex-col gap-3 shrink-0 md:w-48 justify-center">
                <button 
                  onClick={() => handleDismissReport(job.id)}
                  className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Bỏ qua (Minh oan)
                </button>
                <button 
                  onClick={() => handleDeleteJob(job.id)}
                  className="w-full px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                >
                  <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                  Xóa tin vi phạm
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}