import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const role = request.cookies.get("recipe_chain_role")?.value; // "seller" | "buyer"
  const authed = request.cookies.get("recipe_chain_authed")?.value; // "1" means logged in

  if (pathname === "/dashboard") {
    if (authed === "1") {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/select-role");

  const isSellerRoute = pathname.startsWith("/seller");
  const isBuyerRoute = pathname.startsWith("/buyer");
  const isProtected = isSellerRoute || isBuyerRoute;

  if (isProtected && authed !== "1") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && authed === "1") {
    if (pathname.startsWith("/select-role") && !role) {
      return NextResponse.next();
    }

    if (role === "seller") {
      if (pathname.startsWith("/seller/kyc")) {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (role === "buyer") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.redirect(new URL("/select-role", request.url));
  }

  if (isSellerRoute && role !== "seller") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isBuyerRoute && role !== "buyer") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/seller/:path*",
    "/buyer/:path*",
    "/login",
    "/signup",
    "/select-role"
  ],
};