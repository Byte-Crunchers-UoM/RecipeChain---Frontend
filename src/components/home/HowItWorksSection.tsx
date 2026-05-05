//src/components/home/HowItWorksSection.tsx
'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { HowItWorkStep } from '@/lib/constants/home.constants';
import { HOW_IT_WORKS_TITLE, HOW_IT_WORKS_SUBTITLE, HOW_IT_WORKS_STEPS } from '@/lib/constants/home.constants';

interface StepCardProps {
  step: HowItWorkStep;
  index: number;
  isLast: boolean;
}

function StepCard({ step, index, isLast }: StepCardProps): React.ReactElement {
  return (
    <div key={index} className="relative">
      <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 h-full">
        <div className="text-5xl font-black text-green-200 mb-4">{step.step}</div>
        <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
        <p className="text-slate-600 leading-relaxed">{step.description}</p>
      </div>

      {/* Arrow Connector */}
      {!isLast && (
        <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-green-600 rounded-full items-center justify-center z-10">
          <ArrowRight className="w-5 h-5 text-green-600" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export function HowItWorksSection(): React.ReactElement {
  return (
    <section id="how-it-works" className="py-24 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">{HOW_IT_WORKS_TITLE}</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {HOW_IT_WORKS_SUBTITLE}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {HOW_IT_WORKS_STEPS.map((item, idx) => (
            <StepCard 
              key={idx} 
              step={item} 
              index={idx} 
              isLast={idx === HOW_IT_WORKS_STEPS.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
