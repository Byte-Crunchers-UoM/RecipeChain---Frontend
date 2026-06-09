"use client";

import { useState } from "react";

import { buyRecipeWithWalletBalance } from "@/lib/api/wallet";

type PurchaseResponse = {
  ok?: boolean;
  message?: string;
  paymentId?: string | number;
  recipeId?: string | number;
  payment?: {
    id?: string | number;
    payment_id?: string | number;
    recipe_title?: string;
    amount?: string | number;
  };
  recipe?: {
    id?: string | number;
    title?: string;
    price?: string | number;
  };
};

interface BuyRecipeButtonProps {
  recipeId: string;
  onSuccess?: (paymentId: string, recipeId: string) => void;
  onSuccessAction?: () => void;
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

export default function BuyRecipeButton({
  recipeId,
  onSuccess,
  onSuccessAction,
}: BuyRecipeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleBuy = async () => {
    if (loading) return;

    try {
      setLoading(true);
      setMessage("");
      setError("");

      const data = (await buyRecipeWithWalletBalance(
        recipeId
      )) as PurchaseResponse;

      if (data?.ok === false) {
        throw new Error(data.message || "Failed to purchase recipe");
      }

      const paymentId =
        toStringValue(data.paymentId) ||
        toStringValue(data.payment?.id) ||
        toStringValue(data.payment?.payment_id);

      const purchasedRecipeId =
        toStringValue(data.recipeId) ||
        toStringValue(data.recipe?.id) ||
        recipeId;

      if (onSuccess) {
        if (!paymentId || !purchasedRecipeId) {
          throw new Error("Invalid response: missing payment or recipe ID");
        }

        onSuccess(paymentId, purchasedRecipeId);
      }

      const successMessage = data?.message || "Recipe purchased successfully";
      setMessage(successMessage);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("recipe-purchased-successfully", {
            detail: {
              title: data?.payment?.recipe_title || data?.recipe?.title || "",
              amount:
                toNumberValue(data?.payment?.amount) ||
                toNumberValue(data?.recipe?.price),
            },
          })
        );
      }

      onSuccessAction?.();

      console.log("Recipe purchased successfully:", {
        paymentId,
        purchasedRecipeId,
      });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error occurred while purchasing recipe"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleBuy}
        disabled={loading}
        className={[
          "rounded-xl px-5 py-3 text-sm font-semibold transition",
          loading
            ? "cursor-not-allowed bg-slate-300 text-white"
            : "bg-teal-600 text-white hover:bg-teal-700",
        ].join(" ")}
      >
        {loading ? "Processing..." : "Buy with Wallet Balance"}
      </button>

      {message ? (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}