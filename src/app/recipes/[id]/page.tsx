'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FullRecipeView } from '@/components/recipe/FullRecipeview';
import { Recipe } from '@/lib/types/Recipe';
import { fetchRecipes } from '@/services/recipeService';
import { Loader2 } from 'lucide-react';

export default function RecipeDetailPage() {
  const params = useParams(); 
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecipe() {
      if (!params?.id) return;

      try {
        setLoading(true);
        const allRecipes = await fetchRecipes();
        const foundRecipe = allRecipes.find((r: Recipe) => r.recipe_id === params.id);

        if (foundRecipe) {
          setRecipe(foundRecipe);
        } else {
          setError("Recipe not found");
        }
      } catch (err) {
        console.error("Error loading recipe:", err);
        setError("Failed to load recipe details.");
      } finally {
        setLoading(false);
      }
    }

    loadRecipe();
  }, [params.id]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading recipe details...</p>
      </div>
    );
  }

  // Error Screen
  if (error || !recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error || "Something went wrong."}</p>
          <a 
            href="/marketplace" 
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl transition font-semibold"
          >
            Back to Marketplace
          </a>
        </div>
      </div>
    );
  }

  return <FullRecipeView recipe={recipe} />;
}