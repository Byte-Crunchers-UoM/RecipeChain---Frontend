"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { UserRole } from "@/types";

type AuthContextType = {
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setRole: (role: UserRole) => void;
  setAuthed: (value: boolean) => void;

  logout: () => void;     // clears auth only (keeps role)
  clearRole: () => void;  // clears role only
  resetAll: () => void;   // clears both (optional)
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function canUseDOM() {
  return typeof document !== "undefined";
}

function getCookie(name: string) {
  if (!canUseDOM()) return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string) {
  if (!canUseDOM()) return;
  // session cookie (clears when browser closes)
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (!canUseDOM()) return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [authed, setAuthedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const r = getCookie("recipe_chain_role") as UserRole | null;
    const a = getCookie("recipe_chain_authed") === "1";
    setRoleState(r);
    setAuthedState(a);
    setIsLoading(false);
  }, []);

  const setRole = (newRole: UserRole) => {
    setCookie("recipe_chain_role", newRole);
    setRoleState(newRole);
  };

  const setAuthed = (value: boolean) => {
    if (value) setCookie("recipe_chain_authed", "1");
    else deleteCookie("recipe_chain_authed");
    setAuthedState(value);
  };

  const logout = () => {
    deleteCookie("recipe_chain_authed");
    setAuthedState(false);
  };

  const clearRole = () => {
    deleteCookie("recipe_chain_role");
    setRoleState(null);
  };

  const resetAll = () => {
    deleteCookie("recipe_chain_authed");
    deleteCookie("recipe_chain_role");
    setAuthedState(false);
    setRoleState(null);
  };

  const value = useMemo(
    () => ({
      role,
      isAuthenticated: authed,
      isLoading,
      setRole,
      setAuthed,
      logout,
      clearRole,
      resetAll,
    }),
    [role, authed, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
