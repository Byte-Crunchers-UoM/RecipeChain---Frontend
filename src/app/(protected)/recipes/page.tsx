'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { RecipePreview } from '@/components/recipe/RecipePreview';
import RecipePaymentModal from '@/components/recipe/RecipePaymentModel';
import { Recipe } from '@/lib/types/Recipe';
import { fetchRecipes } from '@/services/recipeService';
import { useRecipeFilterContext } from '@/context/RecipeFilterContext';

export default function MarketplacePage() {
  const router = useRouter();
  
  // State pulled from global context so sidebar filters can affect this page
  const { recipes, setRecipes, isLoading, setIsLoading } = useRecipeFilterContext();
  
  // Local state to manage which modals are open
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [purchasingRecipe, setPurchasingRecipe] = useState<Recipe | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setIsLoading(true); 
        const data = await fetchRecipes();
        setRecipes(data || []); 
      } catch (error) {
        console.error("Failed to fetch recipes:", error);
        setRecipes([]); 
      } finally {
        setIsLoading(false);
      }
    };
    loadRecipes();
  }, []);

  // When a user clicks a RecipeCard on the grid, this decides the next step.
  const handleRecipeClick = (clickedRecipe: Recipe) => {
    // 1. If purchased or if it is free, navigate directly to the Full Recipe Page
    if (clickedRecipe.is_purchased || !clickedRecipe.price || clickedRecipe.price === 0) {
      router.push(`/recipes/${clickedRecipe.recipe_id}`);
    } else {
      // 2. If it is an unpurchased Premium recipe, show the Teaser/Preview Modal
      setSelectedRecipe(clickedRecipe);
    }
  };

  // Triggered when the user successfully completes an XRPL payment
  const handlePaymentSuccess = () => {
    const recipeId = purchasingRecipe?.recipe_id;

    if (recipeId) {
      // Optimistic UI Update: We map over the existing array and manually set 'is_purchased' to true.
      // This immediately unlocks the recipe on the frontend without requiring a full page refresh/refetch!
      const updatedRecipes = recipes.map((r: Recipe) => 
        r.recipe_id === recipeId ? { ...r, is_purchased: true } : r
      );
      
      setRecipes(updatedRecipes);
    }

    // Close both modals
    setPurchasingRecipe(null);
    setSelectedRecipe(null);

    // Navigate the user to the newly purchased recipe
    if (recipeId) {
      router.refresh(); 
      router.push(`/recipes/${recipeId}`);
    }
  };

  return (
    <div className="w-full p-8 bg-white min-h-full relative">
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
          // If the Payment Modal opens ON TOP of the Preview Modal, we blur the Preview Modal for visual hierarchy
          <div className={purchasingRecipe ? "blur-md pointer-events-none transition-all duration-300" : "transition-all duration-300"}>
            <RecipePreview 
              isOpen={true}
              recipe={selectedRecipe} 
              onClose={() => setSelectedRecipe(null)}
              // Passing state up: If they click "Unlock" in the preview, we set the purchasing state
              onInitiatePurchase={() => setPurchasingRecipe(selectedRecipe)} 
            />
          </div>
        )}

        {/* Payment Modal */}
        {/* Opens when purchasingRecipe state is populated */}
        <RecipePaymentModal 
          isOpen={!!purchasingRecipe}
          recipe={purchasingRecipe}
          onClose={() => setPurchasingRecipe(null)}
          onSuccess={handlePaymentSuccess}
        />
      </div>
  );
}