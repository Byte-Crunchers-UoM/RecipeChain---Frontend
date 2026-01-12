"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Web3AuthProvider as Web3AuthModalProvider, type Web3AuthContextConfig } from "@web3auth/modal/react";
import { WEB3AUTH_NETWORK } from "@web3auth/modal";
import { UserRole } from '@/types';

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "";

const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  }
};

interface User {
  role?: UserRole;
  email?: string;
  name?: string;
  walletAddress?: string;
}

interface Web3AuthContextType {
  selectedRole: UserRole | null;
  setSelectedRole: (role: UserRole) => void;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
}

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined);

export const useWeb3Auth = () => {
  const context = useContext(Web3AuthContext);
  if (!context) {
    throw new Error('useWeb3Auth must be used within Web3AuthProvider');
  }
  return context;
};

export const Web3AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = async () => {
    setUser(null);
    setIsAuthenticated(false);
    setSelectedRole(null);
  };

  return (
    <Web3AuthModalProvider config={web3AuthContextConfig}>
      <Web3AuthContext.Provider
        value={{
          selectedRole,
          setSelectedRole,
          user,
          isLoading,
          isAuthenticated,
          logout,
        }}
      >
        {children}
      </Web3AuthContext.Provider>
    </Web3AuthModalProvider>
  );
};
