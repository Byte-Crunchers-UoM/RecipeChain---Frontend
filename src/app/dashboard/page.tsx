'use client';

import React, { useEffect, useState } from 'react'; 
import { supabase } from '../../lib/supabase';
import DashboardLayout from '../../components/DashboardLayout';
import DashboardCard from '../../components/DashboardCard';
import AnalyticsChart from '../../components/AnalyticsChart';
import RecipesTable from '../../components/RecipesTable';
import { useAuth } from '@/context/AuthContext'; // AuthContext එක import කරන්න

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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [recipes, setRecipes] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipes() {
    
      if (authLoading || !isAuthenticated || !user) {
        return;
      }

      try {
        setLoading(true);
      

        const { data, error: recipeError } = await supabase
          .from('recipes')
          .select('*')
          .eq('chef_id', user.user_id) 
          .order('created_at', { ascending: false });

        if (recipeError) {
          console.error("Supabase Error:", recipeError.message);
          throw recipeError;
        }

        console.log("Recipes fetched for Chef:", user.user_id, data); 
        setRecipes(data || []);
        
      } catch (error: any) {
        console.error('Error fetching recipes:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRecipes();
  }, [user, isAuthenticated, authLoading]); 
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <p className="animate-pulse">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
    
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="My Recipes"
            value={loading ? "..." : recipes.length.toString()} 
            icon={<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
            trend={{ direction: 'up', percentage: 12 }}
          />
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AnalyticsChart title="Analytics Overview" data={chartData} maxValue={80} />
          </div>
        </div>

        {/* Recipes Table Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#1a2632] font-roboto">My Recipes</h3>
            <button className="bg-[#0d9488] text-white px-4 py-2 rounded-lg hover:bg-[#0b7a6f] transition-colors font-medium font-roboto">
              + Add New Recipe
            </button>
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
              <p className="text-gray-500 font-roboto mb-4">You haven't added any recipes yet.</p>
              <button className="text-[#0d9488] font-medium hover:underline font-roboto">
                Create your first recipe
              </button>
            </div>
          )}
        </div>
    </DashboardLayout>
  );
}