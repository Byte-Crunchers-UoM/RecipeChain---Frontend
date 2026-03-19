"use client";

import {
  Check,
  CheckCircle2,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  ShieldCheck,
  Store,
} from "lucide-react";
import Image from "next/image";

type Props = {
  submittedAt?: string | null;
  verifiedAt?: string | null;
  onLogout: () => void;
  onGoDashboard: () => void;
  onCreateRecipe: () => void;
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
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>

            <button
              type="button"
              onClick={onGoDashboard}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <LayoutDashboard className="h-4 w-4" />
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
                <div className="flex w-24 flex-col items-center text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                    <Check className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Submitted
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatShortDate(submittedAt)}
                  </p>
                </div>

                <div className="flex w-24 flex-col items-center text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                    <Check className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Reviewed
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatShortDate(verifiedAt)}
                  </p>
                </div>

                <div className="flex w-24 flex-col items-center text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
                    <Check className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    Approved
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatLongDate(verifiedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border-l-4 border-emerald-600 bg-emerald-50 px-5 py-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
              <div>
                <p className="text-base font-semibold text-emerald-900">
                  Verification Complete
                </p>
                <p className="mt-1 text-sm leading-7 text-slate-700">
                  Your seller account was approved on {formatLongDate(verifiedAt)}
                  . All seller features are now unlocked and ready to use.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-emerald-100">
              <ShieldCheck className="h-14 w-14 text-emerald-600" />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-center text-2xl font-semibold tracking-[-0.01em] text-slate-800">
              What you can do now:
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <FeatureCard
                icon={<PlusCircle className="h-6 w-6" />}
                title="Upload Recipes"
                description="Create and list your first recipe for sale"
              />
              <FeatureCard
                icon={<LayoutDashboard className="h-6 w-6" />}
                title="Manage Sales"
                description="Track earnings and view analytics"
              />
              <FeatureCard
                icon={<Store className="h-6 w-6" />}
                title="Build Reputation"
                description="Earn ratings and grow your brand"
              />
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={onGoDashboard}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 py-4 text-base font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              <LayoutDashboard className="h-5 w-5" />
              Go to Seller Dashboard
            </button>

            <button
              type="button"
              onClick={onCreateRecipe}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              <PlusCircle className="h-5 w-5" />
              Create Your First Recipe
            </button>
          </div>

          <div className="mt-8 rounded-2xl bg-teal-50 px-6 py-5 text-center">
            <p className="text-[15px] leading-7 text-slate-700">
              Welcome to the RecipeChain seller community! If you have
              questions, check out our{" "}
              <a
                href="#"
                className="font-semibold text-teal-700 underline underline-offset-4"
              >
                Seller Guide
              </a>{" "}
              or{" "}
              <a
                href="/contact-us"
                className="font-semibold text-teal-700 underline underline-offset-4"
              >
                contact our team
              </a>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}