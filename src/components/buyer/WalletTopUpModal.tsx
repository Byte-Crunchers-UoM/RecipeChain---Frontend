"use client";

import { useMemo, useState } from "react";
import { createStripeTopupCheckoutSession } from "@/lib/api/wallet";

type Props = {
  open: boolean;
  onCloseAction: () => void;
  onSuccessAction: () => void;
};

const QUICK_AMOUNTS = [5, 10, 20, 50];

export default function WalletTopUpModal({
  open,
  onCloseAction,
  onSuccessAction,
}: Props) {
  const [amount, setAmount] = useState("10");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const numericAmount = useMemo(() => Number(amount), [amount]);

  if (!open) return null;

  const handleStripeCheckout = async () => {
    try {
      setSubmitting(true);
      setError("");

      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new Error("Please enter a valid amount");
      }

      const data = await createStripeTopupCheckoutSession({
        amount: numericAmount,
      });

      if (!data?.url) {
        throw new Error("Stripe checkout URL was not returned");
      }

      onSuccessAction();
      window.location.href = data.url;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start Stripe Checkout"
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-slate-900">Top Up Wallet</h3>
        <p className="mt-2 text-sm text-slate-500">
          Pay with Stripe test card and top up your RecipeChain wallet balance.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5">
          <label className="text-sm font-medium text-slate-700">
            Amount (XRP)
          </label>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {QUICK_AMOUNTS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(String(value))}
                className={[
                  "rounded-xl border px-3 py-2 text-sm font-medium transition",
                  Number(amount) === value
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {value}
              </button>
            ))}
          </div>

          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-teal-200"
            placeholder="Enter amount"
          />
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
          Test card: 4242 4242 4242 4242 • any future expiry • any CVC.
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCloseAction}
            disabled={submitting}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleStripeCheckout}
            disabled={submitting}
            className="rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:bg-slate-300"
          >
            {submitting ? "Redirecting..." : "Pay with Card"}
          </button>
        </div>
      </div>
    </div>
  );
}