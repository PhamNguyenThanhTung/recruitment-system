import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import * as authRegisterRoute from '@/app/api/auth/register/route';
import * as authNextAuthRoute from '@/app/api/auth/[...nextauth]/route';
import * as applicationsRoute from '@/app/api/applications/route';
import * as applicationsIdRoute from '@/app/api/applications/[id]/route';
import * as applicationsStatusRoute from '@/app/api/applications/[id]/status/route';
import * as applicationsAiMatchRoute from '@/app/api/applications/[id]/ai-match/route';
import * as applicationsMyRoute from '@/app/api/applications/my/route';
import * as adminDashboardRoute from '@/app/api/admin/dashboard/route';
import * as adminJobsRoute from '@/app/api/admin/jobs/route';
import * as adminJobsIdRoute from '@/app/api/admin/jobs/[id]/route';
import * as adminUsersRoute from '@/app/api/admin/users/route';
import * as adminUsersIdRoute from '@/app/api/admin/users/[id]/route';
import * as adminUsersWarnRoute from '@/app/api/admin/users/[id]/warn/route';
import * as adminReportsRoute from '@/app/api/admin/reports/[jobId]/route';
import * as adminStatsRoute from '@/app/api/admin/stats/route';
import * as analyticsHrRoute from '@/app/api/analytics/hr/route';
import * as interviewsRoute from '@/app/api/interviews/route';
import * as jobsRoute from '@/app/api/jobs/route';
import * as jobsFilterRoute from '@/app/api/jobs/filter/route';
import * as jobsIdRoute from '@/app/api/jobs/[id]/route';
import * as jobsWarnRoute from '@/app/api/jobs/[id]/warn/route';
import * as profileCandidateRoute from '@/app/api/profile/candidate/route';
import * as profileCompanyRoute from '@/app/api/profile/company/route';
import * as reportsRoute from '@/app/api/reports/route';
import * as savedJobsRoute from '@/app/api/saved-jobs/route';
import * as uploadAvatarRoute from '@/app/api/upload/avatar/route';
import * as interviewersRoute from '@/app/api/users/interviewers/route';

const authMock = vi.mocked(auth, true);
const dbMock = db as any;

function buildJsonRequest(url: string, method = 'POST', body?: any) {
  return new Request(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function buildFormDataRequest(url: string, formData: FormData) {
  return new Request(url, {
    method: 'POST',
    body: formData,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue(null);
  dbMock.user.findUnique.mockResolvedValue(null);
  dbMock.user.create.mockResolvedValue(null);
  dbMock.user.findMany.mockResolvedValue([]);
  dbMock.job.findUnique.mockResolvedValue(null);
  dbMock.job.findMany.mockResolvedValue([]);
  dbMock.job.create.mockResolvedValue(null);
  dbMock.job.update.mockResolvedValue(null);
  dbMock.job.delete.mockResolvedValue(null);
  dbMock.job.count.mockResolvedValue(0);
  dbMock.application.findUnique.mockResolvedValue(null);
  dbMock.application.findFirst.mockResolvedValue(null);
  dbMock.application.findMany.mockResolvedValue([]);
  dbMock.application.create.mockResolvedValue(null);
  dbMock.application.update.mockResolvedValue(null);
  dbMock.application.count.mockResolvedValue(0);
  dbMock.savedJob.create.mockResolvedValue(null);
  dbMock.savedJob.findMany.mockResolvedValue([]);
  dbMock.savedJob.deleteMany.mockResolvedValue(null);
  dbMock.companyProfile.findUnique.mockResolvedValue(null);
  dbMock.companyProfile.upsert.mockResolvedValue(null);
  dbMock.candidateProfile.findUnique.mockResolvedValue(null);
  dbMock.candidateProfile.upsert.mockResolvedValue(null);
  dbMock.report.create.mockResolvedValue(null);
  dbMock.report.count.mockResolvedValue(0);
  dbMock.interview.upsert.mockResolvedValue(null);
});

describe('API route coverage', () => {
  it('auth register route exports POST and rejects duplicate email', async () => {
    dbMock.user.findUnique.mockResolvedValue({ id: 'u1', email: 'test@example.com' });
    const response = await authRegisterRoute.POST(buildJsonRequest('http://localhost/api/auth/register', 'POST', { email: 'test@example.com', password: 'secret', name: 'Tester', role: 'HR' }));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ success: false });
  });

  it('auth nextauth route exports GET and POST handlers', () => {
    expect(authNextAuthRoute.GET).toBeDefined();
    expect(authNextAuthRoute.POST).toBeDefined();
  });

  it('jobs GET returns open jobs without auth', async () => {
    dbMock.job.findMany.mockResolvedValue([{ id: 'job1', title: 'Role', company: 'Acme', description: 'desc', requirements: 'req', salary: '10M', location: 'HCM', jobType: 'FULL_TIME', deadline: new Date().toISOString(), status: 'OPEN', createdAt: new Date(), user: {} }]);
    const response = await jobsRoute.GET(new Request('http://localhost/api/jobs'));
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
  });

  it('jobs POST rejects non-HR session', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1', role: 'CANDIDATE' } });
    const response = await jobsRoute.POST(buildJsonRequest('http://localhost/api/jobs', 'POST', { title: 'Test', description: 'Desc', requirements: 'Req', salary: '10M', deadline: '2025-12-31', jobType: 'FULL_TIME' }));
    expect(response.status).toBe(403);
  });

  it('jobs filter GET returns metadata', async () => {
    dbMock.job.findMany.mockResolvedValue([]);
    const response = await jobsFilterRoute.GET(new NextRequest('http://localhost/api/jobs/filter?q=test&limit=10'));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.meta).toBeDefined();
    expect(json.data).toEqual([]);
  });

  it('jobs [id] GET returns 404 when missing job', async () => {
    const response = await jobsIdRoute.GET(new Request('http://localhost/api/jobs/abc'), { params: Promise.resolve({ id: 'abc' }) });
    expect(response.status).toBe(404);
  });

  it('jobs [id] PUT rejects unauthorized request', async () => {
    const response = await jobsIdRoute.PUT(buildJsonRequest('http://localhost/api/jobs/abc', 'PUT', { title: 'New' }), { params: Promise.resolve({ id: 'abc' }) });
    expect(response.status).toBe(401);
  });

  it('jobs [id] DELETE rejects unauthorized request', async () => {
    const response = await jobsIdRoute.DELETE(new Request('http://localhost/api/jobs/abc', { method: 'DELETE' }), { params: Promise.resolve({ id: 'abc' }) });
    expect(response.status).toBe(401);
  });

  it('jobs [id] warn PATCH rejects non-admin role', async () => {
    authMock.mockResolvedValue({ user: { id: 'u1', role: 'HR' } });
    const response = await jobsWarnRoute.PATCH(buildJsonRequest('http://localhost/api/jobs/abc/warn', 'PATCH', { reason: 'Test' }), { params: Promise.resolve({ id: 'abc' }) });
    expect(response.status).toBe(403);
  });

  it('admin dashboard GET rejects unauthenticated user', async () => {
    const response = await adminDashboardRoute.GET();
    expect(response.status).toBe(403);
  });

  it('admin stats GET rejects unauthenticated user', async () => {
    const response = await adminStatsRoute.GET();
    expect(response.status).toBe(403);
  });

  it('admin jobs GET rejects unauthenticated user', async () => {
    const response = await adminJobsRoute.GET();
    expect(response.status).toBe(403);
  });

  it('admin jobs [id] PATCH rejects unauthenticated user', async () => {
    const response = await adminJobsIdRoute.PATCH(buildJsonRequest('http://localhost/api/admin/jobs/abc', 'PATCH', { status: 'PENDING' }), { params: Promise.resolve({ id: 'abc' }) });
    expect(response.status).toBe(403);
  });

  it('admin jobs [id] DELETE rejects unauthenticated user', async () => {
    const response = await adminJobsIdRoute.DELETE(new Request('http://localhost/api/admin/jobs/abc', { method: 'DELETE' }), { params: Promise.resolve({ id: 'abc' }) });
    expect(response.status).toBe(403);
  });

  it('admin users GET rejects unauthenticated user', async () => {
    const response = await adminUsersRoute.GET();
    expect(response.status).toBe(403);
  });

  it('admin users [id] DELETE rejects unauthenticated user', async () => {
    const response = await adminUsersIdRoute.DELETE(new Request('http://localhost/api/admin/users/abc', { method: 'DELETE' }), { params: Promise.resolve({ id: 'abc' }) });
    expect(response.status).toBe(403);
  });

  it('admin users [id] warn PATCH rejects unauthenticated user', async () => {
    const response = await adminUsersWarnRoute.PATCH(buildJsonRequest('http://localhost/api/admin/users/abc/warn', 'PATCH', { reason: 'Spam' }), { params: Promise.resolve({ id: 'abc' }) });
    expect(response.status).toBe(403);
  });

  it('admin reports [jobId] DELETE returns success when deleteMany is mocked', async () => {
    dbMock.report.deleteMany.mockResolvedValue(null);
    dbMock.job.update.mockResolvedValue(null);
    const response = await adminReportsRoute.DELETE(new Request('http://localhost/api/admin/reports/abc', { method: 'DELETE' }), { params: Promise.resolve({ jobId: 'abc' }) });
    expect(response.status).toBe(200);
  });

  it('analytics hr GET rejects unauthenticated user', async () => {
    const response = await analyticsHrRoute.GET();
    expect(response.status).toBe(401);
  });

  it('applications POST rejects unauthenticated request', async () => {
    const formData = new FormData();
    formData.set('jobId', 'job1');
    formData.set('cvFile', new File(['cv'], 'cv.pdf', { type: 'application/pdf' }));
    const response = await applicationsRoute.POST(new Request('http://localhost/api/applications', { method: 'POST', body: formData }));
    expect(response.status).toBe(401);
  });

  it('applications GET rejects unauthenticated request', async () => {
    const response = await applicationsRoute.GET(new NextRequest('http://localhost/api/applications'));
    expect(response.status).toBe(401);
  });

  it('applications [id] GET rejects unauthenticated request', async () => {
    const response = await applicationsIdRoute.GET(new NextRequest('http://localhost/api/applications/abc'), { params: Promise.resolve({ id: 'abc' }) });
    expect(response.status).toBe(401);
  });

  it('applications [id] PATCH rejects unauthenticated request', async () => {
    const response = await applicationsIdRoute.PATCH(buildJsonRequest('http://localhost/api/applications/abc', 'PATCH', { status: 'INTERVIEWING' }), { params: Promise.resolve({ id: 'abc' }) });
    expect(response.status).toBe(401);
  });

  it('applications status PATCH rejects unauthenticated request', async () => {
    const response = await applicationsStatusRoute.PATCH(buildJsonRequest('http://localhost/api/applications/abc/status', 'PATCH', { status: 'REVIEWING' }), { params: Promise.resolve({ id: 'abc' }) });
    expect(response.status).toBe(401);
  });

  it('applications ai-match POST rejects unauthenticated request', async () => {
    const response = await applicationsAiMatchRoute.POST(buildJsonRequest('http://localhost/api/applications/abc/ai-match', 'POST', { some: 'data' }), { params: Promise.resolve({ id: 'abc' }) });
    expect(response.status).toBe(403);
  });

  it('applications my GET rejects unauthenticated request', async () => {
    const response = await applicationsMyRoute.GET(new NextRequest('http://localhost/api/applications/my'));
    expect(response.status).toBe(401);
  });

  it('interviews POST rejects unauthenticated request', async () => {
    const response = await interviewsRoute.POST(buildJsonRequest('http://localhost/api/interviews', 'POST', { applicationId: 'app1', interviewerEmail: 'i@example.com', time: new Date().toISOString(), location: 'Zoom', round: 'Round 1' }));
    expect(response.status).toBe(403);
  });

  it('profile candidate GET rejects unauthenticated request', async () => {
    const response = await profileCandidateRoute.GET(new NextRequest('http://localhost/api/profile/candidate'));
    expect(response.status).toBe(401);
  });

  it('profile candidate PUT rejects unauthenticated request', async () => {
    const response = await profileCandidateRoute.PUT(buildJsonRequest('http://localhost/api/profile/candidate', 'PUT', { bio: 'bio' }));
    expect(response.status).toBe(401);
  });

  it('profile candidate POST rejects unauthenticated request', async () => {
    const formData = new FormData();
    formData.set('address', 'HCM');
    const response = await profileCandidateRoute.POST(new Request('http://localhost/api/profile/candidate', { method: 'POST', body: formData }));
    expect(response.status).toBe(401);
  });

  it('profile company GET rejects unauthenticated request', async () => {
    const response = await profileCompanyRoute.GET(new NextRequest('http://localhost/api/profile/company'));
    expect(response.status).toBe(401);
  });

  it('profile company PUT rejects unauthenticated request', async () => {
    const formData = new FormData();
    formData.set('companyName', 'Acme');
    const response = await profileCompanyRoute.PUT(new Request('http://localhost/api/profile/company', { method: 'PUT', body: formData }));
    expect(response.status).toBe(401);
  });

  it('profile company POST proxies PUT and rejects unauthenticated request', async () => {
    const formData = new FormData();
    formData.set('companyName', 'Acme');
    const response = await profileCompanyRoute.POST(new Request('http://localhost/api/profile/company', { method: 'POST', body: formData }));
    expect(response.status).toBe(401);
  });

  it('reports POST rejects unauthenticated or wrong role', async () => {
    const response = await reportsRoute.POST(buildJsonRequest('http://localhost/api/reports', 'POST', { jobId: 'job1', reason: 'Spam' }));
    expect(response.status).toBe(403);
  });

  it('saved jobs POST rejects unauthenticated request', async () => {
    const response = await savedJobsRoute.POST(buildJsonRequest('http://localhost/api/saved-jobs', 'POST', { jobId: 'job1' }));
    expect(response.status).toBe(401);
  });

  it('saved jobs GET rejects unauthenticated request', async () => {
    const response = await savedJobsRoute.GET();
    expect(response.status).toBe(401);
  });

  it('saved jobs DELETE rejects unauthenticated request', async () => {
    const response = await savedJobsRoute.DELETE(buildJsonRequest('http://localhost/api/saved-jobs', 'DELETE', { jobId: 'job1' }));
    expect(response.status).toBe(401);
  });

  it('upload avatar POST rejects unauthenticated request', async () => {
    const formData = new FormData();
    formData.set('avatar', new File(['a'], 'avatar.png', { type: 'image/png' }));
    const response = await uploadAvatarRoute.POST(new Request('http://localhost/api/upload/avatar', { method: 'POST', body: formData }));
    expect(response.status).toBe(401);
  });

  it('users interviewers GET rejects unauthorized request', async () => {
    const response = await interviewersRoute.GET();
    expect(response.status).toBe(403);
  });
});
