//src/app/recipes/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FullRecipeView } from '@/components/recipe/FullRecipeView';
import RecipePaymentModal from '@/components/recipe/RecipePaymentModel';
import { Recipe } from '@/lib/types/Recipe';
import { fetchRecipeById } from '@/services/recipeService';
import { Loader2, Lock } from 'lucide-react';

/** Page component that displays the full details of a specific recipe, or a locked screen if premium access is required. */
export default function RecipeDetailPage() {
  const params = useParams(); 
  const router = useRouter(); 
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    /** Asynchronously loads the recipe details from the backend API using the provided recipe ID. */
    async function loadRecipe() {
      if (!params?.id) return;

      try {
        setLoading(true);
        const foundRecipe = await fetchRecipeById(params.id as string);

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

  // 1. Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading recipe details...</p>
      </div>
    );
  }

  // 2. Error Screen
  if (error || !recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error || "Something went wrong."}</p>
          <button 
            onClick={() => router.push('/recipes')}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl transition font-semibold"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 🛠️ 3. CONDITIONAL RENDERING (Locked Screen vs Full View) */}
      {recipe.is_premium_locked ? (
        
        // "Locked" screen shown if the user hasn't paid (Locked Screen)
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <div className="bg-white p-10 rounded-3xl shadow-lg border border-slate-100 max-w-md w-full animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Premium Recipe</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              This recipe is locked. You need to purchase it to view the full ingredients and instructions.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setIsPaymentModalOpen(true)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl transition shadow-md shadow-teal-200"
              >
                Unlock for {recipe.price || 0} XRP
              </button>
              <button 
                onClick={() => router.push('/recipes')}
                className="w-full bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-medium py-3.5 rounded-xl transition"
              >
                Back to Marketplace
              </button>
            </div>
          </div>
        </div>

      ) : (
        // If paid (or free), directly show the Full View
        <FullRecipeView recipe={recipe} />
      )}

      {/* 🛠️ PAYMENT MODAL (Appears when clicking Unlock from the locked screen) */}
      <RecipePaymentModal 
        recipe={recipe}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={() => {
          setIsPaymentModalOpen(false);
          window.location.reload(); 
        }}
      />
    </>
  );
}