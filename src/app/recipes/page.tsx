'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext'; 
import DashboardLayout from '../../components/DashboardLayout';


interface Recipe {
  recipe_id: string;
  title: string;
  image_url: string;
  category: string;
  price: number;
  status: string;
  views_count: number;
  unlocks_count: number;
  rating: number;
  created_at: string;
}

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    Italian: 'bg-blue-100 text-blue-700',
    Vegan: 'bg-green-100 text-green-700',
    Seafood: 'bg-cyan-100 text-cyan-700',
    Dessert: 'bg-pink-100 text-pink-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'published':
      return 'bg-[#0d9488] text-white';
    case 'draft':
      return 'bg-yellow-500 text-white';
    case 'deactivate':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

export default function RecipesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [sortBy, setSortBy] = useState('Newest First');


  useEffect(() => {
    async function fetchMyRecipes() {
      if (authLoading || !isAuthenticated || !user) return;

      try {
        setLoading(true);
      
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('chef_id', user.user_id) 
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRecipes(data || []);
      } catch (error: any) {
        console.error('Error fetching recipes:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMyRecipes();
  }, [user, isAuthenticated, authLoading]);

  
  if (authLoading || (loading && recipes.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafb]">
        <p className="animate-pulse font-roboto text-gray-500">Loading your recipes...</p>
      </div>
    );
  }

  return (

    <DashboardLayout>
    <div className="min-h-screen bg-[#f8fafb]">
      {/* Header */}
      <header className="bg-white border-b border-[#e5e7eb] px-8 py-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1a2632] font-roboto">My Recipes</h1>
            <p className="text-[12px] text-[#64748b] font-roboto mt-1">Manage all your recipes !</p>
          </div>
          <Link href="/recipes/add">
            <button className="bg-[#0d9488] text-white px-6 py-3 rounded-lg hover:opacity-90 font-medium text-[14px] font-roboto transition flex items-center gap-2">
              <span>+</span> Add New Recipe
            </button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Filter recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg text-[14px] text-[#1a2632] placeholder-[#64748b] font-roboto focus:outline-none focus:border-[#0d9488]"
              />
            </div>
         
          </div>
        </div>

        {/* Recipe Cards Grid */}
        {recipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe.recipe_id} className="bg-white rounded-lg border border-[#e5e7eb] overflow-hidden hover:shadow-lg transition">
                {/* Recipe Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {recipe.image_url ? (
                    <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[12px] font-bold ${getStatusColor(recipe.status)}`}>
                    {recipe.status}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="text-[14px] font-bold text-[#1a2632] font-roboto mb-2">{recipe.title}</h3>
                  
                  <div className="mb-3">
                    <span className={`inline-block px-2 py-1 rounded text-[11px] font-medium ${getCategoryColor(recipe.category)}`}>
                      {recipe.category}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-[14px] font-bold text-[#1a2632] font-roboto">
                      {recipe.price} XRP
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-[12px] text-[#64748b] font-roboto mb-4 border-t border-[#e5e7eb] pt-3">
                    <span>👁 {recipe.views_count || 0} views</span>
                    <span>🔓 {recipe.unlocks_count || 0} unlocks</span>
                  </div>

                  <div className="flex gap-2">
                      <Link href={`/recipes/${recipe.recipe_id}`} className="flex-1">
                        <button className="w-full px-3 py-2 border border-[#0d9488] text-[#0d9488] rounded text-[12px] font-medium hover:bg-[#e0f2f1] transition">
                          View
                        </button>
                      </Link>
  
                        <button className="flex-1 px-3 py-2 bg-red-500 text-white rounded text-[12px] font-medium hover:opacity-90 transition">
                          Delete
                        </button>
                      </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-roboto">You haven't added any recipes yet.</p>
            <Link href="/recipes/add" className="text-[#0d9488] font-medium mt-2 inline-block hover:underline">
              Create your first recipe
            </Link>
          </div>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
}