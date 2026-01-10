"use client";

import { Web3AuthContextProvider } from '@/contexts/Web3AuthContext';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Web3AuthContextProvider>
      {children}
    </Web3AuthContextProvider>
  );
}
