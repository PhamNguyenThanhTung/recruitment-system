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
  // ===== State để lưu tên công ty và địa chỉ từ CompanyProfile =====
  const [companyData, setCompanyData] = React.useState({ name: "Đang tải...", address: "Đang tải..." });

  // ===== useEffect: Fetch dữ liệu CompanyProfile từ API =====
  React.useEffect(() => {
    async function fetchCompanyProfile() {
      try {
        const res = await fetch('/api/profile/company');
        if (res.ok) {
          const profile = await res.json();
          if (profile) {
            setCompanyData({ 
              name: profile.companyName, 
              address: profile.address 
            });
          }
        }
      } catch (error) {
        console.error("❌ Lỗi lấy thông tin công ty:", error);
      }
    }
    
    fetchCompanyProfile();
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    // ===== Công ty và địa chỉ sẽ tự động lấy từ CompanyProfile =====
    const data = {
      title: formData.get("title"),
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
        {/* ===== THÔNG BÁO TỰ ĐỘNG: HỆ THỐNG LẤY CÔNG TY VÀ ĐỊA ĐIỂM TỪ HỒ SƠ ===== */}
        <div className="p-4 mb-6 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900">
          <div className="flex items-start gap-3">
            <span className="text-lg">💡</span>
            <div>
              <strong>Lưu ý:</strong> Tên công ty và Địa điểm làm việc sẽ được hệ thống <strong>tự động lấy từ Hồ sơ Công ty</strong> của bạn để gắn vào tin tuyển dụng này.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <div className="space-y-2">
            <Label htmlFor="company" className="text-zinc-700 dark:text-zinc-300">Tên công ty</Label>
            <Input 
              id="company" 
              name="company" 
              value={companyData.name}
              readOnly
              disabled
              className="bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-not-allowed font-semibold" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="text-zinc-700 dark:text-zinc-300">Địa điểm làm việc</Label>
            <Input 
              id="location" 
              name="location" 
              value={companyData.address}
              readOnly
              disabled
              className="bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 cursor-not-allowed font-semibold" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input id="title" name="title" placeholder="Senior Software Engineer" required disabled={isLoading} />
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
