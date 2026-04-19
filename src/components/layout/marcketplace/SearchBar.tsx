'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useRecipeFilterContext } from '@/lib/context/RecipeFilterContext';
import { searchRecipes } from '@/services/recipeService';

export function SearchBar() {
  const [text, setText] = useState('');
  const { setRecipes, setIsLoading, applyFilters } = useRecipeFilterContext();
  const isFirstRender = useRef(true);


  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      if (text.trim() === '') {
        applyFilters();
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchRecipes(text);
        setRecipes(results);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [text]); 

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