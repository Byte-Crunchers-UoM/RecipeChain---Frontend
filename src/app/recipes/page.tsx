'use client';

import { useState, useEffect } from 'react';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import {RecipePreview} from '@/components/recipe/RecipePreview';
import { Recipe } from '@/lib/types/Recipe';
import { fetchRecipes } from '@/services/recipeService';
import { useRecipeFilterContext } from '@/lib/context/RecipeFilterContext';
import Header from '@/components/layout/Header';
interface MarcketplaceProps {
  Recipe: Recipe;
}

export default function MarketplacePage({Recipe}:MarcketplaceProps) {
  const [activeCategory, setActiveCategory] = useState('All Recipes');
  const { recipes, setRecipes, isLoading, setIsLoading } = useRecipeFilterContext();
 const [selectedRecipe,setSelectedRecipe] = useState<Recipe|null>(null);
  const handleRecipeClick = (clickedRecipe: Recipe) => {
  setSelectedRecipe(clickedRecipe);
};
  // 2. Fetch data inside useEffect
  useEffect(() => {
    const     loadRecipes = async () => {
      try {
        const data = await fetchRecipes();
        // Ensure we always set an array, even if data comes back undefined
        setRecipes(data || []); 
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
        setRecipes([]); 
      } finally {
        setIsLoading(false);
      }
    };if (recipes.length === 0) {
       loadRecipes();
  
      }
   
  }, []);
  return (

     <>
      <Header notificationCount={1} />

    <div className="w-full p-8 bg-white min-h-screen">
      


      {/* --- MAIN CONTENT: Recipe Grid --- */}
      <section>
        {isLoading ? (
          // 3. Optional: Add a loading state UI
          <div className="text-center text-gray-500 py-10">Loading recipes...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 4. Safely map over recipes */}
            {recipes.map((recipe: Recipe) => (
             <RecipeCard 
                  key={recipe.recipe_id} 
                  recipe={recipe} 
                  onClick={() => handleRecipeClick(recipe)} // 👈 Pass the specific recipe here!
            />
            ))}
            {/* Optional: Show message if array is empty */}
            {recipes.length === 0 && (
              <p className="col-span-full text-center text-gray-500">No recipes found.</p>
            )}
          </div>
        )}
      </section>
      {selectedRecipe && (
        <RecipePreview 
          isOpen={true}
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
          
        />
      )}

    </div>
    </>
  );
}