"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types";

export default function SelectRolePage() {
  const router = useRouter();
  const { setRole, isAuthenticated, isLoading, role } = useAuth();

  // UI-only selected state (does NOT affect auth logic until confirm)
  const [selected, setSelected] = useState<UserRole>("seller");

  // Guard: must be logged in to select role
  useEffect(() => {
    if (isLoading) return;

    // Not logged in -> go login
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Already has role -> skip select-role (UPDATED per your request)
    if (role === "seller") {
      router.replace("/seller/kyc");
      return;
    }
    if (role === "buyer") {
      router.replace("/marketplace");
      return;
    }
  }, [isLoading, isAuthenticated, role, router]);

  const buyerCapabilities = useMemo(
    () => [
      "Purchase exclusive digital recipes",
      "Save recipes to your cookbook",
      "Track transaction history",
      "Earn buyer achievements",
      "Review and rate purchased recipes",
    ],
    []
  );

  const sellerCapabilities = useMemo(
    () => [
      "Upload and mint recipes",
      "Earn revenue in cryptocurrency",
      "Access sales analytics",
      "Build culinary reputation",
      "Unlock creator achievements",
    ],
    []
  );

  const goNext = (chosen: UserRole) => {
    // Keep: store role in context
    setRole(chosen);

    // UPDATED routes (buyer -> marketplace, seller -> kyc)
    if (chosen === "buyer") router.replace("/marketplace");
    else router.replace("/seller/kyc");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-gray-200 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        {/* Top bar: back + logo */}
        <div className="mb-8 flex items-start justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
          >
            <span className="text-lg">←</span> Back
          </button>

          <div className="flex flex-col items-center">
            <Image
              src="/Logo.png"
              alt="RecipeChain Logo"
              width={70}
              height={70}
              priority
            />
            
          </div>

          <div className="w-[72px]" />
        </div>

        {/* Progress */}
        <div className="mx-auto max-w-2xl">
          <div className="text-sm text-gray-500">Account Setup</div>
          <div className="mt-2 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full w-full bg-teal-600 rounded-full" />
          </div>

          <h1 className="mt-8 text-center text-2xl font-extrabold text-gray-900">
            Select Your Account Role
          </h1>
          <p className="mt-3 text-center text-gray-500 leading-relaxed">
            Choose how you will participate in the RecipeChain marketplace.
            <br />
            Your role determines your permissions and cannot be changed later.
          </p>

          {/* Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <RoleCard
              title="Buyer"
              description="Purchase and collect blockchain-secured recipes from chefs worldwide."
              icon="🛒"
              capabilities={buyerCapabilities}
              active={selected === "buyer"}
              onClick={() => setSelected("buyer")}
            />

            <RoleCard
              title="Seller (Chef)"
              description="Create, mint, and sell your recipes as digital assets on the blockchain."
              icon="👨‍🍳"
              capabilities={sellerCapabilities}
              active={selected === "seller"}
              onClick={() => setSelected("seller")}
            />
          </div>

          {/* Warning box */}
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 flex items-start gap-3">
            <span className="mt-0.5">⚠️</span>
            <div>
              This selection is permanent. Your account role cannot be changed after
              confirmation.
            </div>
          </div>

          {/* Confirm button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => goNext(selected)}
              className="rounded-xl bg-teal-700 px-10 py-4 text-white font-semibold hover:bg-teal-800 transition shadow-sm"
            >
              Confirm Role &amp; Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleCard({
  title,
  description,
  icon,
  capabilities,
  active,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  capabilities: string[];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative text-left rounded-2xl border p-5 transition shadow-sm",
        active
          ? "border-teal-700 bg-teal-50"
          : "border-gray-200 bg-white hover:shadow-md",
      ].join(" ")}
    >
      {/* Check mark */}
      {active && (
        <div className="absolute top-4 right-4 h-7 w-7 rounded-full bg-teal-700 text-white flex items-center justify-center text-sm">
          ✓
        </div>
      )}

      {/* Icon */}
      <div
        className={[
          "h-12 w-12 rounded-xl flex items-center justify-center text-xl",
          active ? "bg-white" : "bg-gray-50",
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="mt-5 text-xl font-bold text-gray-900">{title}</div>
      <div className="mt-2 text-sm text-gray-500 leading-relaxed">
        {description}
      </div>

      <div className="mt-6 text-xs font-semibold tracking-wider text-gray-500">
        CAPABILITIES
      </div>

      <ul className="mt-3 space-y-2 text-sm text-gray-600">
        {capabilities.map((cap) => (
          <li key={cap} className="flex items-start gap-2">
            <span className="mt-1 text-teal-700">•</span>
            <span>{cap}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}