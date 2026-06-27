'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const pathname = usePathname();
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    async function fetchSellerProfile() {
      if (!isAuthenticated || !user) {
        setProfile(null);
        return;
      }

      try {
        const { data: sellerData, error } = await supabase
          .from('sellers')
          .select('*')
          .eq('user_id', user.user_id)
          .single();

        if (error || !sellerData) {
          setProfile({
            full_name: user.name || "Chef",
            display_name: user.name || "",
            profile_photo: null,
            verify_badge_status: 'unverified',
          });
        } else {
          setProfile({
            full_name: sellerData.full_name || sellerData.name || "Chef",
            display_name: sellerData.display_name || sellerData.name || "",
            profile_photo: sellerData.profile_photo || sellerData.avatar_url || null,
            verify_badge_status: sellerData.verify_badge_status || 'unverified',
          });
        }
      } catch (err) {
        console.error("Error fetching seller profile:", err);
      }
    }

    fetchSellerProfile();
  }, [user, isAuthenticated]);

  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
  };

  const headerInfo = (() => {
    if (pathname.includes('/analytics')) return { title: 'Analytics', subtitle: 'Track your recipe performance and revenue.' };
    if (pathname.includes('/recipes')) return { title: 'My Recipes', subtitle: 'Manage all your recipes!' };
    if (pathname.includes('/profile')) return { title: 'Your Profile', subtitle: 'Manage your personal details!' };
    if (pathname.includes('/settings')) return { title: 'Settings', subtitle: 'Account preferences' };
    return { title: 'Dashboard', subtitle: 'Welcome back, Chef!' };
  })();

  const getLinkStyle = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center gap-3 px-4 py-3 rounded-lg text-[14px] font-roboto transition-all duration-200 ${
      isActive ? "text-[#0d9488] bg-[#e0f2f1] font-medium shadow-sm" : "text-[#1a2632] hover:bg-gray-50 hover:text-[#0d9488]"
    }`;
  };

  return (
    <div className="flex h-screen bg-[#f8fafb]">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-[#e5e7eb] transition-all duration-300 flex flex-col`}>
        <div className="p-6 border-b border-[#e5e7eb] flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2 font-roboto">
              <img src="/Logo.png" alt="RecipeChain Logo" className="w-8 h-8 object-contain" />
              <span className="font-bold text-[#1a2632] text-[14px]">RecipeChain</span>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-[#64748b] p-2 hover:bg-gray-100 rounded-md">☰</button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2">
          <Link href="/dashboard" className={getLinkStyle('/dashboard')} suppressHydrationWarning={true}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4z" strokeWidth={1.5} /></svg>
            {isSidebarOpen && <span>Dashboard</span>}
          </Link>
          <Link href="/recipes/analytics" className={getLinkStyle('/recipes/analytics')} suppressHydrationWarning>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 17h3V9H3v8zm6 0h3V5H9v12zm6 0h3V11h-3v6zm6 0h3V13h-3v4z" strokeWidth={1.5} /></svg>
            {isSidebarOpen && <span>Analytics</span>}
          </Link>
          <Link href="/recipes" className={getLinkStyle('/recipes')} suppressHydrationWarning>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            {isSidebarOpen && <span>My Recipes</span>}
          </Link>
          <Link href="/profile" className={getLinkStyle('/profile')}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth={1.5} /></svg>
            {isSidebarOpen && <span>Profile</span>}
          </Link>
        </nav>

        <div className="px-3 py-6 border-t border-[#e5e7eb]">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg text-[14px]">
            <span className="text-xl">🚪</span>
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-[#e5e7eb] px-8 py-4 flex items-center justify-between sticky top-0 z-10 font-roboto">
          <div>
            <h2 className="text-[18px] font-bold text-[#1a2632] leading-tight">{headerInfo.title}</h2>
            <p className="text-[12px] text-[#64748b]">{headerInfo.subtitle}</p>
          </div>

          <div className="flex items-center gap-3 pl-2 pr-6 py-1.5 border border-slate-200 rounded-full bg-white shadow-sm hover:shadow-md transition-all cursor-pointer min-w-[180px] h-[48px] justify-center">
            {profile ? (
              <>
                <div className={`relative flex-shrink-0 w-9 h-9 rounded-full ${profile?.verify_badge_status === 'verified' ? 'ring-2 ring-blue-500 p-[1.5px]' : ''}`}>
                  <div className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-[12px] overflow-hidden bg-[#0d9488]">
                    {profile?.profile_photo ? (
                      <img src={profile.profile_photo} alt="Chef" className="h-full w-full object-cover" />
                    ) : (
                      <span>{getInitials(profile?.display_name || profile?.full_name || "Chef")}</span>
                    )}
                  </div>
                  
                  {profile?.verify_badge_status === 'verified' && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full border border-white">
                      <svg className="w-1 h-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-slate-800 whitespace-nowrap min-w-[70px] text-center">
                    {profile?.display_name || profile?.full_name || "Chef"}
                  </span>
                </div>
              </>
            ) : (
              <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}