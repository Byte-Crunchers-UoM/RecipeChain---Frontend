import type { BuyerProfile } from "@/lib/types/buyer";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getMyBuyerProfile(): Promise<BuyerProfile> {
  const response = await fetch(`${API_URL}/buyer/me/profile`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to load buyer profile");
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

  const response = await fetch(`${API_URL}/buyer/me/profile`, {
    method: "PATCH",
    credentials: "include",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "Failed to update profile");
  }

  return data.profile;
}

export async function deleteMyAccountPermanently(): Promise<void> {
  const response = await fetch(`${API_URL}/users/me`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Failed to delete account");
  }
}