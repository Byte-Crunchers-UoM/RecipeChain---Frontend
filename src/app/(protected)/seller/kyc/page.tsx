"use client";

import { useRouter } from "next/navigation";

export default function SellerKycPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow border border-gray-100">
        <button
          onClick={() => router.back()}
          className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
        >
          ← Back
        </button>

        <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
          Seller Verification (KYC)
        </h1>
        <p className="mt-3 text-gray-600">
          KYC form is not implemented yet. Add seller verification form here.
        </p>
      </div>
    </div>
  );
}