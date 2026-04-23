import type {
  CookbookItem,
  CookbookRecipeReviewData,
  CookbookRecipeDetails,
} from "@/types/cookbook";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function parseJson(response: Response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

export async function getMyCookbook(params?: {
  q?: string;
  reviewStatus?: "all" | "reviewed" | "pending";
  favoritesOnly?: boolean;
}): Promise<CookbookItem[]> {
  const query = new URLSearchParams();

  if (params?.q?.trim()) {
    query.set("q", params.q.trim());
  }

  if (params?.reviewStatus && params.reviewStatus !== "all") {
    query.set("reviewStatus", params.reviewStatus);
  }

  if (params?.favoritesOnly) {
    query.set("favoritesOnly", "true");
  }

  const response = await fetch(
    `${API_URL}/buyer/me/cookbook${query.toString() ? `?${query.toString()}` : ""}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const data = await parseJson(response);
  return data.items || [];
}

export async function getCookbookRecipeDetails(
  recipeId: string
): Promise<CookbookRecipeDetails> {
  const response = await fetch(`${API_URL}/buyer/me/cookbook/${recipeId}`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await parseJson(response);
  return data.recipe;
}

export async function getCookbookRecipeForReview(
  recipeId: string
): Promise<CookbookRecipeReviewData> {
  const response = await fetch(
    `${API_URL}/buyer/me/cookbook/${recipeId}/review`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }
  );

  const data = await parseJson(response);
  return data.recipe;
}

export async function saveCookbookRecipeReview(payload: {
  recipeId: string;
  rating: number;
  comment: string;
  photos?: File[];
}) {
  const formData = new FormData();
  formData.append("rating", String(payload.rating));
  formData.append("comment", payload.comment);

  for (const file of payload.photos || []) {
    formData.append("photos", file);
  }

  const response = await fetch(
    `${API_URL}/buyer/me/cookbook/${payload.recipeId}/review`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    }
  );

  return await parseJson(response);
}

export async function toggleCookbookFavorite(recipeId: string): Promise<{
  is_favorite: boolean;
  saved_id: string | null;
  message: string;
}> {
  const response = await fetch(
    `${API_URL}/buyer/me/cookbook/${recipeId}/favorite`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return await parseJson(response);
}