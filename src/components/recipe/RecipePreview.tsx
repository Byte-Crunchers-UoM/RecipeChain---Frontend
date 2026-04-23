'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Recipe } from '@/lib/types/Recipe';
// 1. Added Lock icon to imports
import { Flame, Clock, Coins, Users, Star, Lock } from 'lucide-react'; 
import SaveRecipeButton from './SaveRecipeButton';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
}

export function RecipePreview({ isOpen, onClose, recipe }: RecipeModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !recipe) return null;

  const chefName = Array.isArray(recipe.sellers) 
    ? recipe.sellers[0]?.full_name 
    : recipe.sellers?.full_name || 'Unknown Chef';

  // 2. Data Slicing Logic
  const hasIngredients = recipe.ingredients && Array.isArray(recipe.ingredients);
  const displayIngredients = hasIngredients ? recipe.ingredients.slice(0, 2) : [];
  const hiddenIngredientsCount = hasIngredients ? recipe.ingredients.length - 2 : 0;

  const hasInstructions = recipe.instructions && Array.isArray(recipe.instructions);
  const displayInstructions = hasInstructions ? recipe.instructions.slice(0, 2) : [];
  const hiddenInstructionsCount = hasInstructions ? recipe.instructions.length - 2 : 0;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="recipe-title"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition shadow-sm"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row gap-6 p-6">
          {/* Left - Image Section */}
          <div className="shrink-0 w-full md:w-48">
            <div className="relative">
              <Image
                src={recipe.image_url && recipe.image_url !== "" ? recipe.image_url : "/images/placeholder-recipe.jpg"}
                alt={recipe.title ? `Photo of ${recipe.title}` : 'Recipe image'}
                width={200}
                height={300}
                className="rounded-lg object-cover w-full h-48 md:h-80"
              />
              <span className="absolute top-3 left-3 bg-white text-teal-600 px-3 py-1 rounded-full text-sm font-semibold capitalize shadow-sm">
                {recipe.difficulty_level || 'Standard'}
              </span>
            </div>

            <div className="mt-4">
              <h2 id="recipe-title" className="text-xl font-bold text-gray-900 leading-tight">
                {recipe.title}
              </h2>
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-gray-600 text-sm">👨‍🍳 {chefName}</span>
                <span className="flex items-center gap-1 text-sm">
                  <Star size={16} className="text-yellow-400" />
                  <span className="font-semibold">{recipe.rating_avg || 'New'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right - Content Section */}
          <div className="flex-1 min-w-0 mt-4 md:mt-0">
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-2 md:gap-3 mb-6">
              <div className="bg-gray-50 p-2 md:p-4 rounded-lg text-center shadow-sm border border-gray-100">
                <div className="flex justify-center mb-1">
                  <Clock size={24} className="text-teal-600" />
                </div>
                <div className="text-xs md:text-sm font-semibold text-gray-900">{recipe.prep_time || 0}m</div>
                <div className="text-[10px] md:text-xs text-gray-500">Prep</div>
              </div>
              <div className="bg-gray-50 p-2 md:p-4 rounded-lg text-center shadow-sm border border-gray-100">
                <div className="flex justify-center mb-1">
                  <Flame size={24} className="text-orange-600" />
                </div>
                <div className="text-xs md:text-sm font-semibold text-gray-900">{recipe.cook_time || 0}m</div>
                <div className="text-[10px] md:text-xs text-gray-500">Cook</div>
              </div>
              <div className="bg-gray-50 p-2 md:p-4 rounded-lg text-center shadow-sm border border-gray-100">
                <div className="flex justify-center mb-1">
                  <Users size={24} className="text-blue-600" />
                </div>
                <div className="text-xs md:text-sm font-semibold text-gray-900">{recipe.servings || 0}</div>
                <div className="text-[10px] md:text-xs text-gray-500">Servings</div>
              </div>
              <div className="bg-blue-50 p-2 md:p-4 rounded-lg text-center shadow-sm border border-blue-100">
                <div className="flex justify-center mb-1">
                  <Coins size={24} className="text-blue-600" />
                </div>
                <div className="text-xs md:text-sm font-bold text-blue-600">{recipe.priceXrp || 0}</div>
                <div className="text-[10px] md:text-xs text-blue-500">XRP</div>
              </div>
            </div>

            {/* About Section */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">About This Recipe</h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {recipe.description || "No description provided."}
              </p>
            </div>

            {/* Premium Ingredients Section */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Ingredients</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {hasIngredients ? (
                  <>
                    {displayIngredients.map((ing: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-teal-600 mt-0.5">•</span>
                        <span>{typeof ing === 'string' ? ing : ing.name || JSON.stringify(ing)}</span>
                      </li>
                    ))}
                    
                    {/* Locked Ingredients Indicator */}
                    {hiddenIngredientsCount > 0 && (
                      <li className="flex items-center gap-2 mt-3 p-2 bg-gray-50 rounded-md text-gray-500 border border-dashed border-gray-200">
                        <Lock size={14} />
                        <span className="italic font-medium">
                          + {hiddenIngredientsCount} more hidden ingredients
                        </span>
                      </li>
                    )}
                  </>
                ) : (
                  <li className="text-gray-400 italic">Ingredients not listed.</li>
                )}
              </ul>
            </div>

            {/* Premium Instructions Section */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Instructions</h3>
              <div className="space-y-3 text-sm relative">
                {hasInstructions ? (
                  <>
                    {displayInstructions.map((step: any, idx: number) => (
                      <div key={idx} className="flex gap-3">
                        <span className="shrink-0 w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center font-semibold text-xs">
                          {idx + 1}
                        </span>
                        <span className="text-gray-600 mt-0.5 leading-relaxed">
                          {typeof step === 'string' ? step : step.instruction || step.step || JSON.stringify(step)}
                        </span>
                      </div>
                    ))}

                    {/* Locked Instructions Blur Effect */}
                    {hiddenInstructionsCount > 0 && (
                      <div className="relative pt-2">
                        {/* Faux blurred content */}
                        <div className="flex gap-3 opacity-20 select-none blur-[2px] pointer-events-none">
                          <span className="shrink-0 w-6 h-6 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-semibold text-xs">3</span>
                          <span className="mt-0.5 bg-gray-300 text-transparent rounded w-full">This is a secret instruction that is hidden behind the paywall to encourage unlocking.</span>
                        </div>
                        
                        {/* Gradient Overlay & Lock Message */}
                        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-t from-white via-white/70 to-transparent">
                           <span className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md text-teal-600 font-bold border border-teal-100 mt-4">
                             <Lock size={16} /> Unlock to see {hiddenInstructionsCount} more steps
                           </span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-gray-400 italic">Instructions not listed.</div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 sticky bottom-0 pt-4 bg-linear-to-t from-white via-white to-transparent backdrop-blur-sm border-t border-gray-100">
              <button 
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUnlocking}
              >
                {isUnlocking ? 'Unlocking...' : `Unlock Recipe for ${recipe.priceXrp || 0} XRP`}
              </button>
              
              <SaveRecipeButton recipe={recipe} />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}