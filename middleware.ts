import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Middleware bảo mật cho hệ thống
 * 
 * Chức năng:
 * - Cho phép truy cập public routes (/, /login, /register, etc.)
 * - Bảo vệ candidate routes: yêu cầu login + role CANDIDATE
 * - Bảo vệ HR routes: yêu cầu login + role HR
 * - Redirect về /login nếu không có quyền truy cập
 */
export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const role = session?.user?.role;

  // === PUBLIC ROUTES === (không cần đăng nhập)
  const publicPaths = ['/', '/login', '/register', '/candidate/register', '/jobs'];
  const isPublicPath = publicPaths.includes(nextUrl.pathname);

  // Cho phép xem chi tiết job công khai (không cần đăng nhập)
  // Ví dụ: /jobs/123 được phép, nhưng /jobs/123/apply không được phép
  const isJobDetailPath = /^\/jobs\/[^/]+$/.test(nextUrl.pathname);

  // THÊM ĐOẠN NÀY: Chặn không cho user đã đăng nhập vào lại các trang Auth
  const authPaths = ['/login', '/register', '/candidate/register'];
  if (authPaths.includes(nextUrl.pathname) && session) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (isPublicPath || isJobDetailPath) {
    return NextResponse.next();
  }

  // === CANDIDATE ROUTES ===
  if (nextUrl.pathname.startsWith('/candidate')) {
    // Nếu chưa đăng nhập hoặc role không phải CANDIDATE, redirect đến /login
    if (!session || role !== 'CANDIDATE') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // === APPLY ROUTES === (apply job cần đăng nhập với role CANDIDATE)
  if (nextUrl.pathname.includes('/apply')) {
    if (!session || role !== 'CANDIDATE') {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  // === HR ROUTES ===
  if (
    nextUrl.pathname.startsWith('/admin-jobs') ||
    nextUrl.pathname.startsWith('/applications')
  ) {
    // Nếu chưa đăng nhập hoặc role không phải HR, redirect đến /login
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

/**
 * Cấu hình matcher: áp dụng middleware cho những path nào
 * - Exclude: /api/*, /_next/*, /static/*, /public/*
 * - Include: Tất cả path khác
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
