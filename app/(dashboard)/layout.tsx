import * as React from "react";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Dashboard Layout - Dành cho khu vực quản lý của HR
 * 
 * Tất cả trang nằm trong thư mục (dashboard) sẽ:
 * 1. Kiểm tra authentication (đã đăng nhập chưa)
 * 2. Kiểm tra role (phải là HR)
 * 3. Kiểm tra CompanyProfile (đã onboarding chưa)
 * 4. Hiển thị HRHeader (thanh điều hướng của HR)
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // ===== Kiểm tra xem người dùng đã đăng nhập chưa =====
  if (!session?.user) {
    redirect("/login");
  }

  // ===== Kiểm tra role: Chỉ HR được vào dashboard =====
  if (session.user.role !== "HR") {
    redirect("/");
  }

  // ===== Kiểm tra CompanyProfile: HR phải onboard trước =====
  const companyProfile = await db.companyProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true }, // Chỉ lấy id để học hiệu quả
  });

  // Nếu chưa có companyProfile, redirect tới /onboarding
  if (!companyProfile) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex gap-6 md:gap-10">
            <Link href="/admin-jobs" className="flex items-center space-x-2">
              <span className="text-xl font-bold">RecruitSync</span>
            </Link>
            <nav className="hidden gap-6 md:flex">
              <Link
                href="/admin-jobs"
                className="flex items-center text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                My Jobs
              </Link>
              <Link
                href="/admin-jobs/new"
                className="flex items-center text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Post a Job
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">
                {session?.user?.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {session?.user?.role === "HR" ? "Employer" : "User"}
              </p>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                Log out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto py-8 px-4">{children}</div>
      </main>
    </div>
  );
}
