"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  TrendingUp,
  BookOpen,
  ChefHat,
  User,
  Store,
  LogOut,
  ChevronDown,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

import { MarketplaceFilters } from "./marcketplace/MarcketplaceFilters";
import { useAuth } from "@/context/AuthContext";

type MenuItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

const topMenuItems: MenuItem[] = [
  { label: "Home", path: "/", icon: Home },
  { label: "Market Place", path: "/recipes", icon: Store },
  { label: "Trending Recipes", path: "/trending", icon: TrendingUp },
  { label: "My Cookbook", path: "/buyer/cookbook", icon: BookOpen },
];

const profileMenuItem: MenuItem = {
  label: "Profile",
  path: "/buyer/profile",
  icon: User,
};

const chefSubItems: MenuItem[] = [
  { label: "Explore Chefs", path: "/chefs/explore", icon: User },
  { label: "Followed Chefs", path: "/chefs/followed", icon: User },
];

export default function BuyerSideBar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const [isChefsOpen, setIsChefsOpen] = useState(true);

  const showSidebar =
    pathname === "/recipes" ||
    pathname?.startsWith("/buyer") ||
    pathname?.startsWith("/chefs") ||
    pathname === "/trending";

  if (!showSidebar) {
    return null;
  }

  const isMarketplace = pathname === "/recipes";
  const isChefsSection = pathname?.startsWith("/chefs") ?? false;

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <aside
      className="
        relative
        flex
        h-full
        min-h-0
        w-72
        shrink-0
        flex-col
        overflow-hidden
        border-r
        border-slate-200
        bg-white
        shadow-[6px_0_18px_rgba(15,23,42,0.04)]
      "
    >
      {/* Right border decoration */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-px bg-gradient-to-b from-slate-100 via-slate-200 to-slate-100" />

      {/* Scrollable Sidebar Content */}
      <nav
        className="
          flex
          min-h-0
          flex-1
          flex-col
          gap-1
          overflow-y-auto
          p-4
          pb-6
          scrollbar-thin
          scrollbar-track-slate-50
          scrollbar-thumb-slate-300
        "
      >
        {/* Main menu */}
        {topMenuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={[
                "group flex h-14 w-full shrink-0 items-center rounded-xl border-l-[5px] transition-all duration-200",
                isActive
                  ? "border-teal-600 bg-teal-50 text-teal-700"
                  : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800",
              ].join(" ")}
            >
              <div className="flex w-full items-center gap-4 px-4">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.4 : 2}
                  className={
                    isActive ? "text-teal-600" : "text-slate-400"
                  }
                />

                <span
                  className={[
                    "text-base",
                    isActive ? "font-bold" : "font-medium",
                  ].join(" ")}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}

        {/* Chefs */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => setIsChefsOpen((open) => !open)}
            className={[
              "group flex h-14 w-full shrink-0 items-center rounded-xl border-l-[5px] transition-all duration-200",
              isChefsSection
                ? "border-teal-600 bg-teal-50 text-teal-700"
                : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800",
            ].join(" ")}
          >
            <div className="flex w-full items-center gap-4 px-4">
              <ChefHat
                size={22}
                strokeWidth={isChefsSection ? 2.4 : 2}
                className={
                  isChefsSection ? "text-teal-600" : "text-slate-400"
                }
              />

              <span
                className={[
                  "text-base",
                  isChefsSection ? "font-bold" : "font-medium",
                ].join(" ")}
              >
                Chefs
              </span>

              <span className="ml-auto pr-1 text-slate-400 group-hover:text-slate-600">
                {isChefsOpen ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </span>
            </div>
          </button>

          {/* Chef submenu */}
          {isChefsOpen && (
            <div className="mt-1 space-y-1 pl-14 pr-2">
              {chefSubItems.map((item) => {
                const isActive = pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={[
                      "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-all",
                      isActive
                        ? "bg-teal-50 font-bold text-teal-700"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
                    ].join(" ")}
                  >
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile */}
        {(() => {
          const isActive = pathname === profileMenuItem.path;
          const Icon = profileMenuItem.icon;

          return (
            <Link
              href={profileMenuItem.path}
              className={[
                "group flex h-14 w-full shrink-0 items-center rounded-xl border-l-[5px] transition-all duration-200",
                isActive
                  ? "border-teal-600 bg-teal-50 text-teal-700"
                  : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800",
              ].join(" ")}
            >
              <div className="flex w-full items-center gap-4 px-4">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.4 : 2}
                  className={
                    isActive ? "text-teal-600" : "text-slate-400"
                  }
                />

                <span
                  className={[
                    "text-base",
                    isActive ? "font-bold" : "font-medium",
                  ].join(" ")}
                >
                  {profileMenuItem.label}
                </span>
              </div>
            </Link>
          );
        })()}

        {/* Marketplace Filters */}
        {isMarketplace && (
          <div className="shrink-0 pt-2">
            <div className="border-t border-slate-100 pt-6">
              <MarketplaceFilters />
            </div>
          </div>
        )}
      </nav>

      {/* Logout - always fixed at bottom */}
      <div className="shrink-0 border-t border-slate-100 bg-white p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="
            flex
            h-12
            w-full
            items-center
            gap-4
            rounded-xl
            px-4
            font-medium
            text-red-500
            transition-all
            hover:bg-red-50
          "
        >
          <LogOut size={20} />

          <span className="text-base">Logout</span>
        </button>
      </div>
    </aside>
  );
}