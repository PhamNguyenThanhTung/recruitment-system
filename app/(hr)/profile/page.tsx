import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import CompanyProfileForm from "@/components/forms/CompanyProfileForm";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "HR") redirect("/login");

  // Kéo dữ liệu công ty cũ lên để nhét vào form
  const profile = await db.companyProfile.findUnique({
    where: { userId: session.user.id }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold font-headline tracking-tight text-gray-900">Thông tin Công ty</h1>
        <p className="text-gray-500 mt-2 text-sm">Cập nhật hồ sơ doanh nghiệp. Thông tin này sẽ tự động đính kèm vào các tin tuyển dụng của bạn.</p>
      </div>
      
      <CompanyProfileForm initialData={profile} />
    </div>
  );
}