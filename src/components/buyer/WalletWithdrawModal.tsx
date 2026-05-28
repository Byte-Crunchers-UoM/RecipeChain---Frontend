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

  const resetForm = () => {
    setAmount("");
    setDestinationWallet("");
    setNote("");
    setError("");
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onCloseAction();
  };

  const handleSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setError("");

      const numericAmount = Number(amount);
      const trimmedDestinationWallet = destinationWallet.trim();
      const trimmedNote = note.trim();

      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        throw new Error("Please enter a valid withdrawal amount.");
      }

      if (!trimmedDestinationWallet) {
        throw new Error("Please enter a destination wallet address.");
      }

      if (!trimmedDestinationWallet.startsWith("r")) {
        throw new Error("Please enter a valid XRPL wallet address.");
      }

      await createWithdrawalRequest({
        amount: numericAmount,
        destinationWallet: trimmedDestinationWallet,
        note: trimmedNote,
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("wallet-withdrawal-submitted", {
            detail: { amount: numericAmount },
          })
        );
      }

      resetForm();
      onSuccessAction();
      onCloseAction();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create withdrawal request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-slate-900">Withdraw Balance</h3>

        <p className="mt-2 text-sm text-slate-500">
          Submit a withdrawal request to transfer your wallet balance to an
          external XRPL wallet.
        </p>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

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
              onChange={(event) => setAmount(event.target.value)}
              disabled={submitting}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">
              Destination Wallet
            </label>

            <input
              type="text"
              value={destinationWallet}
              onChange={(event) => setDestinationWallet(event.target.value)}
              disabled={submitting}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              placeholder="r..."
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Note</label>

            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              disabled={submitting}
              className="mt-2 min-h-[100px] w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-teal-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              placeholder="Optional note"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
}