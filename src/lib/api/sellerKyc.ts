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
  verification_status?: "pending" | "verified" | "rejected" | null;
  verification_submitted_at?: string | null;
  verified_at?: string | null;
  rejection_reason?: string | null;
  full_name?: string | null;
  display_name?: string | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  address?: string | null;
  phone_no?: string | null;
  nic_no?: string | null;
  cloudinary_public_id?: string | null;
  id_document_resource_type?: "image" | "raw" | null;
  id_document_original_name?: string | null;
};

export type SellerKycResponse = {
  success?: boolean;
  message?: string;
  data?: SellerKycStatus;
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

  const result: SellerKycResponse = await parseApiResponse(response);

  if (!response.ok) {
    throw new Error(result?.message || "Failed to submit KYC");
  }

  return result;
}