"use client";

import { useWeb3Auth } from '@/contexts/Web3AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useWeb3Auth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (requiredRole && user?.role !== requiredRole) {
        // Redirect to appropriate dashboard based on user role
        if (user?.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (user?.role === 'seller') {
          router.push('/seller/dashboard');
        } else {
          router.push('/login');
        }
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F2]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[#111827] border-t-transparent rounded-full mx-auto"></div>
          <p className="text-[#111827] mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
