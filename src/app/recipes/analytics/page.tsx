'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AnalyticsChart, { ChartDataPoint } from '@/components/AnalyticsChart';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';

interface RecipeMetric {
  recipe_id: string;
  name: string;
  unlocks: number;
  revenue: number;
  rating: number;
  percentage?: number;
}

interface AnalyticsMetrics {
  totalUnlocks: number;
  rangeRevenue: number;
  averageRating: number;
  chartData: ChartDataPoint[];
  topRecipes: RecipeMetric[];
  allRecipes: RecipeMetric[];
}

const initialMetrics: AnalyticsMetrics = {
  totalUnlocks: 0,
  rangeRevenue: 0,
  averageRating: 0,
  chartData: [
    { day: 'Mon', value: 0 },
    { day: 'Tue', value: 0 },
    { day: 'Wed', value: 0 },
    { day: 'Thu', value: 0 },
    { day: 'Fri', value: 0 },
    { day: 'Sat', value: 0 },
    { day: 'Sun', value: 0 },
  ],
  topRecipes: [],
  allRecipes: [],
};

const dateRangeOptions = ['This Week', 'This Month', 'This Year', 'Up to Now'] as const;
type DateRangeOption = (typeof dateRangeOptions)[number];

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getRangeStart(dateRange: DateRangeOption, registrationDate: Date | null): Date | null {
  const now = new Date();
  const start = new Date(now);

  if (dateRange === 'This Year') {
    start.setMonth(0, 1);
  } else if (dateRange === 'This Month') {
    start.setDate(1);
  } else if (dateRange === 'Up to Now') {
    return registrationDate ? new Date(registrationDate) : new Date(now.setFullYear(now.getFullYear() - 1));
  } else {
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
  }

  start.setHours(0, 0, 0, 0);
  return start;
}

function getWeekBucket(dayOfMonth: number): string {
  if (dayOfMonth <= 7) return 'Week 1';
  if (dayOfMonth <= 14) return 'Week 2';
  if (dayOfMonth <= 21) return 'Week 3';
  return 'Week 4';
}

function getMonthLabelsSince(startDate: Date, endDate: Date): string[] {
  const labels: string[] = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (current <= endDate) {
    labels.push(`${MONTH_LABELS[current.getMonth()]} ${current.getFullYear()}`);
    current.setMonth(current.getMonth() + 1);
  }

  return labels;
}

function buildProgressiveLineData(startDate: Date, payments: { time_stamp: string | null; seller_amount: number }[]): ChartDataPoint[] {
  const endDate = new Date();
  const labels = getMonthLabelsSince(startDate, endDate);
  const monthlyRevenue: Record<string, number> = {};

  payments.forEach((payment) => {
    if (!payment.time_stamp) return;
    const paymentDate = new Date(payment.time_stamp);
    if (paymentDate < startDate || paymentDate > endDate) return;

    const label = `${MONTH_LABELS[paymentDate.getMonth()]} ${paymentDate.getFullYear()}`;
    monthlyRevenue[label] = (monthlyRevenue[label] || 0) + Number(payment.seller_amount || 0);
  });

  let cumulative = 0;
  return labels.map((label) => {
    cumulative += monthlyRevenue[label] || 0;
    return { day: label, value: parseFloat(cumulative.toFixed(2)) };
  });
}

function buildChartData(dateRange: DateRangeOption, startDate: Date, payments: { time_stamp: string | null; seller_amount: number }[]): ChartDataPoint[] {
  const now = new Date();
  const filteredPayments = (payments || [])
    .map((payment) => ({
      ...payment,
      date: payment.time_stamp ? new Date(payment.time_stamp) : null,
    }))
    .filter((payment) => payment.date && payment.date >= startDate && payment.date <= now) as Array<{
      time_stamp: string | null;
      seller_amount: number;
      date: Date;
    }>;

  if (dateRange === 'This Week') {
    const activeDayIndex = (now.getDay() + 6) % 7;
    const weekMap: Record<string, number | null> = {
      Mon: null,
      Tue: null,
      Wed: null,
      Thu: null,
      Fri: null,
      Sat: null,
      Sun: null,
    };

    filteredPayments.forEach((payment) => {
      const label = DAY_ORDER[(payment.date.getDay() + 6) % 7];
      if (label in weekMap) {
        weekMap[label] = (weekMap[label] || 0) + payment.seller_amount;
      }
    });

    return DAY_ORDER.map((day, index) => ({
      day,
      value: index <= activeDayIndex ? parseFloat(((weekMap[day] || 0) as number).toFixed(2)) : null,
    }));
  }

  if (dateRange === 'This Month') {
    const currentWeekLabel = getWeekBucket(now.getDate());
    const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const activeWeeks = weekLabels.slice(0, weekLabels.indexOf(currentWeekLabel) + 1);
    const weekMap: Record<string, number> = activeWeeks.reduce((acc, week) => ({ ...acc, [week]: 0 }), {} as Record<string, number>);

    filteredPayments.forEach((payment) => {
      const weekLabel = getWeekBucket(payment.date.getDate());
      if (weekLabel in weekMap) {
        weekMap[weekLabel] += payment.seller_amount;
      }
    });

    return activeWeeks.map((week) => ({ day: week, value: parseFloat((weekMap[week] || 0).toFixed(2)) }));
  }

  if (dateRange === 'This Year') {
    const currentMonthIndex = now.getMonth();
    const activeMonths = MONTH_LABELS.slice(0, currentMonthIndex + 1);
    const monthMap: Record<string, number> = activeMonths.reduce((acc, month) => ({ ...acc, [month]: 0 }), {} as Record<string, number>);

    filteredPayments.forEach((payment) => {
      const monthLabel = MONTH_LABELS[payment.date.getMonth()];
      if (monthLabel in monthMap) {
        monthMap[monthLabel] += payment.seller_amount;
      }
    });

    return activeMonths.map((month) => ({ day: month, value: parseFloat((monthMap[month] || 0).toFixed(2)) }));
  }

  return buildProgressiveLineData(startDate, filteredPayments.map((payment) => ({
    time_stamp: payment.time_stamp,
    seller_amount: payment.seller_amount,
  })));
}

export default function AnalyticsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [dateRange, setDateRange] = useState<DateRangeOption>('This Week');
  const [metrics, setMetrics] = useState<AnalyticsMetrics>(initialMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      if (authLoading || !isAuthenticated || !user) return;

      setLoading(true);
      setError(null);

      try {
        const { data: sellerData, error: sellerError } = await supabase
          .from('sellers')
          .select('avg_rating')
          .eq('user_id', user.user_id)
          .maybeSingle();

        if (sellerError) throw sellerError;

        const averageRating = sellerData?.avg_rating ? Number(sellerData.avg_rating) : 0;

        const { data: recipeData, error: recipeError } = await supabase
          .from('recipes')
          .select('recipe_id, title, rating_avg')
          .eq('chef_id', user.user_id);

        if (recipeError) throw recipeError;

        const recipes = recipeData || [];
        const recipeIds = recipes.map((recipe) => recipe.recipe_id).filter(Boolean);

        let totalUnlocks = 0;
        let rangeRevenue = 0;
        let rangeStart: Date | null = null;
        
        const rangeRevenueByRecipe: Record<string, number> = {};
        const rangeUnlockCountByRecipe: Record<string, number> = {};

        const allTimeUnlockCountByRecipe: Record<string, number> = {};
        const allTimeRevenueByRecipe: Record<string, number> = {};

        let paymentsData: Array<{ recipe_id: string; seller_amount: number; time_stamp: string | null }> = [];

        if (recipeIds.length > 0) {
          // 1. All-time purchases (for general stats)
          const { data: allPurchasesData, error: allPurchasesError } = await supabase
            .from('recipe_purchases')
            .select('recipe_id')
            .in('recipe_id', recipeIds);

          if (allPurchasesError) throw allPurchasesError;

          (allPurchasesData || []).forEach((purchase) => {
            const recipeId = String(purchase.recipe_id);
            allTimeUnlockCountByRecipe[recipeId] = (allTimeUnlockCountByRecipe[recipeId] || 0) + 1;
            totalUnlocks += 1;
          });

          // 2. Range purchases
          rangeStart = getRangeStart(dateRange, null);
          
          let rangePurchasesQuery = supabase
            .from('recipe_purchases')
            .select('recipe_id, unlocked_at')
            .in('recipe_id', recipeIds);

          if (rangeStart !== null) {
            rangePurchasesQuery = rangePurchasesQuery.gte('unlocked_at', rangeStart.toISOString());
          }

          const { data: rangePurchasesData, error: rangePurchasesError } = await rangePurchasesQuery;
          if (rangePurchasesError) throw rangePurchasesError;

          (rangePurchasesData || []).forEach((purchase) => {
            const recipeId = String(purchase.recipe_id);
            rangeUnlockCountByRecipe[recipeId] = (rangeUnlockCountByRecipe[recipeId] || 0) + 1;
          });

          // 3. Payments data
          const { data: paymentsResult, error: paymentsError } = await supabase
            .from('payments')
            .select('recipe_id, seller_amount, time_stamp')
            .in('recipe_id', recipeIds);

          if (paymentsError) throw paymentsError;

          paymentsData = paymentsResult || [];

          paymentsData.forEach((payment) => {
            const recipeId = String(payment.recipe_id);
            const amount = Number(payment.seller_amount || 0);
            const paymentDate = payment.time_stamp ? new Date(payment.time_stamp) : null;

            // Check if payment falls in selected Date Range
            const isInSelectedRange = rangeStart === null 
              ? true 
              : (paymentDate && paymentDate >= rangeStart);

            if (isInSelectedRange) {
              rangeRevenue += amount;
              rangeRevenueByRecipe[recipeId] = (rangeRevenueByRecipe[recipeId] || 0) + amount;
            }

            allTimeRevenueByRecipe[recipeId] = (allTimeRevenueByRecipe[recipeId] || 0) + amount;
          });
        }

        const chartData = buildChartData(dateRange, rangeStart || new Date(), paymentsData);

        const rangeRecipesList: RecipeMetric[] = recipes.map((recipe) => ({
          recipe_id: recipe.recipe_id,
          name: recipe.title || 'Untitled Recipe',
          unlocks: rangeUnlockCountByRecipe[recipe.recipe_id] || 0,
          revenue: rangeRevenueByRecipe[recipe.recipe_id] || 0,
          rating: Number(recipe.rating_avg ?? 0),
        }));

        const sortedTopRecipes = [...rangeRecipesList]
          .sort((a, b) => b.unlocks - a.unlocks)
          .slice(0, 5);

        const allRecipesList: RecipeMetric[] = recipes.map((recipe) => {
          const unlocks = allTimeUnlockCountByRecipe[recipe.recipe_id] || 0;
          const percentage = totalUnlocks > 0 ? (unlocks / totalUnlocks) * 100 : 0;
          const revenue = allTimeRevenueByRecipe[recipe.recipe_id] || 0;
          
          return {
            recipe_id: recipe.recipe_id,
            name: recipe.title || 'Untitled Recipe',
            unlocks,
            revenue: unlocks > 0 ? revenue : 0,
            rating: Number(recipe.rating_avg ?? 0),
            percentage: parseFloat(percentage.toFixed(1))
          };
        }).sort((a, b) => b.revenue - a.revenue);

        setMetrics({
          totalUnlocks,
          rangeRevenue,
          averageRating,
          chartData,
          topRecipes: sortedTopRecipes,
          allRecipes: allRecipesList,
        });

      } catch (fetchError: any) {
        console.error('Error fetching analytics:', fetchError);
        setError(fetchError?.message || 'Unable to load analytics metrics.');
      } finally {
        setLoading(false);
      }
    }

    void fetchMetrics();
  }, [user, isAuthenticated, authLoading, dateRange]);

  const revenueCardTitle = useMemo(() => {
    if (dateRange === 'This Week') return 'Weekly Revenue';
    if (dateRange === 'This Month') return 'Monthly Revenue';
    if (dateRange === 'This Year') return 'Yearly Revenue';
    if (dateRange === 'Up to Now') return 'Total Revenue';
    return 'Total Revenue';
  }, [dateRange]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-end items-center gap-1 w-full py-1">
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
        
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 hover:shadow-md transition">
            <p className="text-[12px] text-[#64748b] font-roboto mb-2">Total Unlocks</p>
            <h2 className="text-3xl font-bold text-[#1a2632] font-roboto">{loading ? '...' : metrics.totalUnlocks.toLocaleString()}</h2>
            <p className="text-[11px] text-green-600 font-roboto mt-2">{loading ? 'Loading…' : 'Sell-through volume (All Time)'}</p>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 hover:shadow-md transition">
            <p className="text-[12px] text-[#64748b] font-roboto mb-2">{revenueCardTitle}</p>
            <h2 className="text-3xl font-bold text-[#1a2632] font-roboto">{loading ? '...' : `${metrics.rangeRevenue.toFixed(2)} XRP`}</h2>
            <p className="text-[11px] text-green-600 font-roboto mt-2">{loading ? 'Loading…' : `Revenue earned during ${dateRange.toLowerCase()}`}</p>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 hover:shadow-md transition">
            <p className="text-[12px] text-[#64748b] font-roboto mb-2">Average Rating</p>
            <h2 className="text-3xl font-bold text-[#1a2632] font-roboto">{loading ? '...' : metrics.averageRating.toFixed(1)} ⭐</h2>
            <p className="text-[11px] text-green-600 font-roboto mt-2">{loading ? 'Loading…' : 'Across your current recipes'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AnalyticsChart
              title="Revenue Overview (XRP)"
              data={metrics.chartData}
              loading={loading}
              chartType="line"
            />
          </div>

          <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
            <h3 className="text-lg font-bold text-[#1a2632] font-roboto mb-4">Top Performing Recipes ({dateRange})</h3>
            <div className="space-y-2">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : metrics.topRecipes.length === 0 ? (
                <p className="text-sm text-[#64748b]">No top recipes available for this range yet.</p>
              ) : (
                metrics.topRecipes.map((recipe) => (
                  <div key={recipe.recipe_id} className="rounded-2xl border border-[#e5e7eb] p-4 hover:bg-[#f8fafb] transition-colors">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#1a2632] truncate">{recipe.name}</p>
                        <p className="text-[12px] text-[#64748b] mt-1">{recipe.unlocks} unlocks</p>
                      </div>
                      <div className="flex items-center rounded-full bg-[#ecfdf5] px-3 py-1.5 shrink-0">
                        <span className="text-sm font-semibold text-[#0d9488]">{recipe.revenue.toFixed(2)} XRP</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-[#e5e7eb] p-6">
          <h3 className="text-lg font-bold text-[#1a2632] font-roboto mb-4">All Recipes Performance Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e5e7eb]">
                  <th className="px-4 py-3 text-[12px] font-bold text-[#64748b] font-roboto">Recipe Name</th>
                  <th className="px-4 py-3 text-center text-[12px] font-bold text-[#64748b] font-roboto">Avg Rating</th>
                  <th className="px-4 py-3 text-center text-[12px] font-bold text-[#64748b] font-roboto">Unlocks</th>
                  <th className="px-4 py-3 text-center text-[12px] font-bold text-[#64748b] font-roboto">Unlock Share</th>
                  <th className="px-4 py-3 text-right text-[12px] font-bold text-[#64748b] font-roboto">Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index} className="border-b border-[#e5e7eb]">
                      <td className="px-4 py-4 text-[13px] text-[#64748b] font-roboto">Loading...</td>
                      <td className="px-4 py-4 text-center text-[13px] text-[#64748b] font-roboto">—</td>
                      <td className="px-4 py-4 text-center text-[13px] text-[#64748b] font-roboto">—</td>
                      <td className="px-4 py-4 text-center text-[13px] text-[#64748b] font-roboto">—</td>
                      <td className="px-4 py-4 text-right text-[13px] text-[#64748b] font-roboto">—</td>
                    </tr>
                  ))
                ) : metrics.allRecipes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-[#64748b]">No recipe data available.</td>
                  </tr>
                ) : (
                  metrics.allRecipes.map((recipe) => (
                    <tr key={recipe.recipe_id} className="border-b border-[#e5e7eb] hover:bg-[#f8fafb] transition">
                      <td className="px-4 py-4 text-[13px] text-[#1a2632] font-roboto font-medium">{recipe.name}</td>
                      <td className="px-4 py-4 text-center text-[13px] text-[#1a2632] font-roboto">
                        {recipe.rating > 0 ? `${recipe.rating.toFixed(1)} ⭐` : '0'}
                      </td>
                      <td className="px-4 py-4 text-center text-[13px] text-[#64748b] font-roboto">{recipe.unlocks}</td>
                      <td className="px-4 py-4 text-center text-[13px] font-bold text-indigo-600 font-roboto">{recipe.percentage}%</td>
                      <td className="px-4 py-4 text-right text-[13px] font-bold text-[#0d9488] font-roboto">{recipe.revenue.toFixed(2)} XRP</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}