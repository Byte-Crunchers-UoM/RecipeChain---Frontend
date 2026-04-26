import { fetchSellerKycStatus } from "@/lib/api/sellerKyc";

export async function getSellerEntryRoute() {
  try {
    const status = await fetchSellerKycStatus();

    if (!status?.verification_status) {
      return "/seller/kyc";
    }

    if (status.verification_status === "approved") {
      if (status.kyc_approval_page_seen === true) {
        return "/dashboard";
      }
      return "/seller/kyc";
    }

    if (status.verification_status === "pending") {
      return "/seller/kyc";
    }

    if (status.verification_status === "rejected") {
      return "/seller/kyc";
    }

    return "/seller/kyc";
  } catch {
    return "/seller/kyc";
  }
}