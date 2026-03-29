"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

/**
 * Public Layout - Đã tối ưu Avatar tròn và xóa bỏ các thành phần thừa
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Logic định tuyến khi bấm vào Avatar
  const getProfileHref = () => {
    if (session?.user?.role === "HR") return "/dashboard";
    return "/candidate/profile";
  };

  return (
    <div className="bg-surface font-body text-on-surface selection:bg-secondary-container">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass-nav shadow-[0px_10px_40px_rgba(0,89,187,0.06)]">
        <div className="flex justify-between items-center px-8 py-4 w-full max-w-full mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-black tracking-tight text-blue-700 dark:text-blue-400 font-headline">
              Blue Ocean HR
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className={`font-headline font-semibold text-sm py-1 transition-colors ${
                  pathname === "/" 
                  ? "text-blue-700 border-b-2 border-blue-600" 
                  : "text-slate-500 hover:text-blue-600"
                }`}
              >
                Find Jobs
              </Link>
              {/* Các link thừa đã được xóa bỏ tại đây */}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-5">
                {/* Nút Đăng xuất thiết kế lại nhỏ gọn hơn */}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hidden md:block text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-error transition-colors"
                >
                  Log out
                </button>

                {/* Avatar tròn lộng lẫy */}
                <Link href={getProfileHref()}>
                  <div className="group relative">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-headline font-bold text-lg shadow-lg border-2 border-white group-hover:scale-105 group-active:scale-95 transition-all cursor-pointer overflow-hidden">
                      {session.user?.image ? (
                        <img src={session.user.image} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        session.user?.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    {/* Tooltip nhỏ khi hover */}
                    <div className="absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap font-bold">
                      Trang cá nhân
                    </div>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <button className="text-slate-600 font-headline font-semibold text-sm hover:text-blue-500 transition-colors px-4 py-2">
                    Sign In
                  </button>
                </Link>
                <Link href="/register">
                  <button className="bg-primary hover:bg-primary-container text-white px-6 py-2.5 rounded-xl font-headline font-semibold text-sm shadow-lg active:scale-95 duration-200 transition-all">
                    Post a Job
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>
    </div>
  );
}