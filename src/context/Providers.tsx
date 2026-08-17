// src/context/Providers.tsx
"use client";

import { ReactNode } from "react";
import { Web3AuthProvider } from "@/lib/web3/Web3AuthProvider";
import { AuthProvider } from "@/context/AuthContext";
import { RecipeCartProvider } from "@/context/RecipeCartContext";
import { FollowedChefsProvider } from "@/context/FollowedChefsContext";
import { NotificationProvider } from "@/context/NotificationContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Web3AuthProvider>
      <AuthProvider>
        <RecipeCartProvider>
          <FollowedChefsProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </FollowedChefsProvider>
        </RecipeCartProvider>
      </AuthProvider>
    </Web3AuthProvider>
  );
}