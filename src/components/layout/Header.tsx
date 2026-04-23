'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Sparkles } from 'lucide-react';
import { SearchBar } from './marcketplace/SearchBar';
import { usePathname } from 'next/navigation';
import CartBadge from '../recipe/CartBadge';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  notificationCount?: number;
}

export default function Header({ notificationCount = 0 }: HeaderProps) {
  //  1. Bring in Auth State
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isMarcketplace = pathname === '/recipes';

  //  2. Click outside logic to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-6">
        
        {/* Logo and Title */}
        <Link href="/" className="flex items-center gap-2 min-w-fit cursor-pointer">
          <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">RC</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">RecipeChain</h1>
        </Link>

        {/* Search Bar */}
        {isMarcketplace && (
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <SearchBar />
          </div>
        )}

        {/* Right Side Section */}
        <div className="flex items-center gap-4 md:gap-6 font-medium">
          {isLoading ? (
            // Loading State
            <div className="text-slate-500 animate-pulse text-sm">Loading...</div>
          ) : isAuthenticated ? (
            // 🛠️ 3. Logged In View (Notifications, Cart, Profile)
            <>
              {/* Notifications */}
              <button className="relative text-gray-600 hover:text-teal-500 transition-colors">
                <Bell className="w-6 h-6" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                    {notificationCount}
                  </span>
                )}
              </button>

              {/* Shopping Cart */}
              <CartBadge />

              {/* Profile Button & Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors font-semibold shadow-sm ring-2 ring-white"
                >
                  {user?.email?.[0]?.toUpperCase() || 'P'}
                </button>
                
                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user?.email || 'User'}
                      </p>
                    </div>
                    <Link 
                      href="/profile" 
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                    >
                      My Profile
                    </Link>
                    <Link 
                      href="/settings" 
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors"
                    >
                      Settings
                    </Link>
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        if (logout) logout();
                      }}
                      className="w-full text-left block px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // 🛠️ 4. Logged Out View (Sign In / Sign Up)
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="text-slate-700 hover:text-slate-900 transition-colors font-medium hidden sm:block"
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="flex items-center gap-2 bg-teal-500 text-white px-5 py-2.5 rounded-lg hover:bg-teal-600 transition-colors shadow-sm font-medium"
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