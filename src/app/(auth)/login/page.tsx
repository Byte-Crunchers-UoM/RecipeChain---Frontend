"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { role, setAuthed } = useAuth();
  const { connect, loading } = useWeb3AuthConnect();

  const [error, setError] = useState("");

  const goNext = (r: typeof role) => {
    if (r === "seller") router.replace("/seller/dashboard");
    else if (r === "buyer") router.replace("/buyer/dashboard");
    else router.replace("/select-role");
  };

  const handleLogin = async () => {
    setError("");
    try {
      await connect(); // user explicitly connected
      setAuthed(true); // set session auth cookie
      goNext(role); // route based on stored role (if any)
    } catch {
      setError("Failed to connect. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      {/* Top-right switch button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => router.push("/signup")}
          className="rounded-xl border border-teal-500 px-6 py-3 text-sm font-medium text-teal-600 hover:bg-teal-50 transition"
        >
          Switch to Sign Up
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/Logo.png"
              alt="RecipeChain Logo"
              width={110}
              height={110}
              priority
            />
          </div>

          <p className="text-sm text-gray-500 mt-6">
            A blockchain-powered recipe marketplace
          </p>

          {/* Headings */}
          <h2 className="text-2xl font-bold text-gray-900 mt-6">
            Log in to your Account
          </h2>
          <p className="text-gray-500 mt-3">Welcome back to RecipeChain!</p>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Main button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className={[
              "mt-8 w-full rounded-xl py-4 font-semibold transition",
              loading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-teal-600 text-white hover:bg-teal-700 shadow-sm",
            ].join(" ")}
          >
            {loading ? "Connecting..." : "Continue with Web3Auth"}
          </button>

          {/* Helper text */}
          <div className="mt-8 text-sm text-gray-500">
            No password required &nbsp;•&nbsp; Secured by Web3Auth
          </div>

          {/* Signup link */}
          <div className="mt-8 text-sm text-gray-500">
            New user?{" "}
            <Link href="/signup" className="text-teal-600 hover:underline">
              Click here to sign up
            </Link>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t text-xs text-gray-400 flex items-center justify-center gap-4">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline">
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