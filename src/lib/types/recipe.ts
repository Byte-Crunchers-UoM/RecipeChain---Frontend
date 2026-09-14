export interface Recipe {
    recipe_id: string;
    chef_id: string;
    title: string;
    sellers: {
        full_name: string;
    };
    rating: number;
    rating_avg: number;
    ingredients: Ingredient[];
    instructions: Instructions[];
    reviews_count: number;
    prep_time: number;
    cook_time:number;
    servings: number;
    difficulty_level?: string;
    image_url: string;
    price: number;
    blockchainHash?: string;
    description : string;
    cuisine: string;
    dietary_tags: string;
    goal: string;
    meal_type: string;
    category: string;
    occasion: string;
    chef_note?: string;
    is_premium_locked?: boolean;
    is_purchased?: boolean;
}

export interface RecipeApiResponsed {
    success: boolean;
    message: string;
    data: Recipe[]
}
export interface Ingredient {
  id:string;
  name: string;
  quantity: string;
  unit: string;
}
export interface Instructions {
  id: string;
  step: number;
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


export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}