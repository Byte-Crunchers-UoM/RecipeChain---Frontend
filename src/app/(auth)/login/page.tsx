"use client";

import Image from "next/image";
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
      await connect();          // user explicitly connected
      setAuthed(true);          // set session auth cookie
      goNext(role);             // route based on stored role (if any)
    } catch (e) {
      setError("Failed to connect. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 text-center">
          <div className="flex justify-center mb-6">
            <Image src="/Logo.png" alt="RecipeChain Logo" width={90} height={90} priority />
          </div>

          <h1 className="text-3xl font-bold text-gray-900">RecipeChain</h1>
          <p className="text-gray-500 mt-1">Recipe • AI • Crypto</p>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-8 w-full rounded-xl py-4 font-semibold text-white transition disabled:opacity-60"
            style={{ backgroundColor: "#0D9488" }}
          >
            {loading ? "Connecting..." : "Continue with Web3Auth"}
          </button>
        </div>
      </div>
    </div>
  );
}
