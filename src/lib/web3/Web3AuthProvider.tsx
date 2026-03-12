"use client";

import React from "react";
import {
  Web3AuthProvider as Web3AuthModalProvider,
  type Web3AuthContextConfig,
} from "@web3auth/modal/react";
import { WEB3AUTH_NETWORK } from "@web3auth/modal";

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "";

if (!clientId) {
  console.error("Missing NEXT_PUBLIC_WEB3AUTH_CLIENT_ID");
}

const config: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  },
};

export function Web3AuthProvider({ children }: { children: React.ReactNode }) {
  return <Web3AuthModalProvider config={config}>{children}</Web3AuthModalProvider>;
}