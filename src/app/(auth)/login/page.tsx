"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3Auth, useWeb3AuthConnect } from "@web3auth/modal/react";

import { useAuth } from "@/context/AuthContext";
import { getWeb3AuthPrivateKey } from "@/lib/web3/getWeb3AuthPrivKey";
import { deriveXrplAddressFromWeb3AuthPrivKey } from "@/lib/xrpl/deriveXrpl";
import { closeWeb3AuthModal } from "@/lib/web3/closeWeb3AuthModal";
import { getSellerEntryRoute } from "@/lib/getSellerEntryRoute";

const BUYER_HOME = "/buyer/profile";

type IdentityTokenResult =
  | string
  | {
      idToken?: string;
    }
  | null
  | undefined;

type AppRole = "seller" | "buyer" | null | undefined;

type SyncResponse =
  | {
      message?: string;
    }
  | null;

/**
 * Safely reads the backend sync response.
 *
 * @param resp - Response returned by the auth sync endpoint.
 * @returns Parsed JSON response, or null when the response body is empty/invalid.
 */
const readSyncResponse = async (resp: Response): Promise<SyncResponse> => {
  return resp.json().catch(() => null);
};

/**
 * Renders the login page and runs the Web3Auth-based session sync flow.
 *
 * @returns Login page UI.
 */
export default function LoginPage() {
  const router = useRouter();
  const { refreshSession, resetAll } = useAuth();

  const { web3Auth } = useWeb3Auth();
  const { connect, loading } = useWeb3AuthConnect();

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAuthBusy = loading || submitting;

  /**
   * Sends the user to the correct first page after backend session refresh.
   *
   * @param role - Role returned by the refreshed RecipeChain session.
   * @returns Promise that resolves after navigation is requested.
   */
  const routeByRole = async (role: AppRole): Promise<void> => {
    let target = "/select-role";

    if (role === "seller") {
      // Seller access depends on KYC status, so the entry route must be resolved dynamically.
      target = await getSellerEntryRoute();
    } else if (role === "buyer") {
      target = BUYER_HOME;
    }

    if (typeof window !== "undefined") {
      // Full navigation ensures new auth cookies are visible to middleware/protected layouts.
      window.location.replace(target);
      return;
    }

    router.replace(target);
  };

  /**
   * Clears any existing Web3Auth connection before starting a new login attempt.
   *
   * @returns Promise that resolves after the old Web3Auth state/modal is cleared.
   */
  const forceFreshWeb3AuthPopup = async (): Promise<void> => {
    if (web3Auth?.connected) {
      try {
        await web3Auth.logout();
      } catch {
        // Logout is best-effort because a stale Web3Auth session should not block a fresh attempt.
      }
    }

    await closeWeb3AuthModal(web3Auth);
  };

  /**
   * Waits until Web3Auth exposes both connection state and provider.
   *
   * @param timeoutMs - Maximum time to wait for Web3Auth readiness.
   * @returns Connected Web3Auth instance, or null when readiness times out.
   */
  const waitForConnectedWeb3Auth = async (timeoutMs = 15000) => {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
      const instance = web3Auth;

      if (instance?.connected && instance?.provider) {
        return instance;
      }

      await new Promise<void>((resolve) => {
        setTimeout(resolve, 250);
      });
    }

    return null;
  };

  /**
   * Logs in the user by syncing Web3Auth identity with the RecipeChain backend.
   *
   * @returns Promise that resolves after login succeeds or an error is shown.
   */
  const handleLogin = async (): Promise<void> => {
    if (isAuthBusy) return;

    setError("");
    setSubmitting(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL;
      const web3AuthClientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;

      if (!apiBase) {
        throw new Error("Missing NEXT_PUBLIC_API_URL");
      }

      if (!web3AuthClientId) {
        // Surfacing this early avoids confusing Web3Auth errors later in the flow.
        throw new Error("Missing NEXT_PUBLIC_WEB3AUTH_CLIENT_ID");
      }

      await resetAll();
      await forceFreshWeb3AuthPopup();

      await connect();

      const readyWeb3Auth = await waitForConnectedWeb3Auth();

      if (!readyWeb3Auth) {
        throw new Error(
          "Web3Auth connection was not ready in time. Please try again."
        );
      }

      // IMPORTANT: get token and wallet data before closing the Web3Auth modal.
      // Closing the modal too early can make Web3Auth/provider state unavailable.
      const tokenInfo: IdentityTokenResult =
        await readyWeb3Auth.getIdentityToken();

      const idToken =
        typeof tokenInfo === "string" ? tokenInfo : tokenInfo?.idToken;

      if (!idToken) {
        throw new Error("Failed to get identity token from Web3Auth");
      }

      const privKeyHexNo0x = await getWeb3AuthPrivateKey(readyWeb3Auth);

      // The private key is used only in the browser to derive the public XRPL address.
      // Never send the private key to the backend.
      const walletAddress =
        await deriveXrplAddressFromWeb3AuthPrivKey(privKeyHexNo0x);

      await closeWeb3AuthModal(readyWeb3Auth);

      const resp = await fetch(`${apiBase}/auth/web3auth/sync`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ walletAddress }),
      });

      const data = await readSyncResponse(resp);

      if (!resp.ok) {
        if (resp.status === 409) {
          // Provider mismatch errors need a clear recovery path for users.
          setError(data?.message || "Please use your original sign-in method.");
          return;
        }

        throw new Error(data?.message || "Login failed");
      }

      const me = await refreshSession();
      await routeByRole(me?.role);
    } catch (e: unknown) {
      console.error("Login error:", e);
      await closeWeb3AuthModal(web3Auth);

      const msg =
        e instanceof Error ? e.message : "Login failed. Please try again.";

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

      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="absolute right-8 top-8">
        <button
          onClick={() => router.push("/signup")}
          disabled={isAuthBusy}
          className="rounded-xl border border-teal-500 px-6 py-3 text-sm font-medium text-teal-600 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Switch to Sign Up
        </button>
      </div>

      <div className="w-full max-w-xl">
        <div className="rounded-3xl border border-gray-100 bg-white px-10 py-12 text-center shadow-2xl">
          <div className="mb-6 flex justify-center">
            <Image
              src="/Logo.png"
              alt="RecipeChain Logo"
              width={120}
              height={120}
              priority
              className="h-auto w-30"
            />
          </div>

          <p className="text-sm text-gray-500">
            A blockchain-powered recipe marketplace
          </p>

          <h2 className="mt-8 text-3xl font-bold text-gray-900">
            Log in to your Account
          </h2>

          <p className="mt-3 text-sm text-gray-500">
            Welcome back to RecipeChain!
          </p>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isAuthBusy}
            className={[
              "mt-10 w-full rounded-xl py-4 text-lg font-semibold shadow-md transition",
              isAuthBusy
                ? "cursor-not-allowed bg-gray-200 text-gray-500"
                : "bg-teal-600 text-white hover:bg-teal-700",
            ].join(" ")}
          >
            {isAuthBusy ? "Connecting..." : "Continue with Web3Auth"}
          </button>

          <div className="mt-6 text-xs text-gray-400">
            No password required • Secured by Web3Auth
          </div>

          <div className="mt-8 text-sm text-gray-500">
            New user?{" "}
            <Link
              href="/signup"
              className="font-medium text-teal-600 hover:underline"
            >
              Click here to sign up
            </Link>
          </div>

          <div className="mt-6 border-t border-gray-300" />

          <div className="mt-6 flex justify-center gap-2 border-t border-gray-100 pt-6 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-gray-600">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-gray-600">
              Terms of Service
            </Link>
          </div>

          <div className="mt-3 text-xs text-gray-400">
            © {new Date().getFullYear()} RecipeChain. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}