'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';

// Truyền jobId vào Component này
export default function ReportButton({ jobId }: { jobId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (reason.trim().length < 10) {
      return toast.error("Vui lòng nhập lý do chi tiết hơn (ít nhất 10 ký tự)");
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, reason })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Đã gửi báo cáo thành công!");
        setIsOpen(false);
        setReason(''); // Reset form
      } else {
        toast.error(data.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* NÚT BẤM BÊN NGOÀI */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-red-500 transition-colors mt-4"
      >
        <span className="material-symbols-outlined text-base">flag</span>
        Báo cáo tin lừa đảo
      </button>

      {/* MODAL NHẬP LÝ DO (Chỉ hiện khi isOpen = true) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500">warning</span>
              Báo cáo vi phạm
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">
              Hệ thống sẽ giữ bí mật danh tính của bạn. Vui lòng cho biết lý do bạn cho rằng tin này là lừa đảo hoặc vi phạm nội quy.
            </p>
            
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Công ty này yêu cầu tôi đóng phí 500k trước khi phỏng vấn..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 text-sm resize-none"
              rows={4}
            />

            <div className="flex gap-3 mt-4 justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}