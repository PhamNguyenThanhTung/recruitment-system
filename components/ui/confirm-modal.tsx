'use client';

import { AlertCircle } from 'lucide-react';
import { useCallback } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isDangerous?: boolean; // Thay đổi color scheme nếu là action nguy hiểm
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Component ConfirmModal: Modal xác nhận hành động
 * 
 * Sử dụng:
 * - Xác nhận thay đổi trạng thái ứng tuyển
 * - Xác nhận hành động nguy hiểm
 */
export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  isLoading = false,
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm mx-4 p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <AlertCircle
            className={`w-6 h-6 flex-shrink-0 ${
              isDangerous ? 'text-red-600' : 'text-blue-600'
            }`}
          />
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>

        {/* Message */}
        <p className="text-gray-600 text-sm mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded transition disabled:opacity-50 disabled:cursor-not-allowed ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
