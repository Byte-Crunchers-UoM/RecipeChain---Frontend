"use client";

import { useState } from "react";
import { createWithdrawalRequest } from "@/lib/api/wallet";

type Props = {
  open: boolean;
  onCloseAction: () => void;
  onSuccessAction: () => void;
};

export default function WalletWithdrawModal({
  open,
  onCloseAction,
  onSuccessAction,
}: Props) {
  const [amount, setAmount] = useState("");
  const [destinationWallet, setDestinationWallet] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");

      const numericAmount = Number(amount);

      await createWithdrawalRequest({
        amount: numericAmount,
        destinationWallet,
        note,
      });

      window.dispatchEvent(
        new CustomEvent("wallet-withdrawal-submitted", {
          detail: { amount: numericAmount },
        })
      );

      setAmount("");
      setDestinationWallet("");
      setNote("");
      onSuccessAction();
      onCloseAction();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create withdrawal request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-slate-900">Withdraw Balance</h3>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Amount (XRP)
            </label>
            <input
              type="number"
              min="0.000001"
              step="0.000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-teal-200"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Destination Wallet
            </label>
            <input
              type="text"
              value={destinationWallet}
              onChange={(e) => setDestinationWallet(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-teal-200"
              placeholder="r..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-2 min-h-25 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-teal-200"
            />
          </div>
        </div>S

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCloseAction}
            disabled={submitting}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:bg-slate-300"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}