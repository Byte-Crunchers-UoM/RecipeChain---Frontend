"use client";

import { useState } from "react";
import { buyRecipeWithWalletBalance } from "@/lib/api/wallet";

type Props = {
  recipeId: string;
  onSuccessAction?: () => void;
};

export default function BuyRecipeButton({
  recipeId,
  onSuccessAction,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleBuy = async () => {
    try {
      setLoading(true);
      setMessage("");
      setError("");

      const data = await buyRecipeWithWalletBalance(recipeId);
      setMessage(data?.message || "Recipe purchased successfully");

      window.dispatchEvent(
        new CustomEvent("recipe-purchased-successfully", {
          detail: {
            title: data?.payment?.recipe_title || data?.recipe?.title || "",
            amount:
              Number(data?.payment?.amount || 0) ||
              Number(data?.recipe?.price || 0),
          },
        })
      );

      onSuccessAction?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed");
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
        className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:bg-slate-300"
      >
        {loading ? "Processing..." : "Buy with Wallet Balance"}
      </button>

      {message && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}