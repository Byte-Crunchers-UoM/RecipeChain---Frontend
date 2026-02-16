"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types";

export default function SelectRolePage() {
  const router = useRouter();
  const { setRole, isAuthenticated, isLoading, role } = useAuth();

  // Guard: must be logged in to select role
  useEffect(() => {
    if (isLoading) return;

    // Not logged in -> go login
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Already has role -> skip select-role
    if (role === "seller") router.replace("/seller/dashboard");
    if (role === "buyer") router.replace("/buyer/dashboard");
  }, [isLoading, isAuthenticated, role, router]);

  const chooseRole = (newRole: UserRole) => {
    setRole(newRole);
    router.replace(newRole === "seller" ? "/seller/dashboard" : "/buyer/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 text-center">
          <div className="flex justify-center mb-6">
            <Image src="/Logo.png" alt="RecipeChain Logo" width={90} height={90} priority />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Select your role</h1>
          <p className="text-gray-500 mt-1">Continue as Seller (Chef) or Buyer</p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => chooseRole("seller")}
              className="rounded-2xl border border-gray-200 p-6 text-left hover:shadow-md transition"
            >
              <div className="text-3xl">👨‍🍳</div>
              <div className="mt-3 font-semibold text-gray-900">Seller (Chef)</div>
              <div className="mt-1 text-sm text-gray-500">
                Create recipes, sell recipes, manage your dashboard.
              </div>
            </button>

            <button
              onClick={() => chooseRole("buyer")}
              className="rounded-2xl border border-gray-200 p-6 text-left hover:shadow-md transition"
            >
              <div className="text-3xl">🧑‍💻</div>
              <div className="mt-3 font-semibold text-gray-900">Buyer</div>
              <div className="mt-1 text-sm text-gray-500">
                Browse marketplace, buy/unlock recipes, manage profile.
              </div>
            </button>
          </div>

          <p className="mt-8 text-xs text-gray-400">You can change this later from Settings.</p>
        </div>
      </div>
    </div>
  );
}
