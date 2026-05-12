"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { UserRole } from "@/types";

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
  logout: () => Promise<void>;
  clearRole: () => void;
  resetAll: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MeUser | null>(null);
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [authed, setAuthedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  const refreshSession = useCallback(async (): Promise<MeUser | null> => {
    if (!apiBase) {
      setAuthedState(false);
      setRoleState(null);
      setUser(null);
      return null;
    }

    try {
      const resp = await fetch(`${apiBase}/me`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const json: unknown = await resp.json().catch(() => null);

      const parsed = json as
        | {
            success?: boolean;
            data?: MeUser;
          }
        | null;

      if (!resp.ok || !parsed?.success || !parsed?.data) {
        setAuthedState(false);
        setRoleState(null);
        setUser(null);
        return null;
      }

      const me = parsed.data;

      setAuthedState(true);
      setUser(me);
      setRoleState(me.role ?? null);

      return me;
    } catch (error) {
      console.error("refreshSession error:", error);
      setAuthedState(false);
      setRoleState(null);
      setUser(null);
      return null;
    }
  }, [apiBase]);

  useEffect(() => {
    void (async () => {
      setIsLoading(true);
      const me = await refreshSession();
     
      if (me) {
        setUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            full_name: me.full_name || me.name || "Chef",
            display_name: me.display_name || "",
            profile_photo: me.profile_photo || null,
          };
        });
      }
      setIsLoading(false);
    })();
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
      if (apiBase) {
        await fetch(`${apiBase}/auth/logout`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }).catch(() => null);
      }
    } finally {
      setAuthedState(false);
      setRoleState(null);
      setUser(null);
    }
  }, [apiBase]);

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
      logout,
      clearRole,
      resetAll,
    }),
    [user, role, authed, isLoading, setRole, refreshSession, logout, clearRole, resetAll]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}