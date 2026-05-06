'use client';

import React from 'react';
import type { Feature } from '@/lib/constants/home.constants';
import { FEATURES_TITLE, FEATURES_SUBTITLE, FEATURES } from '@/lib/constants/home.constants';

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

/** Renders a card displaying a specific platform feature with an icon, title, and description. */
function FeatureCard({ feature, index }: FeatureCardProps): React.ReactElement {
  const IconComponent = feature.icon;

  return (
    <div
      key={index}
      className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-slate-200 hover:border-green-200 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="w-14 h-14 bg-linear-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        <IconComponent className="w-7 h-7 text-green-600" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
    </div>
  );
}

/** Renders a section highlighting the core features and benefits of the platform. */
export function FeaturesSection(): React.ReactElement {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">{FEATURES_TITLE}</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {FEATURES_SUBTITLE}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
