import * as React from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q: query } = await searchParams;
  
  const jobs = await db.job.findMany({
    where: {
      status: 'Open',
      ...(query && {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { company: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar được render bởi PublicLayout - không cần inline header nữa */}

      <main className="flex-1 bg-zinc-50 dark:bg-zinc-950">
        <section className="bg-blue-600 py-20 text-white">
          <div className="container mx-auto px-4 text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Find your next dream job</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Explore thousands of job opportunities from top companies around the world.
            </p>
            <div className="max-w-2xl mx-auto">
              <form action="/" method="GET" className="flex gap-2">
                <Input
                  name="q"
                  placeholder="Job title, keywords, or company..."
                  defaultValue={query}
                  className="bg-white text-zinc-900 h-12"
                />
                <Button type="submit" size="lg" className="bg-zinc-900 hover:bg-zinc-800 text-white">
                  Search
                </Button>
              </form>
            </div>
          </div>
        </section>

        <section className="container mx-auto py-12 px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">{query ? `Results for "${query}"` : "Latest Job Openings"}</h2>
            <p className="text-zinc-500">{jobs.length} jobs found</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {jobs.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-zinc-900 border rounded-xl">
                <p className="text-zinc-500">No open jobs found matching your criteria.</p>
              </div>
            ) : (
              jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="block bg-white dark:bg-zinc-900 p-6 rounded-xl border hover:border-blue-500 transition-all shadow-sm group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold group-hover:text-blue-600 transition-colors">{job.title}</h3>
                      <div className="flex flex-wrap gap-4 mt-2 text-zinc-600 dark:text-zinc-400 text-sm">
                        <span className="font-medium text-zinc-900 dark:text-zinc-200">{job.company}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                        {job.salary && (
                          <>
                            <span>•</span>
                            <span>{job.salary}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-zinc-500">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-white dark:bg-zinc-950 dark:border-zinc-800">
        <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
          <p>© 2026 RecruitSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
