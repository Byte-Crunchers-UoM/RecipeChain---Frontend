import { fetchSellerKycStatus } from "@/lib/api/sellerKyc";

const SELLER_KYC_ROUTE = "/seller/kyc";
const SELLER_DASHBOARD_ROUTE = "/seller/dashboard";

/**
 * Returns the correct landing route for a seller after login/signup.
 *
 * @returns Seller dashboard route only when the seller is fully approved and has already seen the approval page. Otherwise, returns the KYC route.
 */
export async function getSellerEntryRoute(): Promise<string> {
  try {
    const status = await fetchSellerKycStatus();

    const isApproved = status?.verification_status === "approved";
    const hasSeenApprovalPage = status?.kyc_approval_page_seen === true;

    if (isApproved && hasSeenApprovalPage) {
      return SELLER_DASHBOARD_ROUTE;
    }

    // All incomplete, pending, rejected, first-time-approved, or unknown states should be handled by the KYC page.
    return SELLER_KYC_ROUTE;
  } catch {
    // KYC is the safest fallback because it prevents unverified sellers from reaching the dashboard.
    return SELLER_KYC_ROUTE;
  }
}