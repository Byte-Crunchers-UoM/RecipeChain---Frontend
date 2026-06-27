import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
}

export default function DashboardCard({
  title,
  value,
  icon,
  trend,
}: DashboardCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[12px] text-[#64748b] mb-2 font-roboto font-medium  tracking-wider">
            {title}
          </p>
          <h3 className="text-2xl font-bold text-[#1a2632] font-roboto">
            {value}
          </h3>
        </div>
        {/* Colorful icon wrapper: soft teal background with a vibrant teal colored icon */}
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#f0fdfa] text-[#0d9488]">
          {icon}
        </div>
      </div>
    </div>
  );
}