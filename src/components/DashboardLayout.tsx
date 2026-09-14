//src/components/DashboardLayout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, BookOpen, LayoutDashboard, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
  { label: 'Dashboard', path: '/seller/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', path: '/seller/recipes/analytics', icon: BarChart3 },
  { label: 'My Recipes', path: '/seller/recipes', icon: BookOpen },
  { label: 'Profile', path: '/seller/profile', icon: User },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
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
    if (pathname.includes('/seller/recipes/analytics')) return { title: 'Analytics', subtitle: 'Track your recipe performance and revenue.' };
    if (pathname.includes('/seller/recipes')) return { title: 'My Recipes', subtitle: 'Manage all your recipes!' };
    if (pathname.includes('/seller/profile')) return { title: 'Your Profile', subtitle: 'Manage your personal details!' };
    if (pathname.includes('/seller/settings')) return { title: 'Settings', subtitle: 'Account preferences' };
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
      <aside className="relative flex h-full min-h-0 w-72 shrink-0 flex-col border-r border-slate-200 bg-white shadow-[6px_0_18px_rgba(15,23,42,0.04)]">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-px bg-gradient-to-b from-slate-100 via-slate-200 to-slate-100" />

        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <img src="/Logo.png" alt="RecipeChain Logo" className="h-10 w-10 rounded-2xl object-contain" />
            <div>
            <span className="text-xl font-bold tracking-tight text-slate-800">
            RecipeChain
          </span>
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-4 py-5">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={[
                  'group flex h-14 w-full items-center rounded-xl border-l-[5px] transition-all duration-200',
                  isActive
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                ].join(' ')}
              >
                <div className="flex w-full items-center gap-4 px-4">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.4 : 2}
                    className={isActive ? 'text-teal-600' : 'text-slate-400'}
                  />

                  <span className={[
                    'text-base',
                    isActive ? 'font-bold' : 'font-medium',
                  ].join(' ')}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-[#e5e7eb] px-8 py-5 flex items-center justify-between sticky top-0 z-10 font-roboto">
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