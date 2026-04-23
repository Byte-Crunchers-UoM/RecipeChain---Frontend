import { Recipe, RecipeApiResponsed } from "@/lib/types/Recipe";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const FETCH_TIMEOUT = 10000; // 10 seconds timeout

/**
 * Fetches saved recipes for a user with timeout and error handling
 * @param userId - The user ID (typically the user's email now)
 * @returns Promise of Recipe array, or empty array on error
 */
export async function fetchCart(userId: string): Promise<Recipe[]> {
    // 🛠️ token check එක අයින් කළා
    if (!userId) {
        console.warn('fetchCart: Missing userId');
        return [];
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const response = await fetch(`${BASE_URL}/savedrecipes/user/${userId}`, {
            method: 'GET',
            credentials: 'include', // 🛠️ මේක අනිවාර්යයෙන්ම තියෙන්න ඕනේ
            headers: {
                'Content-Type': 'application/json',
                // 🛠️ Authorization header එක අයින් කළා (Cookies හරහා යන නිසා)
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`fetchCart failed: ${response.status} ${response.statusText}`);
            
            if (response.status === 404) {
                console.info('No saved recipes found for user');
                return [];
            }
            
            if (response.status === 401) {
                console.warn('Unauthorized: Session may be invalid');
                return [];
            }

            console.error(`Server error fetching cart: ${response.status}`);
            return [];
        }

        const cartItems: RecipeApiResponsed = await response.json();
        return cartItems.data || [];

    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                console.error('fetchCart: Request timeout');
            } else {
                console.error('fetchCart error:', error.message);
            }
        } else {
            console.error('fetchCart error:', error);
        }
        return [];
    }
}

/**
 * Adds a recipe to user's saved recipes
 * @param userId - The user ID
 * @param recipeId - The recipe ID to save
 * @throws Error if the operation fails
 */
export async function addToCart(userId: string, recipeId: string): Promise<void> {
    // 🛠️ token check එක අයින් කළා
    if (!userId || !recipeId) {
        throw new Error('Missing required parameters: userId or recipeId');
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const response = await fetch(`${BASE_URL}/savedrecipes/`, {
            method: 'POST',
            credentials: 'include', // 🛠️ අනිවාර්යයි
            headers: {
                'Content-Type': 'application/json',
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
 * @throws Error if the operation fails
 */
export async function removeFromCart(userId: string, recipeId: string): Promise<void> {
    // 🛠️ token check එක අයින් කළා
    if (!userId || !recipeId) {
        throw new Error('Missing required parameters: userId or recipeId');
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const response = await fetch(`${BASE_URL}/savedrecipes`, {
            method: 'DELETE',
            credentials: 'include', // 🛠️ අනිවාර්යයි
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId,
                recipe_id : recipeId
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
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