//src/services/recipeServices.ts
import { Recipe, RecipeApiResponsed } from "@/lib/types/Recipe";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ;
const FETCH_TIMEOUT = 10000;

/** Fetches a list of all available recipes from the API. */
export async function fetchRecipes(page: number = 1, limit: number = 12): Promise<{ recipes: Recipe[], meta: any }> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        // Append page and limit to the URL
        const response = await fetch(`${BASE_URL}/recipes?page=${page}&limit=${limit}`, {
            signal: controller.signal,
            credentials: 'include', 
            cache: 'no-store'
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`Failed to fetch recipes: ${response.status}`);
            return { recipes: [], meta: null }; 
        }

        const result = await response.json();
        
        // Return BOTH the recipes and the pagination metadata
        return { 
            recipes: result.data || [], 
            meta: result.meta || null 
        };

    } catch (error: any) {
        // 1. Check for intentional aborts (e.g., component unmounts or timeouts)
        if (error.name === 'AbortError' || error.message?.includes('aborted')) {
            console.log('fetchRecipes request safely aborted.');
            throw error; // Bubble this up so the component knows NOT to wipe the UI
        }

        // 2. Handle actual network or server errors
        console.error("Fetch Recipes Error:", error);
        return { recipes: [], meta: null };
    }
}

/** Fetches the details of a specific recipe by its unique identifier. */
export const fetchRecipeById = async (id: string) => {
    const response = await fetch(`${BASE_URL}/recipes/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store'      
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch recipe');
    }

    return data.recipe; 
};

/** Fetches a list of recipes that match the provided filter query string. */
export async function fetchFilteredRecipe(queryString: string): Promise<Recipe[]> {
    try {
        const url = queryString 
            ? `${BASE_URL}/recipes/filter?${queryString}` 
            : `${BASE_URL}/recipes`;
            
        // AbortController prevents the app from hanging
        // infinitely if the backend server crashes or is too slow.
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const response = await fetch(url, {
            signal: controller.signal,
            credentials: 'include', 
            cache: 'no-store'
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`Failed to fetch filtered recipes: ${response.status}`);
            return [];
        }

        const recipes: RecipeApiResponsed = await response.json();
        return recipes.data || [];

    } catch (error: any) {
        if (error.name === 'AbortError' || error.message?.includes('aborted')) {
            console.log('fetchFilteredRecipe request safely aborted.');
            throw error;
        }

        console.error("Fetch Filtered Recipes Error:", error);
        return [];
    }
}

/** Searches for recipes matching a specific keyword or search query. */
export const searchRecipes = async (query: string): Promise<Recipe[]> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout for fast searches

        const response = await fetch(`${BASE_URL}/recipes/search?q=${query}`, {
            signal: controller.signal,
            credentials: 'include', 
            cache: 'no-store'
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`Failed to fetch search recipes: ${response.status}`);
            return [];
        }

        const data = await response.json();
        return data.data || []; 

    } catch (error: any) {
        if (error.name === 'AbortError' || error.message?.includes('aborted')) {
            console.log('searchRecipes request safely aborted.');
            throw error; 
        }

        console.error("Fetch Search Recipes Error:", error);
        return [];
    }
}

export async function getCheckoutQuote(recipeIds: string[]) {
    const response = await fetch(`${BASE_URL}/recipes/checkout-quote`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeIds }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to fetch checkout quote');
    return data.data as {
        payableItems: { recipe_id: string; title: string; price: number; seller_id: string }[];
        skippedItems: { recipe_id: string; title: string; reason: string }[];
        totalDue: number;
    };
}

export async function unlockRecipesBatch(recipeIds: string[], transactionHash: string) {
    const response = await fetch(`${BASE_URL}/recipes/unlock-batch`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeIds, transactionHash }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Batch unlock failed');
    return data.data as { batch_id: string; unlocked: string[]; duplicates: string[]; skipped: any[] };
}