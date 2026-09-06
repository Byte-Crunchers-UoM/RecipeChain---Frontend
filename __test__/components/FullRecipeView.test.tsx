import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FullRecipeView } from '@/components/recipe/FullRecipeView';
import { Recipe } from '@/lib/types/recipe';

// Mock Next.js Image to prevent loading real images and suppress React warnings
jest.mock('next/image', () => ({
  __esModule: true,
  // We destructure 'fill' and 'priority' out of the props so React doesn't complain about invalid HTML attributes!
  default: ({ fill, priority, ...props }: any) => <img {...props} />,
}));

describe('FullRecipeView Component', () => {
    // Correctly structured mock object using 'as unknown as Recipe'
    const mockRecipe = {
        recipe_id: '123',
        title: 'Spicy Ramen',
        difficulty_level: 'Medium',
        prep_time: 15,
        cook_time: 20,
        servings: 2,
        description: 'A delicious bowl of spicy ramen.',
        ingredients: ['Noodles', 'Spicy Broth', 'Egg'],
        instructions: ['Boil water', 'Add noodles', 'Serve'],
        sellers: { full_name: 'Chef Akira' }
    } as unknown as Recipe;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the recipe details correctly', () => {
        render(<FullRecipeView recipe={mockRecipe} />);
        
        // Check if the main title and chef name rendered
        expect(screen.getByText('Spicy Ramen')).toBeInTheDocument();
        expect(screen.getByText('Chef Akira')).toBeInTheDocument();
        
        // Check if all ingredients rendered
        expect(screen.getByText('Noodles')).toBeInTheDocument();
        expect(screen.getByText('Spicy Broth')).toBeInTheDocument();
    });

    it('toggles the crossed-out state when an ingredient is clicked', () => {
        render(<FullRecipeView recipe={mockRecipe} />);
        
        // 1. Find the ingredient text
        const ingredientText = screen.getByText('Noodles');
        
        // 2. Initial state: Should NOT have the 'line-through' CSS class
        expect(ingredientText).not.toHaveClass('line-through');

        // 3. Simulate user clicking the ingredient to check it off
        fireEvent.click(ingredientText);

        // 4. Assert it now HAS the 'line-through' class
        expect(ingredientText).toHaveClass('line-through');

        // 5. Simulate user clicking it again to uncheck it
        fireEvent.click(ingredientText);

        // 6. Assert the 'line-through' class was removed
        expect(ingredientText).not.toHaveClass('line-through');
    });

    it('handles recipes with missing ingredients gracefully', () => {
        const emptyRecipe = { ...mockRecipe, ingredients: null } as unknown as Recipe;
        render(<FullRecipeView recipe={emptyRecipe} />);
        
        expect(screen.getByText('No ingredients listed.')).toBeInTheDocument();
    });
});