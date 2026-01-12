export type UserRole = 'admin' | 'seller' | 'buyer';

export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  name?: string;
  role: UserRole;
  isVerified?: boolean;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface ChefProfile extends User {
  role: 'seller';
  documents?: {
    certification?: string;
    portfolio?: string;
    verification?: string;
  };
  verificationStatus: 'pending' | 'approved' | 'rejected';
  earnings: number;
  recipesCount: number;
  averageRating: number;
  totalOrders: number;
}

export interface AdminProfile extends User {
  role: 'admin';
  permissions: string[];
}

export interface Recipe {
  id: string;
  chefId: string;
  title: string;
  description: string;
  category: string;
  preparationTime: number;
  servings: number;
  price: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: {
    name: string;
    quantity: string;
  }[];
  instructions: string[];
  images?: string[];
  ratings: {
    average: number;
    count: number;
  };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
