'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#f8fafb]">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-[#e5e7eb] transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-[#e5e7eb] flex items-center justify-between">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0d9488] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-[12px]">RC</span>
              </div>
              <span className="font-bold text-[#1a2632] font-roboto text-[14px]">RecipeChain</span>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-[#64748b] hover:text-[#1a2632] p-2"
          >
            ☰
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-[#0d9488] bg-[#e0f2f1] rounded-lg font-medium text-[14px] font-roboto">
            <span className="text-xl">⊞</span>
            {isSidebarOpen && <span>Dashboard</span>}
          </Link>
          <Link href="/recipes" className="flex items-center gap-3 px-4 py-3 text-[#1a2632] hover:bg-[#f8fafb] rounded-lg text-[14px] font-roboto">
            <span className="text-xl">👨‍🍳</span>
            {isSidebarOpen && <span>My Recipes</span>}
          </Link>
          <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-[#1a2632] hover:bg-[#f8fafb] rounded-lg text-[14px] font-roboto">
            <span className="text-xl">👤</span>
            {isSidebarOpen && <span>Profile</span>}
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-[#1a2632] hover:bg-[#f8fafb] rounded-lg text-[14px] font-roboto">
            <span className="text-xl">⚙️</span>
            {isSidebarOpen && <span>Settings</span>}
          </Link>
        </nav>

        {/* Logout */}
        <div className="px-3 py-6 border-t border-[#e5e7eb]">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg text-[14px] font-roboto">
            <span className="text-xl">🚪</span>
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-[#e5e7eb] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-[#1a2632] font-roboto">Dashboard</h2>
            <p className="text-[12px] text-[#64748b] font-roboto">Welcome back, Chef Anuradha</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#0d9488] rounded-full flex items-center justify-center text-white font-bold text-[12px]">
              CA
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
