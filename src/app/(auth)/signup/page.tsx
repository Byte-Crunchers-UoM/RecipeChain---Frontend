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
      clearRole();        // force role selection for a new user
      await connect();    // user explicitly connected
      setAuthed(true);    // mark session
      router.replace("/select-role");
    } catch {
      setError("Failed to create account. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 text-center">
          <div className="flex justify-center mb-6">
            <Image src="/Logo.png" alt="RecipeChain Logo" width={90} height={90} priority />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Recipe • AI • Crypto</p>

          <div className="mt-6 flex items-start gap-3 text-left">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{" "}
              <Link href="/terms" className="text-gray-900 font-medium hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-gray-900 font-medium hover:underline">
                Privacy Policy
              </Link>
              .
            </label>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleSignup}
            disabled={loading || !acceptTerms}
            className="mt-8 w-full rounded-xl py-4 font-semibold text-white transition disabled:opacity-60"
            style={{ backgroundColor: "#0D9488" }}
          >
            {loading ? "Creating Account..." : "Continue with Web3Auth"}
          </button>

          <div className="mt-8 text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-gray-900 font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
