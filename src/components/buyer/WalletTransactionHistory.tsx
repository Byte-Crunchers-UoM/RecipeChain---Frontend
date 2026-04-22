"use client";

import type { WalletTransaction } from "@/types/wallet";

export default function WalletTransactionHistory({
  transactions,
}: {
  transactions: WalletTransaction[];
}) {
  if (!transactions.length) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-[17px] font-semibold text-slate-900">
          Wallet Transactions
        </h3>
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
          No wallet transactions yet.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-[17px] font-semibold text-slate-900">
        Wallet Transactions
      </h3>

      <div className="mt-4 space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.transaction_id}
            className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 p-4"
          >
            <div className="min-w-0">
              <p className="text-[15px] font-semibold capitalize text-slate-900">
                {tx.type}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {tx.description || "Wallet activity"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {new Date(tx.created_at).toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <p
                className={[
                  "text-sm font-semibold",
                  tx.direction === "credit" ? "text-emerald-600" : "text-rose-600",
                ].join(" ")}
              >
                {tx.direction === "credit" ? "+" : "-"}
                {Number(tx.amount || 0).toFixed(2)} XRP
              </p>
              <p className="mt-1 text-xs capitalize text-slate-400">{tx.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}