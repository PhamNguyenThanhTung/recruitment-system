'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface Application {
  id: string;
  jobId: string;
  status: string;
  appliedAt: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
  };
}

/**
 * Page: /candidate/dashboard
 * Hiển thị danh sách ứng tuyển của Candidate
 */
export default function CandidateDashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch candidate's applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/applications/my');
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
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Danh sách ứng tuyển</h1>
          <p className="text-gray-600 mt-2">
            Theo dõi trạng thái các đơn ứng tuyển của bạn
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-600">Đang tải danh sách ứng tuyển...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && applications.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">
              Bạn chưa nộp đơn ứng tuyển cho công việc nào.
            </p>
            <Button
              onClick={() => router.push('/jobs')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              Xem công việc phù hợp
            </Button>
          </div>
        )}

        {/* Applications List */}
        {!isLoading && applications.length > 0 && (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {application.job.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {application.job.company} • {application.job.location}
                    </p>
                  </div>
                  <StatusBadge status={application.status} className="ml-4" />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-500">
                    Nộp lúc: {formatDate(application.appliedAt)}
                  </span>
                  <Button
                    onClick={() =>
                      router.push(`/jobs/${application.jobId}`)
                    }
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
