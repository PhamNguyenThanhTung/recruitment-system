"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarNav() {
  const pathname = usePathname();

  
const navItems = [
  { href: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { href: "/admin-jobs", icon: "work", label: "Quản lý Việc làm" },
  { href: "/applications", icon: "group", label: "Ứng viên" },
  { href: "/profile", icon: "apartment", label: "Hồ sơ Công ty" }, // 👈 THÊM DÒNG NÀY VÀO ĐÂY
];

  return (
    <nav className="flex flex-col gap-1 grow">
      {navItems.map((item) => {
        // Thuật toán kiểm tra Active: Đúng trang đó, HOẶC đang ở trang con (như /admin-jobs/new)
        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold duration-150 transition-all ${
              isActive
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 w-full h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-outline-variant/10 flex items-center justify-around px-4 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <Link href="/dashboard" className={`flex flex-col items-center gap-1 ${pathname === '/dashboard' ? 'text-primary' : 'text-on-surface-variant'}`}>
        <span className="material-symbols-outlined">dashboard</span>
      </Link>
      <Link href="/admin-jobs" className={`flex flex-col items-center gap-1 ${pathname.startsWith('/admin-jobs') && pathname !== '/admin-jobs/new' ? 'text-primary' : 'text-on-surface-variant'}`}>
        <span className="material-symbols-outlined">work</span>
      </Link>
      <Link href="/admin-jobs/new" className="-mt-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
        <span className="material-symbols-outlined">add</span>
      </Link>
      <Link href="/applications" className={`flex flex-col items-center gap-1 ${pathname.startsWith('/applications') ? 'text-primary' : 'text-on-surface-variant'}`}>
        <span className="material-symbols-outlined">group</span>
      </Link>
      <Link href="/profile" className={`flex flex-col items-center gap-1 ${pathname.startsWith('/profile') ? 'text-primary' : 'text-on-surface-variant'}`}>
        <span className="material-symbols-outlined">apartment</span>
      </Link>
    </nav>
    
  );
}