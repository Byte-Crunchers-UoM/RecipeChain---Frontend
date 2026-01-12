"use client";

import { Web3AuthProvider } from "@/lib/web3/Web3AuthProvider";
import { ReactNode } from "react";

export function RootLayoutClient({ children }: { children: ReactNode }) {
  return (
    <Web3AuthProvider>
      {children}
    </Web3AuthProvider>
  );
}
