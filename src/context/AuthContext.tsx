//src/context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { UserRole } from "@/lib/types";

export type MeUser = {
  user_id: string;
  email: string;
  role: UserRole | null;
  wallet_address?: string | null;
};

export type AuthContextType = {
  user: MeUser | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setRole: (role: UserRole | null) => void;

  refreshSession: () => Promise<MeUser | null>;

  syncWeb3AuthSession: (payload: {
    idToken: string;
    walletAddress?: string | null;
  }) => Promise<MeUser | null>;

  logout: () => Promise<void>;

  clearRole: () => void;
  resetAll: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/** Helper function to safely parse a JSON response, returning null if the text is empty or invalid. */
async function safeJson(response: Response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Server returned non-JSON response. Status: ${response.status}`
    );
  }
}

/** Provider component that manages user authentication state, session refreshing, and Web3Auth synchronization. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MeUser | null>(null);
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [authed, setAuthedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /** Helper function to update the local user and role state based on the provided user object. */
  const applyUser = (me: MeUser | null) => {
    if (!me) {
      setAuthedState(false);
      setRoleState(null);
      setUser(null);
      return;
    }

    setAuthedState(true);
    setUser(me);
    setRoleState((me.role as UserRole | null) ?? null);
  };

  /** Fetches the latest user profile from the backend to refresh the current authentication session. */
  const refreshSession = async (): Promise<MeUser | null> => {
    try {
      const resp = await fetch(`${API_BASE}/buyer/me/profile`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const json = await safeJson(resp).catch(() => null);

      if (!resp.ok || !json?.profile) {
        applyUser(null);
        return null;
      }

      const profile = json.profile;

      const me: MeUser = {
        user_id: profile.user_id,
        email: profile.email,
        role: (profile.role as UserRole | null) ?? "buyer",
        wallet_address: profile.wallet_address ?? null,
      };

      applyUser(me);
      return me;
    } catch (error) {
      console.error("refreshSession error:", error);
      applyUser(null);
      return null;
    }
  };

  /** Synchronizes a Web3Auth session with the backend using an ID token and an optional wallet address. */
  const syncWeb3AuthSession = async (payload: {
    idToken: string;
    walletAddress?: string | null;
  }): Promise<MeUser | null> => {
    try {
      if (!payload.idToken) {
        throw new Error("Missing Web3Auth ID token");
      }

      const resp = await fetch(`${API_BASE}/auth/web3auth/sync`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${payload.idToken}`,
        },
        body: JSON.stringify({
          walletAddress: payload.walletAddress || "",
        }),
      });

      const json = await safeJson(resp);

      if (!resp.ok || !json?.ok) {
        throw new Error(json?.message || "Failed to sync Web3Auth session");
      }

      const syncedUser = json.user;

      const me: MeUser = {
        user_id: syncedUser.user_id,
        email: syncedUser.email,
        role: (syncedUser.role as UserRole | null) ?? null,
        wallet_address: syncedUser.wallet_address ?? payload.walletAddress ?? null,
      };

      applyUser(me);

      return me;
    } catch (error) {
      console.error("syncWeb3AuthSession error:", error);
      applyUser(null);
      throw error instanceof Error
        ? error
        : new Error("Failed to sync Web3Auth session");
    }
  };

  useEffect(() => {
    let active = true;

    /** Initializes the authentication state by refreshing the session on component mount. */
    const init = async () => {
      setIsLoading(true);

      const me = await refreshSession();

      if (!active) return;

      if (!me) {
        applyUser(null);
      }

      setIsLoading(false);
    };

    void init();

    return () => {
      active = false;
    };
  }, []);

  /** Updates the current user's role in the local state. */
  const setRole = (newRole: UserRole | null) => {
    setRoleState(newRole);
    setUser((prev) => (prev ? { ...prev, role: newRole } : prev));
  };

  /** Clears the current user's role from the local state. */
  const clearRole = () => {
    setRoleState(null);
    setUser((prev) => (prev ? { ...prev, role: null } : prev));
  };

  /** Logs the user out by invalidating the backend session and clearing local state. */
  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }).catch(() => null);
    } finally {
      applyUser(null);
    }
  };

  /** Resets all authentication states by logging the user out. */
  const resetAll = async () => {
    await logout();
  };

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      role,
      isAuthenticated: authed,
      isLoading,
      setRole,
      refreshSession,
      syncWeb3AuthSession,
      logout,
      clearRole,
      resetAll,
    }),
    [user, role, authed, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Custom hook to access the authentication context securely. */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}