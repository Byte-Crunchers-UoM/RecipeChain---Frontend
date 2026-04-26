'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { RecipePreview } from '@/components/recipe/RecipePreview';
import RecipePaymentModal from '@/components/recipe/RecipePaymentModel';
import { Recipe } from '@/lib/types/Recipe';
import { fetchRecipes } from '@/services/recipeService';
import { useRecipeFilterContext } from '@/lib/context/RecipeFilterContext';
import Header from '@/components/layout/Header';

export default function MarketplacePage() {
  const router = useRouter();
  const { recipes, setRecipes, isLoading, setIsLoading } = useRecipeFilterContext();
  
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [purchasingRecipe, setPurchasingRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setIsLoading(true); // 🛠️ Set Loading to true here
        const data = await fetchRecipes();
        setRecipes(data || []); 
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
        setRecipes([]); 
      } finally {
        setIsLoading(false);
      }
    };
    // Fetch the initial data first
    loadRecipes();
  }, []);

  // 🛠️ This is the main logic change!
  const handleRecipeClick = (clickedRecipe: Recipe) => {
    // 1. If purchased or if it is free, navigate directly to the Recipe Page
    if (clickedRecipe.is_purchased || !clickedRecipe.price || clickedRecipe.price === 0) {
      router.push(`/recipes/${clickedRecipe.recipe_id}`);
    } else {
      // 2. If it is an unpurchased Premium recipe, show the Preview Modal
      setSelectedRecipe(clickedRecipe);
    }
  };

  const handlePaymentSuccess = () => {
    const recipeId = purchasingRecipe?.recipe_id;

    if (recipeId) {
      // 1. Create a new array mapping over the existing recipes array
      const updatedRecipes = recipes.map((r: Recipe) => 
        r.recipe_id === recipeId ? { ...r, is_purchased: true } : r
      );
      
      // 2. Pass that new array directly to setRecipes (TypeScript is happy now!)
      setRecipes(updatedRecipes);
    }

    setPurchasingRecipe(null);
    setSelectedRecipe(null);

    if (recipeId) {
      router.refresh(); 
      router.push(`/recipes/${recipeId}`);
    }
  };

  return (
    <>
      <Header notificationCount={1} />

      <div className="w-full p-8 bg-white min-h-screen relative">
        <section>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
              <p className="text-gray-500 font-medium">Fetching Marketplace Recipes...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe: Recipe) => (
                <RecipeCard 
                  key={recipe.recipe_id} 
                  recipe={recipe} 
                  onClick={() => handleRecipeClick(recipe)} 
                />
              ))}
              {recipes.length === 0 && (
                <p className="col-span-full text-center text-gray-500 py-10">No recipes found.</p>
              )}
            </div>
          )}
        </section>

        {/* Recipe Preview Modal */}
        {selectedRecipe && (
          <div className={purchasingRecipe ? "blur-md pointer-events-none transition-all duration-300" : "transition-all duration-300"}>
            <RecipePreview 
              isOpen={true}
              recipe={selectedRecipe} 
              onClose={() => setSelectedRecipe(null)}
              onInitiatePurchase={() => setPurchasingRecipe(selectedRecipe)} 
            />
          </div>
        )}

        {/* Payment Modal */}
        <RecipePaymentModal 
          isOpen={!!purchasingRecipe}
          recipe={purchasingRecipe}
          onClose={() => setPurchasingRecipe(null)}
          onSuccess={handlePaymentSuccess}
        />
      </div>
    </>
  );
}