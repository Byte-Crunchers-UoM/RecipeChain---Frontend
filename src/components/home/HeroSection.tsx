// src/components/home/HeroSection.tsx
'use client';

import React from 'react';
import { Sparkles, Bot, Star, ShieldCheck, Cpu } from 'lucide-react';
import { BrowseMarketplaceBtn } from '@/components/ui/MarcketplaceButton';
import { HERO_TAGLINE, HERO_TITLE, HERO_DESCRIPTION, CHEFS_TRUST_COUNT } from '@/lib/constants/home.constants';

/** Renders the hero section of the landing page, displaying the main tagline, call-to-actions, and visually engaging elements. */
export function HeroSection(): React.ReactElement {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-[#eaf7f0] via-white to-[#f0f9ff] pt-20 pb-32">
      
      {/* 1. Tech/Grid Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

      {/* Decorative Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-20 w-125 h-125 bg-green-300/20 rounded-full blur-[100px]"></div>
        <div className="absolute top-40 -left-40 w-100 h-100 bg-blue-300/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-8 pt-12 lg:pt-20">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* ================= LEFT CONTENT: TEXT & CTAs ================= */}
          <div className="flex flex-col gap-8 z-10">
            
            {/* Animated Tagline Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md text-green-700 px-4 py-2 rounded-full text-sm font-bold w-max border border-green-200 shadow-sm shadow-green-100/50 animate-fade-in">
              <Sparkles size={16} className="text-green-500" />
              <span className="tracking-wide uppercase text-xs">{HERO_TAGLINE}</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight text-slate-900">
              {HERO_TITLE.split(' Chef').map((part, idx) => (
                <React.Fragment key={idx}>
                  {part}
                  {idx === 0 && (
                    <span className="relative whitespace-nowrap">
                      <span className="absolute -inset-1 bg-linear-to-r from-green-100 to-emerald-50 rounded-lg -z-10 transform scale-y-90 origin-bottom"></span>
                      <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-emerald-500">
                        {' Chef'}
                      </span>
                    </span>
                  )}
                </React.Fragment>
              ))}
            </h1>

            {/* Description */}
            <p className="text-lg text-slate-600 max-w-lg leading-relaxed font-medium">
              {HERO_DESCRIPTION}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <BrowseMarketplaceBtn />
              
              <button 
                className="group flex items-center justify-center gap-2 bg-white border border-orange-200/60 text-orange-600 px-6 py-3.5 rounded-xl font-semibold hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 shadow-sm hover:shadow-md"
                aria-label="Ask AI Chef for recipe recommendations"
              >
                <div className="bg-orange-100 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                  <Bot size={18} className="text-orange-600" />
                </div>
                Ask AI Chef
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-5 pt-6 mt-4 border-t border-slate-200/60">
              <div className="flex -space-x-3">
                {[
                  "bg-emerald-500", 
                  "bg-blue-500", 
                  "bg-orange-400", 
                  "bg-purple-500"
                ].map((bgColor, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full ${bgColor} border-2 border-white flex items-center justify-center text-white shadow-sm ring-2 ring-transparent hover:ring-slate-200 transition-all`}
                  >
                    <Star size={14} className="fill-white/80 text-transparent" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(star => <Star key={star} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <div className="text-sm text-slate-600 mt-0.5">
                  <span className="font-bold text-slate-900">{CHEFS_TRUST_COUNT}</span> chefs trust us
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT CONTENT: GLASSMORPHISM VISUAL ================= */}
          <div className="hidden md:flex relative justify-center items-center lg:h-125">
            
            {/* Center Main Card */}
            <div className="relative z-10 bg-white/70 backdrop-blur-xl border border-white/80 shadow-2xl rounded-4xl p-5 w-[320px] lg:w-90 transform transition-transform duration-700 hover:scale-[1.02]">
              
              {/* Image Placeholder area */}
              <div className="w-full h-48 bg-linear-to-br from-slate-100 to-green-50 rounded-2xl mb-5 relative overflow-hidden flex items-center justify-center group">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544025162-83173d1f1437?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-80 mix-blend-multiply transition-transform duration-700 group-hover:scale-110"></div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold text-slate-800 shadow-sm">
                  <Cpu size={14} className="text-blue-500" />
                  Smart Recipe
                </div>
              </div>

              {/* Card Content */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-xl">Wagyu Steak Frites</h3>
                  <p className="text-sm text-slate-500 font-medium">By Chef Gordon R.</p>
                </div>
                <div className="bg-emerald-100/80 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-black border border-emerald-200/50">
                  25 XRP
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                   <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 4.9 (128)
                </div>
                <div className="text-xs text-slate-400 font-medium bg-slate-50 px-2 py-1 rounded-md">
                  Blockchain Verified
                </div>
              </div>
            </div>

            {/* Floating Badge 1: AI (Top Right) */}
            <div className="absolute -right-6 top-8 z-20 bg-white/90 backdrop-blur-md border border-slate-100 shadow-xl rounded-2xl p-4 flex items-center gap-3 animate-[bounce_4s_ease-in-out_infinite]">
              <div className="bg-linear-to-br from-orange-100 to-amber-50 p-2.5 rounded-xl shadow-inner">
                <Bot className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">AI Pairings</p>
                <p className="text-xs text-slate-500 font-medium">Wine & Sides</p>
              </div>
            </div>

            {/* Floating Badge 2: Security (Bottom Left) */}
            <div className="absolute -left-12 bottom-12 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700 shadow-2xl rounded-2xl p-4 flex items-center gap-3 animate-[bounce_5s_ease-in-out_infinite_reverse]">
               <div className="bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
               <div>
                <p className="text-sm font-bold text-white">Smart Contract</p>
                <p className="text-xs text-emerald-400 font-medium">Ownership Minted</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}