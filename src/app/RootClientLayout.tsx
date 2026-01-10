"use client";

import { Web3AuthProvider } from '@/app/lib/web3/Web3AuthProvider';

export default function RootClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Web3AuthProvider>
      {children}
    </Web3AuthProvider>
  );
}
