"use client"
import { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';
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
  applyFilters: (isFromButton?: boolean) => Promise<void>; 
}

const RecipeFilterContext = createContext<FilterContextType | undefined>(undefined);

/** Provider component that manages the state and operations for filtering recipes. */
export function RecipeFilterProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [error, setError] = useState<string | null>(null);
// Active Filters State
  const [filters, setFilters] = useState<FilterState>({
    difficulty_level: '', 
    dietary_tags: '',      
    meal_type: '', 
    occasion: '', 
    cuisine: '', 
    goal: ''
  });

  const filtersRef = useRef<FilterState>(filters);

  /** Checks whether a specific filter category currently has the given value active. */
  const hasFilter = (category: keyof FilterState, value: string) => {
    return filters[category] === value;
  };

  /** Toggles a filter on or off for a specific category and updates the filter state. */
  const toggleFilter = (category: keyof FilterState, value: string) => {
    const newFilters = {
      ...filters,
      [category]: filters[category] === value ? '' : value
    };
    setFilters(newFilters);
    filtersRef.current = newFilters; 
  }; 

  /** Resets all filter categories to their default empty states and reapplies the empty filter. */
  const clearFilters = () => {
    const emptyFilters = {
      difficulty_level: '', meal_type: '', occasion: '', cuisine: '', dietary_tags: '', goal: '' 
    };
    setFilters(emptyFilters);
    filtersRef.current = emptyFilters;
    applyFilters(false); 
  };

  /** Constructs the query string from active filters and fetches the corresponding recipes from the API. */
  const applyFilters = useCallback(async (isFromButton = false) => {
    try {
      if (isFromButton) {
        setIsFiltering(true);
      } else {
        setIsLoading(true); 
      }
      
      setError(null);

      const activeFilters: Record<string, string> = Object.fromEntries(
        Object.entries(filtersRef.current).filter(([_, value]) => value !== '')
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
  }, []);
  return(
    <RecipeFilterContext.Provider value={{
      recipes, setRecipes, isLoading, isFiltering, setIsLoading, 
      error, setError, hasFilter, toggleFilter, clearFilters, applyFilters
    }}>
        {children}
    </RecipeFilterContext.Provider>
  );
}

/** Custom hook to securely access the recipe filter context. */
export function useRecipeFilterContext() {
    const context = useContext(RecipeFilterContext);
    if (!context) {
        throw new Error('useRecipeFilterContext must be used within a RecipeFilterProvider');
    }
    return context;
}