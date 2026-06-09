// src/components/recipe/RecipePaymentModel.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  X,
  CheckCircle,
  ShieldCheck,
  Coins,
  PartyPopper,
} from "lucide-react";

import { Recipe } from "@/lib/types/Recipe";
import {
  buyRecipeWithWalletBalance,
  type BuyRecipeResponse,
} from "@/lib/api/wallet";

interface RecipePaymentModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function toStringValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
}

function toNumberValue(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getResponsePaymentId(data: BuyRecipeResponse): string {
  return (
    toStringValue(data.paymentId) ||
    toStringValue(data.payment?.id) ||
    toStringValue(data.payment?.payment_id)
  );
}

function getResponseRecipeId(data: BuyRecipeResponse, fallbackRecipeId: string) {
  return (
    toStringValue(data.recipeId) ||
    toStringValue(data.recipe?.id) ||
    fallbackRecipeId
  );
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

  const price = toNumberValue(recipe.price);

  const executePurchase = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setErrorMsg(null);

    if (!recipe.recipe_id) {
      setErrorMsg("Recipe ID is missing. Please refresh and try again.");
      setIsProcessing(false);
      return;
    }

    if (price <= 0) {
      setErrorMsg("This recipe is free and does not require wallet payment.");
      setIsProcessing(false);
      return;
    }

    try {
      const data = await buyRecipeWithWalletBalance(recipe.recipe_id);

      if (data?.ok === false) {
        throw new Error(data.message || "Failed to purchase recipe");
      }

      const paymentId = getResponsePaymentId(data);
      const purchasedRecipeId = getResponseRecipeId(data, recipe.recipe_id);

      const purchaseDetail = {
        title: data.payment?.recipe_title || data.recipe?.title || recipe.title || "",
        amount:
          toNumberValue(data.payment?.amount) ||
          toNumberValue(data.recipe?.price) ||
          price,
        paymentId,
        recipeId: purchasedRecipeId,
      };

      if (process.env.NODE_ENV !== "production") {
        console.log("Recipe purchased successfully:", purchaseDetail);
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("recipe-purchased-successfully", {
            detail: purchaseDetail,
          })
        );
      }

      setIsSuccess(true);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to complete purchase. Please try again.";

      if (errorMessage.toLowerCase().includes("insufficient")) {
        setErrorMsg(
          "You do not have enough RecipeChain wallet balance to buy this recipe. Please top up your wallet and try again."
        );
      } else if (errorMessage.toLowerCase().includes("already purchased")) {
        setErrorMsg("You already purchased this recipe.");
      } else {
        setErrorMsg(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={!isProcessing && !isSuccess ? onClose : undefined}
      />

      <div className="relative z-10 w-full max-w-md animate-in overflow-hidden rounded-3xl bg-white shadow-2xl fade-in zoom-in duration-300">
        <div
          className={[
            "h-2 transition-colors duration-500",
            isSuccess
              ? "bg-emerald-500"
              : "bg-linear-to-r from-teal-500 to-blue-500",
          ].join(" ")}
        />

        {!isSuccess ? (
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close payment modal"
          >
            <X size={20} />
          </button>
        ) : null}

        {isSuccess ? (
          <div className="animate-in p-10 text-center zoom-in duration-500">
            <div className="relative mx-auto mb-6 h-24 w-24">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-75" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
                <PartyPopper className="h-12 w-12 animate-bounce text-emerald-500" />
              </div>
            </div>

            <h3 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900">
              Recipe Unlocked!
            </h3>

            <p className="mb-8 leading-relaxed text-slate-500">
              Payment successful. This recipe is now available in your cookbook,
              and your RecipeChain wallet balance has been updated.
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
                Pay securely using your RecipeChain wallet balance.
              </p>
            </div>

            <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Item
                </span>

                <span className="max-w-45 truncate text-sm font-semibold text-slate-800">
                  {recipe.title}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Total Price
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black text-teal-600">
                    {price.toFixed(2)}
                  </span>

                  <span className="text-xs font-bold text-teal-500">XRP</span>
                </div>
              </div>
            </div>

            <div className="mb-4 flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <AlertTriangle className="shrink-0 text-amber-500" size={20} />

              <p className="text-[13px] leading-snug text-amber-800">
                This will deduct XRP from your RecipeChain buyer wallet balance.
                Make sure your wallet has enough balance before confirming.
              </p>
            </div>

            {errorMsg ? (
              <div className="mb-4 animate-in rounded-xl border border-red-100 bg-red-50 p-3 text-center text-[13px] font-medium text-red-600 fade-in duration-200">
                {errorMsg}
              </div>
            ) : null}

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={executePurchase}
                disabled={isProcessing}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 py-4 font-bold text-white shadow-lg shadow-teal-200 transition-all hover:bg-teal-700 active:scale-[0.98] disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Processing Payment...
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
                className="w-full rounded-2xl bg-white py-4 font-semibold text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"
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