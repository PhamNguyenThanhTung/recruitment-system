import * as React from "react";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-white dark:bg-zinc-950 dark:border-zinc-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex gap-6 md:gap-10">
            <Link href="/admin-jobs" className="flex items-center space-x-2">
              <span className="font-bold text-xl">RecruitSync</span>
            </Link>
            <nav className="flex gap-6">
              <Link
                href="/admin-jobs"
                className="flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                My Jobs
              </Link>
              <Link
                href="/admin-jobs/new"
                className="flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                Post a Job
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400 hidden sm:inline-block">
              {session.user.name} ({ session.user.role })
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button variant="ghost" size="sm">
                Sign out
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
