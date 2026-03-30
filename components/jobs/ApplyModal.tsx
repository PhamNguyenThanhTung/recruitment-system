'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileInput } from '@/components/ui/file-input';

interface ApplyModalProps {
  jobId: string;
  jobTitle: string;
  isLoggedIn: boolean;
}

export default function ApplyModal({ jobId, jobTitle, isLoggedIn }: ApplyModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleOpen = () => {
    // Nếu chưa đăng nhập, đá văng ra trang login luôn
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setCvFile(null);
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cvFile) {
      setError('Vui lòng chọn file CV (PDF/DOCX)');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('cvFile', cvFile);

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Lỗi khi nộp đơn. Vui lòng thử lại.');
        return;
      }

      // Nộp đơn thành công
      setSuccess(true);
      setTimeout(() => {
        handleClose();
        router.refresh(); // Refresh lại trang để cập nhật trạng thái "Đã ứng tuyển"
      }, 2000);
    } catch (err) {
      setError('Lỗi kết nối server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Nút Ứng tuyển hiển thị ở trang Detail */}
      <button 
        onClick={handleOpen}
        className="w-full bg-secondary-container text-on-secondary-container font-headline font-extrabold py-4 rounded-xl mb-4 transition-all hover:brightness-105 active:scale-95 duration-200 shadow-lg flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined">send</span>
        Ứng tuyển ngay
      </button>

      {/* Lớp nền đen mờ & Bảng Modal (Chỉ hiện khi isOpen = true) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 font-headline">Nộp hồ sơ ứng tuyển</h3>
              <button onClick={handleClose} className="text-gray-400 hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Nội dung Modal */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Vị trí ứng tuyển:</p>
                <p className="font-bold text-blue-600 line-clamp-2">{jobTitle}</p>
              </div>

              {success ? (
                <div className="flex flex-col items-center justify-center py-6 text-center animate-in slide-in-from-bottom-4">
                  <span className="material-symbols-outlined text-6xl text-green-500 mb-4">check_circle</span>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Tuyệt vời!</h4>
                  <p className="text-gray-600 text-sm">Hồ sơ của bạn đã được gửi tới nhà tuyển dụng.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                      <span className="material-symbols-outlined text-[18px]">error</span>
                      <span>{error}</span>
                    </div>
                  )}

                  <FileInput
                    label="Tải lên CV của bạn"
                    helperText="Hỗ trợ PDF, DOCX (Tối đa 4MB)"
                    acceptedTypes={['.pdf', '.docx', '.doc']}
                    maxSize={4 * 1024 * 1024}
                    onFileSelect={(file) => {
                      setCvFile(file);
                      setError(null);
                    }}
                  />

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || !cvFile}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="material-symbols-outlined animate-spin">progress_activity</span>
                          Đang gửi...
                        </>
                      ) : (
                        'Nộp CV'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}