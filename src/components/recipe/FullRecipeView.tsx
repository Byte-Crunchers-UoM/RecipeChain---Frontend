'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Recipe } from '@/lib/types/recipe';
import { 
  Clock, Users, Flame, Star, ChefHat, CheckCircle2, Circle 
} from 'lucide-react';

interface FullRecipeViewProps {
  recipe: Recipe;
}

export function FullRecipeView({ recipe }: FullRecipeViewProps) {
  // An array storing the indices of ingredients the user has clicked on, 
  // enabling a checklist feature while they cook.
  const [checkedIngredients, setCheckedIngredients] = useState<number[]>([]);

  if (!recipe) return null;

  const chefName = Array.isArray(recipe.sellers) 
    ? recipe.sellers[0]?.full_name 
    : recipe.sellers?.full_name || 'Unknown Chef';

  // Toggle function for the ingredient checklist
  const toggleIngredient = (index: number) => {
    setCheckedIngredients(prev => 
      // If the index exists in the array, filter it out. Otherwise, add it.
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. Hero Image Header */}
      <div className="relative h-[40vh] md:h-[50vh] w-full">
        <Image
          src={recipe.image_url && recipe.image_url !== "" ? recipe.image_url : "/images/placeholder-recipe.jpg"}
          alt={recipe.title || 'Recipe Image'}
          fill
          priority // Prioritizes this image to prevent layout shift above the fold
          className="object-cover"
        />
        {/* CSS Gradient Overlay so white text is readable regardless of the image behind it */}
        <div className="absolute inset-0 bg-linear-to-t from-gray-900/90 via-gray-900/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
          <div className="max-w-6xl mx-auto">
            <span className="inline-block bg-teal-500/20 text-teal-300 border border-teal-500/30 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase mb-4 backdrop-blur-md">
              {recipe.difficulty_level || 'Standard'}
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
              {recipe.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-200">
              <span className="flex items-center gap-2 font-medium">
                <ChefHat size={20} className="text-teal-400" />
                {chefName}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Star size={20} className="text-yellow-400 fill-yellow-400" />
                {recipe.rating_avg || 'New'} Rating
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-8">
        
        {/* Quick Stats Bar (Prep/Cook time) */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 flex flex-wrap items-center justify-between gap-6 mb-10">
          <div className="flex flex-wrap gap-8 md:gap-16">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Prep Time</p>
                <p className="text-lg font-bold text-gray-900">{recipe.prep_time || 0} min</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                <Flame size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Cook Time</p>
                <p className="text-lg font-bold text-gray-900">{recipe.cook_time || 0} min</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Servings</p>
                <p className="text-lg font-bold text-gray-900">{recipe.servings || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {recipe.description && (
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-10 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">About this recipe</h3>
            <p className="text-gray-600 leading-relaxed text-lg">
              {recipe.description}
            </p>
          </div>
        )}

        {/* 3. Two Column Layout: Ingredients & Instructions */}
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column: Ingredients (Uses sticky positioning to scroll smoothly with the user) */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 sticky top-24">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                Ingredients
                <span className="text-sm font-medium bg-gray-100 text-gray-600 px-3 py-1 rounded-full ml-auto">
                  {recipe.ingredients?.length || 0} items
                </span>
              </h3>
              
              <ul className="space-y-4">
                {recipe.ingredients && Array.isArray(recipe.ingredients) ? (
                  recipe.ingredients.map((ing: any, idx: number) => {
                    const isChecked = checkedIngredients.includes(idx);
                    // Defensive extraction based on DB structure (string vs JSON object)
                    const ingredientText = typeof ing === 'string' ? ing : ing.name || JSON.stringify(ing);
                    
                    return (
                      <li 
                        key={idx} 
                        // Dynamically changes styling when user clicks an ingredient
                        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          isChecked ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => toggleIngredient(idx)}
                      >
                        <button className="shrink-0 mt-0.5 text-teal-600 focus:outline-none">
                          {isChecked ? <CheckCircle2 size={22} /> : <Circle size={22} className="text-gray-300" />}
                        </button>
                        <span className={`text-gray-700 leading-relaxed ${isChecked ? 'line-through' : ''}`}>
                          {ingredientText}
                        </span>
                      </li>
                    );
                  })
                ) : (
                  <li className="text-gray-500 italic">No ingredients listed.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Right Column: Instructions */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Step-by-Step Instructions</h3>
              
              <div className="space-y-10">
                {recipe.instructions && Array.isArray(recipe.instructions) ? (
                  recipe.instructions.map((step: any, idx: number) => {
                    const stepText = typeof step === 'string' ? step : step.instruction || step.step || JSON.stringify(step);
                    
                    return (
                      <div key={idx} className="relative pl-10 md:pl-14">
                        {/* Vertical Connecting Line between steps */}
                        {idx !== recipe.instructions.length - 1 && (
                          <div className="absolute left-4 md:left-6 top-10 -bottom-10 w-0.5 bg-gray-100"></div>
                        )}
                        
                        {/* Step Number Indicator */}
                        <div className="absolute left-0 top-0 w-8 md:w-12 h-8 md:h-12 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center font-bold text-lg md:text-xl border-4 border-white shadow-sm z-10">
                          {idx + 1}
                        </div>
                        
                        <div className="pt-1 md:pt-2">
                          <h4 className="text-lg font-bold text-gray-900 mb-2">Step {idx + 1}</h4>
                          <p className="text-gray-600 text-lg leading-relaxed">
                            {stepText}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-gray-500 italic">No instructions provided.</div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}