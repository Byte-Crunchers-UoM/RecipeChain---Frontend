import { Recipe, RecipeApiResponsed } from "@/lib/types/Recipe";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchCart(userId: string, token: string): Promise<Recipe[]>{
    try{
        const response = await fetch(`${BASE_URL}/api/savedrecipes/user/${userId}`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if(!response.ok){
            throw new Error(`Failed to fetch saved recipes: ${response.status} ${response.statusText}`);
        }
        const cartItems: RecipeApiResponsed = await response.json();
        return cartItems.data;

    }catch(error){
        throw error;
    }
}

export async function addToCart(userId: string, recipeId: string, token: string): Promise<void> {
    try {
        const response = await fetch(`${BASE_URL}/api/savedrecipes/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                user_id: userId,
                recipe_id: recipeId,
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to add recipe to cart: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        throw error;
    }
}

export async function removeFromCart(userId: string, recipeId: string, token: string): Promise<void> {
    try {
        const response = await fetch(`${BASE_URL}/api/savedrecipes`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                user_id: userId,
                recipe_id : recipeId
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to remove recipe from cart: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        throw error;
    }
}