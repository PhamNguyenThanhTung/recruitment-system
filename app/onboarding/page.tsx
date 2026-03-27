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
 * Trang Onboarding cho HR - Cập nhật thông tin công ty
 * 
 * Ngữ cảnh: Khi HR đăng nhập lần đầu, họ phải vào đây để nhập tên công ty.
 * 
 * Tính năng:
 * - Form gồm: Tên công ty (bắt buộc), Địa chỉ (bắt buộc), Website (tùy chọn), Mô tả (textarea)
 * - useEffect fetch GET /api/profile/company để load dữ liệu cũ (nếu có)
 * - Submit gọi POST /api/profile/company
 * - Thành công: hiển thị Toast xanh, redirect tới /admin-jobs
 */
export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // State quản lý form dữ liệu
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    website: '',
    description: '',
  });

  // State quản lý trạng thái submit
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // ===== useEffect 1: Kiểm tra session và role =====
  useEffect(() => {
    // Nếu chưa tải xong session
    if (status === 'loading') return;

    // Nếu chưa đăng nhập, redirect về /login
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    // Nếu đăng nhập nhưng không phải HR, redirect về /
    if (session?.user?.role !== 'HR') {
      router.push('/');
      return;
    }
  }, [status, session, router]);

  // ===== useEffect 2: Fetch dữ liệu hồ sơ công ty cũ =====
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        setIsFetching(true);
        const response = await fetch('/api/profile/company');

        if (!response.ok) {
          // Nếu không tìm thấy profile (404) là bình thường, user mới
          if (response.status !== 404) {
            toast.error('❌ Không thể tải hồ sơ công ty');
          }
          setIsFetching(false);
          return;
        }

        const data = await response.json();

        // Nếu có dữ liệu cũ, update vào form
        if (data) {
          setFormData({
            companyName: data.companyName || '',
            address: data.address || '',
            website: data.website || '',
            description: data.description || '',
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
      fetchCompanyProfile();
    }
  }, [session?.user?.id]);

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

    // Validated dữ liệu bắt buộc
    if (!formData.companyName.trim()) {
      toast.error('❌ Tên công ty không được để trống');
      return;
    }

    if (!formData.address.trim()) {
      toast.error('❌ Địa chỉ không được để trống');
      return;
    }

    try {
      setIsLoading(true);

      // Gọi API POST để cập nhật/tạo hồ sơ
      const response = await fetch('/api/profile/company', {
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
      toast.success('✅ Cập nhật hồ sơ công ty thành công!');

      // Redirect tới dashboard sau 1 giây
      setTimeout(() => {
        window.location.href = '/admin-jobs';
      }, 1000);
    } catch (error) {
      console.error('❌ Lỗi submit form:', error);
      toast.error('❌ Lỗi hệ thống, vui lòng thử lại');
      setIsLoading(false);
    }
  };

  // Hiển thị spinner khi đang fetch dữ liệu
  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🏢 Hồ sơ công ty</h1>
          <p className="text-gray-600 mt-2">Vui lòng cập nhật thông tin công ty để bắt đầu đăng tin tuyển dụng</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên công ty */}
          <div>
            <Label htmlFor="companyName" className="text-gray-700 font-semibold">
              Tên công ty <span className="text-red-500">*</span>
            </Label>
            <Input
              id="companyName"
              name="companyName"
              type="text"
              placeholder="Nhập tên công ty"
              value={formData.companyName}
              onChange={handleInputChange}
              required
              className="mt-2"
            />
          </div>

          {/* Địa chỉ */}
          <div>
            <Label htmlFor="address" className="text-gray-700 font-semibold">
              Địa chỉ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              name="address"
              type="text"
              placeholder="Nhập địa chỉ công ty"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="mt-2"
            />
          </div>

          {/* Website */}
          <div>
            <Label htmlFor="website" className="text-gray-700 font-semibold">
              Website <span className="text-gray-400 text-sm">(tùy chọn)</span>
            </Label>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={handleInputChange}
              className="mt-2"
            />
          </div>

          {/* Mô tả */}
          <div>
            <Label htmlFor="description" className="text-gray-700 font-semibold">
              Mô tả công ty <span className="text-gray-400 text-sm">(tùy chọn)</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Nhập mô tả về công ty..."
              value={formData.description}
              onChange={handleInputChange}
              className="mt-2"
            />
          </div>

          {/* Button Submit */}
          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang cập nhật...
                </div>
              ) : (
                '💾 Lưu và tiếp tục'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
