// src/context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useCallback,
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
  name?: string | null;
  bio?: string | null;
  full_name?: string | null;
  display_name?: string | null;
  profile_photo?: string | null;
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

type ApiMeResponse = {
  success?: boolean;
  ok?: boolean;
  data?: MeUser | { user?: MeUser };
  user?: MeUser;
  profile?: Partial<MeUser> & {
    id?: string;
    display_name?: string;
  };
  message?: string;
  error?: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function safeJson<T = unknown>(response: Response): Promise<T | null> {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `Server returned non-JSON response. Status: ${response.status}`
    );
  }
}

function normalizeUser(rawUser: unknown): MeUser | null {
  if (!rawUser || typeof rawUser !== "object") return null;

  const user = rawUser as Partial<MeUser> & {
    id?: string;
    display_name?: string;
  };

  const userId = user.user_id || user.id;
  const email = user.email;

  if (!userId || !email) return null;

  return {
    user_id: userId,
    email,
    role: (user.role as UserRole | null) ?? null,
    wallet_address: user.wallet_address ?? null,
    name: user.name ?? user.display_name ?? null,
    bio: user.bio ?? null,
  };
}

function extractUserFromSessionResponse(
  json: ApiMeResponse | null
): MeUser | null {
  if (!json) return null;

  if (json.data && typeof json.data === "object" && "user" in json.data) {
    return normalizeUser(json.data.user);
  }

  return (
    normalizeUser(json.data) ||
    normalizeUser(json.user) ||
    normalizeUser(json.profile)
  );
}

/**
 * Provider component that manages user authentication state,
 * session refreshing, Web3Auth synchronization, logout, and role state.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MeUser | null>(null);
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [authed, setAuthedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const applyUser = useCallback((me: MeUser | null) => {
    if (!me) {
      setAuthedState(false);
      setRoleState(null);
      setUser(null);
      return;
    }

    setAuthedState(true);
    setUser(me);
    setRoleState(me.role ?? null);
  }, []);

  const refreshSession = useCallback(async (): Promise<MeUser | null> => {
    try {
      const resp = await fetch(`${API_BASE}/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const json = await safeJson<ApiMeResponse>(resp).catch(() => null);
      const me = extractUserFromSessionResponse(json);

      if (resp.ok && me) {
        applyUser(me);
        return me;
      }

      const fallbackResp = await fetch(`${API_BASE}/buyers/me/profile`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }).catch(() => null);

      if (!fallbackResp) {
        applyUser(null);
        return null;
      }

      const fallbackJson = await safeJson<ApiMeResponse>(fallbackResp).catch(
        () => null
      );

      const fallbackMe = extractUserFromSessionResponse(fallbackJson);

      if (!fallbackResp.ok || !fallbackMe) {
        applyUser(null);
        return null;
      }

      applyUser(fallbackMe);
      return fallbackMe;
    } catch (error) {
      console.error("refreshSession error:", error);
      applyUser(null);
      return null;
    }
  }, [applyUser]);

  const syncWeb3AuthSession = useCallback(
    async (payload: {
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

        const json = await safeJson<ApiMeResponse>(resp).catch(() => null);

        if (!resp.ok) {
          throw new Error(
            json?.message || json?.error || "Failed to sync Web3Auth session"
          );
        }

        const syncedUser = extractUserFromSessionResponse(json);

        if (syncedUser) {
          applyUser(syncedUser);
          return syncedUser;
        }

        return await refreshSession();
      } catch (error) {
        console.error("syncWeb3AuthSession error:", error);
        applyUser(null);

        throw error instanceof Error
          ? error
          : new Error("Failed to sync Web3Auth session");
      }
    },
    [applyUser, refreshSession]
  );

  useEffect(() => {
    let active = true;

    const init = async () => {
      setIsLoading(true);

      await refreshSession();

      if (active) {
        setIsLoading(false);
      }
    };

    void init();

    return () => {
      active = false;
    };
  }, [refreshSession]);

  const setRole = useCallback((newRole: UserRole | null) => {
    setRoleState(newRole);
    setUser((prev) => (prev ? { ...prev, role: newRole } : prev));
  }, []);

  const clearRole = useCallback(() => {
    setRoleState(null);
    setUser((prev) => (prev ? { ...prev, role: null } : prev));
  }, []);

  const logout = useCallback(async () => {
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
  }, [applyUser]);

  const resetAll = useCallback(async () => {
    await logout();
  }, [logout]);

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
    [
      user,
      role,
      authed,
      isLoading,
      setRole,
      refreshSession,
      syncWeb3AuthSession,
      logout,
      clearRole,
      resetAll,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Custom hook to access the authentication context securely. */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}