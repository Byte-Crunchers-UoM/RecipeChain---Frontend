"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { UserRole } from "@/types";

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

  // ✅ now RETURNS user (or null)
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

  const refreshSession = async (): Promise<MeUser | null> => {
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

      const json = await resp.json().catch(() => null);

      if (!resp.ok || !json?.success || !json?.data) {
        setAuthedState(false);
        setRoleState(null);
        setUser(null);
        return null;
      }

      const me: MeUser = json.data;

      setAuthedState(true);
      setUser(me);
      setRoleState((me.role as UserRole | null) ?? null);

      return me;
    } catch (e) {
      console.error("refreshSession error:", e);
      setAuthedState(false);
      setRoleState(null);
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await refreshSession();
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setRole = (newRole: UserRole | null) => {
    setRoleState(newRole);
    setUser((prev) => (prev ? { ...prev, role: newRole } : prev));
  };

  const clearRole = () => {
    setRoleState(null);
    setUser((prev) => (prev ? { ...prev, role: null } : prev));
  };

  const logout = async () => {
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
  };

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
      logout,
      clearRole,
      resetAll,
    }),
    [user, role, authed, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}