// src/context/Providers.tsx
"use client";

import { ReactNode } from "react";
import { Web3AuthProvider } from "@/lib/web3/Web3AuthProvider";
import { AuthProvider } from "@/context/AuthContext";
import { RecipeCartProvider } from "@/context/RecipeCartContext";
import { FollowedChefsProvider } from "@/context/FollowedChefsContext";
import { RecipeFilterProvider } from "@/context/RecipeFilterContext";
import { NotificationProvider } from "@/components/NotificationContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Web3AuthProvider>
      <AuthProvider>
        <RecipeFilterProvider>
          <RecipeCartProvider>
            <FollowedChefsProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </FollowedChefsProvider>
          </RecipeCartProvider>
        </RecipeFilterProvider>
      </AuthProvider>
    </Web3AuthProvider>
  );
}