'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
// 🔥 IMPORT THƯ VIỆN BIỂU ĐỒ
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Dữ liệu mẫu cho biểu đồ (Sếp có thể thay bằng API thật sau này)
export default function AdminDashboard() {
  const [data, setData] = useState(null as any);
  const [isLoading, setIsLoading] = useState(true);

  // Gọi API tải dữ liệu
  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      const json = await res.json();
      if (res.ok) {
        setData(json);
      } else {
        toast.error(json.error || "Lỗi tải dữ liệu");
      }
    } catch (error) {
      toast.error("Lỗi kết nối");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Hàm xử lý "Duyệt" hoặc "Xóa" bài
  const handleAction = async (jobId: string, action: 'approve' | 'delete') => {
    if (!confirm(`Bạn có chắc chắn muốn ${action === 'approve' ? 'DUYỆT' : 'XÓA'} tin này?`)) return;

    try {
      // 🔥 LƯU Ý NHỎ: Nếu sếp đã tạo API /api/admin/jobs/[id] ở bước trước, sếp đổi đường dẫn ở đây nhé. 
      // Còn không thì cứ giữ nguyên /api/jobs/${jobId} của sếp cũng được.
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: action === 'approve' ? 'PATCH' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'OPEN' })
      });

      if (res.ok) {
        toast.success(`Đã ${action === 'approve' ? 'duyệt' : 'xóa'} tin thành công!`);
        fetchDashboardData(); // Tải lại danh sách
      } else {
        toast.error("Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Lỗi kết nối");
    }
  };

  if (isLoading) return <div className="p-8 text-center animate-pulse">Đang tải dữ liệu Admin...</div>;
  if (!data) return <div className="p-8 text-center text-red-500 font-bold">Không có quyền truy cập!</div>;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-headline text-slate-800">Trung Tâm Điều Hành</h1>
          <p className="text-slate-500 mt-1">Quản lý tổng quan hệ thống Shisha</p>
        </div>
        <button className="hidden md:flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
          <span className="material-symbols-outlined text-[18px]">download</span>
          Xuất báo cáo
        </button>
      </div>

      {/* 3 THẺ THỐNG KÊ TỔNG QUAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl relative overflow-hidden group hover:border-blue-300 transition-colors">
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-blue-500/10 group-hover:scale-110 transition-transform">group</span>
          <p className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2 relative z-10">Tổng Người Dùng</p>
          <p className="text-4xl font-black text-blue-900 relative z-10">{data.stats.totalUsers}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl relative overflow-hidden group hover:border-emerald-300 transition-colors">
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-emerald-500/10 group-hover:scale-110 transition-transform">work</span>
          <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2 relative z-10">Tổng Tin Tuyển Dụng</p>
          <p className="text-4xl font-black text-emerald-900 relative z-10">{data.stats.totalJobs}</p>
        </div>
        <div className="bg-purple-50 border border-purple-100 p-6 rounded-3xl relative overflow-hidden group hover:border-purple-300 transition-colors">
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-purple-500/10 group-hover:scale-110 transition-transform">description</span>
          <p className="text-sm font-bold text-purple-600 uppercase tracking-wider mb-2 relative z-10">Tổng Lượt Ứng Tuyển</p>
          <p className="text-4xl font-black text-purple-900 relative z-10">{data.stats.totalApplications}</p>
        </div>
      </div>

      {/* 🔥 KHU VỰC BIỂU ĐỒ (MỚI THÊM) */}
      <div className="bg-white p-8 border border-slate-200 rounded-[40px] shadow-sm">
        <div className="mb-6">
          <h3 className="font-black text-lg text-slate-800">Biểu đồ tăng trưởng</h3>
          <p className="text-sm text-slate-500 font-medium">Thống kê lượng tin tuyển dụng và người dùng mới trong 7 ngày qua.</p>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }} />
              <Bar dataKey="jobs" name="Tin tuyển dụng mới" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Bar dataKey="users" name="Người dùng mới" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DANH SÁCH TIN BỊ CẮM CỜ / BÁO CÁO (GIỮ NGUYÊN) */}
      <div className="bg-white p-8 border border-red-100 rounded-[40px] shadow-sm">
        <h2 className="text-xl font-black font-headline text-slate-800 flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-red-500">warning</span>
          Tin Chờ Duyệt / Bị Tố Cáo ({data.reportedJobs.length})
        </h2>

        {data.reportedJobs.length === 0 ? (
          <p className="text-slate-500 text-center py-10 bg-slate-50 rounded-2xl font-bold">Hệ thống đang sạch sẽ, không có tin nào bị báo cáo! 🎉</p>
        ) : (
          <div className="space-y-6">
            {data.reportedJobs.map((job: any) => (
              <div key={job.id} className="border border-red-200 bg-red-50/30 p-6 rounded-2xl flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-red-900 mb-1">{job.title}</h3>
                  <p className="text-sm font-bold text-slate-600 mb-2">Công ty: {job.company} | Đăng bởi: {job.user.email}</p>
                  
                  {job.report && job.report.length > 0 && (
                    <div className="mt-4 bg-white p-4 rounded-xl border border-red-100 text-sm shadow-sm">
                      <p className="font-bold text-red-600 mb-2">Các lý do báo cáo từ ứng viên:</p>
                      <ul className="list-disc pl-5 space-y-1 text-slate-600 font-medium">
                        {job.report.map((r: any, idx: number) => (
                          <li key={idx}>"{r.reason}"</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 shrink-0 md:w-48">
                  <Link href={`/jobs/${job.id}`} target="_blank">
                    <button className="w-full px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                      Xem chi tiết tin
                    </button>
                  </Link>
                  <button 
                    onClick={() => handleAction(job.id, 'approve')}
                    className="w-full px-4 py-2 bg-emerald-500 text-white font-bold text-sm rounded-xl hover:bg-emerald-600 transition-colors shadow-sm"
                  >
                    Duyệt (An toàn)
                  </button>
                  <button 
                    onClick={() => handleAction(job.id, 'delete')}
                    className="w-full px-4 py-2 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 transition-colors shadow-sm shadow-red-500/20"
                  >
                    Xóa tin vĩnh viễn
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}