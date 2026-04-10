import * as React from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebarNav as SidebarNav } from "./AdminSidebarNav"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="bg-slate-50 font-body text-slate-900 min-h-screen">
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-slate-900 text-white p-4 gap-4 z-40 shadow-xl">
        <div className="mb-8 px-2 flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-lg bg-red-500 text-white flex items-center justify-center font-headline font-bold text-xl">
            A
          </div>
          <div>
            <h1 className="text-lg font-bold font-headline">Admin Panel</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Hệ thống quản trị</p>
          </div>
        </div>
        
        {/* 🔥 SỬA CHỖ NÀY: Gọi cái SidebarNav ra thì menu mới hiện lên sếp nhé */}
        <SidebarNav /> 

      </aside>

      <main className="md:ml-64 min-h-screen">
        

        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}