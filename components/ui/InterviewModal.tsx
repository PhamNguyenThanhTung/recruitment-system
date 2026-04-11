'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react'; // 🔥 Thêm cái này để lấy email của sếp

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  onSuccess: () => void;
}

export function InterviewModal({ isOpen, onClose, applicationId, onSuccess }: InterviewModalProps) {
  const { data: session } = useSession(); // Lấy thông tin sếp đang đăng nhập
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    round: 'Vòng 1 - Chuyên môn',
    time: '',
    location: '',
    interviewerEmail: '', // 🔥 Đổi từ Id sang Email
  });

  // Tự động điền email của sếp khi mở Modal
  useEffect(() => {
    if (isOpen && session?.user?.email) {
      setFormData(prev => ({ 
        ...prev, 
        interviewerEmail: session.user.email as string 
      }));
    }
  }, [isOpen, session]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          ...formData
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi lên lịch phỏng vấn');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black font-headline text-on-surface">Lên lịch phỏng vấn</h2>
          <button onClick={onClose} className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors">close</button>
        </div>

        {error && <div className="bg-error-container text-on-error-container p-3 rounded-lg mb-4 text-sm font-bold">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vòng phỏng vấn */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Vòng phỏng vấn</label>
            <input required type="text" value={formData.round} onChange={e => setFormData({...formData, round: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-on-surface outline-none focus:border-primary" placeholder="VD: Vòng 1 - Kỹ thuật" />
          </div>

          {/* Thời gian */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Thời gian</label>
            <input required type="datetime-local" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-on-surface outline-none focus:border-primary" />
          </div>

          {/* Địa điểm */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Địa điểm / Link Online</label>
            <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-on-surface outline-none focus:border-primary" placeholder="VD: Google Meet link hoặc văn phòng công ty" />
          </div>

          {/* 🔥 Ô NHẬP EMAIL (Thay thế cho Select cũ) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Email người phỏng vấn</label>
            <input 
              required 
              type="email" 
              value={formData.interviewerEmail} 
              onChange={e => setFormData({...formData, interviewerEmail: e.target.value})} 
              className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-3 text-on-surface outline-none focus:border-primary" 
              placeholder="nhanvien@congty.com" 
            />
            <p className="text-[10px] text-on-surface-variant mt-1 italic">* Hệ thống sẽ tự động gửi thư mời đến email này.</p>
          </div>

          <div className="flex gap-3 mt-8">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-3 bg-surface-container-high text-on-surface rounded-xl font-bold hover:bg-surface-container-highest transition-colors">Hủy</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
              {isSubmitting ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">send</span>}
              Gửi thư mời
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}