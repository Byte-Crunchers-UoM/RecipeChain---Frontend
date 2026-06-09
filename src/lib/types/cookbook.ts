export type CookbookFeedbackImage = {
  image_id: string;
  image_url: string;
  cloudinary_public_id: string;
  sort_order: number;
  created_at: string;
};

export type CookbookFeedback = {
  feedback_id: string;
  rating: number;
  comment: string;
  created_at: string;
  images: CookbookFeedbackImage[];
};

export type CookbookItem = {
  purchase_id: string;
  unlocked_at: string;
  recipe_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  difficulty_level: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  price: number | null;
  rating_avg: number | null;
  status: string | null;
  has_reviewed: boolean;
  is_favorite: boolean;
  saved_id: string | null;
  my_feedback: CookbookFeedback | null;
};

export type CookbookRecipeReviewData = {
  recipe_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  difficulty_level: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  price: number | null;
  rating_avg: number | null;
  chef_id: string | null;
  created_at: string;
  my_feedback: CookbookFeedback | null;
};

export type CookbookRecipeDetails = {
  recipe_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  difficulty_level: string | null;
  prep_time: number | null;
  cook_time: number | null;
  servings: number | null;
  price: number | null;
  rating_avg: number | null;
  chef_id: string | null;
  created_at: string;
  chef_note: string | null;
  ingredients: unknown;
  instructions: unknown;
  status: string | null;
  my_feedback: CookbookFeedback | null;
};