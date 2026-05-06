// src/context/Providers.tsx
"use client";

import { ReactNode } from "react";
import { Web3AuthProvider } from "@/lib/web3/Web3AuthProvider";
import { AuthProvider } from "@/context/AuthContext";
import { RecipeCartProvider } from "@/context/RecipeCartContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Web3AuthProvider>
      <AuthProvider>
        <RecipeCartProvider>
          {children}
        </RecipeCartProvider>
      </AuthProvider>
    </Web3AuthProvider>
  );
}