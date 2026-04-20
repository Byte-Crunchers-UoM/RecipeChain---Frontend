"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Recipe } from '../types/Recipe';
import { useAuth } from '../utils/useAuth';
import { fetchCart, addToCart, removeFromCart } from '@/services/savedRecipeService';

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

// 2. Create the Context with an initial undefined value
const RecipeCartContext = createContext<RecipeCartContextType | undefined>(undefined);

// 3. Create the Provider Component
export const RecipeCartProvider = ({ children }: { children: ReactNode }) => {
    const { userId, token, isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState<Recipe[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleCart = () => setIsOpen((prev) => !prev);
    const closeCart = () => setIsOpen(false);

    // Load cart on mount (gracefully handles failures)
    useEffect(()=>{
        if(!isAuthenticated || !userId || !token) return;
        const loadCart = async () =>{
            setIsLoading(true);
            setError(null);
            try{
                const recipes = await fetchCart(userId, token);
                setCartItems(recipes || []);
            } catch (error){
                // Log error but don't break the app
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.warn("Warning: Could not load saved recipes from server:", errorMessage);
                // Don't set error state for fetch failures - let user continue using the app
                // Cart will be empty until server recovers
                setCartItems([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadCart();
    },[isAuthenticated, userId, token]);

    const handleAddToCart = async (recipe: Recipe) => {
        if (!userId || !token) {
            setError("User not authenticated");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Prevent duplicate saves
            if (cartItems.find((item) => item.recipe_id === recipe.recipe_id)) {
                setError("Recipe already in cart");
                return;
            }

            // Make API call
            await addToCart(userId, recipe.recipe_id, token);
            
            // Update local state
            setCartItems((prev) => [...prev, recipe]);
            setIsOpen(true); // Pop open the cart to show the user it worked
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add recipe to cart';
            console.error("Failed to add recipe to cart:", err);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFromCart = async (recipe_id: string) => {
        if (!userId || !token) {
            setError("User not authenticated");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Make API call
            await removeFromCart(userId, recipe_id, token);
            
            // Update local state
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

// 4. Custom Hook with a safety check
export const useRecipeCart = () => {
    const context = useContext(RecipeCartContext);
    if (!context) {
        throw new Error("useRecipeCart must be used within a RecipeCartProvider");
    }
    return context;
};