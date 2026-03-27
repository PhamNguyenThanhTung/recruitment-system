'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { AlertCircle, ArrowLeft } from 'lucide-react';

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

/**
 * Page: /applications
 * Hiển thị danh sách ứng tuyển cho HR
 * Hỗ trợ filter theo jobId và status
 */
export default function ApplicationsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterJobId, setFilterJobId] = useState(searchParams.get('jobId') || '');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');

  // Fetch applications
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

  // Fetch jobs for filter dropdown
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
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'reviewed', label: 'Đã xem' },
    { value: 'interview', label: 'Phỏng vấn' },
    { value: 'accepted', label: 'Được chấp nhận' },
    { value: 'rejected', label: 'Bị từ chối' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
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
            Quản lý và xem chi tiết các đơn ứng tuyển
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Job Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo công việc
              </label>
              <select
                value={filterJobId}
                onChange={(e) => setFilterJobId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả công việc</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} - {job.company}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-600">Đang tải danh sách ứng tuyển...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && applications.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600">Không có ứng tuyển nào phù hợp.</p>
          </div>
        )}

        {/* Applications Table */}
        {!isLoading && applications.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Ứng viên
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Công việc
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Ngày nộp
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr
                    key={application.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {application.user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {application.user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {application.job.title}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={application.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(application.appliedAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        onClick={() => router.push(`/applications/${application.id}`)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Xem chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
