"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { useState } from "react";

/**
 * Public Layout - Dành cho khách ngoài và ứng viên
 * 
 * Tất cả trang nằm trong thư mục (public) sẽ hiển thị Navbar xanh này
 * Ví dụ:
 * - Trang chủ: / → PublicLayout → Navbar + HomePage
 * - Danh sách việc: /jobs → PublicLayout → Navbar + JobsPage
 * - Ứng viên profile: /candidate/* → PublicLayout → Navbar + CandidateLayout
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <span className="text-lg font-bold text-white">R</span>
              </div>
              <span className="hidden font-bold text-gray-900 sm:inline">
                Recruitment System
              </span>
            </Link>

            <div className="hidden items-center gap-6 md:flex">
              {session ? (
                <>
                  {session.user?.role === "HR" ? (
                    <>
                      <Link
                        href="/admin-jobs"
                        className={`rounded-lg px-4 py-2 font-medium transition ${
                          pathname.startsWith("/admin-jobs")
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Manage Jobs
                      </Link>
                      <Link
                        href="/onboarding"
                        className={`rounded-lg px-4 py-2 font-medium transition ${
                          pathname === "/onboarding"
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Company Setup
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/jobs"
                        className={`rounded-lg px-4 py-2 font-medium transition ${
                          pathname.startsWith("/jobs")
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Jobs
                      </Link>
                      <Link
                        href="/candidate/dashboard"
                        className={`rounded-lg px-4 py-2 font-medium transition ${
                          pathname.startsWith("/candidate")
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Profile
                      </Link>
                    </>
                  )}

                  <div className="flex items-center gap-3 border-l border-gray-200 pl-6">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                      <p className="text-xs text-gray-500">{session.user?.role}</p>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Log out
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700"
                >
                  Log in
                </Link>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="text-gray-600 hover:text-gray-900 md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="space-y-2 border-t border-gray-200 py-4 md:hidden">
              {session ? (
                <>
                  {session.user?.role === "HR" ? (
                    <>
                      <Link href="/admin-jobs" className="block rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                        Manage Jobs
                      </Link>
                      <Link href="/onboarding" className="block rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                        Company Setup
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/jobs" className="block rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                        Jobs
                      </Link>
                      <Link href="/candidate/dashboard" className="block rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                        Profile
                      </Link>
                    </>
                  )}
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full rounded-lg px-4 py-2 text-left text-red-600 hover:bg-red-50"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link href="/login" className="block rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-50" onClick={() => setIsMobileMenuOpen(false)}>
                  Log in
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </>
  );
}
