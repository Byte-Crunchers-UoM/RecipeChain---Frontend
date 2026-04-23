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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 6a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 16a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2v-4z" />
            </svg>
            {isSidebarOpen && <span>Dashboard</span>}
          </Link>
          <Link href="/recipes" className="flex items-center gap-3 px-4 py-3 text-[#1a2632] hover:bg-[#f8fafb] rounded-lg text-[14px] font-roboto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 14H6M18 14a3 3 0 00-3-3h-6a3 3 0 00-3 3m12 0v2a1 1 0 01-1 1H7a1 1 0 01-1-1v-2m12 0a9 9 0 00-18 0M9 7h6v4H9V7z" />
            </svg>
            {isSidebarOpen && <span>My Recipes</span>}
          </Link>
          <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-[#1a2632] hover:bg-[#f8fafb] rounded-lg text-[14px] font-roboto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {isSidebarOpen && <span>Profile</span>}
          </Link>
          <Link href="/settings" className="flex items-center gap-3 px-4 py-3 text-[#1a2632] hover:bg-[#f8fafb] rounded-lg text-[14px] font-roboto">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
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
