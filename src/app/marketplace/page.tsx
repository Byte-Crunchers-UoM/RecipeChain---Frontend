"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function MarketPlacePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">MarketPlace</h1>
            <p className="mt-4 text-gray-600">
              This is a placeholder Marketplace page. Add your marketplace content here.
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={loading}
            className={[
              "rounded-xl px-5 py-2.5 text-sm font-semibold transition",
              loading ? "bg-gray-200 text-gray-500" : "bg-red-600 text-white hover:bg-red-700",
            ].join(" ")}
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}