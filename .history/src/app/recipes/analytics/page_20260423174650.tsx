'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  totalViews: number;
  totalUnlocks: number;
  totalRevenue: number;
  averageRating: number;
  weeklyData: { day: string; revenue: number }[];
  topRecipes: { name: string; views: number; unlocks: number; revenue: number }[];
}

const mockAnalyticsData: AnalyticsData = {
  totalViews: 5330,
  totalUnlocks: 210,
  totalRevenue: 1847.01,
  averageRating: 4.85,
  weeklyData: [
    { day: 'Mon', revenue: 42 },
    { day: 'Tue', revenue: 51 },
    { day: 'Wed', revenue: 46 },
    { day: 'Thu', revenue: 60 },
    { day: 'Fri', revenue: 55 },
    { day: 'Sat', revenue: 67 },
    { day: 'Sun', revenue: 72 },
  ],
  topRecipes: [
    { name: 'Sous Vide Salmon', views: 3200, unlocks: 120, revenue: 1078.80 },
    { name: 'Truffle Mushroom Risotto', views: 1240, unlocks: 45, revenue: 269.55 },
    { name: 'Matcha Lava Cake', views: 890, unlocks: 45, revenue: 224.55 },
  ],
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('This Week');

  return (
    <div className="min-h-screen bg-[#f8fafb]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e7eb] px-8 py-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/recipes" className="text-[#0d9488] hover:underline text-[14px] font-roboto">
                ← My Recipes
              </Link>
              <span className="text-[#e5e7eb]">/</span>
              <h1 className="text-3xl font-bold text-[#1a2632] font-roboto">Analytics</h1>
            </div>
            <p className="text-[12px] text-[#64748b] font-roboto mt-2">Track your recipe performance and revenue</p>
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-[#e5e7eb] rounded-lg text-[12px] text-[#1a2632] font-roboto focus:outline-none focus:border-[#0d9488]"
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>Last 3 Months</option>
            <option>This Year</option>
          </select>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 hover:shadow-md transition">
            <p className="text-[12px] text-[#64748b] font-roboto mb-2">Total Views</p>
            <h2 className="text-3xl font-bold text-[#1a2632] font-roboto">{mockAnalyticsData.totalViews.toLocaleString()}</h2>
            <p className="text-[11px] text-green-600 font-roboto mt-2">↑ 12% from last week</p>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 hover:shadow-md transition">
            <p className="text-[12px] text-[#64748b] font-roboto mb-2">Total Unlocks</p>
            <h2 className="text-3xl font-bold text-[#1a2632] font-roboto">{mockAnalyticsData.totalUnlocks}</h2>
            <p className="text-[11px] text-green-600 font-roboto mt-2">↑ 8% from last week</p>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 hover:shadow-md transition">
            <p className="text-[12px] text-[#64748b] font-roboto mb-2">Total Revenue</p>
            <h2 className="text-3xl font-bold text-[#1a2632] font-roboto">{mockAnalyticsData.totalRevenue} XRP</h2>
            <p className="text-[11px] text-green-600 font-roboto mt-2">↑ 15% from last week</p>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 hover:shadow-md transition">
            <p className="text-[12px] text-[#64748b] font-roboto mb-2">Average Rating</p>
            <h2 className="text-3xl font-bold text-[#1a2632] font-roboto">{mockAnalyticsData.averageRating} ⭐</h2>
            <p className="text-[11px] text-green-600 font-roboto mt-2">↑ 0.2 from last week</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weekly Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-[#e5e7eb] p-6">
            <h3 className="text-lg font-bold text-[#1a2632] font-roboto mb-4">Weekly Revenue</h3>
            <div className="flex items-end justify-around h-64 gap-2">
              {mockAnalyticsData.weeklyData.map((data) => (
                <div key={data.day} className="flex flex-col items-center gap-2">
                  <div
                    className="bg-[#0d9488] rounded-t w-12 hover:opacity-80 transition"
                    style={{ height: `${(data.revenue / 80) * 200}px` }}
                    title={`${data.revenue} XRP`}
                  />
                  <span className="text-[11px] text-[#64748b] font-roboto">{data.day}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#64748b] font-roboto mt-4">Revenue (XRP)</p>
          </div>

          {/* Performance Stats */}
          <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
            <h3 className="text-lg font-bold text-[#1a2632] font-roboto mb-4">Performance</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[12px] text-[#64748b] font-roboto">Conversion Rate</span>
                  <span className="text-[12px] font-bold text-[#1a2632] font-roboto">3.9%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#0d9488] h-2 rounded-full" style={{ width: '39%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[12px] text-[#64748b] font-roboto">Engagement Rate</span>
                  <span className="text-[12px] font-bold text-[#1a2632] font-roboto">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[12px] text-[#64748b] font-roboto">Avg. Rating Score</span>
                  <span className="text-[12px] font-bold text-[#1a2632] font-roboto">97%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '97%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Recipes Table */}
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
          <h3 className="text-lg font-bold text-[#1a2632] font-roboto mb-4">Top Performing Recipes</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e7eb]">
                  <th className="text-left px-4 py-3 text-[12px] font-bold text-[#64748b] font-roboto">Recipe Name</th>
                  <th className="text-center px-4 py-3 text-[12px] font-bold text-[#64748b] font-roboto">Views</th>
                  <th className="text-center px-4 py-3 text-[12px] font-bold text-[#64748b] font-roboto">Unlocks</th>
                  <th className="text-right px-4 py-3 text-[12px] font-bold text-[#64748b] font-roboto">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {mockAnalyticsData.topRecipes.map((recipe, index) => (
                  <tr key={index} className="border-b border-[#e5e7eb] hover:bg-[#f8fafb] transition">
                    <td className="px-4 py-4 text-[13px] text-[#1a2632] font-roboto font-medium">{recipe.name}</td>
                    <td className="px-4 py-4 text-center text-[13px] text-[#64748b] font-roboto">{recipe.views.toLocaleString()}</td>
                    <td className="px-4 py-4 text-center text-[13px] text-[#64748b] font-roboto">{recipe.unlocks}</td>
                    <td className="px-4 py-4 text-right text-[13px] font-bold text-[#0d9488] font-roboto">
                      {recipe.revenue.toFixed(2)} XRP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}