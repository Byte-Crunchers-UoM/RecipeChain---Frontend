import { Recipe, RecipeApiResponsed } from "@/lib/types/Recipe";

export async function fetchRecipes(): Promise<Recipe[]>{
    const response = await fetch('http://127.0.0.1:4000/api/recipes/');
    const recipes:RecipeApiResponsed = await response.json();
    return recipes.data;
}


