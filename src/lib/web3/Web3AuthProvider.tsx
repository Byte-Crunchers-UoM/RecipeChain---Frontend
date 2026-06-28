"use client";

import React from "react";
import {
  Web3AuthProvider as Web3AuthModalProvider,
  type Web3AuthContextConfig,
} from "@web3auth/modal/react";
import { WEB3AUTH_NETWORK } from "@web3auth/modal";

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;

export function Web3AuthProvider({ children }: { children: React.ReactNode }) {
  if (!clientId || clientId === "YOUR_CLIENT_ID_HERE" || clientId === "mock-client-id" || clientId.length < 60) {
    console.warn("⚠️ Web3Auth Client ID is missing or invalid. Web3Auth features will be disabled.");
    // Return children directly without the Web3Auth provider so it doesn't crash trying to fetch a fake project ID
    return <>{children}</>;
  }

  const config: Web3AuthContextConfig = {
    web3AuthOptions: {
      clientId,
      web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    },
  };

  return (
    <Web3AuthModalProvider config={config}>
      {children}
    </Web3AuthModalProvider>
  );
}