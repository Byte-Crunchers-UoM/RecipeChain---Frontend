import { fetchSellerKycStatus } from "@/lib/api/sellerKyc";

const SELLER_KYC_ROUTE = "/seller/kyc";
const SELLER_DASHBOARD_ROUTE = "/seller/dashboard";

/**
 * Returns the correct landing route for a seller after login/signup.
 *
 * Seller can reach dashboard only when:
 * 1. KYC verification is approved
 * 2. Seller has already seen the approval page
 *
 * All other states should go to the KYC page.
 */
export async function getSellerEntryRoute(): Promise<string> {
  try {
    const status = await fetchSellerKycStatus();

    const isApproved = status?.verification_status === "approved";
    const hasSeenApprovalPage = status?.kyc_approval_page_seen === true;

    if (isApproved && hasSeenApprovalPage) {
      return SELLER_DASHBOARD_ROUTE;
    }

    return SELLER_KYC_ROUTE;
  } catch {
    return SELLER_KYC_ROUTE;
  }
}