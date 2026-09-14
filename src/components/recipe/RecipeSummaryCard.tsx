import React from 'react';
import Image from 'next/image';
import { Star, ChefHat, Clock, Users, ArrowRight } from 'lucide-react';

interface RecipeCardProps {
  recipe: {
    recipe_id: string;
    title: string;
    image_url?: string;
    difficulty_level?: string;
    average_rating?: number;
    rating?: number;
    rating_count?: number;
    cook_time?: number;
    servings?: number;
    chef_name?: string;
    price?: number;
  };
}

const RecipeSummaryCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const difficultyClass = (recipe.difficulty_level || 'Medium').toLowerCase();
  const rating = (recipe.average_rating || recipe.rating || 0).toFixed(1);
  const reviewsCount = recipe.rating_count || 0;

  return (
    <div className="group bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-slate-100/80">
      {/* Image Section */}
      <div className="relative h-[200px] overflow-hidden">
        <Image 
          src={recipe.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'} 
          alt={recipe.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Difficulty Badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-white shadow-md ${
            difficultyClass === 'easy' ? 'bg-emerald-500' : 
            difficultyClass === 'medium' ? 'bg-amber-500' : 'bg-rose-500'
          }`}>
            {recipe.difficulty_level || 'Medium'}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full flex items-center gap-1 text-[12px] font-semibold">
          <Star size={12} fill="#fbbf24" stroke="#fbbf24" />
          <span>{rating}</span>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-[16px] font-bold mb-3 line-clamp-2 leading-snug group-hover:text-[#008080] transition-colors">
          {recipe.title}
        </h3>
        
        {/* Chef + Reviews */}
        <div className="flex items-center gap-2 mb-4 text-slate-400 text-[13px]">
          <ChefHat size={15} className="text-[#008080]" />
          <span className="text-slate-600 font-medium">{recipe.chef_name || 'Chef'}</span>
          <span className="text-slate-300">•</span>
          <span>{reviewsCount} reviews</span>
        </div>
        
        {/* Cook Time + Servings + View Recipe */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-slate-400 text-[13px]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock size={14} />
              <span>{recipe.cook_time || 30} mins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={14} />
              <span>{recipe.servings || 2} servings</span>
            </div>
          </div>
          <a href="#" className="text-[#008080] font-semibold flex items-center gap-1 hover:gap-2 transition-all text-[13px]">
            View Recipe
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default RecipeSummaryCard;
