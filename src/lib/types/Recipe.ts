export interface Recipe {
    difficulty_level: any;
    recipe_id: string;
    title: string;
    chef_name: string;
    rating: number;
    ingredients: Ingredient[];
    instructions: Instructions[];
    reviewsCount: number;
    prep_time: number;
    servings: number;
    difficdifficulty_level?: string;
    imageUrl: string;
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
