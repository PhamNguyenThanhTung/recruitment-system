"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  
  // State quản lý form
  const [role, setRole] = React.useState<"HR" | "CANDIDATE">("CANDIDATE");
  const [phone, setPhone] = React.useState<string>("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password, 
          name,
          role, 
          phone: phone || undefined, 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Đăng ký thất bại");
      } else {
        router.push("/login");
      }
    } catch (err) {
      setError("Lỗi server. Vui lòng thử lại sau.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-surface font-body text-on-surface">
      
      {/* ================= LEFT SIDE: FORM CANVAS ================= */}
      <main className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative overflow-hidden bg-surface">
        
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-md mx-auto">
          
          <button onClick={() => router.push('/')} className="mb-8 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-bold w-fit">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Quay lại trang chủ
          </button>

          <div className="mb-10">
            <h1 className="font-headline font-bold text-3xl md:text-4xl text-on-surface tracking-tight mb-2">Tạo tài khoản mới</h1>
            <p className="text-on-surface-variant text-sm">Tham gia mạng lưới tuyển dụng hàng đầu hiện nay.</p>
          </div>

          {error && (
            <div className="p-4 mb-6 bg-error-container text-on-error-container rounded-xl text-sm font-bold flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            
            {/* Chọn Role (Custom Radio Cards) */}
            <div className="space-y-3 mb-6">
              <label className="block font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant ml-1">
                Bạn là ai?
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("CANDIDATE")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    role === "CANDIDATE" 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-outline-variant/30 hover:border-primary/50 text-on-surface-variant bg-surface-container-lowest"
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl mb-2">work</span>
                  <span className="font-bold text-sm">Ứng viên</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setRole("HR")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    role === "HR" 
                    ? "border-primary bg-primary/5 text-primary" 
                    : "border-outline-variant/30 hover:border-primary/50 text-on-surface-variant bg-surface-container-lowest"
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl mb-2">corporate_fare</span>
                  <span className="font-bold text-sm">Nhà tuyển dụng</span>
                </button>
              </div>
            </div>

            {/* Input Name */}
            <div className="space-y-2">
              <label className="block font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="name">
                Họ và Tên
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">person</span>
                <input 
                  name="name"
                  id="name"
                  type="text"
                  required
                  disabled={isLoading}
                  placeholder="VD: Nguyễn Văn A" 
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 focus:border-primary focus:ring-0 focus:shadow-[0px_10px_40px_rgba(0,89,187,0.06)] transition-all outline-none text-on-surface placeholder:text-outline/50" 
                />
              </div>
            </div>

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
                  placeholder="name@example.com" 
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

            {/* Input Phone (Optional) */}
            <div className="space-y-2">
              <label className="block font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="phone">
                Số điện thoại (Tùy chọn)
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">call</span>
                <input 
                  name="phone"
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                  placeholder="09xx xxx xxx" 
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 focus:border-primary focus:ring-0 focus:shadow-[0px_10px_40px_rgba(0,89,187,0.06)] transition-all outline-none text-on-surface placeholder:text-outline/50" 
                />
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
                  Đang tạo tài khoản...
                </>
              ) : (
                "Đăng ký tài khoản"
              )}
            </button>
          </form>
          
          <footer className="mt-12 text-center lg:text-left">
            <p className="text-sm text-on-surface-variant">
              Đã có tài khoản? <Link href="/login" className="text-primary font-bold hover:underline">Đăng nhập tại đây</Link>
            </p>
          </footer>
        </div>
      </main>

      {/* ================= RIGHT SIDE: EDITORIAL CANVAS (Chỉ hiện trên PC) ================= */}
      <aside className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container">
          <img 
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover mix-blend-overlay opacity-50 grayscale" 
            alt="Team Collaboration" 
          />
        </div>
        
        <div className="relative h-full flex flex-col justify-end p-24 text-white">
          
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-lg mb-8 border border-white/20">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-secondary text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">star</span>
              </div>
              <div>
                <p className="font-headline font-extrabold text-xl">Mạng lưới Rộng lớn</p>
                <p className="text-xs font-label uppercase tracking-widest text-white/70 font-bold">10,000+ Doanh nghiệp</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/20">
                <span className="font-bold text-sm">Việc làm mới mỗi ngày</span>
                <span className="px-3 py-1 bg-secondary text-white rounded-full text-xs font-bold">+500 Jobs</span>
              </div>
            </div>
          </div>
          
          <h3 className="font-headline font-black text-5xl leading-tight mb-6">
            Bắt đầu Hành trình <br/>
            <span className="text-secondary-fixed">Sự nghiệp của bạn.</span>
          </h3>
          <p className="text-lg text-white/80 leading-relaxed max-w-md font-medium">
            Tạo tài khoản ngay hôm nay để mở khóa hàng ngàn cơ hội việc làm hoặc tìm kiếm những nhân tài xuất sắc nhất cho doanh nghiệp của bạn.
          </p>
          
          <div className="absolute top-24 right-24 w-64 h-64 border-[32px] border-white/5 rounded-full pointer-events-none"></div>
          <div className="absolute top-48 right-12 w-32 h-32 bg-secondary-fixed/20 rounded-full blur-2xl pointer-events-none"></div>
        </div>
      </aside>
    </div>
  );
}