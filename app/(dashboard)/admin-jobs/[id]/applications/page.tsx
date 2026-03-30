import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function JobApplicationsListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  // 1. Chỉ cho phép HR
  if (!session || session.user.role !== "HR") {
    redirect("/login");
  }

  // 2. Kéo dữ liệu Job và Ứng viên
  const job = await db.job.findUnique({
    where: { id },
    include: {
      applications: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { appliedAt: "desc" }, // Sắp xếp người nộp mới nhất lên đầu
      },
    },
  });

  if (!job || job.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold font-headline text-gray-900 tracking-tight">Danh sách Ứng viên</h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">
            Vị trí: <span className="font-bold text-primary">{job.title}</span> • Có <span className="font-bold">{job.applications.length}</span> hồ sơ
          </p>
        </div>
        <Link href="/admin-jobs" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Quay lại
        </Link>
      </div>

      {/* Bảng Danh Sách Ứng Viên */}
      <div className="bg-white rounded-2xl shadow-[0px_10px_40px_rgba(0,89,187,0.06)] overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Ứng viên</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Ngày nộp</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">CV / Resume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {job.applications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-5xl text-gray-300">inbox</span>
                      <p className="font-medium mt-2">Chưa có ứng viên nào nộp hồ sơ cho vị trí này.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                job.applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Thông tin ứng viên */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold font-headline">
                          {app.user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">{app.user.name || "Ứng viên ẩn danh"}</span>
                          <span className="text-xs text-gray-500 mt-0.5">{app.user.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Ngày nộp */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(app.appliedAt).toLocaleDateString("vi-VN")}
                      </span>
                    </td>

                    {/* Trạng thái (Tạm thời chỉ hiển thị text, bài sau sẽ làm dropdown sửa status) */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase bg-gray-100 text-gray-600 border border-gray-200">
                        {app.status}
                      </span>
                    </td>

                    {/* Nút Xem CV */}
                    <td className="px-6 py-4 text-right">
                    {app.cvFileUrl ? (
                        <a 
                        href={app.cvFileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-bold text-sm transition-colors border border-blue-100"
                        >
                        <span className="material-symbols-outlined text-[18px]">description</span>
                        Xem CV
                        </a>
                    ) : (
                        <span className="text-xs text-gray-400 italic">Không có CV</span>
                    )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}