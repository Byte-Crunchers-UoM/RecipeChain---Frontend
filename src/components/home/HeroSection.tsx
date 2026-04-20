'use client';

import React from 'react';
import { Sparkles, Bot, Star } from 'lucide-react';
import { BrowseMarketplaceBtn } from '@/components/ui/MarcketplaceButton';
import { HERO_TAGLINE, HERO_TITLE, HERO_DESCRIPTION, CHEFS_TRUST_COUNT } from '@/lib/constants/home.constants';

export function HeroSection(): React.ReactElement {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-[#eaf7f0] via-white to-[#f0f9ff] pt-20 pb-32">
      {/* Decorative blurs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-8 pt-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="flex flex-col gap-8">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold w-max border border-green-200">
              <Sparkles size={16} />
              {HERO_TAGLINE}
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl lg:text-6xl font-black leading-tight tracking-tight">
              {HERO_TITLE.split(' Chef').map((part, idx) => (
                <React.Fragment key={idx}>
                  {part}
                  {idx === 0 && (
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-[#16a34a] to-[#15803d]">
                      {' Chef'}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </h1>

            {/* Description */}
            <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
              {HERO_DESCRIPTION}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <BrowseMarketplaceBtn />
              <button 
                className="flex items-center justify-center gap-2 bg-linear-to-r from-orange-50 to-amber-50 border-2 border-orange-200 text-orange-600 px-6 py-3.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                aria-label="Ask AI Chef for recipe recommendations"
              >
                <Bot size={20} />
                Ask AI Chef
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 pt-4 border-t border-slate-200">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-linear-to-br from-green-400 to-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    aria-label={`User ${i}`}
                  >
                    {i}
                  </div>
                ))}
              </div>
              <div className="text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{CHEFS_TRUST_COUNT}</span> chefs trust RecipeChain
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </section>
  );
}
