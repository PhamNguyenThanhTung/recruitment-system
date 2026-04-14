'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { InterviewModal } from '@/components/ui/InterviewModal';
// Sửa lại Interface khớp với DB Schema của sếp
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
    // THÊM candidateProfile
    candidateProfile?: {
      skills: string | null; // Sếp đang lưu string
      bio: string | null;
      education: any | null; // Sếp đang lưu jsonb
      experience: any | null; // Sếp đang lưu jsonb
    } | null;
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
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;

  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
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
    { value: 'PENDING', label: 'Chờ xử lý' },
    { value: 'REVIEWING', label: 'Đang xem xét' },
    { value: 'INTERVIEWING', label: 'Phỏng vấn' },
    { value: 'OFFERED', label: 'Mời làm việc' },
    { value: 'REJECTED', label: 'Bị từ chối' },
  ];
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-tertiary-fixed text-on-tertiary-fixed-variant';
      case 'REVIEWING': return 'bg-surface-container-high text-on-surface-variant';
      case 'INTERVIEWING': return 'bg-primary-fixed text-primary';
      case 'OFFERED': return 'bg-secondary-fixed text-on-secondary-container';
      case 'REJECTED': return 'bg-error-container text-on-error-container';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

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

  // Parse JSONB an toàn
  const parseJsonData = (data: any) => {
    if (!data) return null;
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return data; // Trả về text nguyên gốc nếu parse lỗi
      }
    }
    return data;
  };
  // Hàm kích hoạt AI
  const handleAiMatch = async () => {
    setIsAiLoading(true);
    try {
      const response = await fetch(`/api/applications/${applicationId}/ai-match`, {
        method: 'POST',
      });
      const result = await response.json();
      if (result.success) {
        setAiResult(result.data);
      } else {
        alert(result.error || "Lỗi phân tích AI");
      }
    } catch (err) {
      alert("Lỗi kết nối Server");
    } finally {
      setIsAiLoading(false);
    }
  };
  const experienceData = parseJsonData(application.user.candidateProfile?.experience);
  const educationData = parseJsonData(application.user.candidateProfile?.education);

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

          {/* ================= DỮ LIỆU TỪ DB THAY THẾ AI ================= */}
          <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-[0px_10px_40px_rgba(0,89,187,0.06)] border border-outline-variant/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black font-headline text-on-surface">Hồ sơ ứng viên (Profile)</h2>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">Hệ thống</span>
            </div>
          
          
        {/* ================= KHU VỰC AI MATCHING ================= */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 shadow-[0px_10px_40px_rgba(0,0,0,0.03)] border border-indigo-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600">auto_awesome</span>
                <h2 className="text-xl font-black font-headline text-indigo-900">AI Phân tích mức độ phù hợp</h2>
              </div>
              {!aiResult && (
                <button 
                  onClick={handleAiMatch} 
                  disabled={isAiLoading}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isAiLoading ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : "Bắt đầu phân tích"}
                </button>
              )}
            </div>

            {/* Hiển thị kết quả AI */}
            {aiResult && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-indigo-50">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className={`${aiResult.score > 70 ? 'text-emerald-500' : aiResult.score > 40 ? 'text-amber-500' : 'text-rose-500'}`} strokeDasharray={`${aiResult.score}, 100`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute text-2xl font-black text-indigo-900">{aiResult.score}%</div>
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-900 text-lg mb-1">Kết luận từ AI:</h3>
                    <p className="text-sm text-indigo-700/80 leading-relaxed">{aiResult.summary}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <h4 className="text-xs font-black uppercase text-emerald-600 mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">thumb_up</span> Điểm mạnh</h4>
                    <ul className="space-y-1">
                      {aiResult.pros.map((pro: string, i: number) => (
                        <li key={i} className="text-sm text-emerald-800 flex items-start gap-2 before:content-['•'] before:text-emerald-400">{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                    <h4 className="text-xs font-black uppercase text-rose-600 mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">warning</span> Cần lưu ý</h4>
                    <ul className="space-y-1">
                      {aiResult.cons.map((con: string, i: number) => (
                        <li key={i} className="text-sm text-rose-800 flex items-start gap-2 before:content-['•'] before:text-rose-400">{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
            {application.user.candidateProfile ? (
              <div className="space-y-8">
                
                {/* Giới thiệu (Bio) */}
                {application.user.candidateProfile.bio && (
                  <div>
                    <h3 className="text-xs font-bold text-outline uppercase tracking-wider mb-3">Giới thiệu bản thân</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line bg-surface-container-low p-4 rounded-xl">
                      {application.user.candidateProfile.bio}
                    </p>
                  </div>
                )}

                {/* Kỹ năng */}
                <div>
                  <h3 className="text-xs font-bold text-outline uppercase tracking-wider mb-3">Kỹ năng</h3>
                  {application.user.candidateProfile.skills ? (
                    <div className="flex flex-wrap gap-2">
                      {application.user.candidateProfile.skills.split(',').map((skill, idx) => (
                        <span key={idx} className="bg-surface-container-low text-on-surface font-semibold px-4 py-1.5 rounded-xl text-sm border border-outline-variant/20">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-on-surface-variant italic">Chưa cập nhật kỹ năng.</p>
                  )}
                </div>

                <hr className="border-outline-variant/10" />

                {/* Kinh nghiệm */}
                <div>
                  <h3 className="text-xs font-bold text-outline uppercase tracking-wider mb-3">Kinh nghiệm làm việc</h3>
                  {experienceData ? (
                    <div className="space-y-3">
                       {/* Nếu là mảng JSON */}
                      {Array.isArray(experienceData) ? experienceData.map((exp: any, i: number) => (
                        <div key={i} className="bg-surface-container-low p-4 rounded-xl">
                          <p className="font-bold text-on-surface">{exp.title || 'Vị trí công việc'}</p>
                          <p className="text-xs text-primary font-medium mb-2">{exp.company || 'Tên công ty'} • {exp.duration || ''}</p>
                          <p className="text-sm text-on-surface-variant">{exp.description || ''}</p>
                        </div>
                      )) : (
                        /* Nếu là Object hoặc text JSON thường */
                        <pre className="text-sm text-on-surface-variant whitespace-pre-wrap font-body">{JSON.stringify(experienceData, null, 2)}</pre>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-on-surface-variant italic">Chưa cập nhật kinh nghiệm.</p>
                  )}
                </div>

                {/* Học vấn */}
                <div>
                  <h3 className="text-xs font-bold text-outline uppercase tracking-wider mb-3">Học vấn</h3>
                  {educationData ? (
                     <div className="space-y-3">
                     {Array.isArray(educationData) ? educationData.map((edu: any, i: number) => (
                       <div key={i} className="bg-surface-container-low p-4 rounded-xl">
                         <p className="font-bold text-on-surface">{edu.school || 'Trường học'}</p>
                         <p className="text-xs text-primary font-medium mb-2">{edu.degree || 'Bằng cấp'} • {edu.year || ''}</p>
                       </div>
                     )) : (
                       <pre className="text-sm text-on-surface-variant whitespace-pre-wrap font-body">{JSON.stringify(educationData, null, 2)}</pre>
                     )}
                   </div>
                  ) : (
                    <p className="text-sm text-on-surface-variant italic">Chưa cập nhật học vấn.</p>
                  )}
                </div>

              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-outline-variant/30 rounded-2xl text-center">
                <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">person_off</span>
                <h3 className="font-bold text-on-surface mb-1">Ứng viên chưa tạo Profile</h3>
                <p className="text-sm text-on-surface-variant">Vui lòng tải CV gốc về để xem chi tiết thông tin.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* CARD: CẬP NHẬT TRẠNG THÁI */}
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
              
              {/* Sửa lại sự kiện onClick của nút Lưu trạng thái */}
              <button
                onClick={() => {
                  if (selectedStatus === 'INTERVIEWING') {
                    setShowInterviewModal(true); // Bật form lên lịch nếu chọn Phỏng vấn
                  } else {
                    setShowConfirmModal(true);   // Bật modal xác nhận bình thường cho các trạng thái khác
                  }
                }}
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
              {/* Sửa nút Hành động nhanh -> Lên lịch phỏng vấn */}
              <button 
                onClick={() => {
                  setSelectedStatus('INTERVIEWING'); // Chuyển state select sang Phỏng vấn
                  setShowInterviewModal(true);       // Mở modal
                }}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low hover:border-primary/30 transition-all group"
              >
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
      <InterviewModal 
        isOpen={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        applicationId={applicationId}
        onSuccess={() => {
          // Khi API tạo lịch thành công, update giao diện
          setApplication(prev => prev ? { ...prev, status: 'INTERVIEWING' } : null);
          setSelectedStatus('INTERVIEWING');
          alert("Đã gửi email mời phỏng vấn thành công!");
        }}
/>
    </>
  );
}