/**
 * Typed error thrown by Seller KYC API calls.
 *
 * @property httpStatus  - HTTP status code from the response.
 * @property messageCode - Machine-readable error code from the API (e.g. "duplicate_seller_identity").
 * @property field       - Which identity field triggered the error ("nicNo" | "phoneNo").
 * @property status      - KYC status of the conflicting record ("pending" | "rejected" | "approved").
 * @property friendlyMessage - Human-readable message suitable for display in the UI.
 */
export class ApiError extends Error {
  messageCode?: string;
  field?: "nicNo" | "phoneNo";
  status?: "pending" | "rejected" | "approved";
  friendlyMessage?: string;
  httpStatus: number;

  constructor(
    message: string,
    httpStatus: number,
    extra?: {
      messageCode?: string;
      field?: string;
      status?: string;
      friendlyMessage?: string;
    }
  ) {
    super(message);
    this.name = "ApiError";
    this.httpStatus = httpStatus;
    this.messageCode = extra?.messageCode;
    this.field = extra?.field as "nicNo" | "phoneNo" | undefined;
    this.status = extra?.status as "pending" | "rejected" | "approved" | undefined;
    this.friendlyMessage = extra?.friendlyMessage;
  }
}

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

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

  const result: Record<string, unknown> = await parseApiResponse(response);

  if (!response.ok) {
    throw new ApiError(
      String(result?.friendlyMessage || result?.message || "Failed to submit KYC"),
      response.status,
      {
        messageCode: result?.message as string | undefined,
        field: result?.field as string | undefined,
        status: result?.status as string | undefined,
        friendlyMessage: result?.friendlyMessage as string | undefined,
      }
    );
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