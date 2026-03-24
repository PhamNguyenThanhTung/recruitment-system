import * as React from "react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import EditJobForm from "./EditJobForm";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const job = await db.job.findUnique({
    where: { id },
  });

  if (!job) {
    notFound();
  }

  if (job.userId !== session.user.id) {
    redirect("/admin-jobs");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Job</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Update the job details below.</p>
      </div>

      <EditJobForm job={job} />
    </div>
  );
}
