
import type { BuyerProfile } from "@/lib/types/buyer";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type ApiMessageResponse = {
  message?: string;
  error?: string;
};

type BuyerProfileResponse = ApiMessageResponse & {
  profile?: BuyerProfile;
};

async function safeJson<T = unknown>(response: Response): Promise<T | null> {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function getMyBuyerProfile(): Promise<BuyerProfile> {
  const response = await fetch(`${API_URL}/buyers/me/profile`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const data = await safeJson<BuyerProfileResponse>(response);

  if (!response.ok) {
    throw new Error(
      data?.message || data?.error || "Failed to load buyer profile"
    );
  }

  if (!data?.profile) {
    throw new Error("Buyer profile was not returned by the server");
  }

  return data.profile;
}

export async function updateMyBuyerProfile(payload: {
  displayName: string;
  bio: string;
  profilePhoto?: File | null;
}): Promise<BuyerProfile> {
  const formData = new FormData();

  formData.append("displayName", payload.displayName);
  formData.append("bio", payload.bio);

  if (payload.profilePhoto) {
    formData.append("profilePhoto", payload.profilePhoto);
  }

  const response = await fetch(`${API_URL}/buyers/me/profile`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });

  const data = await safeJson<BuyerProfileResponse>(response);

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Failed to update profile");
  }

  if (!data?.profile) {
    throw new Error("Updated buyer profile was not returned by the server");
  }

  return data.profile;
}

export async function deleteMyAccountPermanently(): Promise<void> {
  const response = await fetch(`${API_URL}/users/me`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  const data = await safeJson<ApiMessageResponse>(response);

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Failed to delete account");
  }
}