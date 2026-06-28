import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RecipeDetailPage from '@/app/(protected)/recipes/[id]/page';
import { fetchRecipeById } from '@/services/recipeService'; 

// 1. COMPLETELY MOCK THE SERVICE INSTEAD OF SPYING
jest.mock('@/services/recipeService', () => ({
  fetchRecipeById: jest.fn()
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ id: '123' }) 
}));

jest.mock('@/components/recipe/FullRecipeView', () => ({
  FullRecipeView: () => <div data-testid="full-view">Full Recipe Content</div>
}));

jest.mock('@/components/recipe/RecipePaymentModel', () => {
  return function MockModal({ isOpen }: { isOpen: boolean }) { 
    return isOpen ? <div data-testid="payment-modal-open">Modal is Open</div> : null;
  };
});

describe('RecipeDetailPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('1. Shows the loading spinner initially while fetching data', () => {
        // Cast the imported function as a jest.Mock to update its behavior safely
        (fetchRecipeById as jest.Mock).mockImplementation(() => new Promise(() => {}));
        
        render(<RecipeDetailPage />);
        expect(screen.getByText('Loading recipe details...')).toBeInTheDocument();
    });

    it('2. Shows the error screen if the recipe is not found', async () => {
        (fetchRecipeById as jest.Mock).mockResolvedValue(null);
        
        render(<RecipeDetailPage />);
        
        await waitFor(() => {
            expect(screen.getByText('Oops!')).toBeInTheDocument();
        });
    });

    it('3. Shows the locked premium screen if the user has not purchased it', async () => {
        const lockedRecipe = { recipe_id: '123', is_premium_locked: true, price: 15 };
        (fetchRecipeById as jest.Mock).mockResolvedValue(lockedRecipe as any);
        
        render(<RecipeDetailPage />);
        
        await waitFor(() => {
            expect(screen.getByText('Premium Recipe')).toBeInTheDocument();
            expect(screen.getByText('Unlock for 15 XRP')).toBeInTheDocument();
        });
    });

    it('4. Opens the payment modal when "Unlock" is clicked', async () => {
        const lockedRecipe = { recipe_id: '123', is_premium_locked: true, price: 15 };
        (fetchRecipeById as jest.Mock).mockResolvedValue(lockedRecipe as any);
        
        render(<RecipeDetailPage />);
        
        await waitFor(() => {
            expect(screen.getByText('Unlock for 15 XRP')).toBeInTheDocument();
        });

        const unlockButton = screen.getByText('Unlock for 15 XRP');
        fireEvent.click(unlockButton);
        expect(screen.getByTestId('payment-modal-open')).toBeInTheDocument();
    });

    it('5. Shows the FullRecipeView if the recipe is free or already purchased', async () => {
        const unlockedRecipe = { recipe_id: '123', is_premium_locked: false };
        (fetchRecipeById as jest.Mock).mockResolvedValue(unlockedRecipe as any);
        
        render(<RecipeDetailPage />);
        
        await waitFor(() => {
            expect(screen.queryByText('Premium Recipe')).not.toBeInTheDocument();
            expect(screen.getByTestId('full-view')).toBeInTheDocument();
        });
    });
});