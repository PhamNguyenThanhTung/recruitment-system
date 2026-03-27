import * as React from "react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const job = await db.job.findUnique({
    where: { id },
  });

  if (!job || job.status !== "Open") {
    notFound();
  }

  // ===== LOGIC KIỂM TRA ROLE =====
  // HR không được xem nút Apply (vì HR không self-apply job của mình)
  // Candidate và Guest có thể xem nút Apply
  const canApply = !session || session.user?.role === "CANDIDATE";

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white dark:bg-zinc-950 dark:border-zinc-800">
        <div className="container mx-auto h-16 flex items-center justify-between px-4">
          <Link href="/" className="font-bold text-xl">RecruitSync</Link>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Post a Job</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-zinc-50 dark:bg-zinc-950 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/" className="text-sm text-blue-600 hover:underline mb-8 block">
            ← Back to all jobs
          </Link>

          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-8 border-b dark:border-zinc-800">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-bold">{job.title}</h1>
                  <p className="text-xl text-zinc-600 dark:text-zinc-400 mt-2">{job.company}</p>
                  <div className="flex flex-wrap gap-4 mt-6 text-sm">
                    <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">{job.location}</div>
                    {job.salary && <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">{job.salary}</div>}
                    <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {/* ===== NÚT APPLY: CHỈ HIỆN KHI CANDIDATE HOẶC GUEST ===== */}
                {canApply && (
                  <Link href={`/jobs/${job.id}/apply`} className="md:w-auto w-full">
                    <Button size="lg" className="w-full md:w-auto">
                      Apply Now
                    </Button>
                  </Link>
                )}

                {/* ===== HIỂN THỊ THÔNG BÁO NẾU LÀ HR ===== */}
                {!canApply && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-200 rounded-lg text-sm font-medium">
                    ℹ️ Bạn là HR, không thể tự ứng tuyển
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 space-y-8">
              <section>
                <h2 className="text-xl font-bold mb-4">Description</h2>
                <div className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                  {job.description}
                </div>
              </section>

              {job.requirements && (
                <section>
                  <h2 className="text-xl font-bold mb-4">Requirements</h2>
                  <div className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                    {job.requirements}
                  </div>
                </section>
              )}

              {job.deadline && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl text-sm font-medium">
                  Application Deadline: {new Date(job.deadline).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-12 bg-white dark:bg-zinc-950 dark:border-zinc-800">
        <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
          <p>© 2026 RecruitSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
