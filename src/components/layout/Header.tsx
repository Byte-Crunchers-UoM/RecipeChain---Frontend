'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Bell, ShoppingCart, User } from 'lucide-react';

interface HeaderProps {
  cartCount?: number;
  notificationCount?: number;
}

export default function Header({ cartCount = 0, notificationCount = 0 }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-6">
        {/* Logo and Title */}
        <div className="flex items-center gap-2 min-w-fit">
          <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">🍳</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-800">RecipeChain</h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your cookbook"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button className="relative text-gray-600 hover:text-teal-500 transition-colors">
            <Bell className="w-6 h-6" />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Shopping Cart */}
          <button className="relative text-gray-600 hover:text-teal-500 transition-colors">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* Profile Button */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center hover:bg-teal-600 transition-colors font-semibold"
            >
              P
            </button>
            
            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  My Profile
                </Link>
                <Link href="/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Settings
                </Link>
                <Link href="/logout" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 border-t border-gray-200">
                  Logout
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}