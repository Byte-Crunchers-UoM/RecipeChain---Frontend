"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchMe, fetchSellerKycStatus } from "@/lib/api/sellerKyc";

export default function SellerDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function guardDashboard() {
      try {
        const me = await fetchMe();

        if (cancelled) return;

        if (me?.data?.role !== "seller") {
          router.replace("/login");
          return;
        }

        const status = await fetchSellerKycStatus();

        if (cancelled) return;

        if (status?.verification_status !== "approved") {
          router.replace("/seller/kyc");
          return;
        }
      } catch {
        if (!cancelled) {
          router.replace("/login");
        }
      }
    }

    guardDashboard();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return <div>Seller Dashboard</div>;
}