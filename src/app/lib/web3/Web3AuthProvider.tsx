"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from '@web3auth/base';
import { UserRole } from '@/types';

interface Web3AuthContextType {
  selectedRole: UserRole | null;
  setSelectedRole: (role: UserRole) => void;
  web3Auth: Web3Auth | null;
  provider: IProvider | null;
  isWeb3AuthInitialized: boolean;
  userInfo: any;
  login: () => Promise<void>;
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
  const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [isWeb3AuthInitialized, setIsWeb3AuthInitialized] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  // Initialize Web3Auth on mount
  useEffect(() => {
    const init = async () => {
      try {
        const web3authInstance = new Web3Auth({
          clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || '',
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: '0xaa36a7', // Sepolia testnet
            rpcTarget: 'https://rpc.sepolia.org',
            displayName: 'Ethereum Sepolia',
            blockExplorer: 'https://sepolia.etherscan.io',
            ticker: 'ETH',
            tickerName: 'Ethereum',
          } as any,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
        } as any);

        setWeb3Auth(web3authInstance);
        await web3authInstance.init();
        setIsWeb3AuthInitialized(true);

        // Check if user is already logged in
        if (web3authInstance.status === 'connected') {
          const userInformation = await web3authInstance.getUserInfo();
          setUserInfo(userInformation);
          setProvider(web3authInstance.provider);
        }
      } catch (error) {
        console.error('Web3Auth initialization error:', error);
        setIsWeb3AuthInitialized(true); // Set to true even on error to allow login retry
      }
    };

    init();
  }, []);

  const login = async () => {
    try {
      if (!web3Auth) {
        console.error('Web3Auth not initialized');
        return;
      }

      const web3authProvider = await web3Auth.connect();
      setProvider(web3authProvider);
      
      const userInformation = await web3Auth.getUserInfo();
      setUserInfo(userInformation);

      // Save to localStorage
      if (userInformation) {
        localStorage.setItem('park_chain_auth', JSON.stringify(userInformation));
        localStorage.setItem('park_chain_role', selectedRole || 'seller');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (!web3Auth) {
        console.error('Web3Auth not initialized');
        return;
      }

      await web3Auth.logout();
      setProvider(null);
      setUserInfo(null);
      localStorage.removeItem('park_chain_auth');
      localStorage.removeItem('park_chain_role');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <Web3AuthContext.Provider
      value={{
        selectedRole,
        setSelectedRole,
        web3Auth,
        provider,
        isWeb3AuthInitialized,
        userInfo,
        login,
        logout,
      }}
    >
      {children}
    </Web3AuthContext.Provider>
  );
};
