"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewJobPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const data = {
      title: formData.get("title"),
      company: formData.get("company"),
      location: formData.get("location"),
      salary: formData.get("salary"),
      status: formData.get("status"),
      description: formData.get("description"),
      requirements: formData.get("requirements"),
      deadline: formData.get("deadline") || undefined,
    };

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Something went wrong");
      } else {
        router.push("/admin-jobs");
        router.refresh();
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Post a New Job</h1>
        <p className="text-zinc-500 dark:text-zinc-400">Fill in the details to create a new job opening.</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-sm border dark:border-zinc-800 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input id="title" name="title" placeholder="Senior Software Engineer" required disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input id="company" name="company" placeholder="Acme Inc." required disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" placeholder="Remote / Hanoi, Vietnam" required disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary">Salary Range</Label>
            <Input id="salary" name="salary" placeholder="$2000 - $4000" disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Application Deadline</Label>
            <Input id="deadline" name="deadline" type="date" disabled={isLoading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
              disabled={isLoading}
            >
              <option value="Draft">Draft</option>
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Job Description</Label>
          <textarea
            id="description"
            name="description"
            rows={5}
            className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
            required
            disabled={isLoading}
          ></textarea>
        </div>

        <div className="space-y-2">
          <Label htmlFor="requirements">Requirements (Optional)</Label>
          <textarea
            id="requirements"
            name="requirements"
            rows={5}
            className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
            disabled={isLoading}
          ></textarea>
        </div>

        {error && (
          <p className="text-sm text-red-500 font-medium">{error}</p>
        )}

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Posting..." : "Create Job"}
          </Button>
        </div>
      </form>
    </div>
  );
}
