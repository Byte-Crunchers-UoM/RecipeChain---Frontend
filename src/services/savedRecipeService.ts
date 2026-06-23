import { Recipe, RecipeApiResponsed } from "@/lib/types/Recipe";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const FETCH_TIMEOUT = 10000; // 10 seconds timeout

/**
 * Fetches saved recipes for a user using their UUID
 */
export async function fetchCart(userId: string): Promise<Recipe[]> {
    if (!userId) return [];

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const response = await fetch(`${BASE_URL}/savedrecipes/user/${userId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            if (response.status === 404 || response.status === 401) return [];
            throw new Error(`Server error: ${response.status}`);
        }

        const cartItems: RecipeApiResponsed = await response.json();
        return cartItems.data || [];

    } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
            console.error('fetchCart error:', error.message);
        }
        return [];
    }
}

/**
 * Adds a recipe to user's saved recipes using UUID
 */
export async function addToCart(userId: string, recipeId: string): Promise<void> {
    if (!userId || !recipeId) throw new Error('Missing required parameters');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
        const response = await fetch(`${BASE_URL}/savedrecipes/`, {
            method: 'POST',
            credentials: 'include', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                recipe_id: recipeId,
            }),
            signal: controller.signal
        });

        if (!response.ok) throw new Error(`Failed with status: ${response.status}`);
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Removes a recipe from user's saved recipes using UUID
 */
export async function removeFromCart(userId: string, recipeId: string): Promise<void> {
    if (!userId || !recipeId) throw new Error('Missing required parameters');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
        const response = await fetch(`${BASE_URL}/savedrecipes`, {
            method: 'DELETE',
            credentials: 'include', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                recipe_id: recipeId
            }),
            signal: controller.signal
        });

        if (!response.ok) throw new Error(`Failed with status: ${response.status}`);
    } finally {
        clearTimeout(timeoutId);
    }
}