"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Recipe } from '../types/Recipe';
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

export const RecipeCartProvider = ({ children }: { children: ReactNode }) => {
    const { user, isAuthenticated } = useAuth(); 
    const [cartItems, setCartItems] = useState<Recipe[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleCart = () => setIsOpen((prev) => !prev);
    const closeCart = () => setIsOpen(false);

    // Load cart on mount
    useEffect(() => {
        if (!isAuthenticated || !user?.email) {
            setCartItems([]);
            return;
        }

        const loadCart = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const recipes = await fetchCart(user.email); 
                setCartItems(recipes || []);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.warn("Warning: Could not load saved recipes from server:", errorMessage);
                setCartItems([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadCart();
    }, [isAuthenticated, user]);

    const handleAddToCart = async (recipe: Recipe) => {
        if (!user?.email) {
            setError("User not authenticated");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            if (cartItems.find((item) => item.recipe_id === recipe.recipe_id)) {
                setError("Recipe already in cart");
                return;
            }

            await apiAddToCart(user.email, recipe.recipe_id);
            
            setCartItems((prev) => [...prev, recipe]);
            setIsOpen(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add recipe to cart';
            console.error("Failed to add recipe to cart:", err);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFromCart = async (recipe_id: string) => {
        if (!user?.email) {
            setError("User not authenticated");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            await apiRemoveFromCart(user.email, recipe_id);
            
            setCartItems((prev) => prev.filter((item) => item.recipe_id !== recipe_id));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to remove recipe from cart';
            console.error("Failed to remove recipe from cart:", err);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <RecipeCartContext.Provider 
            value={{ 
                cartItems, 
                isOpen, 
                toggleCart, 
                closeCart, 
                addToCart: handleAddToCart, 
                removeFromCart: handleRemoveFromCart,
                isLoading,
                error
            }}
        >
            {children}
        </RecipeCartContext.Provider>
    );
};

export const useRecipeCart = () => {
    const context = useContext(RecipeCartContext);
    if (!context) {
        throw new Error("useRecipeCart must be used within a RecipeCartProvider");
    }
    return context;
};