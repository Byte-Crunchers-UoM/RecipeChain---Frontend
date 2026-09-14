import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Twitter, Github, MessageSquare, HelpCircle } from 'lucide-react';

// 1. Define the data structure outside the component to keep JSX clean
const footerSections = [
  {
    title: 'PLATFORM',
    links: [
      { label: 'Marketplace', href: '/marketplace' },
      // UPDATED: Added '/#' to route to the home page and scroll to the ID
      { label: 'How It Works', href: '/#how-it-works' }, 
      { label: 'Pricing', href: '/pricing' },
      { label: 'AI Assistant', href: '/ai-assistant' },
      { label: 'For Chefs', href: '/chefs' },
    ],
  },
  {
    title: 'COMPANY',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'LEGAL',
    links: [
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' }
    ],
  },
  {
    title: 'CUISINE',
    links: [
      { label: 'Italian', href: '/category/italian' },
      { label: 'Japanese', href: '/category/japanese' },
      { label: 'Vegan & Plant-based', href: '/category/vegan' },
      { label: 'Keto & Low-carb', href: '/category/keto' },
      { label: 'Desserts', href: '/category/desserts' },
    ],
  },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#0f172a] text-slate-400 py-16 border-t border-slate-800 font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Top Section: Brand & Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          
          {/* Brand Column (Spans 2 columns on large screens) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3 w-fit">
              <Image
                src="/logo.png"
                alt="RecipeChain Logo"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
              />
              <span className="text-2xl font-bold text-[#10b981] tracking-tight">RecipeChain</span>
            </Link>
            
            <p className="text-slate-400 leading-relaxed max-w-sm">
              The crypto-powered recipe marketplace connecting world-class chefs with hungry home cooks.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4 mt-2">
              <a href="#" aria-label="Twitter" className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" aria-label="GitHub" className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="#" aria-label="Discord" className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors">
                <MessageSquare size={20} />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-6">
              <h3 className="text-sm font-bold text-white tracking-widest uppercase">
                {section.title}
              </h3>
              <nav className="flex flex-col gap-4">
                {section.links.map((link) => (
                  <Link 
                    key={link.label} 
                    href={link.href}
                    className="text-slate-400 hover:text-[#10b981] transition-colors w-fit"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-slate-800 mb-8" />

        {/* Bottom Section: Crypto Tags & Copyright */}
        <div className="flex flex-col items-center gap-6">

          {/* Copyright */}
          <p className="text-sm text-slate-500 text-center">
            &copy; {currentYear} RecipeChain. All rights reserved. &middot; Powered by blockchain technology.
          </p>
        </div>
      </div>

      {/* Floating Help Button (Bottom Right) */}
      <button 
        aria-label="Help"
        className="fixed bottom-6 right-6 p-3 bg-slate-800 text-slate-300 rounded-full border border-slate-700 shadow-xl hover:bg-slate-700 hover:text-white transition-all z-50"
      >
        <HelpCircle size={24} />
      </button>
    </footer>
  );
};