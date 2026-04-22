export type UserRole = "seller" | "buyer";

/* =========================================
   Shared Types
========================================= */

export type ISODateString = string; // safer for API responses

/* =========================================
   Core User (Web3Auth + XRPL)
========================================= */

export interface User {
  id?: string;

  // Web3Auth / XRPL identity
  walletAddress: string; // XRPL classic address: r...
  email?: string;
  name?: string;

  role?: UserRole; // optional because first-time users may not have selected role yet

  createdAt?: ISODateString | Date;
}

/* =========================================
   Authentication State (Frontend Session)
========================================= */

export interface AuthState {
  user: User | null;
  role: UserRole | null;

  isLoading: boolean;
  isAuthenticated: boolean;
}

/* =========================================
   Seller (Chef)
========================================= */

export interface SellerProfile extends User {
  role: "seller";

  bio?: string;
  specialties?: string[];

  totalRecipes?: number;
  totalSales?: number;

  // Earnings in XRP (string avoids floating precision issues)
  earningsXrp?: string;
}

/* =========================================
   Buyer
========================================= */

export interface BuyerProfile extends User {
  role: "buyer";

  unlockedRecipeIds?: string[];
  totalPurchases?: number;

  // Total spent in XRP (string avoids float issues)
  totalSpentXrp?: string;
}

/* =========================================
   Recipe (Marketplace Core)
========================================= */

export type RecipeStatus = "draft" | "active" | "locked" | "archived";

export interface Recipe {
  id: string;

  title: string;
  description: string;
  imageUrl?: string;

  sellerId: string;
  sellerName?: string;

  // Price in XRP (string for precision safety)
  priceXrp: string;

  // Access control
  isLocked: boolean;

  // Optional display / marketplace metadata
  status?: RecipeStatus;
  tags?: string[];
  ratingAvg?: number;
  ratingCount?: number;

  // Optional XRPL references
  transactionHash?: string; // payment tx hash
  nftTokenId?: string; // if later you tokenize recipes

  createdAt: ISODateString | Date;
  updatedAt?: ISODateString | Date;
}
