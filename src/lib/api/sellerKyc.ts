export type MeResponse = {
  success?: boolean;
  message?: string;
  data?: {
    user_id: string;
    email?: string;
    role?: "buyer" | "seller" | "admin" | null;
    wallet_address?: string | null;
  };
};

export type SellerKycStatus = {
  verification_status?: "pending" | "approved" | "rejected" | null;
  verification_submitted_at?: string | null;
  verified_at?: string | null;
  rejection_reason?: string | null;
  full_name?: string | null;
  display_name?: string | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  address?: string | null;
  phone_no?: string | null;
  phone_no_normalized?: string | null;
  nic_no?: string | null;
  nic_no_normalized?: string | null;

  id_document_front_url?: string | null;
  id_document_front_public_id?: string | null;
  id_document_front_resource_type?: "image" | "raw" | null;
  id_document_front_original_name?: string | null;

  id_document_back_url?: string | null;
  id_document_back_public_id?: string | null;
  id_document_back_resource_type?: "image" | "raw" | null;
  id_document_back_original_name?: string | null;

  cloudinary_public_id?: string | null;
  id_document_resource_type?: "image" | "raw" | null;
  id_document_original_name?: string | null;

  kyc_approval_page_seen?: boolean | null;
};

export type SellerKycResponse = {
  success?: boolean;
  message?: string;
  data?: SellerKycStatus;
};

export type MarkSellerKycApprovalPageSeenResponse = {
  success?: boolean;
  message?: string;
  data?: {
    kyc_approval_page_seen?: boolean;
  };
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

async function parseApiResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected JSON response but received ${
        contentType || "non-JSON"
      } instead. Check your API URL and backend route.`
    );
  }

  return JSON.parse(rawText);
}

export async function fetchMe() {
  const response = await fetch(`${API_BASE}/me`, {
    method: "GET",
    credentials: "include",
  });

  const result: MeResponse = await parseApiResponse(response);

  if (!response.ok) {
    throw new Error(result?.message || "Failed to load current user");
  }

  return result;
}

export async function fetchSellerKycStatus() {
  const response = await fetch(`${API_BASE}/sellers/kyc/status`, {
    method: "GET",
    credentials: "include",
  });

  const result: SellerKycResponse = await parseApiResponse(response);

  if (!response.ok) {
    throw new Error(result?.message || "Failed to load KYC status");
  }

  return result?.data as SellerKycStatus;
}

export async function submitSellerKyc(formData: FormData) {
  const response = await fetch(`${API_BASE}/sellers/kyc/submit`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const result: any = await parseApiResponse(response);

  if (!response.ok) {
    const error: any = new Error(
      result?.friendlyMessage || result?.message || "Failed to submit KYC"
    );

    error.messageCode = result?.message;
    error.field = result?.field;
    error.status = result?.status;
    error.friendlyMessage = result?.friendlyMessage;

    throw error;
  }

  return result;
}

export async function markSellerKycApprovalPageSeen() {
  const response = await fetch(`${API_BASE}/sellers/kyc/approval-page-seen`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kyc_approval_page_seen: true,
    }),
  });

  const result: MarkSellerKycApprovalPageSeenResponse =
    await parseApiResponse(response);

  if (!response.ok) {
    throw new Error(
      result?.message || "Failed to update KYC approval page seen status"
    );
  }

  return result;
}