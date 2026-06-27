import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from 'recharts';

export interface ChartDataPoint {
  day: string;
  value: number | null;
}

interface AnalyticsChartProps {
  title: string;
  data: ChartDataPoint[];
  loading?: boolean;
  maxValue?: number;
  chartType?: 'bar' | 'line';
}

const WEEK_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const val = payload[0].value !== undefined && payload[0].value !== null 
      ? Number(payload[0].value).toFixed(2) 
      : '0.00';
    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-100/80 p-4 rounded-2xl shadow-[0_12px_30px_rgba(15,23,42,0.08)] flex flex-col gap-1.5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#0d9488] shadow-[0_0_8px_#0d9488]" />
          <p className="text-sm font-bold text-slate-800 font-roboto">
            {val} <span className="text-xs font-semibold text-slate-400">XRP</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const ChartDefs = () => (
  <defs>
    {/* Bar gradient: teal primary to translucent emerald/teal */}
    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#2dd4bf" stopOpacity={1} />
      <stop offset="60%" stopColor="#0d9488" stopOpacity={0.8} />
      <stop offset="100%" stopColor="#0d9488" stopOpacity={0.15} />
    </linearGradient>
    {/* Area fill gradient for line chart */}
    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#0d9488" stopOpacity={0.25} />
      <stop offset="100%" stopColor="#0d9488" stopOpacity={0.0} />
    </linearGradient>
    {/* Glow shadow filter */}
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#0d9488" floodOpacity="0.15" />
    </filter>
  </defs>
);

export default function AnalyticsChart({
  title,
  data,
  loading = false,
  maxValue: maxValueProp,
  chartType = 'bar',
}: AnalyticsChartProps) {
  const orderedData = [...(data || [])];
  const sortedData = orderedData.some((item) => WEEK_ORDER.includes(item.day))
    ? [...orderedData].sort((a, b) => WEEK_ORDER.indexOf(a.day) - WEEK_ORDER.indexOf(b.day))
    : orderedData;
  const hasData = sortedData.length > 0;

  if (loading) {
    return (
      <div className="bg-white rounded-[24px] border border-[#f1f5f9] p-6 animate-pulse">
        <div className="h-6 w-40 rounded-full bg-slate-200 mb-6" />
        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: Math.max(7, sortedData.length || 7) }).map((_, index) => (
            <div key={index} className="h-28 rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="bg-white rounded-[24px] border border-[#f1f5f9] p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[#1a2632] mb-6 font-roboto">{title}</h3>
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-[#f8fafb] text-sm text-slate-500 font-roboto">
          No earnings recorded for this range
        </div>
      </div>
    );
  }

  const chartMaxValue = maxValueProp ?? Math.max(...sortedData.map((item) => item.value ?? 0), 20);
  const threshold = Math.ceil(chartMaxValue / 20) * 20;

  return (
    <div className="bg-white rounded-[24px] border border-[#f1f5f9] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.03)] duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-[#1a2632] font-roboto tracking-tight">{title}</h3>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[#f8fafb] rounded-full border border-slate-100">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0d9488]" />
          <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">XRP Revenue</span>
        </div>
      </div>
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <AreaChart data={sortedData} margin={{ top: 15, right: 15, left: 0, bottom: 0 }}>
              <ChartDefs />
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
                dy={10}
              />
              <YAxis 
                tickCount={5} 
                domain={[0, threshold]} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#0d9488', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0d9488"
                strokeWidth={3}
                fill="url(#areaGradient)"
                dot={{ r: 4, stroke: '#0d9488', strokeWidth: 2, fill: '#ffffff' }}
                activeDot={{ r: 6, fill: '#0d9488', stroke: '#ffffff', strokeWidth: 2 }}
                filter="url(#glow)"
                connectNulls={false}
              >
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(value: any) => `${Number(value ?? 0).toFixed(2)}`}
                  style={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
                  offset={10}
                />
              </Area>
            </AreaChart>
          ) : (
            <BarChart data={sortedData} margin={{ top: 15, right: 15, left: 0, bottom: 0 }}>
              <ChartDefs />
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
                dy={10}
              />
              <YAxis 
                tickCount={5} 
                domain={[0, threshold]} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(13,148,136,0.04)' }} />
              <Bar 
                dataKey="value" 
                radius={[8, 8, 0, 0]} 
                barSize={32} 
                fill="url(#barGradient)"
                className="cursor-pointer transition-all duration-300 hover:opacity-85"
              >
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(value: any) => `${Number(value ?? 0).toFixed(2)}`}
                  style={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
                  offset={10}
                />
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}