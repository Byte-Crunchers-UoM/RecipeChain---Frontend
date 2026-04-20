import { Recipe, RecipeApiResponsed } from "@/lib/types/Recipe";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const FETCH_TIMEOUT = 10000; // 10 seconds timeout

/**
 * Fetches saved recipes for a user with timeout and error handling
 * @param userId - The user ID
 * @param token - The authentication token
 * @returns Promise of Recipe array, or empty array on error
 */
export async function fetchCart(userId: string, token: string): Promise<Recipe[]>{
    if (!userId || !token) {
        console.warn('fetchCart: Missing userId or token');
        return [];
    }

    try{
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const response = await fetch(`${BASE_URL}/api/savedrecipes/user/${userId}`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if(!response.ok){
            console.error(`fetchCart failed: ${response.status} ${response.statusText}`);
            
            // Return empty array instead of throwing on non-critical errors
            // This allows the app to continue functioning
            if (response.status === 404) {
                console.info('No saved recipes found for user');
                return [];
            }
            
            if (response.status === 401) {
                console.warn('Unauthorized: Token may be invalid');
                return [];
            }

            // For 5xx errors, log but don't crash
            console.error(`Server error fetching cart: ${response.status}`);
            return [];
        }

        const cartItems: RecipeApiResponsed = await response.json();
        return cartItems.data || [];

    } catch(error) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                console.error('fetchCart: Request timeout');
            } else {
                console.error('fetchCart error:', error.message);
            }
        } else {
            console.error('fetchCart error:', error);
        }
        // Return empty array to allow app to continue functioning
        return [];
    }
}

/**
 * Adds a recipe to user's saved recipes
 * @param userId - The user ID
 * @param recipeId - The recipe ID to save
 * @param token - The authentication token
 * @throws Error if the operation fails
 */
export async function addToCart(userId: string, recipeId: string, token: string): Promise<void> {
    if (!userId || !recipeId || !token) {
        throw new Error('Missing required parameters: userId, recipeId, or token');
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const response = await fetch(`${BASE_URL}/api/savedrecipes/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                user_id: userId,
                recipe_id: recipeId,
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to add recipe to cart: ${response.status} ${response.statusText}. ${errorText}`);
        }
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timeout while adding recipe to cart');
        }
        throw error;
    }
}

/**
 * Removes a recipe from user's saved recipes
 * @param userId - The user ID
 * @param recipeId - The recipe ID to remove
 * @param token - The authentication token
 * @throws Error if the operation fails
 */
export async function removeFromCart(userId: string, recipeId: string, token: string): Promise<void> {
    if (!userId || !recipeId || !token) {
        throw new Error('Missing required parameters: userId, recipeId, or token');
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const response = await fetch(`${BASE_URL}/api/savedrecipes`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                user_id: userId,
                recipe_id : recipeId
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if(!response.ok){
            const errorText = await response.text();
            throw new Error(`Failed to remove recipe from cart: ${response.status} ${response.statusText}. ${errorText}`);
        }
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timeout while removing recipe from cart');
        }
        throw error;
    }
}