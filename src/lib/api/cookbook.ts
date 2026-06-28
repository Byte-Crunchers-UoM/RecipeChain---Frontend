import type {
  CookbookItem,
  CookbookRecipeReviewData,
  CookbookRecipeDetails,
} from "@/lib/types/cookbook";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type ApiMessageResponse = {
  message?: string;
  error?: string;
};

type CookbookListResponse = ApiMessageResponse & {
  items?: CookbookItem[];
};

type CookbookRecipeDetailsResponse = ApiMessageResponse & {
  recipe?: CookbookRecipeDetails;
};

type CookbookRecipeReviewResponse = ApiMessageResponse & {
  recipe?: CookbookRecipeReviewData;
};

type ToggleFavoriteResponse = ApiMessageResponse & {
  is_favorite?: boolean;
  saved_id?: string | null;
};

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorData = data as ApiMessageResponse | null;

    throw new Error(
      errorData?.message || errorData?.error || "Request failed"
    );
  }

  return data as T;
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

  const queryString = query.toString();

  const response = await fetch(
    `${API_URL}/buyers/me/cookbook${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  const data = await parseJson<CookbookListResponse>(response);

  return data.items || [];
}

export async function getCookbookRecipeDetails(
  recipeId: string
): Promise<CookbookRecipeDetails> {
  const response = await fetch(`${API_URL}/buyers/me/cookbook/${recipeId}`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const data = await parseJson<CookbookRecipeDetailsResponse>(response);

  if (!data?.recipe) {
    throw new Error("Cookbook recipe details were not returned by the server");
  }

  return data.recipe;
}

export async function getCookbookRecipeForReview(
  recipeId: string
): Promise<CookbookRecipeReviewData> {
  const response = await fetch(
    `${API_URL}/buyers/me/cookbook/${recipeId}/review`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  const data = await parseJson<CookbookRecipeReviewResponse>(response);

  if (!data?.recipe) {
    throw new Error("Cookbook recipe review data was not returned by the server");
  }

  return data.recipe;
}

export async function saveCookbookRecipeReview(payload: {
  recipeId: string;
  rating: number;
  comment: string;
  photos?: File[];
}): Promise<ApiMessageResponse> {
  const formData = new FormData();

  formData.append("rating", String(payload.rating));
  formData.append("comment", payload.comment);

  for (const file of payload.photos || []) {
    formData.append("photos", file);
  }

  const response = await fetch(
    `${API_URL}/buyers/me/cookbook/${payload.recipeId}/review`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    }
  );

  return parseJson<ApiMessageResponse>(response);
}

export async function toggleCookbookFavorite(recipeId: string): Promise<{
  is_favorite: boolean;
  saved_id: string | null;
  message: string;
}> {
  const response = await fetch(
    `${API_URL}/buyers/me/cookbook/${recipeId}/favorite`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  const data = await parseJson<ToggleFavoriteResponse>(response);

  if (typeof data.is_favorite !== "boolean") {
    throw new Error("Favorite status was not returned by the server");
  }

  return {
    is_favorite: data.is_favorite,
    saved_id: data.saved_id ?? null,
    message: data.message || "Favorite status updated",
  };
}