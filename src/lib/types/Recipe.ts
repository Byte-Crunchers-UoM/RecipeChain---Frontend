export interface Recipe {
    difficulty_level: any;
    recipe_id: string;
    title: string;
    sellers: {
        full_name: string;
    };
    rating: number;
    ingredients: Ingredient[];
    instructions: Instructions[];
    reviewsCount: number;
    prep_time: number;
    servings: number;
    difficdifficulty_level?: string;
    image_url: string;
    priceXrp?: number;
    blockchainHash?: string;
}

export interface RecipeApiResponsed {
    success: boolean;
    message: string;
    data: Recipe[]
}
export interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}
export interface Instructions {
  id: string;
  step: string;
  description: string;
}

export interface FilterState{
  difficulty_level:string;
  meal_type:string;
  occasion:string;
  cuisine:string;
  dietary_tags:string;
  goal:string;


}