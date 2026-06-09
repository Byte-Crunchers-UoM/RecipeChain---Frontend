"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  PencilLine,
  ReceiptText,
  Star,
} from "lucide-react";

import type {
  BuyerActivityItem,
  BuyerActivityType,
} from "@/lib/types/buyer";

type ActivityFilter = "all" | BuyerActivityType;

type Props = {
  activities: BuyerActivityItem[];
  totalPurchases: number;
  feedbackCount: number;
};

const COMPACT_LIMIT = 3;
const EXPANDED_PAGE_SIZE = 5;

const filterOptions: { label: string; value: ActivityFilter }[] = [
  { label: "All Activities", value: "all" },
  { label: "Recipe Purchases", value: "purchase" },
  { label: "Recipe Reviews", value: "review" },
  { label: "Profile Updates", value: "profile_update" },
];

function getActivityId(activity: BuyerActivityItem, index: number) {
  return String(activity.id || `${activity.type}-${activity.date}-${index}`);
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

function getActivityIcon(type: BuyerActivityType) {
  if (type === "purchase") {
    return <ReceiptText className="h-4 w-4" />;
  }

  if (type === "review") {
    return <Star className="h-4 w-4" />;
  }

  return <PencilLine className="h-4 w-4" />;
}

function getActivityIconClass(type: BuyerActivityType) {
  if (type === "purchase") {
    return "bg-red-50 text-red-600";
  }

  if (type === "review") {
    return "bg-yellow-50 text-yellow-600";
  }

  return "bg-teal-50 text-teal-600";
}

function getActivityTypeLabel(type: BuyerActivityType) {
  if (type === "purchase") return "Recipe Purchase";
  if (type === "review") return "Recipe Review";
  return "Profile Update";
}

function ActivityRow({ activity }: { activity: BuyerActivityItem }) {
  const amount = Number(activity.amount_xrp || 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-teal-200 hover:bg-slate-50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <div
            className={[
              "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
              getActivityIconClass(activity.type),
            ].join(" ")}
          >
            {getActivityIcon(activity.type)}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              {getActivityTypeLabel(activity.type)}
            </p>

            <p className="mt-1 truncate text-sm font-medium text-slate-800">
              {activity.title}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {activity.description ||
                (activity.type === "purchase"
                  ? "Recipe purchase completed"
                  : activity.type === "review"
                  ? "Recipe review submitted"
                  : "Buyer profile updated")}
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {formatDate(activity.date)}
              {amount > 0 ? ` • ${amount.toFixed(2)} XRP` : ""}
            </p>
          </div>
        </div>

        <span
          className={[
            "shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize",
            getStatusClass(activity.status),
          ].join(" ")}
        >
          {activity.status || "completed"}
        </span>
      </div>
    </div>
  );
}

export default function BuyerActivityHistory({
  activities,
  totalPurchases,
  feedbackCount,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<ActivityFilter>("all");

  const filteredActivities = useMemo(() => {
    const safeActivities = activities || [];

    if (filter === "all") {
      return safeActivities;
    }

    return safeActivities.filter((activity) => activity.type === filter);
  }, [activities, filter]);

  const sortedActivities = useMemo(() => {
    return [...filteredActivities].sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();

      if (Number.isNaN(dateA) && Number.isNaN(dateB)) return 0;
      if (Number.isNaN(dateA)) return 1;
      if (Number.isNaN(dateB)) return -1;

      return dateB - dateA;
    });
  }, [filteredActivities]);

  const totalActivities = sortedActivities.length;
  const hasMoreThanCompact = totalActivities > COMPACT_LIMIT;
  const totalPages = Math.max(
    1,
    Math.ceil(totalActivities / EXPANDED_PAGE_SIZE)
  );
  const safePage = Math.min(page, totalPages);

  const visibleActivities = useMemo(() => {
    if (!expanded) {
      return sortedActivities.slice(0, COMPACT_LIMIT);
    }

    const start = (safePage - 1) * EXPANDED_PAGE_SIZE;
    const end = start + EXPANDED_PAGE_SIZE;

    return sortedActivities.slice(start, end);
  }, [expanded, safePage, sortedActivities]);

  const handleFilterChange = (value: ActivityFilter) => {
    setFilter(value);
    setExpanded(false);
    setPage(1);
  };

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-[17px] font-semibold text-slate-900">
            Activity
          </h2>

          <p className="mt-2 text-[15px] text-slate-500">
            You have {totalPurchases || 0} purchases and {feedbackCount || 0}{" "}
            reviews.
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {totalActivities === 0
              ? "No activities found for this filter."
              : expanded
              ? `Showing page ${safePage} of ${totalPages}`
              : `Showing latest ${Math.min(
                  COMPACT_LIMIT,
                  totalActivities
                )} of ${totalActivities}`}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={filter}
            onChange={(event) =>
              handleFilterChange(event.target.value as ActivityFilter)
            }
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition hover:bg-slate-50 focus:border-teal-300 focus:ring-4 focus:ring-teal-50"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

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
      </div>

      {totalActivities === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5">
          <p className="text-[16px] font-medium text-slate-800">
            No buyer activity yet.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Purchases, reviews, and profile updates will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 space-y-3">
            {visibleActivities.map((activity, index) => (
              <ActivityRow
                key={getActivityId(activity, index)}
                activity={activity}
              />
            ))}
          </div>

          {expanded && totalPages > 1 ? (
            <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page {safePage} of {totalPages} • {totalActivities} activities
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