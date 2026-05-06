import { Recipe, RecipeApiResponsed } from "@/lib/types/Recipe";


const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const FETCH_TIMEOUT = 10000;

/** Fetches a list of all available recipes from the API. */
export async function fetchRecipes(): Promise<Recipe[]> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        const response = await fetch(`${BASE_URL}/recipes`, {
            signal: controller.signal,
            credentials: 'include', 
            cache: 'no-store'
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error(`Failed to fetch recipes: ${response.status}`);
            return []; 
        }

        const recipes: RecipeApiResponsed = await response.json();
        return recipes.data || [];

    } catch (error) {
        console.error("Fetch Recipes Error:", error);
        return [];
    }
}

/** Fetches the details of a specific recipe by its unique identifier. */
export const fetchRecipeById = async (id: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  
  const response = await fetch(`${apiUrl}/recipes/${id}`, {
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

    } catch (error) {
        console.error("Fetch Filtered Recipes Error:", error);
        return [];
    }
}

/** Searches for recipes matching a specific keyword or search query. */
export const searchRecipes = async (query: string): Promise<Recipe[]> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // FETCH_TIMEOUT

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

    } catch (error) {
        console.error("Fetch Search Recipes Error:", error);
        return [];
    }
};