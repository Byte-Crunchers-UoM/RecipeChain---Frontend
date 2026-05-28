"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ReceiptText,
  RotateCcw,
  WalletCards,
} from "lucide-react";

import type { WalletTransaction } from "@/types/wallet";

type Props = {
  transactions: WalletTransaction[];
};

type TransactionLike = WalletTransaction & {
  id?: string | number | null;
  tx_hash?: string | null;
  amount_xrp?: string | number | null;
  time_stamp?: string | null;
  date?: string | null;
};

const COMPACT_LIMIT = 3;
const EXPANDED_PAGE_SIZE = 5;

function getTransactionId(tx: TransactionLike, index: number) {
  return String(
    tx.transaction_id ||
      tx.id ||
      tx.tx_hash ||
      `${tx.type || "transaction"}-${
        tx.created_at || tx.time_stamp || tx.date || index
      }`
  );
}

function getAmount(tx: TransactionLike) {
  return Number(tx.amount_xrp ?? tx.amount ?? 0);
}

function getDateValue(tx: TransactionLike) {
  return tx.created_at || tx.time_stamp || tx.date || "";
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "Recent";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "Recent";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function normalizeType(type?: string | null) {
  return String(type || "transaction").trim().toLowerCase();
}

function formatType(type?: string | null) {
  const normalized = normalizeType(type);

  const map: Record<string, string> = {
    topup: "Top Up",
    "top-up": "Top Up",
    purchase: "Recipe Purchase",
    buy: "Recipe Purchase",
    withdraw: "Withdrawal",
    withdrawal: "Withdrawal",
    refund: "Refund",
    sale: "Sale",
    transfer: "Transfer",
  };

  return map[normalized] || normalized.replace(/_/g, " ");
}

function getDescription(tx: TransactionLike) {
  if (tx.description) return tx.description;

  const type = normalizeType(tx.type);

  if (type === "topup" || type === "top-up") return "Card top-up completed";
  if (type === "purchase" || type === "buy") return "Recipe purchase completed";
  if (type === "withdraw" || type === "withdrawal") return "Withdrawal request";
  if (type === "refund") return "Refund transaction";
  if (type === "sale") return "Recipe sale received";

  return "Wallet transaction";
}

function isCredit(tx: TransactionLike) {
  const direction = String(tx.direction || "").toLowerCase();
  const type = normalizeType(tx.type);

  if (direction === "credit") return true;
  if (direction === "debit") return false;

  return ["topup", "top-up", "refund", "sale"].includes(type);
}

function getStatusClass(status?: string | null) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "completed" || normalized === "success") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (normalized === "pending" || normalized === "processing") {
    return "bg-amber-50 text-amber-700";
  }

  if (
    normalized === "failed" ||
    normalized === "cancelled" ||
    normalized === "rejected"
  ) {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

function getIcon(tx: TransactionLike) {
  const type = normalizeType(tx.type);
  const credit = isCredit(tx);

  if (type === "topup" || type === "top-up") {
    return <CreditCard className="h-4 w-4" />;
  }

  if (type === "purchase" || type === "buy") {
    return <ReceiptText className="h-4 w-4" />;
  }

  if (type === "withdraw" || type === "withdrawal") {
    return <ArrowUpRight className="h-4 w-4" />;
  }

  if (type === "refund") {
    return <RotateCcw className="h-4 w-4" />;
  }

  if (credit) {
    return <ArrowDownLeft className="h-4 w-4" />;
  }

  return <WalletCards className="h-4 w-4" />;
}

function TransactionRow({
  tx,
  index,
}: {
  tx: TransactionLike;
  index: number;
}) {
  const amount = getAmount(tx);
  const credit = isCredit(tx);
  const status = tx.status || "completed";
  const sign = credit ? "+" : "-";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-teal-200 hover:bg-slate-50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <div
            className={[
              "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
              credit
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700",
            ].join(" ")}
          >
            {getIcon(tx)}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold capitalize text-slate-900">
              {formatType(tx.type)}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {getDescription(tx)}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {formatDate(getDateValue(tx))}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p
            className={[
              "text-base font-bold",
              credit ? "text-emerald-700" : "text-red-600",
            ].join(" ")}
          >
            {sign}
            {Math.abs(amount).toFixed(2)} XRP
          </p>

          <span
            className={[
              "mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
              getStatusClass(status),
            ].join(" ")}
          >
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function WalletTransactionHistory({ transactions }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(1);

  const sortedTransactions = useMemo(() => {
    return [...(transactions || [])].sort((a, b) => {
      const dateA = new Date(getDateValue(a)).getTime();
      const dateB = new Date(getDateValue(b)).getTime();

      if (Number.isNaN(dateA) && Number.isNaN(dateB)) return 0;
      if (Number.isNaN(dateA)) return 1;
      if (Number.isNaN(dateB)) return -1;

      return dateB - dateA;
    });
  }, [transactions]);

  const totalTransactions = sortedTransactions.length;
  const hasMoreThanCompact = totalTransactions > COMPACT_LIMIT;
  const totalPages = Math.max(
    1,
    Math.ceil(totalTransactions / EXPANDED_PAGE_SIZE)
  );

  const safePage = Math.min(page, totalPages);

  const visibleTransactions = useMemo(() => {
    if (!expanded) {
      return sortedTransactions.slice(0, COMPACT_LIMIT);
    }

    const start = (safePage - 1) * EXPANDED_PAGE_SIZE;
    const end = start + EXPANDED_PAGE_SIZE;

    return sortedTransactions.slice(start, end);
  }, [expanded, safePage, sortedTransactions]);

  const handleSeeMore = () => {
    setExpanded(true);
    setPage(1);
  };

  const handleSeeLess = () => {
    setExpanded(false);
    setPage(1);
  };

  const handlePrevious = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const handleNext = () => {
    setPage((current) => Math.min(totalPages, current + 1));
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[17px] font-semibold text-slate-900">
            Wallet Transactions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {totalTransactions === 0
              ? "No wallet transactions yet."
              : expanded
              ? `Showing page ${safePage} of ${totalPages}`
              : `Showing latest ${Math.min(
                  COMPACT_LIMIT,
                  totalTransactions
                )} of ${totalTransactions}`}
          </p>
        </div>

        {hasMoreThanCompact ? (
          <button
            type="button"
            onClick={expanded ? handleSeeLess : handleSeeMore}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {expanded ? "See Less" : "See More"}
          </button>
        ) : null}
      </div>

      {totalTransactions === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5">
          <p className="text-[16px] font-medium text-slate-800">
            No wallet transactions yet.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Top-ups, purchases, withdrawals, and refunds will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-3">
            {visibleTransactions.map((tx, index) => (
              <TransactionRow
                key={getTransactionId(tx, index)}
                tx={tx}
                index={index}
              />
            ))}
          </div>

          {expanded && totalPages > 1 ? (
            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page {safePage} of {totalPages} • {totalTransactions}{" "}
                transactions
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={safePage === 1}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={safePage === totalPages}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}