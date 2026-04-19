import React, { useState } from 'react';
import Image from 'next/image';
import { Recipe } from '@/lib/types/Recipe';

interface RecipeCartItemProps {
    recipe: Recipe;
    onRemove: (recipe_id: string) => Promise<void>;
}

export default function RecipeCartItem({ recipe, onRemove }: RecipeCartItemProps) {
    const [isRemoving, setIsRemoving] = useState(false);

    const handleRemove = async () => {
        setIsRemoving(true);
        try {
            await onRemove(recipe.recipe_id);
        } catch (error) {
            console.error("Failed to remove recipe:", error);
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <div className="group relative flex items-center gap-4 p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-2xl">
            
            {/* 1. The Image Container */}
            <div className="relative w-16 h-16 shrink-0">
                <Image 
                    src={recipe.image_url || "/placeholder-food.jpg"} 
                    alt={recipe.title} 
                    fill
                    className="object-cover rounded-xl"
                    sizes="64px"
                />
            </div>

            {/* 2. The Text Content */}
            {/* min-w-0 ensures the text truncates properly instead of pushing the layout wide */}
            <div className="flex-1 min-w-0 pr-8">
                <h4 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2">
                    {recipe.title}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                    {recipe.prep_time || '25 min'}
                </p>
            </div>

            {/* 3. The Remove Button (Appears on Hover) */}
            <button 
                onClick={handleRemove}
                disabled={isRemoving}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Remove ${recipe.title} from cart`}
            >
                {isRemoving ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    '✕'
                )}
            </button>
            
        </div>
    );
}