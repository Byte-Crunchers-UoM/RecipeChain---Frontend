"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

import { SearchBar } from "@/components/layout/marcketplace/SearchBar";
import CartBadge from "@/components/recipe/CartBadge";
import { useAuth } from "@/context/AuthContext";
import CookbookTopSearch from "@/components/layout/CookbookTopSearch";
import TopNavProfileMenu from "@/components/layout/TopNavProfileMenu";

interface HeaderProps {
  notificationCount?: number;
}

function SearchFallback() {
  return (
    <div className="h-12 w-full max-w-3xl animate-pulse rounded-full bg-slate-100" />
  );
}

export default function Header({ notificationCount = 0 }: HeaderProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  const isMarketplacePage = pathname === "/recipes";
  const isCookbookPage = pathname === "/buyer/cookbook" || pathname === "/cookbook";
  const isTrendingPage = pathname === "/trending";
  const isExploreChefsPage = pathname === "/chefs/explore";
  const isFollowedChefsPage = pathname === "/chefs/followed";

  const renderSearchArea = () => {
    if (isMarketplacePage) {
      return (
        <div className="w-full max-w-xl">
          <SearchBar />
        </div>
      );
    }

    if (isCookbookPage) {
      return (
        <Suspense fallback={<SearchFallback />}>
          <CookbookTopSearch placeholder="Search your cookbook" fallbackPath="/buyer/cookbook" />
        </Suspense>
      );
    }

    if (isTrendingPage) {
      return (
        <Suspense fallback={<SearchFallback />}>
          <CookbookTopSearch placeholder="Search recipes..." fallbackPath="/trending" />
        </Suspense>
      );
    }

    if (isExploreChefsPage) {
      return (
        <Suspense fallback={<SearchFallback />}>
          <CookbookTopSearch placeholder="Search culinary experts..." fallbackPath="/chefs/explore" />
        </Suspense>
      );
    }

    if (isFollowedChefsPage) {
      return (
        <Suspense fallback={<SearchFallback />}>
          <CookbookTopSearch placeholder="Search chefs or recipes..." fallbackPath="/chefs/followed" />
        </Suspense>
      );
    }

    return null;
  };

  return (
    <header className="relative z-50 shrink-0 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-[76px] w-full items-center gap-6 px-6">
        <Link
          href="/"
          className="flex min-w-fit items-center gap-2.5"
          aria-label="Go to RecipeChain home"
        >
          <Image
            src="/Logo.png"
            alt="RecipeChain Logo"
            width={42}
            height={42}
            priority
            className="h-10 w-10 object-contain"
          />
          <span className="text-xl font-bold tracking-tight text-slate-800">
            RecipeChain
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 justify-center md:flex">
          {renderSearchArea()}
        </div>

        <div className="ml-auto flex shrink-0 items-center justify-end gap-3 md:gap-4">
          {isLoading ? (
            <div className="animate-pulse text-sm text-slate-500">
              Loading...
            </div>
          ) : isAuthenticated ? (
            <>
              <button
                type="button"
                className="relative flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-slate-100"
                aria-label="Notifications"
              >
                <Bell size={22} className="text-slate-700" />

                {notificationCount > 0 ? (
                  <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-semibold text-white">
                    {notificationCount}
                  </span>
                ) : null}
              </button>

              <CartBadge />

              <TopNavProfileMenu />
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden text-sm font-medium text-slate-700 transition hover:text-slate-900 sm:block"
              >
                Sign In
              </Link>

              <Link
                href="/signup"
                className="flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700"
              >
                <Sparkles size={18} />
                <span className="hidden sm:inline">Start Cooking</span>
                <span className="sm:hidden">Join</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}