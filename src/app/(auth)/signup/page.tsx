"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3Auth, useWeb3AuthConnect } from "@web3auth/modal/react";

import { useAuth } from "@/context/AuthContext";
import { getWeb3AuthPrivateKey } from "@/lib/web3/getWeb3AuthPrivKey";
import { getXrplWalletFromWeb3AuthPrivKey } from "@/lib/xrpl/getXrplWallet";
import { closeWeb3AuthModal } from "@/lib/web3/closeWeb3AuthModal";
import { getSellerEntryRoute } from "@/lib/getSellerEntryRoute";

const BUYER_HOME = "/buyer/profile";

export default function SignupPage() {
  const router = useRouter();
  const { refreshSession, resetAll } = useAuth();

  const { web3Auth } = useWeb3Auth();
  const { connect, loading } = useWeb3AuthConnect();

  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const routeByRole = async (role: any) => {
    let target = "/select-role";

    if (role === "seller") {
      target = await getSellerEntryRoute();
    } else if (role === "buyer") {
      target = BUYER_HOME;
    }

    if (typeof window !== "undefined") {
      window.location.replace(target);
      return;
    }

    router.replace(target);
  };

  const forceFreshWeb3AuthPopup = async () => {
    if (web3Auth?.connected) {
      try {
        await web3Auth.logout();
      } catch {
        // ignore
      }
    }

    await closeWeb3AuthModal(web3Auth);
  };

  const waitForConnectedWeb3Auth = async (timeoutMs = 15000) => {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const instance = web3Auth;

      if (instance?.connected && instance?.provider) {
        return instance;
      }

      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    return null;
  };

  const handleSignup = async () => {
    setError("");

    try {
      if (!agreed) {
        setError("Please agree to the Terms of Service and Privacy Policy.");
        return;
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      const web3AuthClientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;

      if (!apiBase) throw new Error("Missing NEXT_PUBLIC_API_URL");
      if (!web3AuthClientId) {
        throw new Error("Missing NEXT_PUBLIC_WEB3AUTH_CLIENT_ID");
      }

      await resetAll();
      await forceFreshWeb3AuthPopup();

      console.log("Starting Web3Auth signup flow...");
      await connect();

      const readyWeb3Auth = await waitForConnectedWeb3Auth();
      if (!readyWeb3Auth) {
        throw new Error(
          "Web3Auth connection was not ready in time. Please try again."
        );
      }

      console.log("Web3Auth connected:", {
        connected: readyWeb3Auth.connected,
        hasProvider: !!readyWeb3Auth.provider,
        providerName: readyWeb3Auth.connectedConnectorName || "unknown",
      });

      await closeWeb3AuthModal(readyWeb3Auth);

      const tokenInfo: any = await readyWeb3Auth.getIdentityToken();
      console.log("Web3Auth tokenInfo:", tokenInfo);

      const idToken =
        typeof tokenInfo === "string" ? tokenInfo : tokenInfo?.idToken;

      console.log("Has idToken:", !!idToken);
      console.log(
        "Token preview:",
        typeof idToken === "string" ? `${idToken.slice(0, 30)}...` : null
      );

      if (!idToken) {
        throw new Error("Failed to get identity token from Web3Auth");
      }

      const privKeyHexNo0x = await getWeb3AuthPrivateKey(readyWeb3Auth);
      const xrplWallet =
        await getXrplWalletFromWeb3AuthPrivKey(privKeyHexNo0x);

      const walletAddress = xrplWallet.classicAddress;
      console.log("Derived XRPL wallet address:", walletAddress);

      const resp = await fetch(`${apiBase}/auth/web3auth/sync`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ walletAddress }),
      });

      const data = await resp.json().catch(() => null);

      console.log("Backend /auth/web3auth/sync response:", {
        status: resp.status,
        ok: resp.ok,
        data,
      });

      if (!resp.ok) {
        if (resp.status === 409) {
          throw new Error(
            data?.message || "Please use your original sign-in method."
          );
        }

        throw new Error(data?.message || "Signup failed");
      }

      await closeWeb3AuthModal(readyWeb3Auth);

      const me = await refreshSession();

      if (me?.role === "buyer") {
        if (typeof window !== "undefined") {
          window.location.replace(BUYER_HOME);
          return;
        }
        router.replace(BUYER_HOME);
        return;
      }

      if (me?.role === "seller") {
        const sellerTarget = await getSellerEntryRoute();

        if (typeof window !== "undefined") {
          window.location.replace(sellerTarget);
          return;
        }
        router.replace(sellerTarget);
        return;
      }

      await routeByRole(me?.role);
    } catch (e: any) {
      console.error("Signup error:", e);
      await closeWeb3AuthModal(web3Auth);

      const msg = e?.message || "Failed to create account. Please try again.";

      if (
        msg.includes("Wallet is not connected") ||
        msg.includes("Wallet is not ready yet") ||
        msg.includes("fetch project configurations")
      ) {
        setError(
          "Web3Auth is not ready right now. Please check your internet connection and try again."
        );
        return;
      }

      if (msg.includes("Invalid Web3Auth token")) {
        setError(
          "Web3Auth token verification failed. Check the backend terminal logs for the exact reason."
        );
        return;
      }

      if (msg.includes("Email missing in Web3Auth token")) {
        setError(
          "This login provider did not return an email. Check your Web3Auth provider settings."
        );
        return;
      }

      setError(msg);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="absolute right-8 top-8">
        <button
          onClick={() => router.push("/login")}
          disabled={loading}
          className="rounded-xl border border-teal-500 px-8 py-3 text-sm font-medium text-teal-600 transition hover:bg-teal-50"
        >
          Switch to Login
        </button>
      </div>

      <div className="w-full max-w-xl">
        <div className="rounded-3xl border border-gray-100 bg-white px-12 py-12 text-center shadow-2xl">
          <div className="mb-6 flex justify-center">
            <Image
              src="/Logo.png"
              alt="RecipeChain Logo"
              width={120}
              height={120}
              priority
              className="h-auto w-[120px]"
            />
          </div>

          <p className="text-sm text-gray-500">
            A blockchain-powered recipe marketplace
          </p>

          <h2 className="mt-8 text-3xl font-bold text-gray-900">
            Create Your Account
          </h2>

          <p className="mt-3 text-sm text-gray-500">
            Join RecipeChain &amp; Buy/Sell Recipes securely.
          </p>

          <button
            onClick={handleSignup}
            disabled={loading || !agreed}
            className={[
              "mt-8 w-full rounded-xl py-4 text-base font-medium transition shadow-sm",
              loading || !agreed
                ? "cursor-not-allowed bg-gray-200 text-gray-500"
                : "bg-teal-300 text-white hover:bg-teal-400",
            ].join(" ")}
          >
            {loading ? "Connecting..." : "Sign up with Web3Auth"}
          </button>

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

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-10 text-xs text-gray-400">
            <span className="mr-3">🔒</span>
            A secure blockchain wallet will be created
            <br className="hidden sm:block" />
            automatically after signup.
          </div>

          <div className="mt-10 text-xs text-gray-400">
            No password required • Secured by Web3Auth
          </div>

          <div className="mt-6 text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-600 hover:underline">
              Click here to log in
            </Link>
          </div>

          <div className="mt-8 border-t border-gray-300" />

          <div className="mt-1 flex justify-center gap-6 border-t border-gray-100 pt-6 text-xs text-gray-400">
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