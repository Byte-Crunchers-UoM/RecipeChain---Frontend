'use client';

import { useState, Suspense } from 'react';
import { Filter, RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useRecipeFilters } from '@/lib/types/useRecipeFilters';
import { FilterTag } from '@/components/ui/FilterTags';
import { FilterCheckbox } from '@/components/ui/FilterCheckBox';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DIETARY_NEEDS = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];
const OCCASIONS = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Holiday'];
const GOALS = ['High Protein', 'Low Carb', 'Budget'];
const CUISINES = ['Italian', 'Asian', 'Mexican', 'Indian'];

function FiltersContent() {
  const { toggleFilter, clearFilters, hasFilter } = useRecipeFilters();
  const [showAdditional, setShowAdditional] = useState(false);

  return (
    <div className="bg-[#E0F2F1] w-full flex flex-col gap-8 pb-10 rounded-xl p-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-gray-800 text-base">
          <Filter className="w-4 h-4" />
          Filters
        </div>
        <button
          onClick={clearFilters}
          className="text-[10px] text-teal-600 flex items-center gap-1 font-semibold hover:text-teal-700 transition-colors uppercase tracking-wider"
        >
          <RefreshCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* 1. Price Slider (Placeholder) */}
      <div className='-mt-4'>
        {/* Price Slider Component would go here */}
      </div>

      {/* 2. Difficulty */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">Difficulty</h3>
        <div className="space-y-2.5">
          {DIFFICULTIES.map((level) => (
            <FilterCheckbox
              key={level}
              label={level}
              isChecked={hasFilter('difficulty', level)}
              onChange={() => toggleFilter('difficulty', level)}
            />
          ))}
        </div>
      </div>

      {/* 3. Dietary Needs */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">Dietary Needs</h3>
        <div className="flex flex-wrap gap-2">
          {DIETARY_NEEDS.map((diet) => (
            <FilterTag
              key={diet}
              label={diet}
              isSelected={hasFilter('diet', diet)}
              onClick={() => toggleFilter('diet', diet)}
            />
          ))}
        </div>
      </div>

      {/* 4. Other Filters (Collapsible Section) */}
      <div className="pt-2 border-t border-gray-100">
        <button
          onClick={() => setShowAdditional(!showAdditional)}
          className="flex items-center justify-between w-full text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 mb-4"
        >
          <span>More Filters</span>
          {showAdditional ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showAdditional && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Occasions</h3>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((occ) => (
                  <FilterTag key={occ} label={occ} isSelected={hasFilter('occasion', occ)} onClick={() => toggleFilter('occasion', occ)} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Goals</h3>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((goal) => (
                  <FilterTag key={goal} label={goal} isSelected={hasFilter('goal', goal)} onClick={() => toggleFilter('goal', goal)} />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Cuisines</h3>
              <div className="flex flex-wrap gap-2">
                {CUISINES.map((cuisine) => (
                  <FilterTag key={cuisine} label={cuisine} isSelected={hasFilter('cuisine', cuisine)} onClick={() => toggleFilter('cuisine', cuisine)} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrap in a Suspense boundary as required by Next.js when using useSearchParams
export function MarketplaceFilters() {
  return (
    <Suspense fallback={<div className="bg-[#E0F2F1] rounded-xl animate-pulse h-96 w-full"></div>}>
      <FiltersContent />
    </Suspense>
  );
}