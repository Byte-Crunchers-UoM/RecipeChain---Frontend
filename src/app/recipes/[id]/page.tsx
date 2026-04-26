'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Flame, 
  BookOpen, 
  ShieldCheck, 
  UtensilsCrossed,
  CheckCircle2,
  ChefHat
} from 'lucide-react';

export default function RecipeDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecipeDetails() {
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('recipe_id', id)
          .single();

        if (error) throw error;
        setRecipe(data);
      } catch (error: any) {
        console.error('Error:', error.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchRecipeDetails();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Fetching your recipe...</p>
      </div>
    </div>
  );

  if (!recipe) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Recipe not found!</h2>
        <button onClick={() => router.back()} className="mt-4 text-teal-600 font-semibold underline">Go Back</button>
      </div>
    </div>
  );

  // Helper function to parse ingredients (if stored as JSON string or Array)
  const ingredientsList = Array.isArray(recipe.ingredients) 
    ? recipe.ingredients 
    : typeof recipe.ingredients === 'string' 
      ? JSON.parse(recipe.ingredients) 
      : [];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="group flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
          >
            <div className="p-2 group-hover:bg-teal-50 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-teal-600" />
            <span className="font-bold text-gray-900 tracking-tight">RecipeChain</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left Side: Image Section */}
            <div className="relative h-[450px] lg:h-full min-h-[500px]">
              {recipe.image_url ? (
                <img 
                  src={recipe.image_url} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <UtensilsCrossed className="w-16 h-16 text-slate-300" />
                </div>
              )}
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 bg-teal-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg backdrop-blur-sm">
                  {recipe.status}
                </span>
              </div>
            </div>

            {/* Right Side: Content Section */}
            <div className="p-8 lg:p-14 flex flex-col">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-md mb-4 uppercase tracking-wider">
                  {recipe.difficulty_level || 'Chef Special'}
                </span>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] mb-6">
                  {recipe.title}
                </h1>
                <p className="text-gray-600 leading-relaxed text-lg mb-8 italic">
                  "{recipe.description?.substring(0, 150)}..."
                </p>
              </div>

              {/* Stats Bar */}
              <div className="flex items-center justify-between py-6 border-y border-gray-100 mb-8">
                <div className="flex flex-col items-center gap-1">
                  <Clock className="w-5 h-5 text-teal-500" />
                  <span className="text-sm font-bold text-slate-900">{recipe.prep_time + recipe.cook_time}m</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Cook Time</span>
                </div>
                <div className="h-8 w-[1px] bg-gray-100"></div>
                <div className="flex flex-col items-center gap-1">
                  <Users className="w-5 h-5 text-teal-500" />
                  <span className="text-sm font-bold text-slate-900">{recipe.servings}</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Servings</span>
                </div>
                <div className="h-8 w-[1px] bg-gray-100"></div>
                <div className="flex flex-col items-center gap-1">
                  <Flame className="w-5 h-5 text-teal-500" />
                  <span className="text-sm font-bold text-slate-900">350 kcal</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Calories</span>
                </div>
              </div>

              {/* Price Card */}
              <div className="mt-auto bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-teal-900/20">
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-teal-400 text-[10px] font-black uppercase tracking-widest mb-1">Ownership Price</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black">{recipe.price}</span>
                      <span className="text-xl font-bold text-teal-400">XRP</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-teal-400 mb-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Verified Asset</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-medium max-w-[100px] leading-tight">
                      SECURE BLOCKCHAIN TRANSACTION
                    </p>
                  </div>
                </div>
                {/* Decorative element */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-teal-500/10 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>

          {/* Bottom Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 border-t border-gray-100">
            {/* Ingredients Column */}
            <div className="p-8 lg:p-12 lg:border-r border-gray-100 bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-teal-600" />
                Ingredients
              </h3>
              <ul className="space-y-4">
                {ingredientsList.length > 0 ? ingredientsList.map((ing: any, index: number) => (
                  <li key={index} className="flex items-center gap-3 group">
                    <div className="w-2 h-2 rounded-full bg-teal-400 group-hover:scale-150 transition-transform"></div>
                    <span className="text-slate-600 font-medium">
                      {typeof ing === 'object' ? `${ing.amount} ${ing.item}` : ing}
                    </span>
                  </li>
                )) : (
                  <p className="text-gray-400 text-sm">No ingredients listed.</p>
                )}
              </ul>
            </div>

            {/* Steps Column - Updated Section */}
<div className="lg:col-span-2 p-8 lg:p-12">
  <h3 className="text-xl font-black text-slate-900 mb-8">Preparation Method</h3>
  <div className="space-y-6">
    {Array.isArray(recipe.instructions) ? (
      recipe.instructions.map((stepObj: any, index: number) => (
        <div key={index} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex-none w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
            {stepObj.step || index + 1}
          </div>
          <p className="text-slate-600 leading-relaxed pt-1">
            {typeof stepObj === 'object' ? stepObj.text : stepObj}
          </p>
        </div>
      ))
    ) : (
      <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
        {recipe.instructions || recipe.description || "Instructions coming soon..."}
      </p>
    )}
  </div>

              {recipe.chef_note && (
                <div className="mt-12 p-6 bg-amber-50 rounded-2xl border border-amber-100 border-l-4 border-l-amber-400">
                  <p className="text-amber-900 text-sm italic leading-relaxed">
                    <span className="font-bold not-italic text-amber-950 uppercase text-[10px] tracking-widest block mb-2">Chef's Note</span>
                    {recipe.chef_note}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}