'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '@/components/ui/confirm-modal';

interface Application {
  id: string;
  jobId: string;
  status: string;
  appliedAt: string;
  cvFileUrl: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  job: {
    id: string;
    title: string;
    company: string;
    description: string;
  };
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  // Unwrap params in Next.js 15+
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;

  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // ===== Fetch Application Details =====
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/applications/${applicationId}`);
        if (!response.ok) {
          setError('Ứng tuyển không tồn tại hoặc đã bị xóa.');
          return;
        }
        const data = await response.json();
        setApplication(data);
        setSelectedStatus(data.status);
      } catch (err) {
        setError('Lỗi khi tải chi tiết hồ sơ ứng viên.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  // ===== Xử lý Cập nhật Trạng thái =====
  const handleStatusChange = async () => {
    if (!selectedStatus || selectedStatus === application?.status) {
      setShowConfirmModal(false);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Lỗi khi cập nhật trạng thái');
        return;
      }

      setApplication(data);
      setShowConfirmModal(false);
    } catch (err) {
      setError('Lỗi server. Vui lòng thử lại sau.');
    } finally {
      setIsUpdating(false);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'reviewed', label: 'Đã xem' },
    { value: 'interview', label: 'Phỏng vấn' },
    { value: 'accepted', label: 'Được chấp nhận' },
    { value: 'rejected', label: 'Bị từ chối' },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-tertiary-fixed text-on-tertiary-fixed-variant';
      case 'reviewed': return 'bg-surface-container-high text-on-surface-variant';
      case 'interview': return 'bg-primary-fixed text-primary';
      case 'accepted': return 'bg-secondary-fixed text-on-secondary-container';
      case 'rejected': return 'bg-error-container text-on-error-container';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  // UI Trạng thái Loading / Lỗi
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">progress_activity</span>
        <p className="text-on-surface-variant font-medium">Đang tải hồ sơ ứng viên...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
        <h2 className="text-2xl font-bold font-headline mb-2">Không tìm thấy hồ sơ</h2>
        <p className="text-on-surface-variant mb-6">{error}</p>
        <button onClick={() => router.push('/applications')} className="bg-primary text-white px-6 py-2 rounded-xl font-bold">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const initialLetter = application.user.name.charAt(0).toUpperCase();

  return (
    <>
      <button onClick={() => router.back()} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-6 text-sm font-bold w-fit">
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Quay lại danh sách
      </button>

      {/* ================= PROFILE HEADER SECTION ================= */}
      <section className="bg-surface-container-lowest rounded-3xl p-8 mb-8 relative overflow-hidden shadow-[0px_10px_40px_rgba(0,89,187,0.06)] border border-outline-variant/10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-container/10 to-transparent pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-primary text-white flex items-center justify-center font-headline font-black text-5xl shadow-lg border-4 border-surface-container-lowest">
                {initialLetter}
              </div>
              <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold font-headline uppercase tracking-wider shadow-sm border-2 border-white ${getStatusColor(application.status)}`}>
                {statusOptions.find((o) => o.value === application.status)?.label || application.status}
              </div>
            </div>
            
            {/* Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black font-headline text-on-surface mb-2 tracking-tight">{application.user.name}</h1>
              <p className="text-xl font-medium text-primary mb-4 truncate max-w-lg">Ứng tuyển: {application.job.title}</p>
              <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant font-medium">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-lg">mail</span> {application.user.email}</span>
                {application.user.phone && (
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-lg">call</span> {application.user.phone}</span>
                )}
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-lg">calendar_today</span> Nộp ngày: {new Date(application.appliedAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
          
          {/* Action Bar */}
          <div className="flex flex-wrap gap-3">
            <a href={`mailto:${application.user.email}`} className="bg-surface-container-low text-primary px-6 py-3 rounded-xl font-bold font-headline text-sm hover:bg-primary-fixed transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">mail</span> Gửi Email
            </a>
            <a href={application.cvFileUrl} target="_blank" rel="noopener noreferrer" className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold font-headline text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">description</span> Xem CV gốc
            </a>
          </div>
        </div>
      </section>

      {/* ================= BENTO GRID LAYOUT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Tóm tắt Công việc đã ứng tuyển */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-[0px_10px_40px_rgba(0,89,187,0.06)] border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">work</span>
              <h2 className="text-xl font-black font-headline text-on-surface">Thông tin vị trí ứng tuyển</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Vị trí</p>
                  <p className="font-bold text-on-surface">{application.job.title}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-outline uppercase tracking-wider mb-1">Công ty</p>
                  <p className="font-bold text-on-surface">{application.job.company}</p>
                </div>
              </div>
              <div className="bg-surface-container-low p-4 rounded-xl">
                <p className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Trích lược mô tả công việc</p>
                <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-4">
                  {application.job.description}
                </p>
              </div>
            </div>
          </div>

          {/* Dữ liệu CV (UI Trình diễn cho thiết kế của bạn) */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-[0px_10px_40px_rgba(0,89,187,0.06)] border border-outline-variant/10 opacity-70">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black font-headline text-on-surface">Kinh nghiệm & Kỹ năng</h2>
              <span className="text-xs font-bold text-outline bg-surface-container-high px-3 py-1 rounded-lg">Phân tích từ CV PDF</span>
            </div>
            <div className="p-8 border-2 border-dashed border-outline-variant/30 rounded-2xl text-center">
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">auto_awesome</span>
              <h3 className="font-bold text-on-surface mb-1">Tính năng phân tích CV AI đang phát triển</h3>
              <p className="text-sm text-on-surface-variant">Vui lòng bấm nút "Xem CV gốc" ở phía trên để đọc chi tiết hồ sơ của ứng viên.</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* CARD: CẬP NHẬT TRẠNG THÁI (STATUS UPDATER) */}
          <div className="bg-gradient-to-br from-primary to-primary-container rounded-3xl p-8 text-on-primary shadow-xl shadow-primary/20">
            <h2 className="text-xl font-black font-headline mb-6">Quản lý Trạng thái</h2>
            
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-white/80">Cập nhật tiến trình ứng viên</label>
              <div className="relative">
                <select
                  value={selectedStatus || ''}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={isUpdating}
                  className="w-full bg-white/10 border-2 border-white/20 rounded-xl p-4 text-white font-bold outline-none appearance-none focus:bg-white/20 transition-all cursor-pointer [&>option]:text-on-surface"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
              </div>
              
              <button
                onClick={() => setShowConfirmModal(true)}
                disabled={isUpdating || selectedStatus === application.status}
                className="w-full py-4 mt-2 bg-white text-primary rounded-xl font-black font-headline hover:bg-opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
              >
                {isUpdating ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : <span className="material-symbols-outlined">save</span>}
                {isUpdating ? 'Đang lưu...' : 'Lưu trạng thái'}
              </button>
            </div>
          </div>

          {/* CARD: HÀNH ĐỘNG NHANH */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-[0px_10px_40px_rgba(0,89,187,0.06)] border border-outline-variant/10">
            <h2 className="text-lg font-black font-headline text-on-surface mb-6">Hành động nhanh</h2>
            <div className="space-y-3">
              <a href={application.cvFileUrl} download target="_blank" className="w-full flex items-center justify-between p-4 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low hover:border-primary/30 transition-all group">
                <span className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Tải PDF xuống máy</span>
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">download</span>
              </a>
              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low hover:border-primary/30 transition-all group">
                <span className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">Lên lịch phỏng vấn</span>
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">event</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-xl border border-outline-variant/20 hover:bg-error-container/50 hover:border-error/30 transition-all group">
                <span className="font-bold text-sm text-on-surface group-hover:text-error transition-colors">Đánh dấu Spam / Ẩn</span>
                <span className="material-symbols-outlined text-outline group-hover:text-error transition-colors">archive</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Confirm Modal (Giữ nguyên component UI của bạn) */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Xác nhận thay đổi"
        message={`Bạn có chắc chắn muốn cập nhật trạng thái ứng viên thành "${statusOptions.find((o) => o.value === selectedStatus)?.label}"?`}
        confirmText="Đồng ý cập nhật"
        cancelText="Hủy bỏ"
        isLoading={isUpdating}
        onConfirm={handleStatusChange}
        onCancel={() => setShowConfirmModal(false)}
      />
    </>
  );
}