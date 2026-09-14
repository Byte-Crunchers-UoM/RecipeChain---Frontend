import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const BUYER_HOME = "/recipes";
const SELLER_HOME = "/seller/kyc";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const role = request.cookies.get("recipe_chain_role")?.value
  const authed = request.cookies.get("recipe_chain_authed")?.value
  
  if (!user && authed === "1") {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirectResponse = NextResponse.redirect(url)
    redirectResponse.cookies.delete('recipe_chain_authed')
    redirectResponse.cookies.delete('recipe_chain_role')
    return redirectResponse
  }

  if (pathname === "/dashboard" || pathname === "/profile") {
    if (authed === "1") {
      return response
    }
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/select-role")

  const isSellerRoute = pathname.startsWith("/seller")
  const isBuyerRoute =
    pathname.startsWith("/buyer") ||
    pathname.startsWith("/chefs") ||
    pathname.startsWith("/trending")
  const isProtected = isSellerRoute || isBuyerRoute

  if (isProtected && authed !== "1") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuthRoute && authed === "1") {
    if (pathname.startsWith("/select-role") && !role) {
      return response
    }

    if (role === "seller") {
      return NextResponse.redirect(new URL(SELLER_HOME, request.url));
    }

    if (role === "buyer") {
      return NextResponse.redirect(new URL(BUYER_HOME, request.url));
    }

    return NextResponse.redirect(new URL("/select-role", request.url));
  }

  if (isSellerRoute && role !== "seller") {
    if (role === "buyer") {
      return NextResponse.redirect(new URL(BUYER_HOME, request.url));
    }
    return NextResponse.redirect(new URL("/select-role", request.url));
  }

  if (isBuyerRoute && role !== "buyer") {
    if (role === "seller") {
      return NextResponse.redirect(new URL(SELLER_HOME, request.url));
    }
    return NextResponse.redirect(new URL("/select-role", request.url));
  }

  return response
}

export const config = {
  matcher: [
    "/seller/:path*",
    "/buyer/:path*",
    "/chefs/:path*",
    "/trending",
    "/login",
    "/signup",
    "/select-role",
  ],
};