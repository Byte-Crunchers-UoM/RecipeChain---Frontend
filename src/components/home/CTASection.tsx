'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { BrowseMarketplaceBtn } from '@/components/ui/MarcketplaceButton';
import { CTA_TITLE, CTA_DESCRIPTION, CTA_BECOME_CHEF_TEXT } from '@/lib/constants/home.constants';

export function CTASection(): React.ReactElement {
  return (
    <section className="py-24 bg-linear-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-8 text-center">
        {/* Heading */}
        <h2 className="text-4xl lg:text-5xl font-black mb-6">
          {CTA_TITLE}
        </h2>

        {/* Description */}
        <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
          {CTA_DESCRIPTION}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <BrowseMarketplaceBtn />
          <button 
            className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300"
            aria-label="Become a chef and start selling recipes"
          >
            {CTA_BECOME_CHEF_TEXT} <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
