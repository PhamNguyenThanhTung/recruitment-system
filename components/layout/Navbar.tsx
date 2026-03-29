"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import HeaderSearch from "@/components/layout/HeaderSearch"; // Thanh search lúc nãy mình tạo

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-sm font-body">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* LÒNG TRÁI: Logo + Thanh tìm kiếm */}
        <div className="flex items-center flex-1 gap-4 lg:gap-8">
          <Link href="/">
            <h1 className="text-2xl md:text-3xl font-black text-primary font-headline tracking-tight">
              RecruitSync.
            </h1>
          </Link>

          {/* THANH TÌM KIẾM SẼ NẰM Ở ĐÂY */}
          <div className="hidden md:block flex-1 max-w-md">
             <HeaderSearch />
          </div>
        </div>

        {/* LÒNG PHẢI: Menu & Auth */}
        <nav className="flex items-center gap-4 lg:gap-8">
          <Link href="/jobs" className="hidden md:block text-sm font-bold text-slate-600 hover:text-primary transition-colors">
            Việc làm
          </Link>
          <Link href="/companies" className="hidden lg:block text-sm font-bold text-slate-600 hover:text-primary transition-colors">
            Công ty
          </Link>

          {/* KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP */}
          {status === "loading" ? (
            <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse"></div>
          ) : session?.user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
              
              {/* Nếu là HR -> Đi tới Dashboard, Nếu là Ứng viên -> Đi tới Profile */}
              <Link href={session.user.role === "HR" ? "/hr/dashboard" : "/candidate/profile"}>
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold overflow-hidden border-2 border-transparent hover:border-primary transition-all cursor-pointer shadow-sm">
                  {session.user.image ? (
                    <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    session.user.name?.charAt(0).toUpperCase()
                  )}
                </div>
              </Link>
              
              {/* Nút Đăng xuất */}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="material-symbols-outlined text-slate-400 hover:text-red-500 transition-colors bg-slate-50 p-2 rounded-full"
                title="Đăng xuất"
              >
                logout
              </button>
            </div>
          ) : (
            // NẾU CHƯA ĐĂNG NHẬP
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <Link href="/login">
                <button className="text-sm font-bold text-slate-600 hover:text-primary px-3 py-2 transition-colors">
                  Đăng nhập
                </button>
              </Link>
              <Link href="/register">
                <button className="text-sm font-bold bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95">
                  Đăng ký
                </button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}