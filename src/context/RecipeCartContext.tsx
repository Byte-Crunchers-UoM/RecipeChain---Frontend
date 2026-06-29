//src/context/RecipeCartContext.tsx
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { Recipe } from '../lib/types/Recipe';
import { useAuth } from '@/context/AuthContext';
import { fetchCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart } from '@/services/savedRecipeService';

interface RecipeCartContextType {
    cartItems: Recipe[];
    isOpen: boolean;
    toggleCart: () => void;
    closeCart: () => void;
    addToCart: (recipe: Recipe) => Promise<void>;
    removeFromCart: (recipe_id: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

const RecipeCartContext = createContext<RecipeCartContextType | undefined>(undefined);

/** Provider component that manages the recipe cart state and operations. */
export const RecipeCartProvider = ({ children }: { children: ReactNode }) => {
    const { user, isAuthenticated } = useAuth(); 
    const [cartItems, setCartItems] = useState<Recipe[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 🛠️ Safely extract the UUID regardless of how your Auth provider names it
    const actualUserId = user?.user_id || user?.user_id;

    /** Toggles the visibility state of the recipe cart. */
    const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

    /** Closes the recipe cart by setting its open state to false. */
    const closeCart = useCallback(() => setIsOpen(false), []);

    // Load cart on mount
    useEffect(() => {
        if (!isAuthenticated || !actualUserId) {
            setCartItems([]);
            return;
        }

        /** Fetches the user's saved recipes from the server and updates the local cart state. */
        const loadCart = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const recipes = await fetchCart(actualUserId); 
                setCartItems(recipes || []);
            } catch (error) {
                console.warn("Could not load saved recipes from server:", error);
                setCartItems([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadCart();
    }, [isAuthenticated, actualUserId]);

    /** Adds a recipe to the cart optimistically and syncs the addition with the backend. */
    const handleAddToCart = useCallback(async (recipe: Recipe) => {
        if (!actualUserId) {
            setError("User not authenticated");
            return;
        }

        if (cartItems.some((item) => item.recipe_id === recipe.recipe_id)) {
            setIsOpen(true);
            return;
        }

        // Optimistic UI Update
        setCartItems((prev) => [recipe, ...prev]);
        setIsOpen(true);
        setError(null);

        try {
            await apiAddToCart(actualUserId, recipe.recipe_id);
        } catch (err) {
            // Rollback on failure
            setCartItems((prev) => prev.filter(item => item.recipe_id !== recipe.recipe_id));
            const errorMessage = err instanceof Error ? err.message : 'Failed to save recipe';
            setError(errorMessage);
        }
    }, [actualUserId, cartItems]);

    /** Removes a recipe from the cart optimistically and syncs the removal with the backend. */
    const handleRemoveFromCart = useCallback(async (recipe_id: string) => {
        if (!actualUserId) return;

        const previousItems = [...cartItems];
        
        // Optimistic UI Update
        setCartItems((prev) => prev.filter((item) => item.recipe_id !== recipe_id));
        setError(null);

        try {
            await apiRemoveFromCart(actualUserId, recipe_id);
        } catch (err) {
            // Rollback on failure
            setCartItems(previousItems);
            const errorMessage = err instanceof Error ? err.message : 'Failed to remove recipe';
            setError(errorMessage);
        }
    }, [actualUserId, cartItems]);

    const contextValue = useMemo(() => ({
        cartItems,
        isOpen,
        toggleCart,
        closeCart,
        addToCart: handleAddToCart,
        removeFromCart: handleRemoveFromCart,
        isLoading,
        error
    }), [cartItems, isOpen, toggleCart, closeCart, handleAddToCart, handleRemoveFromCart, isLoading, error]);

    return (
        <RecipeCartContext.Provider value={contextValue}>
            {children}
        </RecipeCartContext.Provider>
    );
};

/** Custom hook to access the recipe cart context. Must be used within a RecipeCartProvider. */
export const useRecipeCart = () => {
    const context = useContext(RecipeCartContext);
    if (!context) {
        throw new Error("useRecipeCart must be used within a RecipeCartProvider");
    }
    return context;
};