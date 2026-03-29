"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CandidateEditForm from "@/components/forms/CandidateEditForm";

export default function CandidateProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter(); // FIX 1: Thêm dòng này
  
  const [activeTab, setActiveTab] = useState<'overview' | 'apps' | 'edit'>('overview');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // State quản lý dữ liệu hiển thị tức thì (Live)
  const [liveProfile, setLiveProfile] = useState({
    address: "",
    skills: "",
    bio: "",
    avatar: ""
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    const fetchData = async () => {
      try {
        const [profileRes, appRes, recRes] = await Promise.all([
          fetch("/api/profile/candidate"),
          fetch("/api/applications/my"), 
          fetch("/api/jobs?limit=10")
        ]);
        
        const profile = await profileRes.json();
        const appsRaw = await appRes.json();
        const recJobsRaw = await recRes.json();

        const allJobs = recJobsRaw.success ? recJobsRaw.data : [];
        const myApps = Array.isArray(appsRaw) ? appsRaw : (appsRaw.data || []);

        // Lọc job chưa nộp
        const recommendedJobs = allJobs
          .filter((job: any) => !myApps.some((app: any) => app.jobId === job.id))
          .slice(0, 2);
        
        // Cập nhật data tổng
        setData({ profile, applications: myApps, recommendedJobs });
        
        // Cập nhật profile hiển thị ở sidebar
        setLiveProfile({
          address: profile?.address || "",
          skills: profile?.skills || "",
          bio: profile?.bio || "",
          avatar: session?.user?.image || ""
        });
      } catch (err) {
        console.error("Lỗi fetch data", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) fetchData();
  }, [session, status, router]); // FIX 2: Thêm router vào đây

  if (isLoading || !data) return <div className="pt-32 text-center font-bold">Đang đồng bộ dữ liệu Blue Ocean...</div>;

  const { profile, applications, recommendedJobs } = data;

  // Tính % hoàn thiện hồ sơ
  const completionCriteria = [
    { label: "Địa chỉ liên hệ", isDone: !!liveProfile.address },
    { label: "Kỹ năng chuyên môn", isDone: !!liveProfile.skills },
    { label: "Giới thiệu bản thân", isDone: !!liveProfile.bio },
    { label: "Hồ sơ CV (PDF)", isDone: !!profile?.defaultCvUrl },
    { label: "Ảnh đại diện", isDone: !!liveProfile.avatar },
  ];
  const profileCompletion = completionCriteria.filter(c => c.isDone).length * 20;

  return (
    <main className="max-w-[1600px] mx-auto pb-20 px-6">
      <div className="h-28 w-full" />

      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black headline-font text-on-surface tracking-tight mb-2">
            Chào buổi sáng, {session?.user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-on-surface-variant text-lg italic text-slate-500 font-medium">
            {activeTab === 'edit' ? "Cập nhật thông tin cá nhân." : activeTab === 'apps' ? "Quản lý các đơn ứng tuyển của bạn." : "Hệ thống đã sẵn sàng cho ngày mới."}
          </p>
        </div>
        {activeTab === 'overview' && (
          <Link href="/">
            <button className="px-8 py-3.5 bg-primary text-white rounded-2xl font-black text-sm shadow-lg hover:scale-105 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined">search</span> Tìm việc ngay
            </button>
          </Link>
        )}
      </header>

      <div className="grid grid-cols-12 gap-8">
        
        {/* LEFT SIDEBAR */}
        <aside className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-outline-variant/10 text-center relative overflow-hidden">
            <div className="w-24 h-24 rounded-full border-4 border-secondary-container p-1 mx-auto mb-4 overflow-hidden">
               {liveProfile.avatar ? (
                 <img src={liveProfile.avatar} className="w-full h-full object-cover rounded-full" alt="avatar" />
               ) : (
                 <div className="w-full h-full bg-primary text-white flex items-center justify-center text-3xl font-black rounded-full">
                   {session?.user?.name?.charAt(0)}
                 </div>
               )}
            </div>
            <h3 className="headline-font font-black text-xl text-on-surface">{session?.user?.name}</h3>
            <p className="text-[10px] font-black uppercase text-primary mt-2 tracking-widest leading-relaxed">
              {liveProfile.address || "Vị trí chưa cập nhật"}
            </p>
            
            <nav className="mt-8 space-y-2 text-left">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-bold ${activeTab === 'overview' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <span className="material-symbols-outlined">grid_view</span> Tổng quan
              </button>
              
              <button 
                onClick={() => setActiveTab('apps')}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-bold ${activeTab === 'apps' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <span className="material-symbols-outlined">assignment_turned_in</span> Đơn ứng tuyển
              </button>

              <button 
                onClick={() => setActiveTab('edit')}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all font-bold ${activeTab === 'edit' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <span className="material-symbols-outlined">person</span> Hồ sơ cá nhân
              </button>
            </nav>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-outline-variant/5 shadow-sm">
            <h4 className="headline-font font-black text-[10px] uppercase text-slate-400 mb-4 tracking-widest">Hoàn thiện {profileCompletion}%</h4>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-6 overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${profileCompletion}%` }} />
            </div>
            <div className="space-y-3">
              {completionCriteria.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] font-bold">
                  <span className={`material-symbols-outlined text-sm ${item.isDone ? 'text-emerald-500' : 'text-slate-200'}`}>
                    {item.isDone ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className={item.isDone ? 'text-slate-600' : 'text-slate-400'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <section className="col-span-12 lg:col-span-6 space-y-8">
          {activeTab === 'edit' ? (
            <div className="bg-white p-2 rounded-[40px] shadow-sm border border-slate-100">
               <CandidateEditForm 
                  initialData={data.profile} 
                  user={session?.user} 
                  onProfileUpdate={(newData: any) => setLiveProfile(prev => ({...prev, ...newData}))}
               />
            </div>
          ) : activeTab === 'apps' ? (
            <div className="bg-white rounded-[40px] shadow-sm border border-outline-variant/10 overflow-hidden">
                <div className="p-8 border-b border-slate-50">
                  <h3 className="font-black text-2xl">Tất cả đơn ứng tuyển</h3>
                  <p className="text-slate-400 text-sm mt-1 font-medium">Bạn đã nộp tổng cộng {applications.length} đơn.</p>
                </div>
                <div className="divide-y divide-slate-50 text-sm">
                  {applications.length > 0 ? applications.map((app: any) => (
                    <div key={app.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-primary font-black text-2xl shadow-inner">{app.job.title.charAt(0)}</div>
                        <div>
                          <h4 className="font-black text-on-surface text-lg">{app.job.title}</h4>
                          <p className="text-sm text-slate-400 font-bold uppercase tracking-tight">{app.job.company}</p>
                          <p className="text-xs text-slate-300 mt-1 italic">Ngày nộp: {new Date(app.appliedAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                      <span className="px-6 py-2 bg-primary/10 text-primary text-[11px] font-black uppercase rounded-2xl border border-primary/20">{app.status}</span>
                    </div>
                  )) : (
                    <div className="p-20 text-center text-slate-300 font-bold italic">Chưa có dữ liệu ứng tuyển nào.</div>
                  )}
                </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border-l-4 border-primary shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Đã nộp</p>
                  <h2 className="text-3xl font-black text-primary">{applications.length}</h2>
                </div>
                <div className="bg-white p-6 rounded-3xl border-l-4 border-emerald-500 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Phỏng vấn</p>
                  <h2 className="text-3xl font-black text-emerald-600">00</h2>
                </div>
                <div className="bg-white p-6 rounded-3xl border-l-4 border-slate-300 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Đã xem</p>
                  <h2 className="text-3xl font-black text-on-surface">00</h2>
                </div>
              </div>

              <div className="bg-white rounded-[40px] shadow-sm border border-outline-variant/10 overflow-hidden text-sm">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                  <h3 className="font-black text-xl">Đơn ứng tuyển gần đây</h3>
                  <button 
                    onClick={() => setActiveTab('apps')} 
                    className="text-primary text-xs font-black uppercase tracking-widest hover:underline"
                  >
                    Xem tất cả
                  </button>
                </div>
                <div className="divide-y divide-slate-50">
                  {applications.slice(0, 3).length > 0 ? applications.slice(0, 3).map((app: any) => (
                    <div key={app.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-primary font-black text-2xl">{app.job.title.charAt(0)}</div>
                        <div>
                          <h4 className="font-black text-on-surface">{app.job.title}</h4>
                          <p className="text-xs text-slate-400 uppercase font-bold">{app.job.company}</p>
                        </div>
                      </div>
                      <span className="px-4 py-2 bg-slate-100 text-[10px] font-black uppercase rounded-xl text-slate-500">{app.status}</span>
                    </div>
                  )) : (
                    <p className="p-10 text-center text-slate-300 font-bold italic">Chưa có đơn ứng tuyển.</p>
                  )}
                </div>
              </div>

              <div className="space-y-6 pt-4 text-sm">
                <h3 className="headline-font font-black text-xl px-2">Gợi ý việc làm dành cho bạn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {recommendedJobs?.map((job: any, idx: number) => (
                    <div key={job.id} className={`${idx === 0 ? 'bg-primary text-white shadow-blue-200' : 'bg-white border border-slate-100'} p-8 rounded-[40px] shadow-xl relative overflow-hidden group transition-all hover:scale-[1.02]`}>
                      <div className="relative z-10">
                        <span className={`${idx === 0 ? 'bg-white/20' : 'bg-primary/10 text-primary'} px-3 py-1 rounded-lg text-[9px] font-black uppercase mb-4 inline-block`}>HOT JOB</span>
                        <h4 className="text-xl font-black headline-font mb-1 line-clamp-1">{job.title}</h4>
                        <p className={`${idx === 0 ? 'text-white/70' : 'text-slate-400'} text-xs font-bold mb-8 uppercase`}>{job.company}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-black">{job.salary || "Thỏa thuận"}</span>
                          <Link href={`/jobs/${job.id}`}>
                            <button className={`${idx === 0 ? 'bg-white text-primary' : 'bg-primary text-white'} px-6 py-3 rounded-2xl text-xs font-black uppercase shadow-sm active:scale-95 transition-all`}>Chi tiết</button>
                          </Link>
                        </div>
                      </div>
                      {idx === 0 && <span className="absolute -right-6 -bottom-6 material-symbols-outlined text-[140px] opacity-10 rotate-12">auto_awesome</span>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="col-span-12 lg:col-span-3 space-y-8">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-outline-variant/10">
            <h3 className="text-lg font-black mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary">calendar_month</span> Lịch trình
            </h3>
            <div className="relative pl-6 border-l-2 border-slate-100 pb-4">
              <div className="relative">
                <div className="absolute -left-[33px] top-0 w-4 h-4 rounded-full bg-secondary border-4 border-white shadow-md"></div>
                <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Cập nhật lúc {new Date().getHours()}:00</p>
                <h4 className="font-bold text-sm">Đang đồng bộ...</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">Lịch phỏng vấn sẽ hiển thị ở đây.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-outline-variant/10">
            <h3 className="text-lg font-black mb-8 flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-600">notifications_active</span> Thông báo
            </h3>
            <div className="space-y-6 text-sm">
              {applications.slice(0, 2).map((app: any) => (
                <div key={app.id} className="flex gap-4 items-start border-b border-slate-50 pb-4 last:border-0 group">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <span className="material-symbols-outlined text-sm">info</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-700 leading-tight italic">
                       Đơn <span className="text-blue-600">{app.job.title}</span> đã chuyển trạng thái.
                    </p>
                    <p className="text-[9px] font-black text-slate-300 mt-2 tracking-widest">HỆ THỐNG</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </main>
  );
}