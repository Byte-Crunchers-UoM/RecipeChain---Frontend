"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK, IProvider } from "@web3auth/base";
import { UserRole } from "@/types";

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "";

export interface Web3AuthUser {
  id: string;
  email?: string;
  name?: string;
  role?: UserRole;
  walletAddress?: string;
}

interface Web3AuthContextType {
  selectedRole: UserRole | null;
  setSelectedRole: (role: UserRole) => void;
  user: Web3AuthUser | null;
  setUser: (user: Web3AuthUser | null) => void;
  isUserExist: () => boolean;
  isUserExistByWallet: (walletAddress: string) => boolean;
  saveWalletAddress: (walletAddress: string) => void;
  getWalletAddress: () => string | null;
  checkAndRestoreSession: () => boolean;
  clearUser: () => void;
  login: () => Promise<Web3AuthUser | null>;
  signup: () => Promise<Web3AuthUser | null>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined);

export const useWeb3Auth = () => {
  const context = useContext(Web3AuthContext);
  if (!context) {
    throw new Error("useWeb3Auth must be used within Web3AuthProvider");
  }
  return context;
};

interface Web3AuthProviderProps {
  children: ReactNode;
}

export const Web3AuthProvider: React.FC<Web3AuthProviderProps> = ({ children }) => {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRoleState] = useState<UserRole | null>(null);
  const [user, setUser] = useState<Web3AuthUser | null>(null);

  // Initialize Web3Auth
  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        const web3authInstance = new Web3Auth({
          clientId,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0xaa36a7",
            rpcTarget: "https://rpc.sepolia.org",
            displayName: "Ethereum Sepolia",
            blockExplorer: "https://sepolia.etherscan.io",
            ticker: "ETH",
            tickerName: "Ethereum",
          } as any,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          uiConfig: {
            appLogo: "/images/recipechain_logo_green.png",
            theme: "light" as any,
            loginGridCol: 2,
            appName: "RecipeChain",
            uxMode: "redirect" as any,
          } as any,
        } as any);

        // Initialize Web3Auth (it includes OpenLogin adapter by default in modal)
        await web3authInstance.init();
        console.log("Web3Auth initialized, status:", web3authInstance.status);
        setWeb3auth(web3authInstance);

        // After redirect back from authentication, check if we're connected
        if (web3authInstance.status === "connected") {
          const userInfo = await web3authInstance.getUserInfo();
          if (userInfo) {
            const userId = (userInfo as any).sub || (userInfo as any).id || (userInfo as any).email || "unknown";
            const userData: Web3AuthUser = {
              id: userId,
              email: (userInfo as any).email,
              name: (userInfo as any).name,
              walletAddress: undefined,
            };
            console.log("User authenticated from redirect:", userData.id);
            setUser(userData);
            localStorage.setItem("recipechain_auth", JSON.stringify(userInfo));
          }
        }
      } catch (error) {
        console.error("Web3Auth initialization failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!web3auth) {
      initWeb3Auth();
    }
  }, [web3auth]);

  const getWalletAddressInternal = async (instance?: Web3Auth): Promise<string | null> => {
    try {
      const authInstance = instance || web3auth;
      if (!authInstance?.provider) {
        return null;
      }

      // Some providers (like social auth) don't support eth_accounts
      // Use .catch() at promise level to prevent error logging
      const result = await authInstance.provider
        .request({
          method: "eth_accounts",
          params: [],
        })
        .catch(() => null) as string[] | null;

      return result?.[0] || null;
    } catch {
      // Wallet is optional - fail silently
      return null;
    }
  };

  const setSelectedRole = (role: UserRole) => {
    setSelectedRoleState(role);
    localStorage.setItem("recipechain_role", role);
    if (user) {
      setUser({ ...user, role });
    }
  };

  const saveWalletAddress = (walletAddress: string) => {
    localStorage.setItem("recipechain_wallet", walletAddress);
  };

  const getWalletAddressLocal = (): string | null => {
    const stored = localStorage.getItem("recipechain_wallet");
    if (stored) return stored;
    if (user?.walletAddress) return user.walletAddress;
    return null;
  };

  const isUserExistByWallet = (walletAddress: string): boolean => {
    const stored = localStorage.getItem("recipechain_wallet");
    return stored === walletAddress;
  };

  const isUserExist = (): boolean => {
    const walletAddress = getWalletAddressLocal();
    if (walletAddress) return true;
    const auth = localStorage.getItem("recipechain_auth");
    const role = localStorage.getItem("recipechain_role");
    return !!(auth && role);
  };

  const checkAndRestoreSession = (): boolean => {
    try {
      const storedAuth = localStorage.getItem("recipechain_auth");
      const storedRole = localStorage.getItem("recipechain_role") as UserRole | null;
      const storedWallet = localStorage.getItem("recipechain_wallet");

      if (storedAuth && storedRole) {
        const authData = JSON.parse(storedAuth);
        const userData: Web3AuthUser = {
          id: authData.sub || authData.id || "",
          email: authData.email,
          name: authData.name,
          role: storedRole,
          walletAddress: storedWallet || undefined,
        };
        setUser(userData);
        setSelectedRoleState(storedRole);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error restoring user session:", error);
      return false;
    }
  };

  const clearUser = () => {
    localStorage.removeItem("recipechain_auth");
    localStorage.removeItem("recipechain_role");
    localStorage.removeItem("recipechain_wallet");
    setUser(null);
    setSelectedRoleState(null);
  };

  const login = async (): Promise<Web3AuthUser | null> => {
    try {
      if (!web3auth) {
        console.error("Web3Auth not initialized");
        // Wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!web3auth) {
          throw new Error("Web3Auth initialization failed");
        }
      }

      console.log("Current Web3Auth status:", web3auth.status);

      // If already connected, get user info directly
      if (web3auth.status === "connected") {
        console.log("Already connected, fetching user info...");
        try {
          const userInfo = await web3auth.getUserInfo();
          
          const userId = (userInfo as any).sub || (userInfo as any).id || (userInfo as any).email || "unknown";
          
          const userData: Web3AuthUser = {
            id: userId,
            email: (userInfo as any).email,
            name: (userInfo as any).name,
            walletAddress: undefined,
          };

          localStorage.setItem("recipechain_auth", JSON.stringify(userInfo));

          setUser(userData);
          return userData;
        } catch (e) {
          console.error("Error getting user info when already connected:", e);
          // Fall through to connection attempt
        }
      }

      // Not connected, need to connect
      console.log("Initiating Web3Auth connection...");
      if (!web3auth.connect) {
        throw new Error("Web3Auth.connect is not available");
      }

      try {
        const provider = await web3auth.connect();

        if (!provider) {
          console.error("Web3Auth connection failed - no provider returned");
          return null;
        }

        console.log("Web3Auth connection successful, provider:", provider);

        // Give it a moment for the state to update
        await new Promise(resolve => setTimeout(resolve, 500));

        const userInfo = await web3auth.getUserInfo();
        console.log("Got user info from Web3Auth:", userInfo);

        const userId = (userInfo as any).sub || (userInfo as any).id || (userInfo as any).email || "unknown";

        const userData: Web3AuthUser = {
          id: userId,
          email: (userInfo as any).email,
          name: (userInfo as any).name,
          walletAddress: undefined,
        };

        localStorage.setItem("recipechain_auth", JSON.stringify(userInfo));

        console.log("User authenticated:", userId);
        setUser(userData);
        return userData;
      } catch (connectError) {
        console.error("Web3Auth connection error:", connectError);
        return null;
      }
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  };

  const signup = async (): Promise<Web3AuthUser | null> => {
    try {
      if (!web3auth) {
        console.error("Web3Auth not initialized");
        // Wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!web3auth) {
          throw new Error("Web3Auth initialization failed");
        }
      }

      console.log("Initiating Web3Auth signup...");
      if (!web3auth.connect) {
        throw new Error("Web3Auth.connect is not available");
      }

      try {
        const provider = await web3auth.connect();

        if (!provider) {
          console.error("Web3Auth signup failed - no provider returned");
          return null;
        }

        console.log("Web3Auth signup successful, provider:", provider);

        // Give it a moment for the state to update
        await new Promise(resolve => setTimeout(resolve, 500));

        const userInfo = await web3auth.getUserInfo();
        console.log("Got user info from Web3Auth signup:", userInfo);

        const userId = (userInfo as any).sub || (userInfo as any).id || (userInfo as any).email || "unknown";

        // Try to get wallet address for new signup
        const walletAddress = await getWalletAddressInternal(web3auth);
        console.log("Wallet address from signup:", walletAddress);

        const userData: Web3AuthUser = {
          id: userId,
          email: (userInfo as any).email,
          name: (userInfo as any).name,
          walletAddress: walletAddress || undefined,
        };

        localStorage.setItem("recipechain_auth", JSON.stringify(userInfo));
        if (walletAddress) {
          localStorage.setItem("recipechain_wallet", walletAddress);
          saveWalletAddress(walletAddress);
        }

        console.log("User signed up:", userId);
        setUser(userData);
        return userData;
      } catch (connectError) {
        console.error("Web3Auth signup connection error:", connectError);
        return null;
      }
    } catch (error) {
      console.error("Signup error:", error);
      return null;
    }
  };

  const logout = async () => {
    try {
      if (web3auth) {
        await web3auth.logout();
      }
      clearUser();
    } catch (error) {
      console.error("Logout error:", error);
      clearUser();
    }
  };

  return (
    <Web3AuthContext.Provider
      value={{
        selectedRole,
        setSelectedRole,
        user,
        setUser,
        isUserExist,
        isUserExistByWallet,
        saveWalletAddress,
        getWalletAddress: getWalletAddressLocal,
        checkAndRestoreSession,
        clearUser,
        login,
        signup,
        logout,
        isLoading,
      }}
    >
      {children}
    </Web3AuthContext.Provider>
  );
};
