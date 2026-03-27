'use client';

import { Toaster } from 'react-hot-toast';

/**
 * Toast Provider Component
 * 
 * Component này sử dụng react-hot-toast để hiển thị thông báo (toast messages) trên toàn bộ ứng dụng.
 * Nó phải là Client Component để có thể sử dụng Toaster.
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Thời gian mặc định: toast tự động biến mất sau 4 giây
        duration: 4000,
        // Style mặc định cho toast
        style: {
          background: '#fff',
          color: '#333',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
        // Chia cắt style cho success, error, loading toast
        success: {
          duration: 3000,
          style: {
            background: '#10b981',
            color: '#fff',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        },
        loading: {
          style: {
            background: '#3b82f6',
            color: '#fff',
          },
        },
      }}
    />
  );
}
