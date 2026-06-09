export type BuyerBadge = {
  key: string;
  title: string;
  description: string;
  earned: boolean;
  progress: number;
  target: number;
};

export type BuyerActivityType = "purchase" | "review" | "profile_update";

export type BuyerActivityItem = {
  id: string;
  title: string;
  description?: string;
  amount_xrp: number;
  status: string;
  type: BuyerActivityType;
  date: string;
  reference_table?: string | null;
  reference_id?: string | number | null;
  metadata?: Record<string, unknown>;
};

export type BuyerProfile = {
  user_id: string;
  email: string;
  wallet_address: string;
  joined_at: string;
  role: string;
  display_name: string;
  bio: string;
  profile_picture: string;
  total_purchases: number;
  total_spent_xrp: number;
  account_balance: number;
  saved_recipes_count: number;
  feedback_count: number;
  notification_count?: number;
  cart_count?: number;
  recent_activity?: BuyerActivityItem[];
  badges?: BuyerBadge[];
};