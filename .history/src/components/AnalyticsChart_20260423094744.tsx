import React from 'react';

interface ChartDataPoint {
  day: string;
  value: number;
}

interface AnalyticsChartProps {
  title: string;
  data: ChartDataPoint[];
  maxValue?: number;
}

export default function AnalyticsChart({
  title,
  data,
  maxValue = 100,
}: AnalyticsChartProps) {
  const height = 160;
  const padding = 30;
  const chartHeight = height - padding * 2;
  const chartWidth = 400;
  const barWidth = chartWidth / (data.length * 2);

  return (
    <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
      <h3 className="text-xl font-bold text-[#1a2632] mb-4 font-roboto">{title}</h3>
      
      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="w-full"
        style={{ maxWidth: '100%', height: '160px' }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={`grid-${i}`}
            x1="40"
            y1={padding + (1 - ratio) * chartHeight}
            x2={chartWidth - 20}
            y2={padding + (1 - ratio) * chartHeight}
            stroke="#e5e7eb"
            strokeDasharray="4"
            strokeWidth="1"
          />
        ))}

        {/* Bars */}
        {data.map((point, i) => (
          <g key={`bar-${i}`}>
            <rect
              x={40 + i * (chartWidth - 60) / data.length + barWidth / 2}
              y={padding + (1 - point.value / maxValue) * chartHeight}
              width={barWidth}
              height={(point.value / maxValue) * chartHeight}
              fill="#0d9488"
              rx="4"
              opacity="0.8"
            />
            <text
              x={40 + i * (chartWidth - 60) / data.length + barWidth}
              y={height - 10}
              textAnchor="middle"
              fontSize="12"
              fill="#64748b"
            >
              {point.day}
            </text>
          </g>
        ))}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <text
            key={`label-${i}`}
            x="30"
            y={padding + (1 - ratio) * chartHeight + 4}
            textAnchor="end"
            fontSize="12"
            fill="#9ca3af"
          >
            {Math.round(ratio * maxValue)}
          </text>
        ))}
      </svg>

      <div className="mt-4 flex justify-between text-[12px] text-[#64748b]">
        <span>Revenue (XRP)</span>
        <span className="text-[#0d9488] font-medium">View all analytics →</span>
      </div>
    </div>
  );
}
