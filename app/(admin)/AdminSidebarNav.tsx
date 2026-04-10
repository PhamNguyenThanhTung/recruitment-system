'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const adminMenu = [
  {
    title: "Tổng quan",
    icon: "dashboard",
    href: "/admin",
  },
  {
    title: "Duyệt tin (Pending)",
    icon: "fact_check",
    href: "/admin/jobs",
  },
  {
    title: "Người dùng",
    icon: "group",
    href: "/admin/users",
  },
  {
    title: "Báo cáo vi phạm",
    icon: "report",
    href: "/admin/reports",
  },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-2 mt-4">
      <p className="text-[10px] font-black text-slate-500 px-3 py-2 uppercase tracking-widest">
        Hệ thống Quản trị
      </p>
      
      {adminMenu.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
              isActive 
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            }`}
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}