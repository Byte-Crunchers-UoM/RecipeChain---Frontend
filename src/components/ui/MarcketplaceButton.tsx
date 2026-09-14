"use client";

import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const BrowseMarketplaceBtn = () => {
  return (
    <Link 
      href="/recipes" 
      className="
        /* Layout & Sizing */
        inline-flex items-center justify-center gap-2 
        px-6 h-13 min-w-55 rounded-xl
        
        /* Branding & Colors */
        bg-[#16a34a] text-white font-semibold text-[15px]
        
        /* Shadow & Effects */
        shadow-lg shadow-green-600/20 
        transition-all duration-200 
        
        /* Interactions */
        hover:bg-[#15803d] hover:-translate-y-0.5
        active:scale-[0.98] 
        group
      "
    >
      <ShoppingBag size={18} className="mr-1" />
      <span>Browse Marketplace</span>
      <ArrowRight 
        size={18} 
        className="ml-1 transition-transform group-hover:translate-x-1" 
      />
    </Link>
  );
};