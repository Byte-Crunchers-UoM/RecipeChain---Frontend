'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import RecipeSummaryCard from '@/components/recipe/RecipeSummaryCard';
import { Search } from 'lucide-react';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/recipes`;

function TrendingRecipesContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Recipes' },
    { id: 'easy', label: 'Easy' },
    { id: 'medium', label: 'Medium' },
    { id: 'hard', label: 'Hard' },
  ];

  const fetchRecipes = async (category = 'all') => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API_BASE_URL}/trending?limit=100`;
      if (category !== 'all') {
        url += `&category=${category}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setRecipes(data.recipes);
      } else {
        setError(data.message || 'Failed to fetch recipes');
      }
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Could not connect to the backend. Please ensure the server is running on port 4000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes(activeCategory);
  }, [activeCategory]);

  // Deduplicate recipes by title
  const uniqueRecipes = recipes.filter((recipe: any, index: number, self: any[]) =>
    index === self.findIndex((r: any) => r.title?.toLowerCase() === recipe.title?.toLowerCase())
  );

  // Filter recipes by search query
  const filteredRecipes = uniqueRecipes.filter((recipe: any) =>
    recipe.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.chef_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold font-outfit text-slate-800">Trending Recipes</h1>
        <p className="text-slate-400 text-[14px] mt-1">Discover the most popular recipes right now</p>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        {/* Category Tabs */}
        <div className="flex gap-2 bg-slate-100/80 p-1 rounded-full">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 ${activeCategory === cat.id
                ? 'bg-[#008080] text-white shadow-md shadow-[#008080]/20'
                : 'text-slate-400 hover:text-slate-700'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-[13px] text-slate-400 mb-5">
        {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-3 border-[#008080] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm animate-pulse">Loading trending recipes...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 text-red-500 p-8 rounded-2xl text-center max-w-md mx-auto">
          <p className="font-semibold mb-2">Something went wrong</p>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={() => fetchRecipes(activeCategory)}
            className="px-6 py-2 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Search size={24} className="text-slate-300" />
          </div>
          <p className="font-medium">No recipes found</p>
          <p className="text-sm mt-1">Try adjusting your search or category filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRecipes.map((recipe: any) => (
            <RecipeSummaryCard key={recipe.recipe_id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TrendingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-500">Loading trending recipes...</div>}>
      <TrendingRecipesContent />
    </Suspense>
  );
}
