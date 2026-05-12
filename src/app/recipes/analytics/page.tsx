'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AnalyticsChart, { ChartDataPoint } from '@/components/AnalyticsChart';
import { useAuth } from '@/context/AuthContext';

interface TopRecipe {
  recipe_id: string;
  name: string;
  unlocks: number;
  revenue: number;
}

interface AnalyticsMetrics {
  totalUnlocks: number;
  totalRevenue: number;
  averageRating: number;
  weeklyData: ChartDataPoint[];
  topRecipes: TopRecipe[];
}

const initialMetrics: AnalyticsMetrics = {
  totalUnlocks: 0,
  totalRevenue: 0,
  averageRating: 0,
  weeklyData: [
    { day: 'Mon', value: 0 },
    { day: 'Tue', value: 0 },
    { day: 'Wed', value: 0 },
    { day: 'Thu', value: 0 },
    { day: 'Fri', value: 0 },
    { day: 'Sat', value: 0 },
    { day: 'Sun', value: 0 },
  ],
  topRecipes: [],
};

const dateRangeOptions = ['This Week', 'This Month', 'Last 3 Months', 'This Year'] as const;

type DateRangeOption = (typeof dateRangeOptions)[number];

function getRangeStart(dateRange: DateRangeOption) {
  const now = new Date();
  const start = new Date(now);

  if (dateRange === 'This Year') {
    start.setMonth(0, 1);
  } else if (dateRange === 'This Month') {
    start.setDate(1);
  } else if (dateRange === 'Last 3 Months') {
    start.setDate(now.getDate() - 90);
  } else {
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
  }

  start.setHours(0, 0, 0, 0);
  return start;
}

function getWeeklyLabels(startDate: Date) {
  return Array.from({ length: 7 }).map((_, index) => {
    const current = new Date(startDate);
    current.setDate(startDate.getDate() + index);
    return current.toLocaleDateString('en-US', { weekday: 'short' });
  });
}

export default function AnalyticsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [dateRange, setDateRange] = useState<DateRangeOption>('This Week');
  const [metrics, setMetrics] = useState<AnalyticsMetrics>(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weeklyLabels = useMemo(() => getWeeklyLabels(getRangeStart('This Week')), []);

  useEffect(() => {
    async function fetchMetrics() {
      if (authLoading || !isAuthenticated || !user) return;

      setLoading(true);
      setError(null);

      try {
        const { data: recipeData, error: recipeError } = await supabase
          .from('recipes')
          .select('recipe_id,title,rating_avg')
          .eq('chef_id', user.user_id);

        if (recipeError) throw recipeError;

        const recipes = recipeData || [];
        const recipeIds = recipes.map((recipe) => recipe.recipe_id).filter(Boolean);

        const ratingEntries = recipes
          .map((recipe) => Number(recipe.rating_avg ?? 0))
          .filter((rating) => rating > 0);
        const averageRating = ratingEntries.length > 0
          ? ratingEntries.reduce((sum, value) => sum + value, 0) / ratingEntries.length
          : 0;

        const topRecipes: TopRecipe[] = recipes.map((recipe) => ({
          recipe_id: recipe.recipe_id,
          name: recipe.title || 'Untitled Recipe',
          unlocks: 0,
          revenue: 0,
        }));

        let totalUnlocks = 0;
        let totalRevenue = 0;
        const revenueByRecipe: Record<string, number> = {};
        const unlockCountByRecipe: Record<string, number> = {};
        const weeklyRevenueMap: Record<string, number> = {};

        if (recipeIds.length > 0) {
          const { data: purchasesData, error: purchasesError } = await supabase
            .from('recipe_purchases')
            .select('recipe_id')
            .in('recipe_id', recipeIds);

          if (purchasesError) throw purchasesError;

          (purchasesData || []).forEach((purchase) => {
            const recipeId = String(purchase.recipe_id);
            unlockCountByRecipe[recipeId] = (unlockCountByRecipe[recipeId] || 0) + 1;
            totalUnlocks += 1;
          });

          const rangeStart = getRangeStart(dateRange);
          const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select('recipe_id,seller_amount,time_stamp')
            .in('recipe_id', recipeIds)
            .gte('time_stamp', rangeStart.toISOString());

          if (paymentsError) throw paymentsError;

          (paymentsData || []).forEach((payment) => {
            const recipeId = String(payment.recipe_id);
            const amount = Number(payment.seller_amount || 0);
            totalRevenue += amount;
            revenueByRecipe[recipeId] = (revenueByRecipe[recipeId] || 0) + amount;

            const createdAt = payment.time_stamp ? new Date(payment.time_stamp) : null;
            if (createdAt && createdAt >= getRangeStart('This Week')) {
              const dayLabel = createdAt.toLocaleDateString('en-US', { weekday: 'short' });
              weeklyRevenueMap[dayLabel] = (weeklyRevenueMap[dayLabel] || 0) + amount;
            }
          });
        }

        const weeklyData = weeklyLabels.map((day) => ({ day, value: weeklyRevenueMap[day] || 0 }));

        const sortedTopRecipes = topRecipes
          .map((recipe) => ({
            ...recipe,
            unlocks: unlockCountByRecipe[recipe.recipe_id] || 0,
            revenue: revenueByRecipe[recipe.recipe_id] || 0,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setMetrics({
          totalUnlocks,
          totalRevenue,
          averageRating,
          weeklyData,
          topRecipes: sortedTopRecipes,
        });

      } catch (fetchError: any) {
        console.error('Error fetching analytics:', fetchError);
        setError(fetchError?.message || 'Unable to load analytics metrics.');
      } finally {
        setLoading(false);
      }
    }

    void fetchMetrics();
  }, [user, isAuthenticated, authLoading, dateRange, weeklyLabels]);

  return (
   
    <div className="min-h-screen bg-[#f8fafb]">
      <header className="bg-white border-b border-[#e5e7eb] px-8 py-6 sticky top-0 z-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              
              <h1 className="text-3xl font-bold text-[#1a2632] font-roboto">Analytics</h1>
            </div>
            <p className="text-[12px] text-[#64748b] font-roboto mt-2">Track your recipe performance and revenue with live metrics.</p>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="dateRange" className="text-[12px] text-[#64748b] font-roboto">Range</label>
            <select
              id="dateRange"
              value={dateRange}
              onChange={(event) => setDateRange(event.target.value as DateRangeOption)}
              className="px-4 py-2 border border-[#e5e7eb] rounded-lg text-[12px] text-[#1a2632] font-roboto focus:outline-none focus:border-[#0d9488]"
            >
              {dateRangeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="p-8">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

          <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 hover:shadow-md transition">
            <p className="text-[12px] text-[#64748b] font-roboto mb-2">Total Unlocks</p>
            <h2 className="text-3xl font-bold text-[#1a2632] font-roboto">{loading ? '...' : metrics.totalUnlocks.toLocaleString()}</h2>
            <p className="text-[11px] text-green-600 font-roboto mt-2">{loading ? 'Loading…' : 'Sell-through volume this range'}</p>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 hover:shadow-md transition">
            <p className="text-[12px] text-[#64748b] font-roboto mb-2">Total Revenue</p>
            <h2 className="text-3xl font-bold text-[#1a2632] font-roboto">{loading ? '...' : `${metrics.totalRevenue.toFixed(3)} XRP`}</h2>
            <p className="text-[11px] text-green-600 font-roboto mt-2">{loading ? 'Loading…' : 'Revenue earned from unlocks'}</p>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 hover:shadow-md transition">
            <p className="text-[12px] text-[#64748b] font-roboto mb-2">Average Rating</p>
            <h2 className="text-3xl font-bold text-[#1a2632] font-roboto">{loading ? '...' : metrics.averageRating.toFixed(1)} ⭐</h2>
            <p className="text-[11px] text-green-600 font-roboto mt-2">{loading ? 'Loading…' : 'Across your current recipes'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-lg border border-[#e5e7eb] p-6">
            <h3 className="text-lg font-bold text-[#1a2632] font-roboto mb-4">Weekly Revenue</h3>
            <AnalyticsChart title="Weekly Revenue" data={metrics.weeklyData} loading={loading} />
          </div>

          <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
            <h3 className="text-lg font-bold text-[#1a2632] font-roboto mb-4">Top Performing Recipes</h3>
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : metrics.topRecipes.length === 0 ? (
                <p className="text-sm text-[#64748b]">No top recipes available yet.</p>
              ) : (
                metrics.topRecipes.map((recipe) => (
                  <div key={recipe.recipe_id} className="rounded-2xl border border-[#e5e7eb] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[#1a2632]">{recipe.name}</p>
                        <p className="text-[12px] text-[#64748b] mt-1"> {recipe.unlocks} unlocks</p>
                      </div>
                      <p className="text-sm font-bold text-[#0d9488]">{recipe.revenue.toFixed(3)} XRP</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
          <h3 className="text-lg font-bold text-[#1a2632] font-roboto mb-4">Recipe Revenue Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e5e7eb]">
                  <th className="px-4 py-3 text-[12px] font-bold text-[#64748b] font-roboto">Recipe Name</th>
                  <th className="px-4 py-3 text-center text-[12px] font-bold text-[#64748b] font-roboto">Unlocks</th>
                  <th className="px-4 py-3 text-right text-[12px] font-bold text-[#64748b] font-roboto">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index} className="border-b border-[#e5e7eb]">
                      <td className="px-4 py-4 text-[13px] text-[#64748b] font-roboto">Loading...</td>
                      <td className="px-4 py-4 text-center text-[13px] text-[#64748b] font-roboto">—</td>
                      <td className="px-4 py-4 text-center text-[13px] text-[#64748b] font-roboto">—</td>
                      <td className="px-4 py-4 text-right text-[13px] text-[#64748b] font-roboto">—</td>
                    </tr>
                  ))
                ) : metrics.topRecipes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-[#64748b]">No recipe revenue data available.</td>
                  </tr>
                ) : (
                  metrics.topRecipes.map((recipe) => (
                    <tr key={recipe.recipe_id} className="border-b border-[#e5e7eb] hover:bg-[#f8fafb] transition">
                      <td className="px-4 py-4 text-[13px] text-[#1a2632] font-roboto font-medium">{recipe.name}</td>
                      <td className="px-4 py-4 text-center text-[13px] text-[#64748b] font-roboto">{recipe.unlocks}</td>
                      <td className="px-4 py-4 text-right text-[13px] font-bold text-[#0d9488] font-roboto">{recipe.revenue.toFixed(3)} XRP</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

  );
}
