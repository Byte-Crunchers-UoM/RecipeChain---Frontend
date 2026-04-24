'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardCard from '@/components/DashboardCard';
import AnalyticsChart from '@/components/AnalyticsChart';
import RecipesTable from '@/components/RecipesTable';

const mockRecipes = [
  {
    id: '1',
    name: 'Mastorani Noodles',
    image: '/recipes/1.jpg',
    price: 4.99,
    status: 'Active' as const,
    views: 1240,
    unlocks: 89,
    updatedAt: '2h ago',
    earnings: 120,
  },
  {
    id: '2',
    name: 'Vegan Butter Bowl',
    image: '/recipes/2.jpg',
    price: 3.99,
    status: 'Active' as const,
    views: 2450,
    unlocks: 156,
    updatedAt: '1d ago',
    earnings: 245,
  },
  {
    id: '3',
    name: 'Keto Lasagne',
    image: '/recipes/3.jpg',
    price: 5.49,
    status: 'Draft' as const,
    views: 0,
    unlocks: 0,
    updatedAt: '5d ago',
    earnings: 0,
  },
  {
    id: '4',
    name: 'Easy Ramen',
    image: '/recipes/4.jpg',
    price: 2.99,
    status: 'Active' as const,
    views: 890,
    unlocks: 67,
    updatedAt: '3d ago',
    earnings: 85,
  },
  {
    id: '5',
    name: 'Spicy Milk Pasta',
    image: '/recipes/5.jpg',
    price: 6.99,
    status: 'Deactivate' as const,
    views: 1450,
    unlocks: 120,
    updatedAt: '2w ago',
    earnings: 150,
  },
];

const chartData = [
  { day: 'Mon', value: 45 },
  { day: 'Tue', value: 52 },
  { day: 'Wed', value: 48 },
  { day: 'Thu', value: 61 },
  { day: 'Fri', value: 55 },
  { day: 'Sat', value: 67 },
  { day: 'Sun', value: 72 },
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="My Recipes"
            value="24"
            icon={
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
            trend={{ direction: 'up', percentage: 12 }}
          />

          <DashboardCard
            title="Verified Recipes"
            value="18"
            icon={
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            trend={{ direction: 'up', percentage: 8 }}
          />

          <DashboardCard
            title="Total Earnings"
            value="12,450 XRP"
            icon={
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            trend={{ direction: 'up', percentage: 23 }}
          />

          <DashboardCard
            title="Total Views"
            value="1,247"
            icon={
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            }
            trend={{ direction: 'down', percentage: 5 }}
          />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AnalyticsChart
              title="Analytics Overview"
              data={chartData}
              maxValue={80}
            />
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
            <h3 className="text-lg font-bold text-[#1a2632] mb-6 font-roboto">Revenue Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#0d9488] rounded-full" />
                  <span className="text-[12px] text-[#64748b] font-roboto">Active Recipes</span>
                </div>
                <span className="font-medium text-[#1a2632] text-[14px] font-roboto">8,450 XRP</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <span className="text-[12px] text-[#64748b] font-roboto">Premium Content</span>
                </div>
                <span className="font-medium text-[#1a2632] text-[14px] font-roboto">2,800 XRP</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-teal-500 rounded-full" />
                  <span className="text-[12px] text-[#64748b] font-roboto">Collaborations</span>
                </div>
                <span className="font-medium text-[#1a2632] text-[14px] font-roboto">1,200 XRP</span>
              </div>
              <hr className="my-4 border-[#e5e7eb]" />
              <div className="flex items-center justify-between pt-2">
                <span className="text-[12px] font-bold text-[#1a2632] font-roboto">Total This Month</span>
                <span className="font-bold text-lg text-[#0d9488] font-roboto">12,450 XRP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recipes Table */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#1a2632] font-roboto">My Recipes</h3>
            <button className="bg-[#0d9488] text-white px-4 py-2 rounded-lg hover:bg-[#0d9488] opacity-90 hover:opacity-100 font-medium text-[14px] font-roboto">
              + Add New Recipe
            </button>
          </div>
          <RecipesTable recipes={mockRecipes} />
        </div>
      </div>
    </DashboardLayout>
  );
}
