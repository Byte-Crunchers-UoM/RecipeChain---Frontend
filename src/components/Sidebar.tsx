"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
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
} from 'lucide-react';
import { MarketplaceFilters } from "./layout/marcketplace/MarcketplaceFilters";

const Sidebar = () => {
  const [isChefsOpen, setIsChefsOpen] = useState(true);
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isMarketplace = pathname === "/recipes" || pathname === "/marketplace";

  const navLinkClass = (isActive: boolean) => [
    "group relative flex h-14 w-full items-center rounded-xl transition-all duration-200 overflow-hidden",
    isActive
      ? "bg-teal-50 text-teal-700 font-bold"
      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium",
  ].join(" ");

  const activeIndicator = (isActive: boolean) => isActive ? (
    <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-teal-600" />
  ) : null;

  const iconClass = (isActive: boolean) => 
    isActive ? "text-teal-600" : "text-slate-400";

  return (
    <aside className="relative flex h-full w-72 shrink-0 flex-col border-r border-slate-200 bg-white shadow-[6px_0_18px_rgba(15,23,42,0.04)] z-40">
      <div className="pointer-events-none absolute right-0 top-0 h-full w-px bg-gradient-to-b from-slate-100 via-slate-200 to-slate-100" />

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-track-slate-50 scrollbar-thumb-slate-300 pb-4 pt-6">
        <nav className="flex flex-col gap-1 px-4">
          <Link href="/" className={navLinkClass(pathname === "/")}>
            {activeIndicator(pathname === "/")}
            <div className="flex w-full items-center gap-4 px-4">
              <Home size={22} strokeWidth={pathname === "/" ? 2.4 : 2} className={iconClass(pathname === "/")} />
              <span className="text-base">Home</span>
            </div>
          </Link>

          <Link href="/recipes" className={navLinkClass(isMarketplace)}>
            {activeIndicator(isMarketplace)}
            <div className="flex w-full items-center gap-4 px-4">
              <Store size={22} strokeWidth={isMarketplace ? 2.4 : 2} className={iconClass(isMarketplace)} />
              <span className="text-base">Market Place</span>
            </div>
          </Link>

          <Link href="/trending" className={navLinkClass(pathname === "/trending")}>
            {activeIndicator(pathname === "/trending")}
            <div className="flex w-full items-center gap-4 px-4">
              <TrendingUp size={22} strokeWidth={pathname === "/trending" ? 2.4 : 2} className={iconClass(pathname === "/trending")} />
              <span className="text-base">Trending Recipes</span>
            </div>
          </Link>

          <Link href="/buyer/cookbook" className={navLinkClass(pathname === "/buyer/cookbook" || pathname === "/cookbook")}>
            {activeIndicator(pathname === "/buyer/cookbook" || pathname === "/cookbook")}
            <div className="flex w-full items-center gap-4 px-4">
              <BookOpen size={22} strokeWidth={pathname === "/buyer/cookbook" || pathname === "/cookbook" ? 2.4 : 2} className={iconClass(pathname === "/buyer/cookbook" || pathname === "/cookbook")} />
              <span className="text-base">My Cookbook</span>
            </div>
          </Link>

          <div className="mb-1">
            <button
              onClick={() => setIsChefsOpen(!isChefsOpen)}
              className={navLinkClass(pathname?.includes("/chefs") || false)}
            >
              {activeIndicator(pathname?.includes("/chefs") || false)}
              <div className="flex items-center gap-4 px-4">
                <ChefHat size={22} strokeWidth={pathname?.includes("/chefs") ? 2.4 : 2} className={iconClass(pathname?.includes("/chefs") || false)} />
                <span className="text-base">Chefs</span>
              </div>
              <div className="ml-auto pr-4 text-slate-400 group-hover:text-slate-600">
                {isChefsOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </div>
            </button>

            {isChefsOpen && (
              <div className="pl-14 pr-2 space-y-1 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                <Link
                  href="/chefs/explore"
                  className={`flex items-center gap-3 py-2.5 px-3 rounded-lg text-[15px] font-medium transition-all ${pathname === '/chefs/explore' ? 'text-teal-700 bg-teal-50 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                >
                  <User size={18} strokeWidth={pathname === '/chefs/explore' ? 2.4 : 2} className={pathname === '/chefs/explore' ? 'text-teal-600' : 'text-slate-400'} />
                  <span>Explore Chefs</span>
                </Link>
                <Link
                  href="/chefs/followed"
                  className={`flex items-center gap-3 py-2.5 px-3 rounded-lg text-[15px] font-medium transition-all ${pathname === '/chefs/followed' ? 'text-teal-700 bg-teal-50 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
                >
                  <User size={18} strokeWidth={pathname === '/chefs/followed' ? 2.4 : 2} className={pathname === '/chefs/followed' ? 'text-teal-600' : 'text-slate-400'} />
                  <span>Followed Chefs</span>
                </Link>
              </div>
            )}
          </div>

          <Link href="/buyer/profile" className={navLinkClass(pathname === "/buyer/profile" || pathname === "/profile")}>
            {activeIndicator(pathname === "/buyer/profile" || pathname === "/profile")}
            <div className="flex w-full items-center gap-4 px-4">
              <User size={22} strokeWidth={pathname === "/buyer/profile" || pathname === "/profile" ? 2.4 : 2} className={iconClass(pathname === "/buyer/profile" || pathname === "/profile")} />
              <span className="text-base">Profile</span>
            </div>
          </Link>
        </nav>

        {isMarketplace && (
          <div className="px-4 mt-6">
            <div className="border-t border-slate-100 pt-6">
              <MarketplaceFilters />
            </div>
          </div>
        )}
        {/* Footer (Logout) inside scrollable area */}
        <div className="px-4 mt-6">
          <div className="border-t border-slate-100 pt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 h-12 text-[#ff4d4d] hover:bg-red-50 rounded-xl transition-all font-medium"
            >
              <LogOut size={20} />
              <span className="text-base">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
