import React from 'react';
import Image from 'next/image';
import { Search, Bell, ShoppingCart } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-[75px] bg-white px-10 flex items-center justify-between border-b border-slate-200 sticky top-0 z-40">
      <div className="flex items-center gap-3 w-[200px]">
        <Image 
          src="/logo.png" 
          alt="RecipeChain Logo" 
          width={32} 
          height={32} 
          className="h-8 w-auto"
        />
        <span className="text-xl font-bold text-slate-800 font-outfit">RecipeChain</span>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl px-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search updates" 
            className="w-full bg-[#f8fafc] border border-slate-200 rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#008080]/20 focus:border-[#008080] transition-all text-sm"
          />
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-6 w-[200px] justify-end">
        <button className="relative text-slate-500 hover:text-[#008080] transition-all">
          <Bell size={22} />
          <span className="absolute -top-1 -right-1 bg-[#ff4d4d] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">2</span>
        </button>
        <button className="relative text-slate-500 hover:text-[#008080] transition-all">
          <ShoppingCart size={22} />
          <span className="absolute -top-1 -right-1 bg-[#008080] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">2</span>
        </button>
        <div className="w-10 h-10 bg-[#008080] rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:bg-[#006666] transition-all">
          JD
        </div>
      </div>
    </header>
  );
};

export default Header;
