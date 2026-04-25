import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const role = request.cookies.get("recipe_chain_role")?.value; // "seller" | "buyer"
  const authed = request.cookies.get("recipe_chain_authed")?.value; // "1" means logged in

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/select-role");

  const isSellerRoute = pathname.startsWith("/seller");
  const isBuyerRoute = pathname.startsWith("/buyer");
  const isProtected = isSellerRoute || isBuyerRoute;

  // Not authenticated -> block protected routes
  if (isProtected && authed !== "1") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Authenticated users shouldn't see login/signup/select-role
  // EXCEPT: allow /select-role when role is missing
  if (isAuthRoute && authed === "1") {
    if (pathname.startsWith("/select-role") && !role) {
      return NextResponse.next();
    }
    if (role === "seller") return NextResponse.redirect(new URL("/seller/dashboard", request.url));
    if (role === "buyer") return NextResponse.redirect(new URL("/buyer/dashboard", request.url));
    return NextResponse.redirect(new URL("/select-role", request.url));
  }

  // Role-based access for protected routes
  if (isSellerRoute && role !== "seller") {
    return NextResponse.redirect(new URL("/buyer/dashboard", request.url));
  }

  if (isBuyerRoute && role !== "buyer") {
    return NextResponse.redirect(new URL("/seller/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/seller/:path*", "/buyer/:path*", "/login", "/signup", "/select-role"],
};
