// src/components/recipe/RecipePaymentModel.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Client, xrpToDrops, type Payment } from "xrpl";
import { useWeb3Auth } from "@web3auth/modal/react";
import {
  AlertTriangle,
  X,
  CheckCircle,
  ShieldCheck,
  Coins,
  PartyPopper,
} from "lucide-react";

import { Recipe } from "@/lib/types/Recipe";
import { getXrplWalletFromWeb3AuthPrivKey } from "@/lib/xrpl/getXrplWallet";

interface RecipePaymentModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * This is your friend's old working fallback platform wallet address.
 *
 * Scenario 1:
 * If NEXT_PUBLIC_PLATFORM_XRPL_ADDRESS exists in frontend .env.local,
 * payment uses that env address.
 *
 * Scenario 2:
 * If NEXT_PUBLIC_PLATFORM_XRPL_ADDRESS does not exist,
 * payment uses this fallback address, matching the old working payment logic.
 *
 * IMPORTANT:
 * This public address must match backend XRPL_TREASURY_ADDRESS.
 * Never put XRPL_TREASURY_SECRET in frontend.
 */
const FALLBACK_PLATFORM_XRPL_ADDRESS = "rMCnGCWskZYWMd5Vr6SeCmPF1kgg2jX2tX";

const DEFAULT_XRPL_TESTNET = "wss://s.altnet.rippletest.net:51233";

function getRecipeId(recipe: Recipe): string {
  const recipeId = recipe.recipe_id;

  if (recipeId === null || recipeId === undefined) {
    return "";
  }

  return String(recipeId);
}

function getRecipePrice(recipe: Recipe): number {
  const price = Number(recipe.price);

  return Number.isFinite(price) ? price : 0;
}

function stringToHex(value: string): string {
  const bytes = new TextEncoder().encode(value);

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function getXrplTransactionResult(result: unknown): string | null {
  const submitResult = result as {
    result?: {
      meta?: string | { TransactionResult?: string };
    };
  };

  const meta = submitResult?.result?.meta;

  if (typeof meta === "string") {
    return meta;
  }

  return meta?.TransactionResult || null;
}

function getXrplTransactionHash(result: unknown): string | null {
  const submitResult = result as {
    result?: {
      hash?: string;
    };
  };

  return submitResult?.result?.hash || null;
}

async function parseBackendError(response: Response): Promise<string> {
  try {
    const data = await response.json();

    return data?.message || data?.error || "Backend verification failed.";
  } catch {
    return "Backend verification failed.";
  }
}

export default function RecipePaymentModal({
  recipe,
  isOpen,
  onClose,
  onSuccess,
}: RecipePaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const { provider } = useWeb3Auth();

  const networkUrl = useMemo(() => {
    return (
      process.env.NEXT_PUBLIC_XRPL_NETWORK?.trim() || DEFAULT_XRPL_TESTNET
    );
  }, []);

  const platformAddress = useMemo(() => {
    return (
      process.env.NEXT_PUBLIC_PLATFORM_XRPL_ADDRESS?.trim() ||
      FALLBACK_PLATFORM_XRPL_ADDRESS
    );
  }, []);

  useEffect(() => {
    if (!isOpen) {
      const timer = window.setTimeout(() => {
        setIsSuccess(false);
        setErrorMsg(null);
        setIsProcessing(false);
      }, 300);

      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [isOpen]);

  if (!isOpen || !recipe) return null;

  const recipeId = getRecipeId(recipe);
  const recipePrice = getRecipePrice(recipe);

  const executePurchase = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setErrorMsg(null);

    if (!recipeId) {
      setErrorMsg("Recipe ID is missing. Please refresh and try again.");
      setIsProcessing(false);
      return;
    }

    if (!recipePrice || recipePrice <= 0) {
      setErrorMsg(
        "This recipe is free and does not require a payment transaction."
      );
      setIsProcessing(false);
      return;
    }

    if (!platformAddress) {
      setErrorMsg("Platform XRPL address is not configured.");
      setIsProcessing(false);
      return;
    }

    if (!provider) {
      setErrorMsg("Web3 provider not found. Please log in again.");
      setIsProcessing(false);
      return;
    }

    const client = new Client(networkUrl);

    try {
      await client.connect();

      const privateKey = (await provider.request({
        method: "private_key",
      })) as string;

      if (!privateKey) {
        throw new Error("Could not get private key from Web3Auth");
      }

      const userWallet = await getXrplWalletFromWeb3AuthPrivKey(privateKey);

      const recipeIdHex = stringToHex(recipeId);
      const actionHex = stringToHex("RecipePurchase");

      /**
       * TypeScript fix:
       * Explicitly type this transaction as XRPL Payment.
       * Otherwise TypeScript can treat TransactionType as general string and
       * compare it with unrelated XRPL transaction types.
       */
      const tx: Payment = {
        TransactionType: "Payment",
        Account: userWallet.classicAddress,
        Destination: platformAddress,
        Amount: xrpToDrops(String(recipePrice)),
        Memos: [
          {
            Memo: {
              MemoType: actionHex,
              MemoData: recipeIdHex,
            },
          },
        ],
      };

      const prepared = await client.autofill(tx);
      const signed = userWallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);

      const txHash = getXrplTransactionHash(result);
      const txResult = getXrplTransactionResult(result);

      if (!txHash || txResult !== "tesSUCCESS") {
        throw new Error(
          `XRPL Transaction failed. Status: ${txResult || "Unknown"}`
        );
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

      /**
       * This keeps your friend's old backend verification method:
       * Frontend sends recipeId + XRPL tx hash.
       * Backend verifies the real XRPL transaction and unlocks the recipe.
       */
      const response = await fetch(`${apiUrl}/recipes/unlock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          recipeId,
          transactionHash: txHash,
        }),
      });

      if (!response.ok) {
        const backendError = await parseBackendError(response);
        throw new Error(backendError);
      }

      window.dispatchEvent(
        new CustomEvent("recipe-purchased-successfully", {
          detail: {
            recipeId,
            title: recipe.title || "Recipe",
            amount: recipePrice,
            transactionHash: txHash,
          },
        })
      );

      window.dispatchEvent(new Event("recipechain-wallet-refresh"));
      window.dispatchEvent(new Event("buyer-profile-updated"));

      setIsSuccess(true);
    } catch (error: unknown) {
      console.error("Purchase error:", error);

      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes("tecUNFUNDED_PAYMENT") ||
        errorMessage.toLowerCase().includes("insufficient funds") ||
        errorMessage.toLowerCase().includes("insufficient payment")
      ) {
        setErrorMsg(
          "You do not have enough XRP to buy this recipe. Please top up your wallet and try again."
        );
      } else if (
        errorMessage.toLowerCase().includes("user rejected") ||
        errorMessage.toLowerCase().includes("declined") ||
        errorMessage.toLowerCase().includes("cancelled")
      ) {
        setErrorMsg("Payment was cancelled by the user.");
      } else if (errorMessage.toLowerCase().includes("already")) {
        setErrorMsg("You already purchased this recipe. Open it from My Cookbook.");
      } else if (errorMessage.toLowerCase().includes("destination")) {
        setErrorMsg(
          "Payment destination mismatch. Check that frontend platform address matches backend XRPL_TREASURY_ADDRESS."
        );
      } else {
        setErrorMsg(
          errorMessage || "Failed to complete purchase. Please try again."
        );
      }
    } finally {
      try {
        if (client.isConnected()) {
          await client.disconnect();
        }
      } catch (disconnectError) {
        console.warn("XRPL client disconnect warning:", disconnectError);
      }

      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={!isProcessing && !isSuccess ? onClose : undefined}
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
        <div
          className={`h-2 transition-colors duration-500 ${
            isSuccess
              ? "bg-emerald-500"
              : "bg-gradient-to-r from-teal-500 to-blue-500"
          }`}
        />

        {!isSuccess ? (
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close payment modal"
          >
            <X size={20} />
          </button>
        ) : null}

        {isSuccess ? (
          <div className="p-10 text-center animate-in zoom-in duration-500">
            <div className="relative mx-auto mb-6 h-24 w-24">
              <div className="absolute inset-0 rounded-full bg-emerald-100 opacity-75 animate-ping" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
                <PartyPopper className="h-12 w-12 animate-bounce text-emerald-500" />
              </div>
            </div>

            <h3 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900">
              Recipe Unlocked!
            </h3>

            <p className="mb-8 leading-relaxed text-slate-500">
              Payment successful. Your XRP payment was confirmed and you now
              have full access to this recipe.
            </p>

            <button
              type="button"
              onClick={onSuccess}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-600 active:scale-[0.98]"
            >
              <CheckCircle className="h-5 w-5" />
              View Full Recipe
            </button>
          </div>
        ) : (
          <div className="p-8">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-50">
                  <Coins size={40} className="text-teal-600" />
                </div>

                <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1 shadow-sm">
                  <ShieldCheck size={24} className="text-blue-500" />
                </div>
              </div>
            </div>

            <div className="mb-8 text-center">
              <h3 className="text-2xl font-bold text-slate-900">
                Unlock Recipe?
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                This will send XRP from your XRPL Testnet wallet and then verify
                the transaction with RecipeChain.
              </p>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="mb-3 flex items-center justify-between gap-4">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Item
                </span>

                <span className="max-w-[220px] truncate text-sm font-semibold text-slate-800">
                  {recipe.title || "Recipe"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Total Price
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black text-teal-600">
                    {recipePrice.toFixed(2)}
                  </span>
                  <span className="text-xs font-bold text-teal-500">XRP</span>
                </div>
              </div>
            </div>

            <div className="mb-4 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <AlertTriangle className="shrink-0 text-amber-500" size={20} />

              <p className="text-[13px] leading-snug text-amber-800">
                This action will deduct XRP from your XRPL Testnet wallet. Make
                sure your wallet has enough XRP before confirming.
              </p>
            </div>

            {errorMsg ? (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-center text-[13px] font-medium text-red-600 animate-in fade-in duration-200">
                {errorMsg}
              </div>
            ) : null}

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={executePurchase}
                disabled={isProcessing}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 py-4 font-bold text-white shadow-lg shadow-teal-200 transition-all hover:bg-teal-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Processing XRP Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Confirm & Pay
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="w-full rounded-2xl bg-white py-4 font-semibold text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
