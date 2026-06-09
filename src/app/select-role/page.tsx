"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  Info,
  Loader2,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

type Role = "buyer" | "seller";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const BUYER_HOME = "/buyer/profile";
const SELLER_HOME = "/seller/kyc";

function RoleCard({
  title,
  description,
  features,
  icon: Icon,
  selected,
  disabled,
  onClick,
}: {
  title: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "relative w-full rounded-3xl border p-6 text-left transition-all",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "hover:-translate-y-0.5 hover:shadow-md",
        selected
          ? "border-teal-500 bg-teal-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-teal-300",
      ].join(" ")}
    >
      {selected ? (
        <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-white">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      ) : null}

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <Icon className="h-7 w-7 text-teal-700" />
      </div>

      <h3 className="mt-5 text-2xl font-bold text-slate-900">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Key benefits
        </p>

        <ul className="mt-3 space-y-2.5">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-3 text-sm text-slate-700"
            >
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </button>
  );
}

/**
 * Lets authenticated users choose their permanent RecipeChain role.
 *
 * Buyer users are sent to the buyer profile, while seller users are sent to KYC.
 */
export default function SelectRolePage() {
  const router = useRouter();
  const { isLoading, isAuthenticated, role, refreshSession } = useAuth();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (role === "buyer") {
      router.replace(BUYER_HOME);
      return;
    }

    if (role === "seller") {
      router.replace(SELLER_HOME);
    }
  }, [isLoading, isAuthenticated, role, router]);

  const handleContinue = async () => {
    if (submitting) return;

    setError("");

    if (!selectedRole) {
      setError("Please select a role to continue.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_BASE}/users/role`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || result?.error || "Failed to save your role"
        );
      }

      await refreshSession();

      const target = selectedRole === "seller" ? SELLER_HOME : BUYER_HOME;

      if (typeof window !== "undefined") {
        window.location.replace(target);
        return;
      }

      router.replace(target);
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : "Failed to save your role. Please try again.";

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
          <span className="text-sm text-slate-600">
            Loading account setup...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-slate-50 px-4 py-4 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100svh-2rem)] max-w-5xl flex-col justify-center">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={submitting}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/Logo.png"
              alt="RecipeChain logo"
              width={82}
              height={82}
              className="h-auto w-[82px] object-contain"
              priority
            />

            <div className="mt-4 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
              Account Setup
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Select Your Account Role
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Choose how you will participate in the RecipeChain marketplace.
              <br className="hidden sm:block" />
              Your role determines your permissions and cannot be changed later.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <RoleCard
              title="Buyer"
              description="Browse, purchase, save, and manage your blockchain-secured recipe collection."
              features={[
                "Discover premium recipes from verified chefs",
                "Save purchased recipes to your personal cookbook",
                "Review recipes and build your buyer profile",
              ]}
              icon={ShoppingBag}
              selected={selectedRole === "buyer"}
              disabled={submitting}
              onClick={() => setSelectedRole("buyer")}
            />

            <RoleCard
              title="Seller (Chef)"
              description="Create, verify, and sell your recipes as digital assets on RecipeChain."
              features={[
                "Complete seller verification before publishing",
                "Upload and mint your original recipes",
                "Track earnings and grow your culinary reputation",
              ]}
              icon={ChefHat}
              selected={selectedRole === "seller"}
              disabled={submitting}
              onClick={() => setSelectedRole("seller")}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <p className="text-center text-sm leading-6 text-amber-900">
                This selection is permanent. Your account role cannot be changed
                after confirmation.
              </p>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">
                {selectedRole === "buyer"
                  ? "Buyer selected"
                  : selectedRole === "seller"
                  ? "Seller selected"
                  : "No role selected yet"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {selectedRole === "seller"
                  ? "Next step: complete seller verification"
                  : selectedRole === "buyer"
                  ? "Next step: open your buyer profile"
                  : "Select one option to continue"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedRole || submitting}
              className="inline-flex min-w-[240px] items-center justify-center rounded-2xl bg-teal-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-300"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving role...
                </>
              ) : (
                "Confirm Role & Continue"
              )}
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Role will be saved to your account and used on future logins.
          </div>
        </div>
      </div>
    </div>
  );
}