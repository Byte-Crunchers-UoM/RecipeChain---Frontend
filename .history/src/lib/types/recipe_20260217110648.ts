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
  name: string;
  description: string;
  category: string;
  cuisine: string;
  difficulty: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: Ingredient[];
  instructions: Instruction[];
  status?: "pending" | "published" | "rejected";
}

export interface RecipeFormData extends Recipe {}
