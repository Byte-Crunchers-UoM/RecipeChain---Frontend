"use client";

import React, { useState } from 'react';
import { useRecipeCart } from '@/lib/context/RecipeCartContext';
import { Recipe } from '@/lib/types/Recipe';

interface SaveRecipeButtonProps {
    recipe: Recipe;
}

export default function SaveRecipeButton({ recipe }: SaveRecipeButtonProps) {
    // 1. Bring in the context functions
    const { cartItems, addToCart, removeFromCart } = useRecipeCart();
    
    // 2. Local loading state for the button animation
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 3. Dynamically check if this specific recipe is already saved
    const isSaved = cartItems.some((item) => item.recipe_id === recipe.recipe_id);

    // 4. The Action Handler
    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        
        try {
            if (isSaved) {
                // If it's already saved, clicking it again will unsave it
                await removeFromCart(recipe.recipe_id);
            } else {
                // Otherwise, save it to the cart
                await addToCart(recipe);
            }
        } catch (err) {
            console.error("Failed to update saved status:", err);
            setError("Failed to update cart");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-6 py-3 rounded-xl font-semibold transition shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    isSaved
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300'
                }`}
            >
                {isSaving ? (
                    // Loading spinner when isSaving is true
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                    </>
                ) : isSaved ? (
                    // "Saved" UI
                    <>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Carted
                    </>
                ) : (
                    // "Save" UI
                    <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
                        </svg>
                        Add To Cart
                    </>
                )}
            </button>
            {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
        </div>
    );
}