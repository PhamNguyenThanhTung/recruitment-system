"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  // Giữ nguyên logic xử lý Đăng nhập của bạn
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email hoặc mật khẩu không chính xác.");
        setIsLoading(false);
        return;
      }

      // Hack nhỏ để lấy lại session sau khi đăng nhập (NextAuth v5)
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const session = await res.json();

      // Điều hướng dựa trên Role
      if (session?.user?.role === "HR") {
        window.location.href = "/dashboard"; // Đã trỏ thẳng về trang Analytics mới
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError("Đã có lỗi xảy ra. Vui lòng thử lại!");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-surface font-body text-on-surface">
      
      {/* ================= LEFT SIDE: FORM CANVAS ================= */}
      <main className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative overflow-hidden bg-surface">
        
        {/* Background Accent (Hình mờ góc trên trái) */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-md mx-auto">
          {/* Nút quay lại trang chủ (Bổ sung UX) */}
          <button onClick={() => router.push('/')} className="mb-8 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-bold w-fit">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Quay lại trang chủ
          </button>

          {/* Tiêu đề & Lời chào */}
          <div className="mb-12">
            <h1 className="font-headline font-black text-3xl md:text-4xl tracking-tight text-primary">RecruitSync</h1>
            <p className="mt-2 text-on-surface-variant font-medium">Nền tảng tuyển dụng thông minh thế hệ mới.</p>
          </div>
          
          <div className="space-y-8">
            <div>
              <h2 className="font-headline font-bold text-3xl text-on-surface tracking-tight mb-2">Chào mừng trở lại</h2>
              <p className="text-on-surface-variant text-sm">Đăng nhập để quản lý hồ sơ và tin tuyển dụng của bạn.</p>
            </div>

            {/* BÁO LỖI */}
            {error && (
              <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm font-bold flex items-center gap-3">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
              
              {/* Input Email */}
              <div className="space-y-2">
                <label className="block font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="email">
                  Địa chỉ Email
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                  <input 
                    name="email"
                    id="email"
                    type="email"
                    required
                    disabled={isLoading}
                    placeholder="name@company.com" 
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 focus:border-primary focus:ring-0 focus:shadow-[0px_10px_40px_rgba(0,89,187,0.06)] transition-all outline-none text-on-surface placeholder:text-outline/50" 
                  />
                </div>
              </div>
              
              {/* Input Password */}
              <div className="space-y-2">
                <label className="block font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="password">
                  Mật khẩu
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                  <input 
                    name="password"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoading}
                    placeholder="••••••••" 
                    className="w-full pl-12 pr-12 py-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 focus:border-primary focus:ring-0 focus:shadow-[0px_10px_40px_rgba(0,89,187,0.06)] transition-all outline-none text-on-surface placeholder:text-outline/50" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
              
              {/* Box Checkbox & Quên MK */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" className="peer h-5 w-5 rounded border-outline-variant/30 text-primary focus:ring-primary/20 bg-surface-container-lowest transition-all cursor-pointer" />
                  </div>
                  <span className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface">Ghi nhớ đăng nhập</span>
                </label>
                <a href="#" className="text-sm font-bold text-primary hover:text-primary-container transition-colors">Quên mật khẩu?</a>
              </div>
              
              {/* Nút Submit */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-xl bg-primary text-on-primary font-headline font-bold text-lg shadow-[0px_10px_30px_rgba(0,89,187,0.2)] hover:shadow-[0px_15px_40px_rgba(0,89,187,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:transform-none disabled:shadow-none flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Đang xử lý...
                  </>
                ) : (
                  "Đăng nhập hệ thống"
                )}
              </button>
            </form>
            
            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/15"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-outline bg-surface px-4 w-fit mx-auto">Hoặc</div>
            </div>
            
            {/* Nút Google (Dummy) */}
            <button type="button" className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-surface-container-lowest border border-outline-variant/15 hover:bg-surface-container-low transition-all duration-200 font-bold text-on-surface group">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
              Đăng nhập với Google
            </button>
          </div>
          
          <footer className="mt-16 text-center lg:text-left">
            <p className="text-sm text-on-surface-variant">
              Chưa có tài khoản? <Link href="/register" className="text-primary font-bold hover:underline">Đăng ký ngay</Link>
            </p>
          </footer>
        </div>
      </main>

      {/* ================= RIGHT SIDE: EDITORIAL CANVAS (Chỉ hiện trên PC) ================= */}
      <aside className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-primary">
        {/* Hình nền mờ */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container">
          <img 
            src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop" 
            className="w-full h-full object-cover mix-blend-overlay opacity-60 grayscale" 
            alt="Office Team" 
          />
        </div>
        
        {/* Lớp phủ nội dung */}
        <div className="relative h-full flex flex-col justify-end p-24 text-white">
          
          {/* Thẻ Thống kê bay lơ lửng */}
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-lg mb-8 border border-white/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-secondary text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">verified</span>
              </div>
              <div>
                <p className="font-headline font-extrabold text-xl">Tuyển dụng thông minh</p>
                <p className="text-xs font-label uppercase tracking-widest text-white/70 font-bold">Real-time Pipeline</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/20">
                <span className="font-bold text-sm">Ứng viên tiềm năng</span>
                <span className="px-3 py-1 bg-secondary text-white rounded-full text-xs font-bold">+12 tuần này</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/20">
                <span className="font-bold text-sm">Lịch phỏng vấn</span>
                <span className="px-3 py-1 bg-white text-primary rounded-full text-xs font-bold">8 hôm nay</span>
              </div>
            </div>
          </div>
          
          <h3 className="font-headline font-black text-5xl leading-tight mb-6">
            Định hình lại <br/>
            <span className="text-secondary-fixed">Tương lai Tuyển dụng.</span>
          </h3>
          <p className="text-lg text-white/80 leading-relaxed max-w-md font-medium">
            Hàng nghìn Nhà tuyển dụng và Ứng viên hàng đầu đang sử dụng RecruitSync để kết nối và xây dựng đội ngũ vững mạnh.
          </p>
          
          {/* Các vòng tròn trang trí */}
          <div className="absolute top-24 right-24 w-64 h-64 border-[32px] border-white/5 rounded-full pointer-events-none"></div>
          <div className="absolute top-48 right-12 w-32 h-32 bg-secondary-fixed/20 rounded-full blur-2xl pointer-events-none"></div>
        </div>
      </aside>
    </div>
  );
}