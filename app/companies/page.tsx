import * as React from "react";
import { db } from "@/lib/db";
import Link from "next/link";
import { JobStatus } from "@prisma/client";

export default async function CompaniesPage() {
  // 1. Kéo danh sách các Công ty từ bảng Job 
  // Lấy unique theo tên công ty, đếm số job OPEN và lấy logo
  const rawCompanies = await db.job.groupBy({
    by: ['company'],
    _count: {
      id: true, // Để đếm tổng số Job
    },
    _max: {
      companyLogoUrl: true, // Lấy đại diện 1 cái Logo
      location: true,       // Lấy đại diện 1 cái địa chỉ
      description: true,    // Lấy đại diện 1 cái mô tả
    },
    where: {
      status: JobStatus.OPEN // Chỉ tính các công ty đang có job mở
    },
    orderBy: {
      _count: {
        id: 'desc', // Hiện ông nào nhiều việc làm lên đầu
      },
    },
  });

  // 2. Map lại dữ liệu cho sạch sẽ để dùng trong giao diện
  const companies = rawCompanies.map((item) => ({
    id: item.company,
    companyName: item.company,
    logoUrl: item._max.companyLogoUrl,
    location: item._max.location || "Việt Nam",
    description: item._max.description,
    openJobsCount: item._count.id
  }));

  return (
    <main className="min-h-screen bg-surface pb-20">
      {/* HEADER SECTION */}
      <section className="bg-primary pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black headline-font text-white mb-6">
            Khám phá <span className="text-secondary-fixed">Nhà tuyển dụng</span>
          </h1>
          <p className="text-lg text-white/80 font-medium mb-10">
            Tìm kiếm cơ hội nghề nghiệp tại những đơn vị hàng đầu đang tin dùng hệ thống của chúng tôi.
          </p>
          
          <div className="bg-white p-2 rounded-full flex items-center shadow-xl max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-slate-400 pl-4 pr-2">domain</span>
            <input 
              type="text" 
              placeholder="Nhập tên công ty sếp muốn tìm..." 
              className="flex-1 bg-transparent border-none outline-none py-3 text-slate-700 font-medium"
            />
            <button className="bg-secondary-fixed text-on-secondary-fixed px-8 py-3 rounded-full font-bold hover:brightness-105 transition-all">
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* DANH SÁCH CÔNG TY */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-outline">Đối tác chiến lược</span>
            <h2 className="text-3xl font-black font-headline text-on-surface mt-2">Nhà tuyển dụng tiêu biểu</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => {
            return (
              <Link 
                href={`/jobs?q=${encodeURIComponent(company.companyName)}`} 
                key={company.id}
              >
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-outline-variant/10 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer h-full flex flex-col">
                  
                  {/* LOGO CÔNG TY */}
                  <div className="w-16 h-16 bg-surface-container-high rounded-2xl flex items-center justify-center shrink-0 overflow-hidden text-primary font-bold text-2xl font-headline mb-4 border border-outline-variant/10">
                    {company.logoUrl ? (
                      <img 
                        src={company.logoUrl} 
                        alt={company.companyName} 
                        className="w-full h-full object-contain p-1" 
                      />
                    ) : (
                      // Nếu không có ảnh thì hiện chữ cái đầu như sếp muốn
                      company.companyName.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Thông tin công ty */}
                  <div className="flex-1">
                    <h3 className="text-xl font-black headline-font text-on-surface group-hover:text-primary transition-colors mb-2">
                      {company.companyName}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase rounded-lg border border-slate-100 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">location_on</span> {company.location.split(',')[0]}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {company.description || "Công ty đang tìm kiếm những ứng viên tài năng gia nhập đội ngũ..."}
                    </p>
                  </div>

                  {/* Nút xem job */}
                  <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-primary font-black text-sm flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 
                      {company.openJobsCount} vị trí đang tuyển
                    </span>
                    <span className="material-symbols-outlined text-outline group-hover:text-primary group-hover:translate-x-1 transition-all">arrow_forward</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}