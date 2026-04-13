"use client";

import {
  Check,
  CheckCircle2,
  LayoutDashboard,
  Loader2,
  LogOut,
  PlusCircle,
  ShieldCheck,
  Store,
} from "lucide-react";
import Image from "next/image";

type Props = {
  submittedAt?: string | null;
  verifiedAt?: string | null;
  onLogout: () => void | Promise<void>;
  onGoDashboard: () => void | Promise<void>;
  onCreateRecipe: () => void | Promise<void>;
  isLoading?: boolean;
};

function formatShortDate(dateString?: string | null) {
  if (!dateString) return "Not available";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatLongDate(dateString?: string | null) {
  if (!dateString) return "Not available";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 px-6 py-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
        {icon}
      </div>
      <h3 className="mt-5 text-[18px] font-semibold text-slate-800">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

export default function VerifiedSuccessView({
  submittedAt,
  verifiedAt,
  onLogout,
  onGoDashboard,
  onCreateRecipe,
  isLoading = false,
}: Props) {
  return (
    <div className="min-h-screen bg-[#F3F5F7]">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-2">
          <Image
            src="/Logo.png"
            alt="RecipeChain logo"
            width={50}
            height={50}
            className="h-auto w-[50px] object-contain"
            priority
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLogout}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>

            <button
              type="button"
              onClick={onGoDashboard}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LayoutDashboard className="h-4 w-4" />
              )}
              Dashboard
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800"
            >
              Status: Approved
              <span className="text-slate-400">⌄</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-6 py-8">
        <div className="mx-auto max-w-[760px] rounded-[24px] border border-slate-200 bg-white px-7 py-7 shadow-[0_8px_24px_rgba(15,23,42,0.07)]">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Verified
          </div>

          <h1 className="text-[34px] font-bold leading-[1.1] tracking-[-0.02em] text-slate-800 sm:text-[44px]">
            You&apos;re Approved to Sell 🎉
          </h1>

          <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-500 sm:text-[16px]">
            Congratulations! Your seller account has been fully verified and
            activated. You can now start uploading and selling your recipes on
            RecipeChain.
          </p>

          <div className="mt-8 px-2 sm:px-6">
            <div className="relative">
              <div className="absolute left-[15%] right-[15%] top-5 h-[2px] bg-emerald-500" />

              <div className="relative flex items-start justify-between">
                {[
                  {
                    label: "Submitted",
                    date: formatShortDate(submittedAt),
                  },
                  {
                    label: "Reviewed",
                    date: formatShortDate(verifiedAt),
                  },
                  {
                    label: "Approved",
                    date: formatShortDate(verifiedAt),
                  },
                ].map((step) => (
                  <div
                    key={step.label}
                    className="flex w-[33%] flex-col items-center text-center"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                      <Check className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      {step.label}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{step.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <FeatureCard
              icon={<Store className="h-5 w-5" />}
              title="Start Selling"
              description="List and publish your recipes for buyers across the marketplace."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Trusted Seller"
              description="Your verified badge builds confidence and trust with buyers."
            />
            <FeatureCard
              icon={<LayoutDashboard className="h-5 w-5" />}
              title="Manage Easily"
              description="Track recipes, sales, and earnings from your seller dashboard."
            />
          </div>

          <div className="mt-8 rounded-2xl bg-slate-50 px-5 py-5">
            <h3 className="text-sm font-semibold text-slate-800">
              Verification summary
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Submitted on
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {formatLongDate(submittedAt)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Approved on
                </p>
                <p className="mt-1 text-sm font-medium text-slate-700">
                  {formatLongDate(verifiedAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onGoDashboard}
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-4 text-[15px] font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[240px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LayoutDashboard className="h-4 w-4" />
              )}
              Go to Dashboard
            </button>

            <button
              type="button"
              onClick={onCreateRecipe}
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[15px] font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[240px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              Create Recipe
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}