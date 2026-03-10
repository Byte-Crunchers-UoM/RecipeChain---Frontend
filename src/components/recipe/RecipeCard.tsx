// src/components/recipe/RecipeCard.tsx
import Image from 'next/image';
import Link from 'next/link'; // Standard for navigation
import { Clock, Users, ChefHat, Star, ArrowRight } from 'lucide-react';
import { Recipe } from '@/lib/types/Recipe';
interface RecipeCardProps {
  recipe: Recipe;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-emerald-500',
  medium: 'bg-amber-500',
  hard: 'bg-red-500',
  default: 'bg-gray-500',
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  
const difficulty = recipe.difficulty_level?.toLowerCase() || 'default';
const badgeColor = DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS.default;
const fallbackImage = "/images/placeholder-recipe.jpg";
  return (
    <article className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col h-full relative">
      
      
      <Link href={`/recipe/${recipe.recipe_id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View recipe for {recipe.title}</span>
      </Link>

      {/* Image Section */}
      <div className="relative h-52 w-full bg-gray-100">
        <Image 
          src={recipe.image_url  && recipe.image_url !== "" ? recipe.image_url : fallbackImage} 
          alt={`Photo of ${recipe.title}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority={false} 
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 z-20">
          <span className={`${badgeColor} text-white text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full shadow-sm`}>
            {recipe.difficulty_level}
          </span>
        </div>

        <div className="absolute top-4 right-4 z-20 bg-gray-900/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="font-semibold">{recipe.rating}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col grow relative z-20 pointer-events-none">
        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-1 group-hover:text-emerald-600 transition-colors">
          {recipe.title}
        </h3>
        
        {/* Chef Info */}
        <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
          <ChefHat className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-700">{
            Array.isArray(recipe.sellers) 
            ? recipe.sellers[0]?.full_name 
            : recipe.sellers?.full_name 
            || 'Unknown chef'
          }</span> 
          <span className="text-gray-300">•</span>
          <span className="text-gray-400 text-xs">{recipe.reviewsCount} reviews</span>
        </div>

        {/* Footer Info */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex gap-4 text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-500" />
              {recipe.prep_time} mins
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-500" />
              {recipe.servings} servings
            </div>
          </div>
          
          <div className="text-emerald-600 text-xs font-bold flex items-center gap-1 group-hover:text-emerald-700 transition-colors">
            View Recipe <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </article>
  );
}