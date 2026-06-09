"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  TrendingUp,
  BookOpen,
  ChefHat,
  User,
  Store,
  type LucideIcon,
} from "lucide-react";

import { MarketplaceFilters } from "./marcketplace/MarcketplaceFilters";

type MenuItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

const menuItems: MenuItem[] = [
  { label: "Home", path: "/", icon: Home },
  { label: "Market Place", path: "/recipes", icon: Store },
  { label: "Trending Recipes", path: "/trending", icon: TrendingUp },
  { label: "My Cookbook", path: "/buyer/cookbook", icon: BookOpen },
  { label: "Chefs", path: "/chefs", icon: ChefHat },
  { label: "Profile", path: "/buyer/profile", icon: User },
];

export default function BuyerSideBar() {
  const pathname = usePathname();

  const showSidebar = pathname === "/recipes" || pathname?.startsWith("/buyer");

  if (!showSidebar) {
    return null;
  }

  const isMarketplace = pathname === "/recipes";

  return (
    <aside
      className={[
        "relative flex h-full min-h-0 w-72 shrink-0 flex-col border-r border-slate-200 bg-white shadow-[6px_0_18px_rgba(15,23,42,0.04)]",
        isMarketplace
          ? "overflow-y-auto [scrollbar-gutter:stable] scrollbar-thin scrollbar-track-slate-50 scrollbar-thumb-slate-300"
          : "overflow-hidden",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute right-0 top-0 h-full w-px bg-gradient-to-b from-slate-100 via-slate-200 to-slate-100" />

      <nav className="flex shrink-0 flex-col gap-1 p-4 pb-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={[
                "group flex h-14 w-full items-center rounded-xl border-l-[5px] transition-all duration-200",
                isActive
                  ? "border-teal-600 bg-teal-50 text-teal-700"
                  : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800",
              ].join(" ")}
            >
              <div className="flex w-full items-center gap-4 px-4">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.4 : 2}
                  className={isActive ? "text-teal-600" : "text-slate-400"}
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
      </nav>

      {isMarketplace ? (
        <div className="px-4 pb-6">
          <div className="border-t border-slate-100 pt-6">
            <MarketplaceFilters />
          </div>
        </div>
      ) : null}
    </aside>
  );
}