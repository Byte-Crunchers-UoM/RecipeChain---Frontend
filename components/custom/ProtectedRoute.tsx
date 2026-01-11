"use client";

import { useWeb3Auth } from '@/app/lib/web3/Web3AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isWeb3AuthInitialized } = useWeb3Auth();
  const router = useRouter();

  useEffect(() => {
    if (isWeb3AuthInitialized) {
      if (!user || !user.id) {
        // Not authenticated, redirect to login
        router.push('/login');
      } else if (requiredRole && user.role !== requiredRole) {
        // User doesn't have the required role
        if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (user.role === 'seller') {
          router.push('/seller/dashboard');
        } else if (user.role === 'buyer') {
          router.push('/buyer/dashboard');
        } else {
          router.push('/login');
        }
      }
    }
  }, [isWeb3AuthInitialized, user, requiredRole, router]);

  if (!isWeb3AuthInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafb]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[#0d9488] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#111827] font-medium">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.id || (requiredRole && user.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
