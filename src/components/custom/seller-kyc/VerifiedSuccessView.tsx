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

type ButtonAction = () => void | Promise<void>;

type Props = {
  submittedAt?: string | null;
  verifiedAt?: string | null;

  /**
   * New prop names.
   */
  onLogoutAction?: ButtonAction;
  onGoDashboardAction?: ButtonAction;
  onCreateRecipeAction?: ButtonAction;

  /**
   * Backward-compatible prop names.
   * These keep the component working if SellerKycForm still passes old names.
   */
  onLogout?: ButtonAction;
  onGoDashboard?: ButtonAction;
  onCreateRecipe?: ButtonAction;

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
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-teal-50 text-teal-600">
        {icon}
      </div>
      <h3 className="mt-4 text-[17px] font-semibold text-slate-800">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-[15px] font-semibold text-slate-800">{value}</p>
    </div>
  );
}

export default function VerifiedSuccessView({
  submittedAt,
  verifiedAt,
  onLogoutAction,
  onGoDashboardAction,
  onCreateRecipeAction,
  onLogout,
  onGoDashboard,
  onCreateRecipe,
  isLoading = false,
}: Props) {
  /**
   * Support both prop naming styles to avoid breaking existing parent components.
   */
  const handleLogout = onLogoutAction ?? onLogout;
  const handleGoDashboard = onGoDashboardAction ?? onGoDashboard;
  const handleCreateRecipe = onCreateRecipeAction ?? onCreateRecipe;

  const isLogoutDisabled = isLoading || !handleLogout;
  const isDashboardDisabled = isLoading || !handleGoDashboard;
  const isCreateRecipeDisabled = isLoading || !handleCreateRecipe;

  const timelineSteps = [
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
  ];

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
              onClick={() => {
                void handleLogout?.();
              }}
              disabled={isLogoutDisabled}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>

            <button
              type="button"
              onClick={() => {
                void handleGoDashboard?.();
              }}
              disabled={isDashboardDisabled}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LayoutDashboard className="h-4 w-4" />
              )}
              Dashboard
            </button>

            <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800">
              Status: Approved
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-58px)] max-w-[1280px] items-center px-4 py-4">
        <div className="mx-auto w-full max-w-[920px] rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-[0_8px_24px_rgba(15,23,42,0.07)] sm:px-8 sm:py-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Verified
          </div>

          <div className="mt-5">
            <h1 className="text-[30px] font-bold leading-[1.08] tracking-[-0.03em] text-slate-800 sm:text-[40px]">
              You&apos;re Approved to Sell 🎉
            </h1>

            <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-500">
              Congratulations! Your seller account has been fully verified and
              activated. You can now start uploading and selling your recipes on
              RecipeChain.
            </p>
          </div>

          <div className="mt-6 px-2 sm:px-8">
            <div className="relative">
              <div className="absolute left-[16%] right-[16%] top-5 h-[2px] bg-emerald-500" />

              <div className="relative flex items-start justify-between">
                {timelineSteps.map((step) => (
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

          <div className="mt-7 grid gap-4 md:grid-cols-[1.25fr_0.95fr]">
            <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
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

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-5">
              <h3 className="text-sm font-semibold text-slate-800">
                Verification Summary
              </h3>

              <div className="mt-4 grid gap-3">
                <SummaryItem
                  label="Submitted On"
                  value={formatLongDate(submittedAt)}
                />
                <SummaryItem
                  label="Approved On"
                  value={formatLongDate(verifiedAt)}
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
                <button
                  type="button"
                  onClick={() => {
                    void handleGoDashboard?.();
                  }}
                  disabled={isDashboardDisabled}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-4 text-[15px] font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                  onClick={() => {
                    void handleCreateRecipe?.();
                  }}
                  disabled={isCreateRecipeDisabled}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-[15px] font-semibold text-slate-800 transition-all duration-200 hover:border-teal-600 hover:bg-teal-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
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
          </div>
        </div>
      </main>
    </div>
  );
}