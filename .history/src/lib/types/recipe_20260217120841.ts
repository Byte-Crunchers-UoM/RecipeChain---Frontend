export interface Ingredient {
  id: string;
  name: string;
  quantity: string;
  unit: string;
}

export interface Instruction {
  id: string;
  step: number;
  description: string;
}

export interface Recipe {
  chef_id?: string;
  title: string;
  description: string;
  category: string;
  cuisine: string;
  dietary_tags?: string;
  goal?: string;
  meal_type?: string;
  occasion?: string;
  image_url: string;
  difficulty_level: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  price: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  chef_note: string;
  status?: "pending" | "published" | "rejected";
}

export interface RecipeFormData extends Recipe {}
