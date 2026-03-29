'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Application {
  id: string;
  status: string;
  appliedAt: string;
  job: {
    title: string;
    company: string;
  };
}

export default function CandidateDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState({ address: '', skills: '', bio: '' });
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // 1. Bảo vệ tuyến
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { router.push('/login'); return; }
    if (session?.user?.role !== 'CANDIDATE') { router.push('/'); }
  }, [status, session, router]);

  // 2. Fetch Data
  useEffect(() => {
    if (status !== 'authenticated' || session?.user?.role !== 'CANDIDATE') return;
    const fetchData = async () => {
      try {
        setIsFetching(true);
        const [profileRes, appRes] = await Promise.all([
          fetch('/api/profile/candidate'),
          fetch('/api/applications/my-applications')
        ]);
        if (profileRes.ok) {
          const p = await profileRes.json();
          setFormData({ address: p.address || '', skills: p.skills || '', bio: p.bio || '' });
        }
        if (appRes.ok) setMyApplications(await appRes.json());
        setIsFetching(false);
      } catch (error) { setIsFetching(false); }
    };
    fetchData();
  }, [status, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/profile/candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) toast.success('Cập nhật thành công!');
    } finally { setIsLoading(false); }
  };

  if (isFetching) return (
    <div className="flex items-center justify-center min-h-screen text-primary">
      <span className="material-symbols-outlined animate-spin text-5xl">progress_activity</span>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f7f9fb] font-body text-on-surface">
      

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 ml-64 p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header với Avatar tròn */}
          <div className="flex justify-between items-center bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full border-4 border-blue-50 bg-primary text-white flex items-center justify-center font-headline font-black text-4xl shadow-inner overflow-hidden">
                {session?.user?.image ? <img src={session.user.image} className="w-full h-full object-cover" /> : session?.user?.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-3xl font-black font-headline tracking-tight">{session?.user?.name}</h2>
                <div className="flex gap-4 mt-2 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-blue-500">mail</span> {session?.user?.email}</span>
                  <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-blue-500">location_on</span> {formData.address || 'Hà Nội, Việt Nam'}</span>
                </div>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:scale-[1.02] transition-all">Update Photo</button>
          </div>

          <div className="grid grid-cols-12 gap-8">
            
            {/* Cột trái: Personal Info Form */}
            <div className="col-span-7 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
              <h3 className="text-xl font-black font-headline mb-6">Personal Information</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Họ và Tên</label>
                    <input disabled value={session?.user?.name || ''} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold text-slate-400 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
                    <input disabled value={session?.user?.email || ''} className="w-full p-4 rounded-2xl bg-slate-50 border-none font-bold text-slate-400 cursor-not-allowed" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Kỹ năng chuyên môn</label>
                  <input 
                    value={formData.skills} 
                    onChange={(e) => setFormData({...formData, skills: e.target.value})} 
                    className="w-full p-4 rounded-2xl bg-slate-50 focus:bg-white border-2 border-transparent focus:border-blue-500 outline-none transition-all font-bold" 
                    placeholder="React, Node.js..." 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Giới thiệu bản thân</label>
                  <textarea 
                    value={formData.bio} 
                    onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                    rows={4} 
                    className="w-full p-4 rounded-2xl bg-slate-50 focus:bg-white border-2 border-transparent focus:border-blue-500 outline-none transition-all font-bold resize-none" 
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <button type="submit" disabled={isLoading} className="bg-[#1a1c1e] text-white px-10 py-4 rounded-2xl font-black text-sm hover:scale-[1.02] transition-all shadow-xl">
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Cột phải: Candidate Pipeline & Applications */}
            <div className="col-span-5 space-y-8">
              
              {/* Pipeline Stat (Giống ảnh 2) */}
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <h3 className="text-xl font-black font-headline mb-6">Application Progress</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase mb-2"><span>Applied</span><span>{myApplications.length}</span></div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600 rounded-full w-[100%]"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase mb-2"><span>Interviewing</span><span>0</span></div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-teal-400 rounded-full w-[0%]"></div></div>
                  </div>
                </div>
              </div>

              {/* List đơn ứng tuyển gần đây */}
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <h3 className="text-lg font-black font-headline mb-4">Active Applications</h3>
                <div className="space-y-4">
                  {myApplications.slice(0, 3).map(app => (
                    <div key={app.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-all">
                      <h4 className="font-bold text-sm group-hover:text-blue-600 transition-colors">{app.job.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{app.job.company}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-[9px] font-black px-2 py-1 bg-blue-100 text-blue-700 rounded-md uppercase">{app.status}</span>
                        <span className="text-[9px] font-bold text-slate-400">{new Date(app.appliedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}