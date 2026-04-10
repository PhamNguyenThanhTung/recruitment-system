'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    const res = await fetch('/api/admin/jobs');
    if (res.ok) setJobs(await res.json());
    setIsLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleAction = async (id: string, action: 'approve' | 'delete') => {
    if (!confirm(`Bạn có chắc chắn muốn ${action === 'approve' ? 'DUYỆT' : 'XÓA'} tin này?`)) return;
    
    const res = await fetch(`/api/admin/jobs/${id}`, {
      method: action === 'approve' ? 'PATCH' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: action === 'approve' ? JSON.stringify({ status: 'OPEN' }) : null
    });

    if (res.ok) {
      toast.success(`Đã ${action === 'approve' ? 'duyệt' : 'xóa'} tin thành công!`);
      fetchJobs();
    } else {
      toast.error("Có lỗi xảy ra!");
    }
  };

  if (isLoading) return <div className="animate-pulse">Đang tải danh sách chờ duyệt...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black text-slate-800">Duyệt tin tuyển dụng</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-bold text-sm text-slate-600">Vị trí / Công ty</th>
              <th className="p-4 font-bold text-sm text-slate-600">Người đăng</th>
              <th className="p-4 font-bold text-sm text-slate-600">Ngày tạo</th>
              <th className="p-4 font-bold text-sm text-slate-600 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-bold">Không có tin nào chờ duyệt! 🎉</td></tr>
            ) : (
              jobs.map((job: any) => (
                <tr key={job.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{job.title}</div>
                    <div className="text-xs text-slate-500">{job.company}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{job.user.email}</td>
                  <td className="p-4 text-sm text-slate-600">{new Date(job.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td className="p-4 flex gap-2 justify-end">
                    <button onClick={() => handleAction(job.id, 'approve')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors">Duyệt</button>
                    <button onClick={() => handleAction(job.id, 'delete')} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors">Xóa</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}