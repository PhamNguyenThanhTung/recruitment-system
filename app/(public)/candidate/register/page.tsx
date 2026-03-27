'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

/**
 * Page: /candidate/register
 * Form đăng ký tài khoản Candidate
 */
export default function CandidateRegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Gọi API đăng ký
      const response = await fetch('/api/candidates/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Đăng ký thất bại');
        return;
      }

      // Đăng ký thành công, chuyển tới trang đăng nhập
      router.push('/login');
    } catch (err) {
      setError('Lỗi server. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-lg shadow-md border border-gray-200">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Đăng ký Ứng viên</h1>
          <p className="text-gray-600 text-sm mt-2">
            Tạo tài khoản để nộp đơn ứng tuyển
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-gray-700">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-gray-700">
              Mật khẩu
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Tối thiểu 6 ký tự
            </p>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-gray-700">
              Họ và tên
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Nguyễn Văn A"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          {/* Phone (Optional) */}
          <div>
            <Label htmlFor="phone" className="text-gray-700">
              Số điện thoại (tùy chọn)
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="0901234567"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
          </Button>
        </form>

        {/* Login Link */}
        <div className="text-center text-sm text-gray-600">
          Đã có tài khoản?{' '}
          <Link
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
