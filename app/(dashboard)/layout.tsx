import * as React from "react";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SidebarNav, MobileNav } from "./DashboardNav"; // <--- IMPORT TỪ FILE MỚI

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "HR") redirect("/");

  const companyProfile = await db.companyProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!companyProfile) redirect("/onboarding");

  const initialLogo = companyProfile.companyName.charAt(0).toUpperCase();

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* ================= SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-white dark:bg-slate-950 font-label font-medium text-sm p-4 gap-2 z-40 border-r border-slate-200/50 dark:border-slate-800 shadow-[2px_0_20px_rgba(0,0,0,0.02)]">
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-headline font-bold text-xl shrink-0">
            {initialLogo}
          </div>
          <div>
            <h1 className="text-lg font-bold text-blue-700 font-headline line-clamp-1">Blue Ocean HR</h1>
            <p className="text-xs text-on-surface-variant line-clamp-1">{companyProfile.companyName}</p>
          </div>
        </div>
        
        {/* MENU ĐỘNG TỪ CLIENT COMPONENT */}
        <SidebarNav /> 
        
        <div className="mt-auto flex flex-col gap-1 border-t border-slate-200/50 dark:border-slate-800 pt-4">
          <Link href="/admin-jobs/new">
            <button className="w-full py-3 px-4 mb-4 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0px_10px_20px_rgba(0,89,187,0.15)] hover:scale-[1.02] active:scale-95 transition-all">
              <span className="material-symbols-outlined text-sm">add</span>
              Tạo Job mới
            </button>
          </Link>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
            <button type="submit" className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 hover:text-error transition-colors rounded-lg hover:bg-red-50">
              <span className="material-symbols-outlined">logout</span>
              Đăng xuất
            </button>
          </form>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="md:ml-64 min-h-screen bg-surface">
        <header className="fixed top-0 right-0 left-0 md:left-64 h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-30 flex items-center justify-between px-8 shadow-[0px_10px_40px_rgba(0,89,187,0.06)] border-b border-slate-200/50 dark:border-slate-800">
          <div className="flex flex-col">
            <h2 className="font-headline font-bold text-xl tracking-tight text-primary">Recruiter Portal</h2>
            <p className="text-xs text-on-surface-variant font-medium">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-full bg-surface-container-low text-on-surface-variant relative">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              
              <div className="flex items-center gap-3 border-l border-outline-variant/15 pl-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold leading-none">{session?.user?.name}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">HR Manager</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-secondary text-white font-bold flex items-center justify-center shadow-inner shrink-0">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="pt-28 pb-12 px-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* MENU MOBILE ĐỘNG TỪ CLIENT COMPONENT */}
      <MobileNav />
    </div>
  );
}