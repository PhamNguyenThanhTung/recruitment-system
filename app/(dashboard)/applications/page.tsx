'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Application {
  id: string;
  jobId: string;
  status: string;
  appliedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  job: {
    id: string;
    title: string;
    company: string;
  };
}

interface Job {
  id: string;
  title: string;
  company: string;
}

export default function ApplicationsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterJobId, setFilterJobId] = useState(searchParams.get('jobId') || '');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');

  // ===== Fetch Applications =====
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (filterJobId) params.append('jobId', filterJobId);
        if (filterStatus) params.append('status', filterStatus);

        const response = await fetch(`/api/applications?${params}`);
        if (!response.ok) {
          setError('Không thể tải danh sách ứng tuyển');
          return;
        }
        const data = await response.json();
        setApplications(data);
      } catch (err) {
        setError('Lỗi server. Vui lòng thử lại sau.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [filterJobId, filterStatus]);

  // ===== Fetch Jobs cho Filter =====
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
        if (!response.ok) return;
        const data = await response.json();
        setJobs(data.data || []);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);
      }
    };

    fetchJobs();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <span className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Chờ xử lý</span>;
      case 'reviewed':
        return <span className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Đã xem</span>;
      case 'interview':
        return <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Phỏng vấn</span>;
      case 'accepted':
        return <span className="bg-secondary-fixed text-on-secondary-container px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Trúng tuyển</span>;
      case 'rejected':
        return <span className="bg-error-container text-on-error-container px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Từ chối</span>;
      default:
        return <span className="bg-surface-container-high text-on-surface-variant px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <>
      {/* ================= HEADER SECTION ================= */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight font-headline">Hồ sơ ứng viên</h1>
          <p className="text-on-surface-variant font-medium mt-2">
            Đang hiển thị <span className="text-primary font-bold">{applications.length}</span> hồ sơ trong hệ thống
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-surface-container-lowest border border-outline-variant/15 rounded-xl text-sm font-semibold hover:bg-surface-container-low transition-all active:scale-95">
            <span className="material-symbols-outlined text-[20px]">file_download</span>
            <span className="hidden md:inline">Xuất dữ liệu</span>
          </button>
        </div>
      </div>

      {/* ================= THÔNG BÁO LỖI ================= */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-error-container text-on-error-container rounded-xl font-medium mb-6 shadow-sm">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* ================= FILTERS SECTION ================= */}
      <section className="bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 mb-8 shadow-[0px_4px_20px_rgba(0,89,187,0.02)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Lọc theo Tên/Email (Dummy cho UI) */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
            <input 
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-outline-variant/20 bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-outline/60 text-sm font-medium" 
              placeholder="Tìm theo tên hoặc email..." 
              type="text"
            />
          </div>

          {/* Lọc theo Công việc */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">work</span>
            <select
              value={filterJobId}
              onChange={(e) => setFilterJobId(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-xl border border-outline-variant/20 bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none transition-all text-sm font-semibold cursor-pointer"
            >
              <option value="">Tất cả vị trí tuyển dụng</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
          </div>

          {/* Lọc theo Trạng thái */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant">rule</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-xl border border-outline-variant/20 bg-surface focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none transition-all text-sm font-semibold cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="reviewed">Đã xem</option>
              <option value="interview">Phỏng vấn</option>
              <option value="accepted">Trúng tuyển</option>
              <option value="rejected">Từ chối</option>
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
          </div>
        </div>
      </section>

      {/* ================= TRẠNG THÁI LOADING / TRỐNG ================= */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">progress_activity</span>
          <p className="text-on-surface-variant font-medium">Đang tải dữ liệu ứng viên...</p>
        </div>
      ) : applications.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 text-center px-4">
          <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-outline">group_off</span>
          </div>
          <h3 className="text-xl font-bold font-headline mb-2">Chưa có ứng viên nào</h3>
          <p className="text-on-surface-variant">Thử thay đổi bộ lọc hoặc đăng thêm tin tuyển dụng mới để thu hút ứng viên.</p>
        </div>
      ) : (
        /* ================= BẢNG DỮ LIỆU (CANDIDATES TABLE) ================= */
        <div className="bg-surface-container-lowest rounded-2xl overflow-x-auto shadow-[0px_10px_40px_rgba(0,89,187,0.06)] border border-outline-variant/10">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-surface-container-low/50">
              <tr>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Ứng viên</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Vị trí ứng tuyển</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label text-center">Ngày nộp</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Trạng thái</th>
                <th className="px-6 py-5 text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-surface-container-low/30 transition-colors group cursor-pointer" onClick={() => router.push(`/applications/${app.id}`)}>
                  
                  {/* Cột 1: Tên & Avatar */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold font-headline text-lg shadow-sm shrink-0">
                        {app.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate max-w-[200px]">
                        <p className="font-bold text-on-surface font-headline truncate group-hover:text-primary transition-colors">{app.user.name}</p>
                        <p className="text-xs text-on-surface-variant truncate">{app.user.email}</p>
                      </div>
                    </div>
                  </td>
                  
                  {/* Cột 2: Job */}
                  <td className="px-6 py-5">
                    <p className="text-sm font-semibold text-primary line-clamp-1">{app.job.title}</p>
                    <p className="text-xs text-on-surface-variant mt-1 truncate max-w-[200px]">{app.job.company}</p>
                  </td>
                  
                  {/* Cột 3: Ngày nộp */}
                  <td className="px-6 py-5 text-center">
                    <p className="text-sm font-medium text-on-surface">{formatDate(app.appliedAt)}</p>
                  </td>
                  
                  {/* Cột 4: Status */}
                  <td className="px-6 py-5">
                    {getStatusBadge(app.status)}
                  </td>
                  
                  {/* Cột 5: Hành động */}
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn click lan ra thẻ <tr>
                          router.push(`/applications/${app.id}`);
                        }}
                        className="flex items-center justify-center p-2 text-primary hover:bg-primary-fixed rounded-lg transition-colors" 
                        title="Xem hồ sơ"
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                      <a 
                        href={`mailto:${app.user.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" 
                        title="Gửi Email"
                      >
                        <span className="material-symbols-outlined">mail</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination (Trang trí UI) */}
          <div className="px-6 py-5 bg-surface-container-low/30 border-t border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-on-surface-variant font-medium">
              Hiển thị toàn bộ <span className="font-bold text-on-surface">{applications.length}</span> hồ sơ
            </p>
          </div>
        </div>
      )}
    </>
  );
}