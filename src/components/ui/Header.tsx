'use client';

import { Search, Bell, ShoppingCart, Menu } from 'lucide-react';

interface HeaderProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
}

export function Header({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) {
  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40 w-full">
      
      {/* 1. Left Section: Title + Mobile Toggle */}
      <div className="flex items-center gap-4">
        {/* Mobile Toggle (Hidden on Desktop) */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden p-2 -ml-2 hover:bg-gray-50 rounded-md text-gray-600"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Page Title */}
        <h1 className="font-bold text-xl text-gray-900 tracking-tight">
          RecipeChain
        </h1>
      </div>

      {/* 2. Center Section: Search Bar */}
      <div className="flex-1 max-w-2xl px-8 hidden md:block">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search your cookbook" 
            className="w-full bg-gray-50 text-gray-600 text-sm rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:bg-white transition-all border border-transparent hover:bg-gray-100"
          />
        </div>
      </div>

      {/* 3. Right Section: Icons & Profile */}
      <div className="flex items-center gap-5">
        
        {/* Notification Bell */}
        <button className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-500 hover:text-gray-700">
          <Bell className="w-6 h-6 stroke-[1.5]" />
        </button>

        {/* Shopping Cart with Badge */}
        <button className="p-2 hover:bg-gray-50 rounded-full transition-colors relative text-gray-500 hover:text-gray-700 mr-2">
          <ShoppingCart className="w-6 h-6 stroke-[1.5]" />
          {/* Badge */}
          <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center rounded-full border-2 border-white">
            2
          </span>
        </button>

        {/* User Profile Avatar */}
        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-sm shadow-emerald-200 cursor-pointer hover:opacity-90 transition-opacity">
          JD
        </div>

      </div>
    </header>
  );
}