"use client";

import { useEffect, useMemo, useState } from "react";

import {
  createStripeTopupCheckoutSession,
  getXrpUsdRate,
} from "@/lib/api/wallet";
import type { XrpUsdRateQuote } from "@/lib/types/wallet";

type Props = {
  open: boolean;
  onCloseAction: () => void;
  onSuccessAction: () => void | Promise<void>;
};

const QUICK_XRP_AMOUNTS = [5, 10, 20, 50];

function formatNumber(value: number, digits = 6) {
  if (!Number.isFinite(value)) return "0";

  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits > 2 ? 0 : 2,
  });
}

export default function WalletTopUpModal({
  open,
  onCloseAction,
  onSuccessAction,
}: Props) {
  const [xrpAmount, setXrpAmount] = useState("10");
  const [quote, setQuote] = useState<XrpUsdRateQuote | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const numericXrpAmount = useMemo(() => Number(xrpAmount), [xrpAmount]);

  const estimatedUsd = useMemo(() => {
    const rate = Number(quote?.xrpUsdRate || 0);

    if (!Number.isFinite(numericXrpAmount) || numericXrpAmount <= 0) return 0;
    if (!Number.isFinite(rate) || rate <= 0) return 0;

    return Number((numericXrpAmount * rate).toFixed(2));
  }, [numericXrpAmount, quote?.xrpUsdRate]);

  useEffect(() => {
    if (!open) return;

    let active = true;

    const loadRate = async () => {
      try {
        setRateLoading(true);
        setError("");

        const data = await getXrpUsdRate();

        if (active) {
          setQuote(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load live XRP/USD rate"
          );
          setQuote(null);
        }
      } finally {
        if (active) {
          setRateLoading(false);
        }
      }
    };

    void loadRate();

    return () => {
      active = false;
    };
  }, [open]);

  if (!open) return null;

  const handleStripeCheckout = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setError("");

      if (!Number.isFinite(numericXrpAmount) || numericXrpAmount <= 0) {
        throw new Error("Please enter a valid XRP amount");
      }

      const data = await createStripeTopupCheckoutSession({
        xrpAmount: numericXrpAmount,
      });

      if (!data?.url) {
        throw new Error("Stripe checkout URL was not returned");
      }

      await onSuccessAction();

      if (typeof window !== "undefined") {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
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
          Enter the XRP amount you want to add. RecipeChain calculates the USD
          amount using the live XRP/USD rate and charges it through Stripe.
        </p>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-5">
          <label className="text-sm font-medium text-slate-700">
            Amount to receive (XRP)
          </label>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {QUICK_XRP_AMOUNTS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setXrpAmount(String(value))}
                disabled={submitting}
                className={[
                  "rounded-xl border px-3 py-2 text-sm font-medium transition",
                  submitting ? "cursor-not-allowed opacity-60" : "",
                  Number(xrpAmount) === value
                    ? "border-teal-600 bg-teal-50 text-teal-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {value} XRP
              </button>
            ))}
          </div>

          <input
            type="number"
            min="0.000001"
            step="0.000001"
            value={xrpAmount}
            onChange={(event) => setXrpAmount(event.target.value)}
            disabled={submitting}
            className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
            placeholder="Enter XRP amount"
          />
        </div>

        <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm text-slate-700">
          {rateLoading ? (
            <p>Loading live XRP/USD rate...</p>
          ) : quote?.xrpUsdRate ? (
            <>
              <p className="font-semibold text-slate-900">
                Stripe will charge approximately ${formatNumber(estimatedUsd, 2)}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Live rate: 1 XRP = ${formatNumber(Number(quote.xrpUsdRate), 6)}
                USD {quote.cached ? "(cached)" : ""}
              </p>
            </>
          ) : (
            <p>Live rate is unavailable. Try again in a moment.</p>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
          Test card: 4242 4242 4242 4242 • any future expiry • any CVC.
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCloseAction}
            disabled={submitting}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleStripeCheckout}
            disabled={submitting || rateLoading || !quote?.xrpUsdRate}
            className="rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting
              ? "Redirecting..."
              : `Get ${numericXrpAmount || 0} XRP`}
          </button>
        </div>
      </div>
    </div>
  );
}