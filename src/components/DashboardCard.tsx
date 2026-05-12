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
    <div className="bg-gradient-to-br from-[#e0f2f] to-[#b2dfdb] rounded-lg p-6 border border-[#0d9488] border-opacity-20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-[12px] text-[#64748b] mb-2 font-roboto">{title}</p>
          <h3 className="text-2xl font-bold text-[#1a2632] mb-2 font-roboto">{value}</h3>
          
        </div>
        <div className="text-[#0d9488] opacity-80">
          {icon}
        </div>
      </div>
    </div>
  );
}
