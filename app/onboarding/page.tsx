'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    website: '',
    description: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // ===== BẢO VỆ TUYẾN =====
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (session?.user?.role !== 'HR') {
      router.push('/');
      return;
    }
  }, [status, session, router]);

  // ===== KÉO DỮ LIỆU CŨ =====
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        setIsFetching(true);
        const response = await fetch('/api/profile/company');

        if (!response.ok) {
          if (response.status !== 404) toast.error('❌ Không thể tải hồ sơ công ty');
          setIsFetching(false);
          return;
        }

        const data = await response.json();
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
        toast.error('❌ Lỗi khi tải dữ liệu hồ sơ');
        setIsFetching(false);
      }
    };

    if (session?.user?.id) fetchCompanyProfile();
  }, [session?.user?.id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.companyName.trim()) {
      toast.error('Tên công ty không được để trống');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Địa chỉ không được để trống');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/profile/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(`${errorData.error || 'Lỗi cập nhật hồ sơ'}`);
        setIsLoading(false);
        return;
      }

      toast.success('Thiết lập hồ sơ thành công!');
      
      // Ép tải lại toàn bộ app để Layout bốc được Avatar công ty mới
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (error) {
      toast.error('Lỗi hệ thống, vui lòng thử lại');
      setIsLoading(false);
    }
  };

  // MÀN HÌNH LOADING
  if (isFetching || status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface text-primary">
        <span className="material-symbols-outlined animate-spin text-5xl mb-4">progress_activity</span>
        <p className="font-headline font-bold">Đang tải dữ liệu không gian làm việc...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-surface font-body text-on-surface">
      
      {/* ================= LEFT SIDE: FORM CANVAS ================= */}
      <main className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative overflow-y-auto bg-surface">
        
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-lg mx-auto py-10">
          
          <div className="mb-10">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">
              Bước 1 / 1
            </span>
            <h1 className="font-headline font-black text-3xl md:text-4xl text-on-surface tracking-tight mb-2">Hồ sơ Doanh nghiệp</h1>
            <p className="text-on-surface-variant text-sm">Vui lòng cung cấp thông tin công ty để ứng viên có thể hiểu rõ hơn về nơi làm việc tương lai của họ.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Input Tên công ty */}
            <div className="space-y-2">
              <label className="block font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="companyName">
                Tên Doanh nghiệp <span className="text-error">*</span>
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">corporate_fare</span>
                <input 
                  name="companyName"
                  id="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder="VD: Ocean Tech Solutions" 
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 focus:border-primary focus:ring-0 focus:shadow-[0px_10px_40px_rgba(0,89,187,0.06)] transition-all outline-none text-on-surface placeholder:text-outline/50" 
                />
              </div>
            </div>

            {/* Input Địa chỉ */}
            <div className="space-y-2">
              <label className="block font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="address">
                Địa chỉ trụ sở <span className="text-error">*</span>
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">location_on</span>
                <input 
                  name="address"
                  id="address"
                  type="text"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder="VD: Tòa nhà A, Quận B, TP. Hà Nội" 
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 focus:border-primary focus:ring-0 focus:shadow-[0px_10px_40px_rgba(0,89,187,0.06)] transition-all outline-none text-on-surface placeholder:text-outline/50" 
                />
              </div>
            </div>

            {/* Input Website */}
            <div className="space-y-2">
              <label className="block font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="website">
                Website <span className="text-outline-variant normal-case font-medium">(Tùy chọn)</span>
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">language</span>
                <input 
                  name="website"
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder="https://example.com" 
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 focus:border-primary focus:ring-0 focus:shadow-[0px_10px_40px_rgba(0,89,187,0.06)] transition-all outline-none text-on-surface placeholder:text-outline/50" 
                />
              </div>
            </div>
            
            {/* Input Mô tả */}
            <div className="space-y-2">
              <label className="block font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="description">
                Giới thiệu về công ty <span className="text-outline-variant normal-case font-medium">(Tùy chọn)</span>
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-[24px] -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">description</span>
                <textarea 
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  placeholder="Công ty chúng tôi chuyên về..." 
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 focus:border-primary focus:ring-0 focus:shadow-[0px_10px_40px_rgba(0,89,187,0.06)] transition-all outline-none text-on-surface placeholder:text-outline/50 resize-y min-h-[120px]" 
                ></textarea>
              </div>
            </div>
            
            {/* Nút Submit */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full mt-4 py-4 px-6 rounded-xl bg-primary text-on-primary font-headline font-bold text-lg shadow-[0px_10px_30px_rgba(0,89,187,0.2)] hover:shadow-[0px_15px_40px_rgba(0,89,187,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:transform-none disabled:shadow-none flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Đang lưu hồ sơ...
                </>
              ) : (
                <>
                  Lưu & Bắt đầu tuyển dụng
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* ================= RIGHT SIDE: EDITORIAL CANVAS ================= */}
      <aside className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container">
          <img 
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" 
            className="w-full h-full object-cover mix-blend-overlay opacity-40 grayscale" 
            alt="Office Teamwork" 
          />
        </div>
        
        <div className="relative h-full flex flex-col justify-center p-24 text-white">
          
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-lg mb-8 border border-white/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-secondary text-white flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-2xl">campaign</span>
              </div>
              <div>
                <p className="font-headline font-extrabold text-xl">Thương hiệu Tuyển dụng</p>
                <p className="text-xs font-label uppercase tracking-widest text-white/70 font-bold">Employer Branding</p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm font-medium leading-relaxed opacity-90">
                "Hồ sơ công ty đầy đủ và chuyên nghiệp giúp tăng <strong>70%</strong> tỷ lệ ứng viên quyết định nộp đơn vào các vị trí bạn đang mở tuyển."
              </p>
            </div>
          </div>
          
          <h3 className="font-headline font-black text-5xl leading-tight mb-6">
            Thu hút <br/>
            <span className="text-secondary-fixed">Nhân tài hàng đầu.</span>
          </h3>
          <p className="text-lg text-white/80 leading-relaxed max-w-md font-medium">
            Thiết lập không gian làm việc của bạn trên RecruitSync để kết nối với những ứng viên xuất sắc nhất.
          </p>
          
          {/* Vòng tròn trang trí */}
          <div className="absolute top-24 right-24 w-64 h-64 border-[32px] border-white/5 rounded-full pointer-events-none"></div>
        </div>
      </aside>
    </div>
  );
}