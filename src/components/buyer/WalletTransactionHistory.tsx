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
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
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
        {transactions.map((tx) => {
          const amount = Number(tx.amount || 0);
          const isCredit = tx.direction === "credit";

          return (
            <div
              key={tx.transaction_id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4"
            >
              <div className="min-w-0">
                <p className="text-[14px] font-semibold capitalize text-slate-900">
                  {tx.type}
                </p>

                <p className="mt-2 text-[14px] text-slate-700">
                  {tx.description || "Wallet activity"}
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  {new Date(tx.created_at).toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <p
                  className={[
                    "text-[18px] font-extrabold tracking-tight",
                    isCredit ? "text-emerald-700" : "text-rose-700",
                  ].join(" ")}
                >
                  {isCredit ? "+" : "-"}
                  {amount.toFixed(2)} XRP
                </p>

                <p
                  className={[
                    "mt-2 text-sm font-semibold capitalize",
                    tx.status === "completed"
                      ? "text-emerald-700"
                      : tx.status === "pending"
                      ? "text-amber-700"
                      : tx.status === "failed" || tx.status === "rejected"
                      ? "text-rose-700"
                      : "text-slate-700",
                  ].join(" ")}
                >
                  {tx.status}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}