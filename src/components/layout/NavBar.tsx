"use client"; 
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Bell } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation'; // 🛠️ 1. Import usePathname
import CartBadge from '../recipe/CartBadge';

export const Navbar = () => {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname(); // 🛠️ 2. Get the current route

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🛠️ 3. Create a custom scroll handler
  const handleHowItWorksClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault(); // Stop Next.js from intercepting
      const section = document.getElementById('how-it-works');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' }); // Scroll smoothly!
      }
    }
  };

  return (
    <nav className="relative z-50 flex items-center justify-between px-8 py-5 bg-white/50 backdrop-blur-sm border-b border-green-100/50">
      
      {/* Logo Section */}
      <Link href="/" className="flex items-center gap-2 cursor-pointer">
        <Image 
          src="/Logo.png" 
          alt="RecipeChain Logo" 
          width={36} 
          height={36} 
          className="h-9 w-auto"
        />
        <div className="text-xl font-bold text-slate-800 tracking-tight">
          RecipeChain
        </div>
      </Link>
      
      {/* Middle Links */}
      <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
        <Link href="/recipes" className="hover:text-[#16a34a] transition-colors">Marketplace</Link>
        
        {/* 🛠️ 4. Attach the onClick handler to the Link */}
        <Link 
          href="/#how-it-works" 
          onClick={handleHowItWorksClick} 
          className="hover:text-[#16a34a] transition-colors"
        >
          How It Works
        </Link>        
        
        <Link href="/ai-assistant" className="hover:text-[#16a34a] transition-colors">AI Assistant</Link>
      </div>

      <div className="flex items-center gap-6 font-medium">
        {isLoading ? (
          <div className="text-slate-600 animate-pulse">Loading...</div>
        ) : isAuthenticated ? (
          <div className="flex items-center gap-4">
            
        

            {/* Shopping Cart */}
            <CartBadge />

            {/* Profile Button & Dropdown */}
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
                    href="/buyer/profile" 
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
                      if (logout) logout(); 
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