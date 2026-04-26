//src/components/custom/protectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { isLoading, isAuthenticated, role } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Not logged in => login
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Logged in but role not chosen => select-role
    if (!role) {
      router.replace("/select-role");
      return;
    }

    // Role mismatch => send to correct dashboard
    if (requiredRole && role !== requiredRole) {
      router.replace(role === "seller" ? "/seller/dashboard" : "/buyer/dashboard");
    }
  }, [isLoading, isAuthenticated, role, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC]">
        <div className="animate-spin h-10 w-10 border-4 border-gray-300 border-t-transparent rounded-full" />
      </div>
    );
  }

  // While redirecting, render nothing
  if (!isAuthenticated) return null;
  if (!role) return null;
  if (requiredRole && role !== requiredRole) return null;

  return <>{children}</>;
}
