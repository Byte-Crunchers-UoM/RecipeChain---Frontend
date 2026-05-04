'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useRecipeFilterContext } from '@/lib/context/RecipeFilterContext';
import { searchRecipes } from '@/services/recipeService';
import { useDebounce } from '@/lib/utils/useDebounce';

export function SearchBar() {
  const [text, setText] = useState('');
  const debouncedText = useDebounce(text, 500); // Debounce the input value
  const { setRecipes, setIsLoading, applyFilters } = useRecipeFilterContext();

  // Effect runs only when debouncedText changes (after 500ms)
  useEffect(() => {
    if (debouncedText.trim() === '') {
      applyFilters();
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      try {
        const results = await searchRecipes(debouncedText);
        
        console.log("SEARCH RESULTS FROM SERVICE:", results);
        
        setRecipes(results);
      } catch (error) {
        console.error("Search failed:", error);
        setRecipes([]);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedText, setRecipes, setIsLoading, applyFilters]);

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#009F7F] transition-all"
        placeholder="Search for delicious recipes..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
}