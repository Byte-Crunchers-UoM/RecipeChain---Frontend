"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3Auth, useWeb3AuthConnect } from "@web3auth/modal/react";

import { useAuth } from "@/context/AuthContext";
import { getWeb3AuthPrivateKey } from "@/lib/web3/getWeb3AuthPrivKey";
import { deriveXrplAddressFromWeb3AuthPrivKey } from "@/lib/xrpl/deriveXrpl";


export default function LoginPage() {
  const router = useRouter();
  const { refreshSession, resetAll } = useAuth();

  const { web3Auth } = useWeb3Auth();
  const { connect, loading } = useWeb3AuthConnect();

  const [error, setError] = useState("");

  const routeByRole = (role: any) => {
    if (role === "seller") router.replace("/seller/kyc");
    else if (role === "buyer") router.replace("/marketplace");
    else router.replace("/select-role");
  };

  const forceFreshWeb3AuthPopup = async () => {
    if (web3Auth?.connected) {
      try {
        await web3Auth.logout();
      } catch {}
    }
  };

  const handleLogin = async () => {
    setError("");

    try {
      await resetAll();
      await forceFreshWeb3AuthPopup();
      await connect();

      if (!web3Auth) throw new Error("Web3Auth not initialized");

      (web3Auth as any)?.modal?.closeModal?.();

      const tokenInfo: any = await web3Auth.getIdentityToken();
      const idToken =
        typeof tokenInfo === "string" ? tokenInfo : tokenInfo?.idToken;
      if (!idToken) throw new Error("Failed to get identity token");

      const privKeyHexNo0x = await getWeb3AuthPrivateKey(web3Auth);
      const walletAddress =
        await deriveXrplAddressFromWeb3AuthPrivKey(privKeyHexNo0x);

      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      if (!apiBase) throw new Error("Missing NEXT_PUBLIC_API_URL");

      const resp = await fetch(`${apiBase}/auth/web3auth/sync`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ walletAddress, mode: "login" }),
      });

      const data = await resp.json().catch(() => null);

      if (resp.status === 404) {
        setError(data?.message || "Account not found. Please sign up first.");
        return;
      }

      if (!resp.ok) throw new Error(data?.message || "Login failed");

      const me = await refreshSession();
      routeByRole(me?.role);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 flex items-center justify-center px-4">
      {/* Switch Button (Top Right) */}
      <div className="absolute top-8 right-8">
        <button
          onClick={() => router.push("/signup")}
          disabled={loading}
          className="rounded-xl border border-teal-500 px-6 py-3 text-sm font-medium text-teal-600 hover:bg-teal-50 transition"
        >
          Switch to Sign Up
        </button>
      </div>

      <div className="w-full max-w-xl">
        <div className="bg-white rounded-3xl shadow-2xl px-10 py-12 text-center border border-gray-100">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/Logo.png"
              alt="RecipeChain Logo"
              width={120}
              height={120}
              priority
            />
          </div>

          {/* Tagline */}
          <p className="text-gray-500 text-sm">
            A blockchain-powered recipe marketplace
          </p>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mt-8">
            Log in to your Account
          </h2>

          <p className="mt-3 text-gray-500 text-sm">
            Welcome back to RecipeChain!
          </p>

          {/* Error Box */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className={[
              "mt-10 w-full rounded-xl py-4 font-semibold text-lg transition shadow-md",
              loading
                ? "bg-gray-200 text-gray-500"
                : "bg-teal-600 text-white hover:bg-teal-700",
            ].join(" ")}
          >
            {loading ? "Connecting..." : "Continue with Web3Auth"}
          </button>

          {/* Security Text */}
          <div className="mt-6 text-xs text-gray-400">
            No password required • Secured by Web3Auth
          </div>

          {/* Signup Link */}
          <div className="mt-8 text-sm text-gray-500">
            New user?{" "}
            <Link
              href="/signup"
              className="text-teal-600 font-medium hover:underline"
            >
              Click here to sign up
            </Link>
          </div>
          <div className="mt-6 border-t border-gray-300"></div>

          {/* Footer */}
          <div className="mt-6 border-t border-gray-100 pt-6 text-xs text-gray-400 flex justify-center gap-2">
            <Link href="/privacy" className="hover:text-gray-600">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-gray-600">
              Terms of Service
            </Link>
          </div>

          <div className="mt-3 text-xs text-gray-400">
            © 2026 RecipeChain. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}