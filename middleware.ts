import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user is trying to access protected routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isSellerRoute = pathname.startsWith('/seller');
  const isProtectedRoute = isAdminRoute || isSellerRoute;

  // Get user role from cookie or header (in production, use proper JWT validation)
  const userRole = request.cookies.get('park_chain_role')?.value;

  // If accessing protected route without authentication, redirect to login
  if (isProtectedRoute && !userRole) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based access control
  if (isAdminRoute && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isSellerRoute && userRole !== 'seller') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/seller/:path*'],
};
