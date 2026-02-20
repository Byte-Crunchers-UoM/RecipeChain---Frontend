"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3AuthConnect } from "@web3auth/modal/react";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const router = useRouter();
  const { clearRole, setAuthed } = useAuth();
  const { connect, loading } = useWeb3AuthConnect();

  const [error, setError] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSignup = async () => {
    if (!acceptTerms) {
      setError("Please accept the terms and conditions");
      return;
    }

    setError("");
    try {
      clearRole(); // force role selection for a new user
      await connect(); // user explicitly connected
      setAuthed(true); // mark session
      router.replace("/select-role");
    } catch {
      setError("Failed to create account. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      {/* Top-right switch button */}
      <div className="absolute top-6 right-6">
        <button
          onClick={() => router.push("/login")}
          className="rounded-xl border border-teal-500 px-6 py-3 text-sm font-medium text-teal-600 hover:bg-teal-50 transition"
        >
          Switch to Login
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-md sm:max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-6 py-7 sm:px-8 sm:py-8 text-center">
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

          {/* Title block */}
          <p className="text-sm text-gray-500 mt-3">
            A blockchain-powered recipe marketplace
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-6">
            Create Your Account
          </h2>
          <p className="text-gray-500 mt-2">
            Join RecipeChain &amp; Buy/Sell Recipes securely.
          </p>

          {/* Signup button */}
          <button
            onClick={handleSignup}
            disabled={loading || !acceptTerms}
            className={[
              "mt-6 w-full rounded-xl py-4 font-semibold transition",
              loading || !acceptTerms
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-teal-500 text-white hover:bg-teal-600",
            ].join(" ")}
          >
            {loading ? "Signing up..." : "Sign up with Web3Auth"}
          </button>

          {/* Terms */}
          <div className="mt-6 flex items-start justify-center gap-3 text-left">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 h-5 w-5 accent-teal-500"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{" "}
              <Link href="/terms" className="text-teal-600 hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-teal-600 hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Helper text */}
          <div className="mt-6 text-xs text-gray-400">
            🔒 A secure blockchain wallet will be created automatically after signup.
          </div>

          <div className="mt-6 text-sm text-gray-500">
            No password required &nbsp;•&nbsp; Secured by Web3Auth
          </div>

          {/* Bottom login link */}
          <div className="mt-6 text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-600 hover:underline">
              Click here to log in
            </Link>
          </div>

          {/* Footer links */}
          <div className="mt-8 pt-5 border-t text-xs text-gray-400 flex items-center justify-center gap-4">
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