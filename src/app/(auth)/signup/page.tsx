"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3Auth, useWeb3AuthConnect } from "@web3auth/modal/react";

import { useAuth } from "@/context/AuthContext";
import { getWeb3AuthPrivateKey } from "@/lib/web3/getWeb3AuthPrivKey";
import { deriveXrplAddressFromWeb3AuthPrivKey } from "@/lib/xrpl/deriveXrpl";

export default function SignupPage() {
  const router = useRouter();
  const { refreshSession, resetAll } = useAuth();

  const { web3Auth } = useWeb3Auth();
  const { connect, loading } = useWeb3AuthConnect();

  const [agreed, setAgreed] = useState(false);
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
      } catch {
        // ignore
      }
    }
  };

  const handleSignup = async () => {
    setError("");

    try {
      if (!agreed) {
        setError("Please agree to the Terms of Service and Privacy Policy.");
        return;
      }

      await resetAll();
      await forceFreshWeb3AuthPopup();

      // ✅ Always show Web3Auth modal (email select)
      await connect();

      if (!web3Auth) throw new Error("Web3Auth not initialized");

      // ✅ Close modal overlay if it visually sticks
      (web3Auth as any)?.modal?.closeModal?.();

      // ✅ Identity token
      const tokenInfo: any = await web3Auth.getIdentityToken();
      const idToken =
        typeof tokenInfo === "string" ? tokenInfo : tokenInfo?.idToken;
      if (!idToken) throw new Error("Failed to get identity token");

      // ✅ XRPL address
      const privKeyHexNo0x = await getWeb3AuthPrivateKey(web3Auth);
      const walletAddress =
        await deriveXrplAddressFromWeb3AuthPrivKey(privKeyHexNo0x);

      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      if (!apiBase) throw new Error("Missing NEXT_PUBLIC_API_URL");

      // ✅ SIGNUP: backend will create if new, or treat as login if exists
      const resp = await fetch(`${apiBase}/auth/web3auth/sync`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ walletAddress, mode: "signup" }),
      });

      const data = await resp.json().catch(() => null);
      if (!resp.ok) throw new Error(data?.message || "Signup failed");

      // ✅ Load session + route by role
      const me = await refreshSession();
      routeByRole(me?.role);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Failed to create account. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 flex items-center justify-center px-4">
      {/* Switch button (top-right) */}
      <div className="absolute top-8 right-8">
        <button
          onClick={() => router.push("/login")}
          disabled={loading}
          className="rounded-xl border border-teal-500 px-8 py-3 text-sm font-medium text-teal-600 hover:bg-teal-50 transition"
        >
          Switch to Login
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 px-12 py-12 text-center">
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

          {/* Brand */}
          <p className="text-sm text-gray-500">
            A blockchain-powered recipe marketplace
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-8">
            Create Your Account
          </h2>

          <p className="mt-3 text-gray-500 text-sm">
            Join RecipeChain &amp; Buy/Sell Recipes securely.
          </p>

          {/* Button (lighter teal like screenshot) */}
          <button
            onClick={handleSignup}
            disabled={loading || !agreed}
            className={[
              "mt-8 w-full rounded-xl py-4 font-medium text-base transition shadow-sm",
              loading || !agreed
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-teal-300 text-white hover:bg-teal-400",
            ].join(" ")}
          >
            {loading ? "Connecting..." : "Sign up with Web3Auth"}
          </button>

          {/* Terms checkbox row */}
          <div className="mt-8 flex items-start justify-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-gray-300 accent-teal-600"
              disabled={loading}
            />
            <span className="text-left leading-6">
              I agree to the{" "}
              <Link href="/terms" className="text-teal-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-teal-600 hover:underline">
                Privacy Policy
              </Link>
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Small note (subtle like screenshot) */}
          <div className="mt-10 text-xs text-gray-400">
            <span className="mr-3">🔒</span>
            A secure blockchain wallet will be created <br className="hidden sm:block" />
            automatically after signup.
          </div>

          {/* Security line */}
          <div className="mt-10 text-xs text-gray-400">
            No password required &nbsp;•&nbsp; Secured by Web3Auth
          </div>

          {/* Login link */}
          <div className="mt-6 text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-600 hover:underline">
              Click here to log in
            </Link>
          </div>
          <div className="mt-8 border-t border-gray-300"></div>

          {/* Footer */}
          <div className="mt-1 border-t border-gray-100 pt-6 text-xs text-gray-400 flex justify-center gap-6">
            <Link href="/privacy" className="hover:text-gray-600">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-gray-600">
              Terms of Service
            </Link>
          </div>

          <div className="mt-2 text-xs text-gray-400">
            © {new Date().getFullYear()} RecipeChain. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}