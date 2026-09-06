'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import DashboardCard from '../../../../components/DashboardCard';
import AnalyticsChart from '../../../..//components/AnalyticsChart';
import RecipesTable from '../../../../components/RecipesTable';
import { useAuth } from '../../../../context/AuthContext';
import Link from 'next/link';

interface ChartDataPoint {
  day: string;
  value: number | null;
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnlocks, setTotalUnlocks] = useState<number>(0);
  const [activeRecipesCount, setActiveRecipesCount] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [maxChartValue, setMaxChartValue] = useState<number>(100);

  useEffect(() => {
    async function fetchDashboardData() {
      if (authLoading || !isAuthenticated || !user) {
        return;
      }

      try {
        setLoading(true);

        // 1. Fetch all recipes belonging to the logged-in chef
        const { data: recipeData, error: recipeError } = await supabase
          .from('recipes')
          .select('*')
          .eq('chef_id', user.user_id)
          .order('created_at', { ascending: false });

        if (recipeError) throw recipeError;

        const currentRecipes = recipeData || [];
        setRecipes(currentRecipes);

        const activeCount = currentRecipes.filter(
          r => r.status?.toLowerCase() === 'published' || r.status?.toLowerCase() === 'active'
        ).length;
        setActiveRecipesCount(activeCount);

        if (currentRecipes.length > 0) {
          const recipeIds = currentRecipes.map(r => r.recipe_id);

          // 2. Calculate Total Unlocks
          const { count, error: countError } = await supabase
            .from('recipe_purchases')
            .select('*', { count: 'exact', head: true })
            .in('recipe_id', recipeIds);

          if (!countError && count !== null) {
            setTotalUnlocks(count);
          }

          // 3. Calculate Total Earnings and Weekly Chart Data
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
          sevenDaysAgo.setHours(0, 0, 0, 0);

          const { data: paymentsData, error: paymentsError } = await supabase
            .from('payments')
            .select('seller_amount, time_stamp')
            .in('recipe_id', recipeIds);

          if (!paymentsError && paymentsData) {
            const earnings = paymentsData.reduce((acc, curr) => {
              return acc + (Number(curr.seller_amount) || 0);
            }, 0);
            setTotalEarnings(earnings);

            // ---- Weekly Chart Data Processing ----
            const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const weekStart = new Date();
            const currentWeekday = (weekStart.getDay() + 6) % 7; // Monday=0
            weekStart.setDate(weekStart.getDate() - currentWeekday);
            weekStart.setHours(0, 0, 0, 0);

            const weekMap: Record<string, number | null> = {
              Mon: null,
              Tue: null,
              Wed: null,
              Thu: null,
              Fri: null,
              Sat: null,
              Sun: null,
            };

            paymentsData.forEach(payment => {
              const paymentDate = new Date(payment.time_stamp);
              if (paymentDate < weekStart || paymentDate > new Date()) return;

              const dayName = daysOfWeek[(paymentDate.getDay() + 6) % 7];
              if (weekMap[dayName] !== undefined) {
                weekMap[dayName] = (weekMap[dayName] || 0) + Number(payment.seller_amount) || 0;
              }
            });

            const formattedChartData = daysOfWeek.map((day, index) => ({
              day,
              value: index <= currentWeekday ? parseFloat(((weekMap[day] || 0) as number).toFixed(2)) : null,
            }));

            setChartData(formattedChartData);

            // Calculate dynamic maximum boundary for chart scaling (+20% padding)
            const maxVal = Math.max(...formattedChartData.map(d => d.value ?? 0), 0);
            setMaxChartValue(maxVal > 0 ? Math.ceil(maxVal * 1.2) : 100); 
          }
        } else {
          setTotalUnlocks(0);
          setTotalEarnings(0);
          setChartData([]);
        }
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user, isAuthenticated, authLoading]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-[#0d9488] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-roboto">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Recipes"
          value={loading ? "..." : recipes.length.toString()}
          icon={
            <svg className="w-7 h-7 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          trend={{ direction: 'up', percentage: 12 }}
        />
        <DashboardCard
          title="Active Recipes"
          value={loading ? "..." : activeRecipesCount.toString()}
          icon={
            <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <DashboardCard
          title="Total Earnings"
          value={loading ? "..." : `${totalEarnings.toFixed(2)}`}
          subtitle="XRP"
          icon={
            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <DashboardCard
          title="Total Unlocks"
          value={loading ? "..." : totalUnlocks.toString()}
          icon={
            <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Analytics Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnalyticsChart title="Analytics Overview" data={chartData} maxValue={maxChartValue} chartType="line" />
            <div className="mt-4 text-right">
        <Link
          href="/seller/recipes/analytics"
          className="text-sm font-medium text-[#0d9488] flex items-center justify-end gap-1"
        >
          View detailed analytics <span>→</span>
        </Link>
      </div>
        </div>
      </div>

      {/* Recipes List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1a2632] font-roboto">My Recipes</h3>
          <Link href="/seller/recipes/add">
            <button className="bg-[#0d9488] text-white px-4 py-2 rounded-lg hover:bg-[#0b7a6f] transition-colors font-medium font-roboto">
              + Add New Recipe
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <p className="text-gray-500 animate-pulse font-roboto">Loading your recipes...</p>
          </div>
        ) : recipes.length > 0 ? (
          <RecipesTable recipes={recipes} />
        ) : (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl bg-white">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-50 p-4 rounded-full">
                <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 font-roboto mb-4">No recipe found.</p>
          </div>
        )}
      </div>
    </div>
  );
}