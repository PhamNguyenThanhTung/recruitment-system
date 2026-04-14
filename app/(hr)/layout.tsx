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

  // 1. Nếu chưa đăng nhập -> Về Login
  if (!session?.user) redirect("/login");

  // 2. 🔥 SỬA LỖI 1: Cho phép cả HR và ADMIN đi tiếp
  const userRole = session.user.role;
  if (userRole !== "HR" && userRole !== "ADMIN") {
    redirect("/");
  }

  // 3. Lấy profile công ty (Chỉ cần thiết cho HR)
  const companyProfile = await db.companyProfile.findUnique({
    where: { userId: session.user.id },
  });

  // 4. 🔥 SỬA LỖI 2: Chỉ bắt HR điền profile, Admin thì bỏ qua
  if (!companyProfile && userRole === "HR") {
    redirect("/onboarding");
  }

  // Tạo logo mặc định (Dùng tên User nếu là Admin không có Profile)
  const initialLogo = (companyProfile?.companyName || session.user.name || "A").charAt(0).toUpperCase();
  const displayCompanyName = companyProfile?.companyName || "Hệ thống Quản trị";

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* ================= SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-white dark:bg-slate-950 p-4 gap-2 z-40 border-r border-slate-200/50">
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center font-headline font-bold text-xl shrink-0">
            {initialLogo}
          </div>
          <div>
            <h1 className="text-lg font-bold text-blue-700 font-headline line-clamp-1">
               {userRole === "ADMIN" ? "Admin Panel" : "Blue Ocean HR"}
            </h1>
            <p className="text-xs text-on-surface-variant line-clamp-1">{displayCompanyName}</p>
          </div>
        </div>
        
        <SidebarNav /> 
      </aside>

      {/* ... Phần Main Content giữ nguyên ... */}
      <main className="md:ml-64 min-h-screen bg-surface">
         {/* ... (Code Header giữ nguyên) ... */}
         <div className="pt-28 pb-12 px-8 max-w-7xl mx-auto">
           {children}
         </div>
      </main>
      <MobileNav />
    </div>
  );
}