import React from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

export interface ChartDataPoint {
  day: string;
  value: number;
}

interface AnalyticsChartProps {
  title: string;
  data: ChartDataPoint[];
  loading?: boolean;
  maxValue?: number;
}

export default function AnalyticsChart({
  title,
  data,
  loading = false,
  maxValue: maxValueProp,
}: AnalyticsChartProps) {
  const hasData = data && data.length > 0 && data.some((item) => item.value > 0);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 animate-pulse">
        <div className="h-6 w-40 bg-slate-200 rounded mb-6" />
        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-28 bg-slate-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
        <h3 className="text-xl font-bold text-[#1a2632] mb-6 font-roboto">{title}</h3>
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
          No earnings this week
        </div>
      </div>
    );
  }

  const chartMaxValue = maxValueProp ?? Math.max(...data.map((item) => item.value), 20);
  const threshold = Math.ceil(chartMaxValue / 20) * 20;

  return (
    <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
      <h3 className="text-xl font-bold text-[#1a2632] mb-4 font-roboto">{title}</h3>
      <div className="w-full h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 50, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tickCount={5} domain={[0, threshold]} tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip formatter={(value) => [`${value ?? 0} XRP`, 'Revenue']} cursor={{ fill: 'rgba(13,148,136,0.08)' }} />
            <Bar dataKey="value" fill="#095a53" radius={[8, 8, 0, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#095a53" />
              ))}
              
            </Bar>
          </BarChart>
          
        </ResponsiveContainer>
        
      </div>
      <div className="mt-4 text-right">
        <Link 
          href="/recipes/analytics" 
          className="text-sm font-medium text-[#0d9488] flex items-center justify-end gap-1"
        >
          View detailed analytics <span>→</span>
        </Link>
      </div>
    </div>
  );
}
