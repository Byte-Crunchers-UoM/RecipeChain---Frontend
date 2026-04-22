"use client"; 
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Bell } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import CartBadge from '../recipe/CartBadge';

export const Navbar = () => {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    <nav className="flex items-center justify-between px-8 py-5 bg-white/50 backdrop-blur-sm border-b border-green-100/50">
      
      {/* 🛠️ Logo Section */}
      <Link href="/" className="flex items-center gap-2 cursor-pointer">
        <div className="w-10 h-10 bg-[#16a34a] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
          RC
        </div>
        <div className="text-xl font-bold text-slate-800 tracking-tight">
          RecipeChain
        </div>
      </Link>
      
      {/* Middle Links */}
      <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
        <Link href="/recipes" className="hover:text-[#16a34a] transition-colors">Marketplace</Link>
        <Link href="/how-it-works" className="hover:text-[#16a34a] transition-colors">How It Works</Link>        
        <Link href="/ai-assistant" className="hover:text-[#16a34a] transition-colors">AI Assistant</Link>
      </div>

      <div className="flex items-center gap-6 font-medium">
        {isLoading ? (
          <div className="text-slate-600 animate-pulse">Loading...</div>
        ) : isAuthenticated ? (
          <div className="flex items-center gap-4">
            
            {/* Notifications */}
            <button className="relative text-gray-600 hover:text-[#16a34a] transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold border-2 border-white">
                1
              </span>
            </button>

            {/* Shopping Cart */}
            <CartBadge />

            {/* 🛠️ Profile Button & Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-9 h-9 bg-[#16a34a] text-white rounded-full flex items-center justify-center hover:bg-[#15803d] transition-colors font-semibold shadow-sm ring-2 ring-white"
              >
                {user?.email?.[0]?.toUpperCase() || 'P'}
              </button>
              
              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 py-1 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.email || 'User'}</p>
                  </div>
                  <Link 
                    href="/profile" 
                    onClick={() => setIsProfileOpen(false)}
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-[#16a34a] transition-colors"
                  >
                    My Profile
                  </Link>
                  <Link 
                    href="/settings" 
                    onClick={() => setIsProfileOpen(false)}
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-[#16a34a] transition-colors"
                  >
                    Settings
                  </Link>
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      if (logout) logout(); // 🛠️ Call your logout function
                    }}
                    className="w-full text-left block px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <Link 
              href="/login" 
              className="text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>

            <Link 
              href="/signup" 
              className="flex items-center gap-2 bg-[#16a34a] text-white px-5 py-2.5 rounded-lg hover:bg-[#15803d] transition-colors shadow-sm"
            >
              <Sparkles size={18} />
              Start Cooking
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};