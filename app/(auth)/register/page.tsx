"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation"; // 🔥 Thêm useSearchParams
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); // 🔥 Lấy "radar" bắt link
  
  // 🔥 MỚI: Bóc tách dữ liệu từ Google gửi sang (nếu có)
  const googleEmail = searchParams.get("email");
  const googleName = searchParams.get("name");
  const isGoogle = searchParams.get("provider") === "google";

  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  
  const [role, setRole] = React.useState<"HR" | "CANDIDATE">("CANDIDATE");
  const [phone, setPhone] = React.useState<string>("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = (formData.get("email") as string) || (googleEmail as string);
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          // 🔥 Nếu là Google thì gửi password là undefined hoặc null
          password: isGoogle ? undefined : password, 
          name,
          role, 
          phone: phone || undefined, 
          // Gửi thêm flag để backend biết đây là user Google
          isGoogle: isGoogle 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Đăng ký thất bại");
      } else {
        // Đăng ký xong đá sang login để họ vào bằng Google lại phát nữa cho chắc
        router.push("/login?message=registered");
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
      <main className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 relative overflow-hidden bg-surface">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 w-full max-w-md mx-auto">
          <button onClick={() => router.push('/')} className="mb-8 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm font-bold w-fit">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Quay lại trang chủ
          </button>

          <div className="mb-10">
            {/* 🔥 MỚI: Đổi tiêu đề nếu là Google */}
            <h1 className="font-headline font-bold text-3xl md:text-4xl text-on-surface tracking-tight mb-2">
              {isGoogle ? "Hoàn tất đăng ký" : "Tạo tài khoản mới"}
            </h1>
            <p className="text-on-surface-variant text-sm">
              {isGoogle ? `Chào ${googleName}, chọn vai trò của bạn để bắt đầu.` : "Tham gia mạng lưới tuyển dụng hàng đầu hiện nay."}
            </p>
          </div>

          {error && (
            <div className="p-4 mb-6 bg-error-container text-on-error-container rounded-xl text-sm font-bold flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Chọn Role */}
            <div className="space-y-3 mb-6">
              <label className="block font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant ml-1">Bạn là ai?</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("CANDIDATE")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${role === "CANDIDATE" ? "border-primary bg-primary/5 text-primary" : "border-outline-variant/30 text-on-surface-variant bg-surface-container-lowest"}`}
                >
                  <span className="material-symbols-outlined text-3xl mb-2">work</span>
                  <span className="font-bold text-sm">Ứng viên</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("HR")}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${role === "HR" ? "border-primary bg-primary/5 text-primary" : "border-outline-variant/30 text-on-surface-variant bg-surface-container-lowest"}`}
                >
                  <span className="material-symbols-outlined text-3xl mb-2">corporate_fare</span>
                  <span className="font-bold text-sm">Nhà tuyển dụng</span>
                </button>
              </div>
            </div>

            {/* Input Name */}
            <div className="space-y-2">
              <label className="block font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="name">Họ và Tên</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">person</span>
                <input 
                  name="name" id="name" type="text" required disabled={isLoading}
                  defaultValue={googleName || ""} // 🔥 Tự điền tên từ Google
                  placeholder="VD: Nguyễn Văn A" 
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 focus:border-primary focus:ring-0 transition-all outline-none text-on-surface" 
                />
              </div>
            </div>

            {/* Input Email */}
            <div className="space-y-2">
              <label className="block font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="email">Địa chỉ Email</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
                <input 
                  name="email" id="email" type="email" required disabled={isLoading || isGoogle}
                  defaultValue={googleEmail || ""} // 🔥 Tự điền email từ Google
                  readOnly={isGoogle} // 🔥 Khóa luôn không cho sửa email nếu dùng Google
                  placeholder="name@example.com" 
                  className={`w-full pl-12 pr-4 py-4 rounded-xl border border-outline-variant/15 focus:border-primary focus:ring-0 transition-all outline-none text-on-surface ${isGoogle ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-surface-container-lowest'}`} 
                />
              </div>
            </div>
            
            {/* Input Password - 🔥 ẨN ĐI NẾU LÀ GOOGLE */}
            {!isGoogle && (
              <div className="space-y-2">
                <label className="block font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="password">Mật khẩu</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
                  <input 
                    name="password" id="password" type={showPassword ? "text" : "password"}
                    required={!isGoogle} disabled={isLoading}
                    placeholder="••••••••" 
                    className="w-full pl-12 pr-12 py-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 focus:border-primary focus:ring-0 transition-all outline-none text-on-surface" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface">
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Input Phone */}
            <div className="space-y-2">
              <label className="block font-label font-bold text-xs uppercase tracking-widest text-on-surface-variant ml-1" htmlFor="phone">Số điện thoại (Tùy chọn)</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">call</span>
                <input 
                  name="phone" id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isLoading}
                  placeholder="09xx xxx xxx" 
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-surface-container-lowest border border-outline-variant/15 focus:border-primary focus:ring-0 transition-all outline-none text-on-surface" 
                />
              </div>
            </div>
            
            <button type="submit" disabled={isLoading} className="w-full mt-4 py-4 px-6 rounded-xl bg-primary text-on-primary font-headline font-bold text-lg shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 flex justify-center items-center gap-2">
              {isLoading ? "Đang xử lý..." : isGoogle ? "Hoàn tất thiết lập" : "Đăng ký tài khoản"}
            </button>
          </form>
          
          <footer className="mt-12 text-center lg:text-left">
            <p className="text-sm text-on-surface-variant">
              Đã có tài khoản? <Link href="/login" className="text-primary font-bold hover:underline">Đăng nhập tại đây</Link>
            </p>
          </footer>
        </div>
      </main>

      {/* ASIDE RIGHT GIỮ NGUYÊN */}
      <aside className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container">
          <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover mix-blend-overlay opacity-50 grayscale" alt="Team" />
        </div>
        <div className="relative h-full flex flex-col justify-end p-24 text-white">
          <h3 className="font-headline font-black text-5xl leading-tight mb-6">Bắt đầu Hành trình <br/><span className="text-secondary-fixed">Sự nghiệp của bạn.</span></h3>
          <p className="text-lg text-white/80 leading-relaxed max-w-md font-medium">Tạo tài khoản để mở khóa cơ hội việc làm hoặc tìm kiếm nhân tài cho doanh nghiệp.</p>
        </div>
      </aside>
    </div>
  );
}