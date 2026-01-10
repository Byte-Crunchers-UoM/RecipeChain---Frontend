"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { UserRole } from '@/types';

export interface Web3AuthUser {
  id: string;
  email?: string;
  role: UserRole;
  name?: string;
}

interface Web3AuthContextType {
  user: Web3AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined);

export const useWeb3Auth = () => {
  const context = useContext(Web3AuthContext);
  if (!context) {
    throw new Error('useWeb3Auth must be used within Web3AuthContextProvider');
  }
  return context;
};

export const Web3AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<Web3AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check if user is authenticated from localStorage
        const storedRole = localStorage.getItem('park_chain_role') as UserRole | null;
        const storedAuth = localStorage.getItem('park_chain_auth');
        
        if (storedAuth && storedRole) {
          const userData: Web3AuthUser = {
            id: storedAuth,
            role: storedRole,
          };
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  const login = useCallback(async () => {
    try {
      setIsLoading(true);
      // Login is handled by Web3AuthModalProvider
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      localStorage.removeItem('park_chain_role');
      localStorage.removeItem('park_chain_auth');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <Web3AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </Web3AuthContext.Provider>
  );
};
