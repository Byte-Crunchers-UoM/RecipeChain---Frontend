"use client";

import { useRouter, usePathname } from 'next/navigation';
import { ChefHat, LayoutGrid, Users, DollarSign, MessageSquare, LogOut, ShoppingBag } from 'lucide-react';
import { Poppins } from 'next/font/google';

const customFont = Poppins({ subsets: ['latin'], weight: ['600', '700'] });

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const isActive = (path: string) => pathname === path;

  // UPDATED: Navigation Links split into Sellers and Buyers
  const navLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
    { name: 'Sellers', href: '/admin/sellers', icon: ChefHat }, // For Chef Approvals
    { name: 'Buyers', href: '/admin/buyers', icon: Users },      // For Customer Management
    { name: 'Recipes', href: '/admin/recipes', icon: ShoppingBag }, // Changed icon to distinguish from Sellers
    { name: 'Finance', href: '/admin/finance', icon: DollarSign },
    { name: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      
      {/* Brand Logo Area */}
      <div className="flex flex-col items-center pt-6 pb-4 border-b border-gray-100">
        <img src="/images/logo.svg" alt="RecipeChain Logo" className="h-10 mb-2 object-contain" />
        <span className={`text-xl text-[#23262f] tracking-tight ${customFont.className}`}>
          RecipeChain
        </span>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navLinks.map((link) => (
          <div key={link.href} className="flex flex-col">
            <a
              href={link.href}
              onClick={(e) => {
                e.preventDefault();
                router.push(link.href);
              }}
              className={`w-full flex items-center px-4 py-3 rounded-xl font-semibold transition-all ${
                isActive(link.href)
                  ? 'bg-[#149984] text-white shadow-lg shadow-[#149984]/20'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-[#149984]'
              }`}
            >
              <link.icon className={`h-5 w-5 mr-3 flex-shrink-0 ${isActive(link.href) ? 'text-white' : 'text-gray-400'}`} /> 
              {link.name}
            </a>
            
            {/* Cleaner separator logic */}
            {!isActive(link.href) && (
              <div className="h-px border-t border-gray-50 mx-4 my-1 last:hidden" />
            )}
          </div>
        ))}
      </nav>

      {/* Logout Area */}
      <div className="p-4 border-t border-gray-100 mt-auto">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-semibold transition-colors gap-3"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" /> Logout
        </button>
      </div>
      
    </aside>
  );
}