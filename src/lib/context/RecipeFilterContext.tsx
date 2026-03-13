"use client"
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { FilterState, Recipe } from '@/lib/types/Recipe';
import { fetchFilteredRecipe } from '@/services/recipeService';

interface FilterContextType {
  recipes: Recipe[];
  setRecipes: (recipes: Recipe[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isFiltering: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  hasFilter: (category: keyof FilterState, value: string) => boolean;
  toggleFilter: (category: keyof FilterState, value: string) => void;
  clearFilters: () => void;
  applyFilters: (isFromButton?: boolean) => void; 
}

const RecipeFilterContext = createContext<FilterContextType | undefined>(undefined);

export function RecipeFilterProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    difficulty_level: '', 
    dietary_tags: '',      
    meal_type: '', 
    occasion: '', 
    cuisine: '', 
    goal: ''
  });

  const hasFilter = (category: keyof FilterState, value: string) => {
    return filters[category] === value;
  };

  const toggleFilter = (category: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category] === value ? '' : value
    }));
  }; 

  const clearFilters = () => {
    setFilters({
      difficulty_level: '', 
      meal_type: '', 
      occasion: '', 
      cuisine: '', 
      dietary_tags: '', 
      goal: '' 
    });
  };

  const applyFilters = useCallback(async (isFromButton = false) => {
    try {
      if (isFromButton) {
        setIsFiltering(true);
      } else {
        setIsLoading(true); 
      }
      
      setError(null);
      
      const activeFilters: Record<string, string> = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      const queryString = new URLSearchParams(activeFilters).toString();
      const data = await fetchFilteredRecipe(queryString);
      
      setRecipes(data || []);
    } catch (err) {
      setError("Can't fetch filtered data. Please try again.");
    } finally {
      setIsFiltering(false);
      setIsLoading(false);
    }
  }, [filters]);

  return(
    <RecipeFilterContext.Provider value={{
      recipes, setRecipes, isLoading, isFiltering, setIsLoading, 
      error, setError, hasFilter, toggleFilter, clearFilters, applyFilters
    }}>
        {children}
    </RecipeFilterContext.Provider>
  );
}

export function useRecipeFilterContext() {
    const context = useContext(RecipeFilterContext);
    if (!context) {
        throw new Error('useRecipeFilterContext must be used within a RecipeFilterProvider');
    }
    return context;
}