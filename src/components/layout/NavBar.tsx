import React from 'react';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-8 py-5 bg-white/50 backdrop-blur-sm border-b border-green-100/50">
      <div className="flex items-center gap-2 cursor-pointer">
        <div className="w-10 h-10 bg-[#16a34a] rounded-lg flex items-center justify-center text-white font-bold">
          RC
        </div>
        <div className="w-24 h-6 bg-[#16a34a] rounded"></div>
      </div>
      
      <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
        <Link href="/recipes" className="hover:text-[#16a34a] transition-colors">Marketplace</Link>
        <Link href="/how-it-works" className="hover:text-[#16a34a] transition-colors">How It Works</Link>
        <Link href="/chefs" className="hover:text-[#16a34a] transition-colors">For Chefs</Link>
        <Link href="/ai-assistant" className="hover:text-[#16a34a] transition-colors">AI Assistant</Link>
      </div>

      <div className="flex items-center gap-6 font-medium">
        <button className="text-slate-700 hover:text-slate-900 transition-colors">Sign In</button>
        <button className="flex items-center gap-2 bg-[#16a34a] text-white px-5 py-2.5 rounded-lg hover:bg-[#15803d] transition-colors shadow-sm">
          <Sparkles size={18} />
          Start Cooking
        </button>
      </div>
    </nav>
  );
};