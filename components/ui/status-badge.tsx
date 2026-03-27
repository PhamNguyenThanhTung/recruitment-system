'use client';

import { ReactNode } from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * Component StatusBadge: Hiển thị badge màu theo trạng thái ứng tuyển
 * 
 * Status colors:
 * - pending: vàng (yellow)
 * - reviewed: xanh dương (blue)
 * - interview: tím (purple)
 * - accepted: xanh lá (green)
 * - rejected: đỏ (red)
 */
export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'interview':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      pending: 'Chờ xử lý',
      reviewed: 'Đã xem',
      interview: 'Phỏng vấn',
      accepted: 'Được chấp nhận',
      rejected: 'Bị từ chối',
    };
    return labels[status.toLowerCase()] || status;
  };

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
        border ${getStatusColor(status)} ${className}
      `}
    >
      {getStatusLabel(status)}
    </span>
  );
}

export default StatusBadge;
