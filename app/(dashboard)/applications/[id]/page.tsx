'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { AlertCircle, ArrowLeft, Download, ExternalLink } from 'lucide-react';

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

/**
 * Page: /applications/[id]
 * Hiển thị chi tiết ứng tuyển cho HR
 * Cho phép cập nhật trạng thái
 */
export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params.id as string;

  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch application details
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/applications/${applicationId}`);
        if (!response.ok) {
          setError('Ứng tuyển không tồn tại');
          return;
        }
        const data = await response.json();
        setApplication(data);
        setSelectedStatus(data.status);
      } catch (err) {
        setError('Lỗi khi tải chi tiết ứng tuyển');
        console.error(err);
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
      const response = await fetch(
        `/api/applications/${applicationId}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: selectedStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Lỗi khi cập nhật trạng thái');
        return;
      }

      setApplication(data);
      setShowConfirmModal(false);
    } catch (err) {
      setError('Lỗi server. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

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
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'reviewed', label: 'Đã xem' },
    { value: 'interview', label: 'Phỏng vấn' },
    { value: 'accepted', label: 'Được chấp nhận' },
    { value: 'rejected', label: 'Bị từ chối' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Đang tải chi tiết ứng tuyển...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">{error || 'Ứng tuyển không tồn tại'}</p>
        </div>
      </div>
    );
  }

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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Ứng tuyển của {application.user.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Cho vị trí {application.job.title}
              </p>
            </div>
            <StatusBadge status={application.status} />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin ứng viên</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Họ và tên</p>
                  <p className="font-medium text-gray-900">{application.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <a
                    href={`mailto:${application.user.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {application.user.email}
                  </a>
                </div>
                {application.user.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Số điện thoại</p>
                    <a
                      href={`tel:${application.user.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {application.user.phone}
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Ngày nộp</p>
                  <p className="text-gray-900">{formatDate(application.appliedAt)}</p>
                </div>
              </div>
            </div>

            {/* Job Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông tin công việc</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Vị trí</p>
                  <p className="font-medium text-gray-900">{application.job.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Công ty</p>
                  <p className="text-gray-900">{application.job.company}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mô tả công việc</p>
                  <p className="text-gray-700 whitespace-pre-wrap text-sm">
                    {application.job.description}
                  </p>
                </div>
              </div>
            </div>

            {/* CV File */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">File CV</h2>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 font-bold text-xs">PDF</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">CV.pdf</p>
                  <p className="text-sm text-gray-600">Cloudinary</p>
                </div>
                <a
                  href={application.cvFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition"
                >
                  <Download className="w-4 h-4" />
                  Tải xuống
                </a>
                <a
                  href={application.cvFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-900 font-medium rounded-lg transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Xem
                </a>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Update */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Cập nhật trạng thái</h2>
              <div className="space-y-3">
                <select
                  value={selectedStatus || ''}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={isUpdating}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <Button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={isUpdating || selectedStatus === application.status}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Hành động</h2>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition">
                  Gửi email
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition">
                  Lên lịch phỏng vấn
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Cập nhật trạng thái ứng tuyển"
        message={`Bạn có chắc chắn muốn thay đổi trạng thái thành "${
          statusOptions.find((o) => o.value === selectedStatus)?.label
        }"?`}
        confirmText="Cập nhật"
        cancelText="Hủy"
        isLoading={isUpdating}
        onConfirm={handleStatusChange}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
}
