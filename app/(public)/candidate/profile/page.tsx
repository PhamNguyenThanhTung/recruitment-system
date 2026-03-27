'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast';

/**
 * Trang Hồ sơ Ứng viên - Cập nhật kỹ năng và thông tin cá nhân
 * 
 * Ngữ cảnh: Nơi ứng viên cập nhật kỹ năng, địa chỉ và giới thiệu bản thân.
 * 
 * Tính năng:
 * - Form gồm: Địa chỉ, Kỹ năng (nhập text), Giới thiệu bản thân (textarea)
 * - useEffect fetch GET /api/profile/candidate để load dữ liệu cũ
 * - Submit gọi POST /api/profile/candidate
 * - Thành công: hiển thị Toast màu xanh, giữ nguyên trang (không redirect)
 */
export default function CandidateProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // State quản lý form dữ liệu
  const [formData, setFormData] = useState({
    address: '',
    skills: '',
    bio: '',
  });

  // State quản lý trạng thái submit
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

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

  // ===== useEffect: Fetch dữ liệu hồ sơ ứng viên cũ =====
  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'CANDIDATE') return;
    const fetchCandidateProfile = async () => {
      try {
        setIsFetching(true);
        const response = await fetch('/api/profile/candidate');

        if (!response.ok) {
          // Nếu không tìm thấy profile (404) là bình thường, user mới
          if (response.status !== 404) {
            toast.error('❌ Không thể tải hồ sơ ứng viên');
          }
          setIsFetching(false);
          return;
        }

        const data = await response.json();

        // Nếu có dữ liệu cũ, update vào form
        if (data) {
          setFormData({
            address: data.address || '',
            skills: data.skills || '',
            bio: data.bio || '',
          });
        }

        setIsFetching(false);
      } catch (error) {
        console.error('❌ Lỗi fetch profile:', error);
        toast.error('❌ Lỗi khi tải dữ liệu hồ sơ');
        setIsFetching(false);
      }
    };

    // Chỉ fetch nếu session đã có sẵn
    if (session?.user?.id) {
      fetchCandidateProfile();
    }
  }, [status, session?.user?.id, session?.user?.role]);

  // ===== Handler: Cập nhật giá trị form =====
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ===== Handler: Submit form =====
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // Gọi API POST để cập nhật/tạo hồ sơ
      const response = await fetch('/api/profile/candidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`❌ ${errorData.error || 'Lỗi cập nhật hồ sơ'}`);
        setIsLoading(false);
        return;
      }

      // Thành công: hiển thị toast xanh
      toast.success('✅ Cập nhật hồ sơ thành công!');
      setIsLoading(false);

      // Giữ nguyên trang (không redirect)
    } catch (error) {
      console.error('❌ Lỗi submit form:', error);
      toast.error('❌ Lỗi hệ thống, vui lòng thử lại');
      setIsLoading(false);
    }
  };

  // Hiển thị spinner khi đang fetch dữ liệu
  if (status === 'loading' || (status === 'authenticated' && session?.user?.role !== 'CANDIDATE') || isFetching) {
    return (
      <div className="mx-auto w-full max-w-6xl bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-sm p-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-700 shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-zinc-700 p-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">👤</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Quản lý CV & Profile
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Cập nhật thông tin cá nhân, kỹ năng để tìm được công việc phù hợp
        </p>
      </div>

      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Địa chỉ */}
          <div>
            <Label htmlFor="address" className="text-gray-700 dark:text-gray-300 font-semibold">
              Địa chỉ <span className="text-gray-400 text-sm">(tùy chọn)</span>
            </Label>
            <Input
              id="address"
              name="address"
              type="text"
              placeholder="Nhập địa chỉ của bạn"
              value={formData.address}
              onChange={handleInputChange}
              className="mt-2"
            />
          </div>

          {/* Kỹ năng */}
          <div>
            <Label htmlFor="skills" className="text-gray-700 dark:text-gray-300 font-semibold">
              Kỹ năng <span className="text-gray-400 text-sm">(tùy chọn)</span>
            </Label>
            <Textarea
              id="skills"
              name="skills"
              placeholder="Nhập các kỹ năng của bạn (cách nhau bằng dấu phẩy)"
              value={formData.skills}
              onChange={handleInputChange}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">💡 Ví dụ: React, TypeScript, Node.js, SQL</p>
          </div>

          {/* Giới thiệu bản thân */}
          <div>
            <Label htmlFor="bio" className="text-gray-700 dark:text-gray-300 font-semibold">
              Giới thiệu bản thân <span className="text-gray-400 text-sm">(tùy chọn)</span>
            </Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Viết ngắn gọn về bạn, kinh nghiệm, và mục tiêu sự nghiệp..."
              value={formData.bio}
              onChange={handleInputChange}
              className="mt-2"
            />
          </div>

          {/* Button Submit */}
          <div className="pt-4 flex gap-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang cập nhật...
                </div>
              ) : (
                '💾 Lưu hồ sơ'
              )}
            </Button>
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            📝 Hồ sơ của bạn sẽ được nhà tuyển dụng xem khi bạn nộp đơn ứng tuyển.
          </p>
        </div>
      </div>
    </div>
  );
}
