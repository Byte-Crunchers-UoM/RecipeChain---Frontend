"use client";

import {
  Check,
  Clock3,
  FileText,
  Headphones,
  Info,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  submittedAt?: string | null;
  onViewDetails: () => void;
  onLogout: () => void;
};

function formatSubmittedDate(dateString?: string | null) {
  if (!dateString) return "Not available";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatSubmittedShortDate(dateString?: string | null) {
  if (!dateString) return "Not available";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ReviewCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="flex items-start gap-3">
        <FileText className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  submittedAt,
  onViewDetails,
}: {
  submittedAt?: string | null;
  onViewDetails: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-slate-500">Submitted on</p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {formatSubmittedDate(submittedAt)}
          </p>
        </div>

        <button
          type="button"
          onClick={onViewDetails}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-teal-700 transition hover:bg-slate-50 hover:border-teal-300"
        >
          View Submitted Details
        </button>
      </div>
    </div>
  );
}

export default function UnderReviewView({
  submittedAt,
  onViewDetails,
  onLogout,
}: Props) {
  const router = useRouter();

  const handleLogoutClick = async () => {
    try {
      await onLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F5F7]">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-1">
          <Image
            src="/Logo.png"
            alt="RecipeChain logo"
            width={40}
            height={40}
            className="h-auto w-[50px] object-contain"
            priority
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogoutClick}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>

            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800">
              Status: Under Review
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto max-w-[860px] rounded-[24px] border border-slate-200 bg-white px-6 py-6 shadow-[0_8px_24px_rgba(15,23,42,0.07)] sm:px-7 sm:py-7">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700">
            <Clock3 className="h-4 w-4" />
            Under Review
          </div>

          <h1 className="text-[32px] font-bold leading-[1.1] tracking-[-0.02em] text-slate-800 sm:text-[44px]">
            Your Verification Is Being Reviewed
          </h1>

          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-500 sm:text-[16px]">
            Our compliance team is carefully reviewing your submission. This
            process typically takes 24–48 hours to ensure security and accuracy.
          </p>

          <div className="mt-8 px-2 sm:px-6">
            <div className="relative">
              <div className="absolute left-[15%] right-[15%] top-5 h-[2px] bg-slate-200" />
              <div className="absolute left-[15%] right-[50%] top-5 h-[2px] bg-emerald-500" />

              <div className="relative flex items-start justify-between">
                <div className="flex w-24 flex-col items-center text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                    <Check className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Submitted
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatSubmittedShortDate(submittedAt)}
                  </p>
                </div>

                <div className="flex w-24 flex-col items-center text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-white shadow-sm">
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Under Review
                  </p>
                  <p className="mt-1 text-xs text-slate-500">In Progress</p>
                </div>

                <div className="flex w-24 flex-col items-center text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-400 shadow-sm">
                    <div className="h-3 w-3 rounded-full bg-slate-400" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-500">
                    Decision
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Pending</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border-l-4 border-teal-600 bg-teal-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
              <p className="text-sm leading-7 text-slate-700">
                You will be notified by email and in your dashboard once our
                team completes the review. No action is needed from you at this
                time.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2 items-stretch">
            {/* LEFT BLOCK */}
            <div className="h-full rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex justify-center lg:justify-start">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
                  <Clock3 className="h-8 w-8 text-teal-600" />
                </div>
              </div>

              <h2 className="mt-5 text-2xl font-semibold text-slate-800">
                What&apos;s being reviewed:
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <ReviewCard
                  title="Identity Documents"
                  description="Verifying authenticity and validity"
                />
                <ReviewCard
                  title="Personal Information"
                  description="Cross-checking details for accuracy"
                />
                <ReviewCard
                  title="Compliance Check"
                  description="Ensuring regulatory requirements"
                />
                <ReviewCard
                  title="Fraud Prevention"
                  description="Security and risk assessment"
                />
              </div>
            </div>

            {/* RIGHT BLOCK */}
            <div className="flex h-full flex-col justify-between space-y-4">
              
              {/* Submitted Card */}
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Submitted on</p>
                    <p className="mt-2 text-base font-semibold text-slate-900">
                      {formatSubmittedDate(submittedAt)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onViewDetails}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-teal-700 transition-all duration-200 hover:bg-teal-600 hover:text-white hover:border-teal-600"
                  >
                    View Submitted Details
                  </button>
                </div>
              </div>

              {/* Support Card */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white px-5 py-5">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Need help?</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Contact support if you have questions about your seller verification or submitted details.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/contact-us")}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-[15px] font-semibold text-slate-800 transition-all duration-200 hover:bg-teal-600 hover:text-white hover:border-teal-600"
                >
                  <Headphones className="h-4 w-4" />
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
   
  );
}