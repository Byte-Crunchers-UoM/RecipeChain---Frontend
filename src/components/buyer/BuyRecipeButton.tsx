import { useState } from "react";
import { BuyRecipeResponse, buyRecipeWithWalletBalance } from "@/lib/api/wallet";

interface BuyRecipeButtonProps {
  recipeId: string;
  onSuccess?: (paymentId: string, recipeId: string) => void;
}

export default function BuyRecipeButton({
  recipeId,
  onSuccess,
}: BuyRecipeButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBuy = async () => {
    setLoading(true);
    setError("");

    try {
      const response: BuyRecipeResponse = await buyRecipeWithWalletBalance(recipeId);

      if (!response.ok) {
        setError(response.message || "Failed to purchase recipe");
        return;
      }

      // Correctly access paymentId and recipeId
      const paymentId = response.paymentId;
      const purchasedRecipeId = response.recipeId;

      if (!paymentId || !purchasedRecipeId) {
        setError("Invalid response: missing payment or recipe ID");
        return;
      }

      if (onSuccess) {
        onSuccess(paymentId, purchasedRecipeId);
      }

      console.log("Recipe purchased successfully:", {
        paymentId,
        purchasedRecipeId,
      });
    } catch (err: any) {
      setError(err.message || "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleBuy}
        disabled={loading}
        className={`rounded-xl px-6 py-3 font-medium transition ${
          loading ? "bg-gray-200 text-gray-500" : "bg-teal-600 text-white hover:bg-teal-700"
        }`}
      >
        {loading ? "Processing..." : "Buy Recipe"}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}