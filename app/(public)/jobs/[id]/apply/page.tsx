'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileInput } from '@/components/ui/file-input';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  requirements?: string;
}

/**
 * Page: /jobs/[id]/apply
 * Form nộp đơn ứng tuyển cho một job cụ thể
 */
export default function JobApplyPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (!response.ok) {
          setError('Công việc không tồn tại');
          return;
        }
        const data = await response.json();
        setJob(data.data);
      } catch (err) {
        setError('Lỗi khi tải thông tin công việc');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!cvFile) {
      setError('Vui lòng chọn file CV');
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
        setError(data.error || 'Lỗi khi nộp đơn');
        return;
      }

      // Nộp đơn thành công
      
      setSuccess(true);
      setTimeout(() => {
        router.back(); // Lệnh này sẽ đưa user về đúng trang họ vừa xem trước đó
      }, 2000);
    } catch (err) {
      setError('Lỗi server. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Đang tải thông tin công việc...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'Công việc không tồn tại'}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Nộp đơn thành công!
          </h2>
          <p className="text-gray-600 mb-4">
            Đơn ứng tuyển của bạn đã được gửi. Bạn sẽ được chuyển hướng trong
            giây lát...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Job Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {job.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-gray-600 text-sm mb-4">
            <span>📍 {job.location}</span>
            <span>🏢 {job.company}</span>
            {job.salary && <span>💰 {job.salary}</span>}
          </div>

          <div className="prose prose-sm max-w-none">
            <h3 className="font-semibold text-gray-900 mt-4 mb-2">Mô tả công việc</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>

            {job.requirements && (
              <>
                <h3 className="font-semibold text-gray-900 mt-4 mb-2">Yêu cầu</h3>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {job.requirements}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Apply Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Nộp đơn ứng tuyển</h2>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <FileInput
              label="Tải lên CV của bạn"
              helperText="PDF hoặc DOCX, tối đa 4MB"
              acceptedTypes={['.pdf', '.docx', '.doc']}
              maxSize={4 * 1024 * 1024}
              onFileSelect={(file) => {
                setCvFile(file);
                setError(null);
              }}
            />

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || !cvFile}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang gửi...' : 'Nộp đơn'}
              </Button>
              <Button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 rounded-lg transition disabled:opacity-50"
              >
                Hủy
              </Button>
            </div>
          </form>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Bằng cách nộp đơn, bạn đồng ý với điều khoản và chính sách bảo mật
            của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
}
