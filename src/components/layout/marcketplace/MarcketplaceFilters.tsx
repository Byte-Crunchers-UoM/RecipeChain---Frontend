'use client';

import { useState, Suspense } from 'react';
import { Filter, RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { FilterTag } from '@/components/ui/FilterTags';
import { FilterCheckbox } from '@/components/ui/FilterCheckBox';
import { useRecipeFilterContext } from '@/lib/context/RecipeFilterContext';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DIETARY_TAGS = ['vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'];
const OCCASIONS = [ 'Party', 'Holiday','weekend'];
const GOALS = ['High Protein', 'Low Carb', 'Budget'];
const CUISINES = ['Italian', 'Asian', 'Mexican', 'Indian','Sri Lankan'];
const MEAL_TYPE = ['Breakfast','Lunch','Dinner'];

function FiltersContent() {
  const [showAdditional, setShowAdditional] = useState(false);
  const { hasFilter, toggleFilter, clearFilters, applyFilters, isFiltering } = useRecipeFilterContext();

  return (
    <div className="bg-[#E0F2F1] w-full flex flex-col gap-8 pb-10 rounded-xl p-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => applyFilters(true)}
          disabled={isFiltering}
          className="flex items-center gap-2 font-bold text-white bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded-xl text-sm transition-all disabled:opacity-50 active:scale-95 shadow-sm"
        >
          <Filter className="w-4 h-4" />
          {isFiltering ? 'Applying...' : 'Apply Filters'}
        </button>
        <button
          onClick={clearFilters}
          className="text-[10px] text-teal-600 flex items-center gap-1 font-semibold hover:text-teal-700 transition-colors uppercase tracking-wider"
        >
          <RefreshCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Difficulty */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">Difficulty</h3>
        <div className="space-y-2.5">
          {DIFFICULTIES.map((level) => (
            <FilterCheckbox
              key={level}
              label={level}
              isChecked={hasFilter('difficulty_level', level)}
              onChange={() => toggleFilter('difficulty_level', level)}
            />
          ))}
        </div>
      </div>

      {/* Dietary Needs */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3">Dietary Needs</h3>
        <div className="flex flex-wrap gap-2">
          {DIETARY_TAGS.map((diet) => (
            <FilterTag
              key={diet}
              label={diet}
              isSelected={hasFilter('dietary_tags', diet)}
              onClick={() => toggleFilter('dietary_tags', diet)}
            />
          ))}
        </div>
      </div>

      {/* Other Filters */}
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
              <h3 className="text-sm font-bold text-gray-700 mb-3">Meal Type</h3>
              <div className="flex flex-wrap gap-2">
                {MEAL_TYPE.map((meal_type) => (
                  <FilterTag key={meal_type} label={meal_type} isSelected={hasFilter('meal_type', meal_type)} onClick={() => toggleFilter('meal_type', meal_type)} />
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

export function MarketplaceFilters() {
  return (
    <Suspense fallback={<div className="bg-[#E0F2F1] rounded-xl animate-pulse h-96 w-full"></div>}>
      <FiltersContent />
    </Suspense>
  );
}