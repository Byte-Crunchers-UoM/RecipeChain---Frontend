import { Recipe, RecipeApiResponsed } from "@/lib/types/Recipe";

export async function fetchRecipes(): Promise<Recipe[]>{
    const response = await fetch( process.env.NEXT_PUBLIC_API_URL + "/api/recipes/");
    const recipes:RecipeApiResponsed = await response.json();
    return recipes.data;
}

export async function fetchFilteredRecipe(queryString: string): Promise<Recipe[]>{
    try{
        const url = queryString
        ?`${process.env.NEXT_PUBLIC_API_URL}/api/recipes/filter?${queryString}`
        :`${process.env.NEXT_PUBLIC_API_URL}/api/recipes`;

        const response = await fetch(url);

        if(!response.ok){
            throw new Error('Failed to fetch filtered recipes')
        }

        const recipes:RecipeApiResponsed =await response.json();

        return recipes.data;
    }catch(error){
        console.error("Fetch Filtered Recipes Error:", error);
    throw error;
    }
}