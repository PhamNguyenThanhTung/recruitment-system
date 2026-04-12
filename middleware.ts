import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Middleware bảo mật cho hệ thống RecruitSync
 */
export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const role = session?.user?.role;
  
  // === 1. ĐIỀU HƯỚNG THÔNG MINH KHI ĐÃ ĐĂNG NHẬP (Chặn vào /login) ===
  const authPaths = ['/login', '/register', '/candidate/register'];
  
  if (authPaths.includes(nextUrl.pathname) && session) {
    // Nếu là Admin thì đá về trang quản trị
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    // Nếu là HR thì đá về dashboard tuyển dụng
    if (role === 'HR') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // Còn lại (Candidate) thì về trang chủ
    return NextResponse.redirect(new URL('/', req.url));
  }

  // === 2. PUBLIC ROUTES (Không cần đăng nhập) ===
  const publicPaths = ['/', '/login', '/register', '/candidate/register', '/jobs'];
  const isPublicPath = publicPaths.includes(nextUrl.pathname);
  const isJobDetailPath = /^\/jobs\/[^/]+$/.test(nextUrl.pathname);

  if (isPublicPath || isJobDetailPath) {
    return NextResponse.next();
  }

  // === 3. ADMIN ROUTES (Bảo vệ vùng cấm Admin) ===
  if (nextUrl.pathname.startsWith('/admin/')) {
    if (!session || role !== 'ADMIN') {
      // Không phải Admin mà đòi vào thì đá về trang chủ hoặc login
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // === 4. CANDIDATE ROUTES ===
  if (nextUrl.pathname.startsWith('/candidate') || nextUrl.pathname.includes('/apply')) {
    if (!session || role !== 'CANDIDATE') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // === 5. HR ROUTES ===
  if (
    nextUrl.pathname.startsWith('/admin-jobs') ||
    nextUrl.pathname.startsWith('/applications') ||
    nextUrl.pathname.startsWith('/dashboard') // Route dashboard của HR
  ) {
    if (!session || role !== 'HR') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // === DEFAULT: Các route khác cần đăng nhập ===
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};