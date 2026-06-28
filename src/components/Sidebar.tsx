"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { supabase } from '@/services/supabaseClient';
import {
  Home,
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  ChefHat,
  User,
  LogOut,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const [isChefsOpen, setIsChefsOpen] = React.useState(true);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navLinkClass = (path: string) => `
    flex items-center gap-3 px-6 py-3 transition-all border-l-4 
    ${isActive(path)
      ? 'text-[#008080] bg-[#e6f2f2] border-[#008080] font-semibold'
      : 'text-slate-500 hover:bg-[#e6f2f2] hover:text-[#008080] border-transparent'}
  `;

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-white border-r border-slate-200 flex flex-col py-6 z-50">
      <div className="px-8 mb-10 flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="RecipeChain Logo"
          width={32}
          height={32}
          className="h-8 w-auto"
        />
        <span className="text-xl font-bold text-slate-800 font-outfit">RecipeChain</span>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <Link href="/" className="flex items-center gap-3 px-6 py-3 text-slate-500 hover:bg-[#e6f2f2] hover:text-[#008080] transition-all border-l-4 border-transparent">
          <Home size={20} />
          <span className="font-medium">Home</span>
        </Link>

        <Link href="/marketplace" className={navLinkClass('/marketplace')}>
          <LayoutDashboard size={20} />
          <span className="font-medium">Market Place</span>
        </Link>

        <Link href="/trending" className={navLinkClass('/trending')}>
          <TrendingUp size={20} />
          <span className="font-medium">Trending Recipes</span>
        </Link>

        <Link href="/cookbook" className={navLinkClass('/cookbook')}>
          <BookOpen size={20} />
          <span className="font-medium">My Cookbook</span>
        </Link>

        <div className="mb-2">
          <button
            onClick={() => setIsChefsOpen(!isChefsOpen)}
            className={`w-full flex items-center justify-between px-6 py-3 text-slate-500 hover:bg-[#e6f2f2] hover:text-[#008080] transition-all border-l-4 border-transparent group ${pathname.includes('/chefs') ? 'text-[#008080]' : ''}`}
          >
            <div className="flex items-center gap-3">
              <ChefHat size={20} />
              <span className="font-medium">Chefs</span>
            </div>
            {isChefsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {isChefsOpen && (
            <div className="pl-12 pr-4 space-y-1 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
              <Link
                href="/chefs/explore"
                className={`flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium transition-all ${isActive('/chefs/explore') ? 'text-[#008080] bg-[#e6f2f2]' : 'text-slate-500 hover:bg-[#e6f2f2] hover:text-[#008080]'}`}
              >
                <User size={18} />
                <span>Explore Chefs</span>
              </Link>
              <Link
                href="/chefs/followed"
                className={`flex items-center gap-3 py-2 px-3 rounded-lg text-sm font-medium transition-all ${isActive('/chefs/followed') ? 'text-[#008080] bg-[#e6f2f2]' : 'text-slate-500 hover:bg-[#e6f2f2] hover:text-[#008080]'}`}
              >
                <User size={18} />
                <span>Followed Chefs</span>
              </Link>
            </div>
          )}
        </div>

        <Link href="/profile" className={navLinkClass('/profile')}>
          <User size={20} />
          <span className="font-medium">Profile</span>
        </Link>
      </nav>

      <div className="pt-6 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-6 py-3 text-[#ff4d4d] hover:bg-red-50 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
