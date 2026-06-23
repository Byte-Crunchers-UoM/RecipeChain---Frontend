'use client';

import React from 'react';
import type { Stat } from '@/lib/constants/home.constants';
import { STATS } from '@/lib/constants/home.constants';

interface StatItemProps {
  stat: Stat;
  index: number;
}

/** Renders an individual statistic item containing a value and a label. */
function StatItem({ stat, index }: StatItemProps): React.ReactElement {
  return (
    <div key={index} className="group text-center">
      <div className="text-4xl lg:text-5xl font-black mb-2 group-hover:scale-110 transition-transform duration-300">
        {stat.value}
      </div>
      <p className="text-green-50 font-semibold">{stat.label}</p>
    </div>
  );
}

/** Renders a section displaying various community and platform statistics. */
export function StatsSection(): React.ReactElement {
  return (
    <section className="py-24 bg-linear-to-r from-[#16a34a] to-[#15803d] text-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid md:grid-cols-4 gap-12">
          {STATS.map((stat, idx) => (
            <StatItem key={idx} stat={stat} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
