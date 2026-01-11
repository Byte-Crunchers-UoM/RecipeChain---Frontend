"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from '@web3auth/base';
import { UserRole } from '@/types';

export interface Web3AuthUser {
  id: string;
  email?: string;
  name?: string;
  role?: UserRole;
}

interface Web3AuthContextType {
  selectedRole: UserRole | null;
  setSelectedRole: (role: UserRole) => void;
  web3Auth: Web3Auth | null;
  provider: IProvider | null;
  isWeb3AuthInitialized: boolean;
  userInfo: any;
  user: Web3AuthUser | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isUserExist: () => boolean;
  getWalletAddress: () => string | null;
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
  const [selectedRole, setSelectedRoleState] = useState<UserRole | null>(null);
  const [web3Auth, setWeb3Auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [isWeb3AuthInitialized, setIsWeb3AuthInitialized] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [user, setUser] = useState<Web3AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Custom setSelectedRole function that updates both state and user object
  const setSelectedRole = (role: UserRole) => {
    setSelectedRoleState(role);
    
    // Update user object with the selected role
    if (user) {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
    }
    
    // Save role to localStorage
    localStorage.setItem('recipechain_role', role);
  };

  // Initialize Web3Auth on mount
  useEffect(() => {
    const init = async () => {
      try {
        console.log('Starting Web3Auth initialization...');
        console.log('Client ID available:', !!process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID);
        
        if (process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID) {
          const web3authInstance = new Web3Auth({
            clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID,
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
            uiConfig: {
              appLogo: '/images/recipechain_logo_green.png',
              theme: 'light',
              loginGridCol: 2,
              appName: 'RecipeChain',
            } as any,
          } as any);

          console.log('Web3Auth instance created');
          console.log('Calling init()...');
          
          await web3authInstance.init();
          
          console.log('Web3Auth initialized successfully');
          console.log('Web3Auth status:', web3authInstance.status);
          
          setWeb3Auth(web3authInstance);
          setIsWeb3AuthInitialized(true);

          // Check if user is already logged in
          if (web3authInstance.status === 'connected') {
            console.log('User already connected, restoring session');
            const userInformation = await web3authInstance.getUserInfo();
            setUserInfo(userInformation);
            setProvider(web3authInstance.provider);
            
            // Restore user from localStorage if available
            restoreUserSession();
          }
        } else {
          console.warn('Web3Auth client ID not configured');
          setIsWeb3AuthInitialized(true);
        }
      } catch (error) {
        console.error('Web3Auth initialization error:', error);
        console.error('Error details:', error instanceof Error ? error.message : String(error));
        setIsWeb3AuthInitialized(true); // Set to true even on error to allow login retry
      }
    };

    init();
  }, []);

  // Restore user session from localStorage
  const restoreUserSession = () => {
    try {
      const storedAuth = localStorage.getItem('recipechain_auth');
      const storedRole = localStorage.getItem('recipechain_role') as UserRole | null;
      
      if (storedAuth && storedRole) {
        const authData = JSON.parse(storedAuth);
        const userData: Web3AuthUser = {
          id: authData.sub || authData.id || '',
          email: authData.email,
          name: authData.name,
          role: storedRole,
        };
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error restoring user session:', error);
    }
  };

  // Check if user already exists (has completed signup before)
  const isUserExist = (): boolean => {
    try {
      const storedAuth = localStorage.getItem('recipechain_auth');
      const storedRole = localStorage.getItem('recipechain_role');
      return !!(storedAuth && storedRole);
    } catch (error) {
      return false;
    }
  };

  // Get wallet address from user info
  const getWalletAddress = (): string | null => {
    if (userInfo?.walletAddress) {
      return userInfo.walletAddress;
    }
    // Try to extract from provider
    try {
      if (provider && typeof provider.request === 'function') {
        return null; // Address would need async call
      }
    } catch (error) {
      console.error('Error getting wallet address:', error);
    }
    return null;
  };

  const login = async () => {
    try {
      if (!web3Auth) {
        console.error('Web3Auth instance is null');
        throw new Error('Web3Auth not initialized. Please refresh the page and try again.');
      }

      console.log('Login started');
      console.log('Web3Auth ready state:', web3Auth.status);

      // Create a timeout promise that rejects after 15 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Web3Auth modal timeout. The modal did not respond within 15 seconds.')), 15000)
      );

      let web3authProvider;

      try {
        // Race between the connect promise and timeout
        web3authProvider = await Promise.race([
          web3Auth.connect(),
          timeoutPromise as Promise<any>
        ]);
        
        console.log('Web3Auth connection successful');
      } catch (error) {
        if (error instanceof Error && error.message.includes('timeout')) {
          console.error('Web3Auth modal timed out');
          throw new Error('Web3Auth modal did not respond. Please check your internet connection and try again.');
        }
        
        // Check if user cancelled
        if (error instanceof Error && (error.message.includes('cancelled') || error.message.includes('User closed'))) {
          console.log('User cancelled Web3Auth modal');
          throw new Error('You cancelled the Web3Auth modal. Please try again.');
        }
        
        console.error('Web3Auth connect error:', error);
        throw error;
      }

      if (!web3authProvider) {
        throw new Error('No provider returned from Web3Auth. Please try again.');
      }

      console.log('Provider obtained:', !!web3authProvider);
      setProvider(web3authProvider);

      // Get user information
      console.log('Fetching user information...');
      const userInformation = await web3Auth.getUserInfo();

      if (!userInformation) {
        throw new Error('Could not retrieve user information. Please try again.');
      }

      console.log('User authenticated:', userInformation.email);
      setUserInfo(userInformation);

      // Create user object
      const userId = (userInformation as any)?.sub || (userInformation as any)?.id || Math.random().toString();

      const newUser: Web3AuthUser = {
        id: userId,
        email: userInformation?.email,
        name: userInformation?.name,
        role: undefined,
      };

      setUser(newUser);
      setIsAuthenticated(true);

      // Save to localStorage
      localStorage.setItem('recipechain_auth', JSON.stringify(userInformation));

      console.log('Login successful');
    } catch (error) {
      console.error('Login failed:', error);
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
      setUser(null);
      setIsAuthenticated(false);
      setSelectedRoleState(null);
      localStorage.removeItem('recipechain_auth');
      localStorage.removeItem('recipechain_role');
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
        user,
        isAuthenticated,
        login,
        logout,
        isUserExist,
        getWalletAddress,
      }}
    >
      {/* Web3Auth modal container */}
      <div id="web3auth-modal"></div>
      {children}
    </Web3AuthContext.Provider>
  );
};
