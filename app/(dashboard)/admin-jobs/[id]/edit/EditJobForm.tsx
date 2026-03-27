"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

export default function EditJobForm({ job }: { job: any }) {
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
      // Không gửi company và location vì API đã loại bỏ
      salary: formData.get("salary"),
      status: formData.get("status"),
      description: formData.get("description"),
      requirements: formData.get("requirements"),
      deadline: formData.get("deadline") || null,
    };

    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Something went wrong");
      } else {
        toast.success("Cập nhật thành công!");
        router.push("/admin-jobs");
        router.refresh();
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function onDelete() {
    if (!confirm("Bạn có chắc muốn xóa tin này?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.message || "Failed to delete");
      } else {
        toast.success("Đã xóa tin tuyển dụng");
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
    <form onSubmit={onSubmit} className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-sm border dark:border-zinc-800 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Job Title</Label>
          <Input id="title" name="title" defaultValue={job.title} required disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company Name</Label>
          <Input
            id="company"
            name="company"
            defaultValue={job.company}
            disabled={true}
            className="bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400">Thông tin công ty được quản lý trong hồ sơ công ty</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            defaultValue={job.location}
            disabled={true}
            className="bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400">Địa chỉ được lấy từ hồ sơ công ty</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="salary">Salary Range</Label>
          <Input id="salary" name="salary" defaultValue={job.salary} disabled={isLoading} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Application Deadline</Label>
          <Input
            id="deadline"
            name="deadline"
            type="date"
            defaultValue={job.deadline ? new Date(job.deadline).toISOString().split("T")[0] : ""}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={job.status}
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
          defaultValue={job.description}
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
          defaultValue={job.requirements}
          className="flex w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
          disabled={isLoading}
        ></textarea>
      </div>

      {error && (
        <p className="text-sm text-red-500 font-medium">{error}</p>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="danger" onClick={onDelete} disabled={isLoading}>
          Delete Job
        </Button>
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}