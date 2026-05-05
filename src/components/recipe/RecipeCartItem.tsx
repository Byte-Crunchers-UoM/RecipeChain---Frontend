//src/components/recipe/RecipeCartItem.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Recipe } from '@/lib/types/Recipe';
import { Trash2, Loader2, Clock } from 'lucide-react';

interface RecipeCartItemProps {
    recipe: Recipe;
    onRemove: (recipe_id: string) => Promise<void>;
}

export default function RecipeCartItem({ recipe, onRemove }: RecipeCartItemProps) {
    const [isRemoving, setIsRemoving] = useState(false);
    const [imgError, setImgError] = useState(false);

    const handleRemove = async (e: React.MouseEvent) => {
        e.preventDefault(); 
        e.stopPropagation();
        
        if (isRemoving) return;
        
        setIsRemoving(true);
        try {
            await onRemove(recipe.recipe_id);
        } catch (error) {
            console.error("Failed to remove recipe:", error);
            setIsRemoving(false); // Only reset if failed, if success it unmounts anyway
        }
    };

    // 🛠️ Fallbacks for missing backend JOIN data
    const displayTitle = recipe.title || 'Untitled Recipe';
    const displayTime = recipe.prep_time ? `${recipe.prep_time} min` : '-- min';
    const imgSrc = imgError || !recipe.image_url ? '/images/placeholder-recipe.jpg' : recipe.image_url;

    return (
        <Link 
            href={`/recipes/${recipe.recipe_id}`}
            className="group relative flex items-center gap-4 p-3 bg-white border border-slate-100 hover:border-teal-200 hover:shadow-md hover:bg-teal-50/30 transition-all duration-300 rounded-2xl cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label={`View recipe for ${displayTitle}`}
        >
            {/* Image Container with subtle inner shadow */}
            <div className="relative w-20 h-20 shrink-0 bg-slate-100 rounded-xl overflow-hidden shadow-inner">
                <Image 
                    src={recipe.image_url || "/placeholder-food.jpg"} 
                    alt={recipe.title || 'Recipe image'} 
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 80px, 80px"
                    onError={() => setImgError(true)}
                />
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0 pr-10">
                <h4 
                    className="font-bold text-slate-800 text-[15px] leading-snug truncate" 
                    title={displayTitle}
                >
                    {displayTitle}
                </h4>
            </div>

            {/* Remove Button */}
            <button 
                onClick={handleRemove}
                disabled={isRemoving}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 p-2.5 hover:bg-red-50 rounded-full disabled:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-200"
                aria-label={`Remove ${displayTitle} from cart`}
                title="Remove saved recipe"
            >
                {isRemoving ? (
                    <Loader2 className="animate-spin w-5 h-5 text-red-500" />
                ) : (
                    <Trash2 className="w-5 h-5" />
                )}
            </button>
        </Link>
    );
}