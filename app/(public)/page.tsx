
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { JobStatus } from "@prisma/client";

export default async function HomePage() {
  const session = await auth();

  // 1. Kéo danh sách việc làm mới nhất (Featured Jobs)
  const featuredJobs = await db.job.findMany({
    where: { status: JobStatus.OPEN },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        include: { companyProfile: true },
      },
    },
  });

  // 2. Đếm số lượng Job cho từng Category (Bằng cách tìm từ khóa trong Title)
  const [designCount, engineerCount, marketingCount] = await Promise.all([
    db.job.count({ where: { status: JobStatus.OPEN, title: { contains: "design", mode: "insensitive" } } }),
    db.job.count({ where: { status: JobStatus.OPEN, title: { contains: "engineer", mode: "insensitive" } } }),
    db.job.count({ where: { status: JobStatus.OPEN, title: { contains: "market", mode: "insensitive" } } })
  ]);

  // 3. Lấy 3 từ khóa phổ biến dựa trên 3 Job mới nhất (để làm gợi ý dưới ô Search)
  const popularKeywords = featuredJobs.slice(0, 3).map(job => {
    // Cắt lấy 2 từ đầu tiên của Title cho ngắn gọn (VD: "Senior Frontend Developer" -> "Senior Frontend")
    return job.title.split(' ').slice(0, 2).join(' ');
  });

// 4. Kéo danh sách các Công ty từ bảng Job (Lấy 5 công ty có nhiều job nhất)
  const rawJobs = await db.job.groupBy({
    by: ['company'],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc', // Sắp xếp theo số lượng job giảm dần
      },
    },
    take: 5,
  });

  // Map lại để giao diện không bị lỗi, thêm kiểu dữ liệu để TS không kêu
  const topCompanies = rawJobs.map((j) => ({
    id: j.company, // Dùng tên công ty làm ID tạm thời
    companyName: j.company,
    logoUrl: null, // Job nhập tay thường không có logo
  }));

  return (
    <div className="flex flex-col min-h-screen bg-surface font-body">
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-container">
          {/* Thay url ảnh nền bằng ảnh của bạn nếu muốn */}
          <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" alt="Hero Background" className="w-full h-full object-cover mix-blend-overlay opacity-20 grayscale" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center lg:text-left flex flex-col items-center lg:items-start">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-headline tracking-tight mb-6 max-w-3xl leading-tight">
            Định hướng <span className="text-secondary-fixed">Sự nghiệp</span><br />Vững bước Tương lai.
          </h1>
          <p className="text-lg md:text-xl text-white/80 font-medium mb-10 max-w-2xl">
            Khám phá hàng ngàn cơ hội việc làm từ các công ty công nghệ và startup đổi mới sáng tạo hàng đầu.
          </p>
        </div>
      </section>

      {/* ================= DYNAMIC CATEGORIES ================= */}
      {/* ================= DYNAMIC CATEGORIES ================= */}
      <section className="max-w-7xl mx-auto px-6 w-full -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Design & Creative */}
          <Link href="/jobs?q=design" className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 flex justify-between items-center group cursor-pointer hover:-translate-y-1 transition-all border border-outline-variant/10">
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface mb-1">Design & Creative</h3>
              <p className="text-on-surface-variant text-sm">{designCount} vị trí đang mở</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">palette</span>
            </div>
          </Link>

          {/* Card 2: Engineering */}
          <Link href="/jobs?q=engineer" className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 flex justify-between items-center group cursor-pointer hover:-translate-y-1 transition-all border border-outline-variant/10">
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface mb-1">Engineering</h3>
              <p className="text-on-surface-variant text-sm">{engineerCount} vị trí đang mở</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">code</span>
            </div>
          </Link>

          {/* Card 3: Marketing */}
          <Link href="/jobs?q=market" className="bg-white p-6 rounded-2xl shadow-xl shadow-blue-900/5 flex justify-between items-center group cursor-pointer hover:-translate-y-1 transition-all border border-outline-variant/10">
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface mb-1">Marketing</h3>
              <p className="text-on-surface-variant text-sm">{marketingCount} vị trí đang mở</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center group-hover:bg-tertiary group-hover:text-white transition-colors">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </Link>

        </div>
      </section>

      {/* ================= FEATURED JOBS ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-outline">Cơ hội nghề nghiệp</span>
            <h2 className="text-3xl font-black font-headline text-on-surface mt-2">Việc làm Nổi bật</h2>
          </div>
          <Link href="/jobs" className="text-primary font-bold hover:underline hidden md:block">Xem tất cả</Link>
        </div>

        <div className="space-y-4">
          {featuredJobs.length === 0 ? (
            <p className="text-center py-10 text-on-surface-variant">Hiện chưa có tin tuyển dụng nào.</p>
          ) : (
            featuredJobs.map((job) => {
              const companyName = job.company; // Lấy trực tiếp từ bảng Job
              const companyLogo = job.user.companyProfile?.logoUrl;
              
              return (
                <div key={job.id} className="bg-white p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md border border-outline-variant/15 transition-all group">
                  <div className="flex items-center gap-6">
                    {/* Phần hiển thị Avatar/Logo trong Card Job */}
                    <div className="w-14 h-14 bg-surface-container-high rounded-xl flex items-center justify-center shrink-0 overflow-hidden text-primary font-bold text-xl font-headline">
                      {/* Ưu tiên hiển thị chữ cái đầu của Tên công ty trong Job */}
                      {companyName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <Link href={`/jobs/${job.id}`}>
                        <h3 className="text-xl font-bold font-headline text-on-surface group-hover:text-primary transition-colors">{job.title}</h3>
                      </Link>
                      <p className="text-on-surface-variant text-sm mt-1">{companyName} • {job.location || "Từ xa"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {job.salary && (
                      <span className="px-4 py-1.5 bg-primary-fixed text-primary rounded-full text-xs font-bold hidden lg:block">
                        {job.salary}
                      </span>
                    )}
                    <span className="text-xs text-outline font-medium mr-2">{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                    <Link href={`/jobs/${job.id}`}>
                      <button className="bg-surface-container-low text-primary px-6 py-2.5 rounded-xl font-bold hover:bg-primary hover:text-white transition-all border border-outline-variant/20">
                        Chi tiết
                      </button>
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* ================= WORLD-CLASS TEAMS (Dynamic Companies) ================= */}
      {topCompanies.length > 0 && (
        <section className="bg-surface-container-low py-20 w-full">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-black font-headline text-on-surface mb-2">Làm việc cùng những đội ngũ hàng đầu</h2>
            <p className="text-on-surface-variant mb-12">Khám phá các doanh nghiệp ưu tiên văn hóa, sự phát triển và đổi mới.</p>
            
            <div className="flex flex-wrap justify-center gap-6">
              {topCompanies.map((company) => (
                <Link 
                  key={company.id} 
                  href={`/jobs?q=${encodeURIComponent(company.companyName)}`}
                  className="bg-white w-40 h-40 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col items-center justify-center p-4 hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/5 text-primary flex items-center justify-center text-xl font-bold font-headline mb-3 overflow-hidden group-hover:scale-110 transition-transform">
                     {company.logoUrl ? (
                        <img src={company.logoUrl} alt={company.companyName} className="w-full h-full object-contain p-1" />
                      ) : (
                        company.companyName.charAt(0).toUpperCase()
                      )}
                  </div>
                  <h4 className="font-bold text-sm text-on-surface text-center line-clamp-1 group-hover:text-primary transition-colors">
                    {company.companyName}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= CTA BANNER (Chỉ hiện khi chưa đăng nhập) ================= */}
      {!session?.user && (
        <section className="max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="bg-primary rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative shadow-2xl shadow-primary/20">
            <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
            <div className="relative z-10 md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-black font-headline text-white mb-4 leading-tight">
                Sẵn sàng tìm kiếm <br/>công việc mơ ước?
              </h2>
              <p className="text-white/80 mb-8 font-medium">
                Tham gia cùng hàng ngàn chuyên gia đã tìm thấy bước tiến tiếp theo trong sự nghiệp của họ với RecruitSync.
              </p>
              <Link href="/register">
                <button className="bg-secondary-fixed text-on-secondary-fixed px-8 py-4 rounded-xl font-bold font-headline hover:brightness-105 transition-all shadow-lg">
                  Tạo tài khoản miễn phí
                </button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}