'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export type HRAnalyticsPayload = {
  openJobsCount: number;
  totalApplicants: number;
  applicationsByMonth: { month: string; label: string; count: number }[];
  applicationsByJob: { jobTitle: string; count: number }[];
};

export function HRDashboard() {
  const [data, setData] = React.useState<HRAnalyticsPayload | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/analytics/hr');
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || 'Không tải được dữ liệu');
        }
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Lỗi không xác định');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-outline-variant/10 bg-surface-container-lowest">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-on-surface-variant">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-error/20 bg-error-container/30 px-6 py-8 text-center text-sm text-error">
        {error || 'Không có dữ liệu'}
      </div>
    );
  }

  const barData = data.applicationsByJob.map((j) => ({
    name: j.jobTitle.length > 24 ? `${j.jobTitle.slice(0, 22)}…` : j.jobTitle,
    fullTitle: j.jobTitle,
    applicants: j.count,
  }));

  const lineData = data.applicationsByMonth.map((m) => ({
    name: m.label,
    applications: m.count,
  }));

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-[0px_10px_40px_rgba(0,89,187,0.06)]">
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <span className="material-symbols-outlined">work</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
              Job đang mở
            </p>
            <h3 className="mt-1 font-headline text-3xl font-extrabold text-on-surface">
              {data.openJobsCount}
            </h3>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-[0px_10px_40px_rgba(0,89,187,0.06)]">
          <div className="flex items-start justify-between">
            <div className="rounded-xl bg-secondary/10 p-3 text-secondary">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">
              Tổng ứng viên
            </p>
            <h3 className="mt-1 font-headline text-3xl font-extrabold text-on-surface">
              {data.totalApplicants}
            </h3>
            <p className="mt-1 text-xs text-on-surface-variant/80">Số đơn ứng tuyển nhận được</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-[0px_10px_40px_rgba(0,89,187,0.06)]">
          <h4 className="mb-6 font-headline text-lg font-bold text-on-surface">
            Ứng viên theo từng Job
          </h4>
          <div style={{ width: '100%', height: 288, minHeight: 288 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e3e5" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={72}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #eceef0' }}
                  formatter={(value) => [Number(value ?? 0), 'Ứng viên']}
                  labelFormatter={(_, payload) => {
                    const p = payload?.[0]?.payload as { fullTitle?: string } | undefined;
                    return p?.fullTitle ?? '';
                  }}
                />
                <Bar dataKey="applicants" fill="#0059bb" radius={[6, 6, 0, 0]} name="Số đơn" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-[0px_10px_40px_rgba(0,89,187,0.06)]">
          <h4 className="mb-6 font-headline text-lg font-bold text-on-surface">
            Xu hướng nộp đơn theo tháng
          </h4>
          <div style={{ width: '100%', height: 288, minHeight: 288 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e3e5" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #eceef0' }}
                  formatter={(value) => [Number(value ?? 0), 'Đơn nộp']}
                />
                <Line
                  type="monotone"
                  dataKey="applications"
                  stroke="#006a60"
                  strokeWidth={3}
                  dot={{ fill: '#006a60', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
