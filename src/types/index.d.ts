export type UserRole = 'admin' | 'seller' | 'driver';

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

export interface SellerProfile extends User {
  role: 'seller';
  documents?: {
    nic?: string;
    policeReport?: string;
    ownershipClearance?: string;
  };
  verificationStatus: 'pending' | 'approved' | 'rejected';
  earnings: number;
  totalBookings: number;
}

export interface AdminProfile extends User {
  role: 'admin';
  permissions: string[];
}

export interface ParkingSlot {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  pricePerHour: number;
  isAvailable: boolean;
  images?: string[];
  features: string[];
  lastBookedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
