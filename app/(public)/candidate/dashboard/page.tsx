'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2, ExternalLink, Briefcase } from 'lucide-react';
import Link from 'next/link';

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
 * 
 * Tính năng:
 * - Gọi API /api/applications/my để lấy danh sách ứng tuyển
 * - Hiển thị status badge cho từng đơn
 * - Loading spinner, empty state, error state
 * - Liên kết nhanh đến job detail
 */
export default function CandidateDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (session?.user?.role !== 'CANDIDATE') {
      router.push('/');
    }
  }, [status, session, router]);

  // Fetch candidate's applications
  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'CANDIDATE') return;
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
  }, [status, session?.user?.role]);

  if (status === 'loading' || (status === 'authenticated' && session?.user?.role !== 'CANDIDATE')) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      pending: { text: 'Đang chờ', class: 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-400' },
      reviewed: { text: 'Nhà tuyển dụng đã xem', class: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-400' },
      interview: { text: 'Phỏng vấn', class: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-400' },
      accepted: { text: 'Trúng tuyển', class: 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-400' },
      rejected: { text: 'Từ chối', class: 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-400' },
    };
    const badge = statusMap[status] || statusMap.pending;
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badge.class}`}>{badge.text}</span>;
  };

  return (
    <div className="mx-auto w-full max-w-6xl bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-zinc-700 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Việc làm đã ứng tuyển
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Theo dõi trạng thái các đơn ứng tuyển của bạn
        </p>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && applications.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Chưa có đơn ứng tuyển
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Hãy khám phá những công việc hấp dẫn và gửi đơn ứng tuyển của bạn
            </p>
            <Link
              href="/jobs"
              className="inline-block px-6 py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              💼 Tìm việc ngay
            </Link>
          </div>
        )}

        {/* Applications List */}
        {!isLoading && applications.length > 0 && (
          <div className="space-y-3">
            {applications.map((application) => (
              <div
                key={application.id}
                className="border border-gray-100 dark:border-zinc-800 p-4 rounded-xl hover:shadow-md dark:hover:bg-zinc-800 transition flex flex-col md:flex-row justify-between md:items-center gap-4 group"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-blue-700 dark:text-blue-400 group-hover:text-blue-800 dark:group-hover:text-blue-300 truncate">
                    {application.job.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    {application.job.company}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    📍 {application.job.location} • Ngày nộp: {formatDate(application.appliedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(application.status)}
                  <Link
                    href={`/jobs/${application.jobId}`}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Xem chi tiết công việc"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
