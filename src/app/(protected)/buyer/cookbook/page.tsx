"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Clock3,
  Star,
  Heart,
  Eye,
  UtensilsCrossed,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import {
  getMyCookbook,
  getCookbookRecipeDetails,
  toggleCookbookFavorite,
} from "@/lib/api/cookbook";
import type { CookbookItem, CookbookRecipeDetails } from "@/types/cookbook";
import RecipeQuickViewModal from "@/components/buyer/RecipeQuickViewModal";

type ReviewFilter = "all" | "reviewed" | "pending";
type SortOption =
  | "newest"
  | "oldest"
  | "title_asc"
  | "title_desc"
  | "rating_desc"
  | "favorites_first"
  | "pending_first";

function formatMinutes(prep?: number | null, cook?: number | null) {
  const total = Number(prep || 0) + Number(cook || 0);
  if (!total) return "Time not available";
  return `${total} min`;
}

function getSafeImageSrc(value?: string | null) {
  const cleaned = String(value || "").trim();
  return cleaned.length > 0 ? cleaned : null;
}

function getPlaceholderLabel(title?: string | null) {
  return title?.trim() || "Recipe";
}

function getDifficultyLabel(value?: string | null) {
  const safe = String(value || "").trim();
  if (!safe) return "Not specified";
  return safe;
}

function compareCookbookItems(
  a: CookbookItem,
  b: CookbookItem,
  sortBy: SortOption
) {
  if (sortBy === "newest") {
    return (
      new Date(b.unlocked_at || 0).getTime() -
      new Date(a.unlocked_at || 0).getTime()
    );
  }

  if (sortBy === "oldest") {
    return (
      new Date(a.unlocked_at || 0).getTime() -
      new Date(b.unlocked_at || 0).getTime()
    );
  }

  if (sortBy === "title_asc") {
    return a.title.localeCompare(b.title);
  }

  if (sortBy === "title_desc") {
    return b.title.localeCompare(a.title);
  }

  if (sortBy === "favorites_first") {
    if (a.is_favorite !== b.is_favorite) {
      return a.is_favorite ? -1 : 1;
    }
    return a.title.localeCompare(b.title);
  }

  if (sortBy === "pending_first") {
    if (a.has_reviewed !== b.has_reviewed) {
      return a.has_reviewed ? 1 : -1;
    }
    return a.title.localeCompare(b.title);
  }

  return Number(b.rating_avg || 0) - Number(a.rating_avg || 0);
}

function StatusChip({
  reviewed,
  favorite,
}: {
  reviewed: boolean;
  favorite: boolean;
}) {
  if (reviewed) {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
        Reviewed
      </span>
    );
  }

  if (favorite) {
    return (
      <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700 ring-1 ring-yellow-200">
        Favorite
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
      Not reviewed
    </span>
  );
}

function CookbookCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="h-48 w-full animate-pulse bg-slate-100" />
      <div className="space-y-4 p-5">
        <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
        <div className="h-7 w-2/3 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-4 w-3/4 animate-pulse rounded-lg bg-slate-100" />
        <div className="h-4 w-1/2 animate-pulse rounded-lg bg-slate-100" />
        <div className="flex gap-3 pt-2">
          <div className="h-12 w-32 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-12 w-36 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export default function BuyerCookbookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const qParam = searchParams.get("q") || "";
  const reviewStatusParam = (
    searchParams.get("reviewStatus") || "all"
  ) as ReviewFilter;
  const favoritesOnlyParam = searchParams.get("favoritesOnly") === "true";

  const [items, setItems] = useState<CookbookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favoriteLoadingId, setFavoriteLoadingId] = useState<string | null>(
    null
  );
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedRecipe, setSelectedRecipe] = useState<CookbookItem | null>(
    null
  );
  const [selectedRecipeDetails, setSelectedRecipeDetails] =
    useState<CookbookRecipeDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadCookbook = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyCookbook({
        q: qParam,
        reviewStatus: reviewStatusParam,
        favoritesOnly: favoritesOnlyParam,
      });

      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load cookbook"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCookbook();
  }, [qParam, reviewStatusParam, favoritesOnlyParam]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => compareCookbookItems(a, b, sortBy));
  }, [items, sortBy]);

  const totalCount = items.length;

  const reviewedCount = useMemo(
    () => items.filter((item) => item.has_reviewed).length,
    [items]
  );

  const toReviewCount = useMemo(
    () => items.filter((item) => !item.has_reviewed).length,
    [items]
  );

  const favoriteCount = useMemo(
    () => items.filter((item) => item.is_favorite).length,
    [items]
  );

  const setReviewFilter = (filter: ReviewFilter) => {
    const params = new URLSearchParams(searchParams.toString());

    if (filter === "all") {
      params.delete("reviewStatus");
    } else {
      params.set("reviewStatus", filter);
    }

    if (filter === "all") {
      params.delete("favoritesOnly");
    }

    router.push(`/buyer/cookbook?${params.toString()}`);
  };

  const showFavoritesOnly = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("favoritesOnly", "true");
    router.push(`/buyer/cookbook?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push("/buyer/cookbook");
  };

  const handleToggleFavorite = async (recipeId: string) => {
    try {
      setFavoriteLoadingId(recipeId);

      const result = await toggleCookbookFavorite(recipeId);

      setItems((prev) => {
        const updated = prev.map((item) =>
          item.recipe_id === recipeId
            ? {
                ...item,
                is_favorite: result.is_favorite,
                saved_id: result.saved_id,
              }
            : item
        );

        if (favoritesOnlyParam && !result.is_favorite) {
          return updated.filter((item) => item.recipe_id !== recipeId);
        }

        return updated;
      });

      setSelectedRecipe((prev) =>
        prev && prev.recipe_id === recipeId
          ? {
              ...prev,
              is_favorite: result.is_favorite,
              saved_id: result.saved_id,
            }
          : prev
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update favorite"
      );
    } finally {
      setFavoriteLoadingId(null);
    }
  };

  const openRecipePopup = async (item: CookbookItem) => {
    setError("");
    setSelectedRecipe(item);
    setSelectedRecipeDetails(null);
    setDetailsLoading(true);

    try {
      const details = await getCookbookRecipeDetails(item.recipe_id);
      setSelectedRecipeDetails(details);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load recipe details"
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeRecipePopup = () => {
    setSelectedRecipe(null);
    setSelectedRecipeDetails(null);
    setDetailsLoading(false);
  };

  const goToReview = (recipeId: string) => {
    router.push(`/buyer/review/${recipeId}`);
  };

  const activeViewLabel = qParam
    ? `Search results for "${qParam}"`
    : favoritesOnlyParam
    ? "Favorite recipes"
    : reviewStatusParam === "reviewed"
    ? "Reviewed recipes"
    : reviewStatusParam === "pending"
    ? "Recipes to review"
    : "All cookbook recipes";

  return (
    <>
      <div className="px-2 pb-10 pt-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                My Cookbook
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-slate-500">
                Your purchased recipes, favorites, and reviews in one beautiful
                place.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Collection
              </div>
              <div className="mt-1 text-sm text-slate-700">
                {totalCount} saved to your cookbook
              </div>
            </div>
          </div>

          {(qParam || favoritesOnlyParam || reviewStatusParam !== "all") && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-sm font-medium text-slate-700">
                {activeViewLabel}
              </div>

              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RotateCcw size={16} />
                Back to full cookbook
              </button>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setReviewFilter("all")}
                className={[
                  "rounded-2xl px-5 py-3 text-sm font-semibold transition",
                  reviewStatusParam === "all" && !favoritesOnlyParam
                    ? "bg-teal-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                All Recipes ({totalCount})
              </button>

              <button
                onClick={() => setReviewFilter("reviewed")}
                className={[
                  "rounded-2xl px-5 py-3 text-sm font-semibold transition",
                  reviewStatusParam === "reviewed"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                Reviewed ({reviewedCount})
              </button>

              <button
                onClick={() => setReviewFilter("pending")}
                className={[
                  "rounded-2xl px-5 py-3 text-sm font-semibold transition",
                  reviewStatusParam === "pending"
                    ? "bg-teal-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                To review ({toReviewCount})
              </button>

              <button
                onClick={showFavoritesOnly}
                className={[
                  "inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition",
                  favoritesOnlyParam
                    ? "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                <Heart
                  size={16}
                  className={favoritesOnlyParam ? "fill-current text-yellow-500" : ""}
                />
                Favorites ({favoriteCount})
              </button>

              <div className="ml-auto flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <SlidersHorizontal size={16} className="text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent text-sm font-medium text-slate-700 outline-none"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="title_asc">Title A–Z</option>
                    <option value="title_desc">Title Z–A</option>
                    <option value="rating_desc">Highest Rated</option>
                    <option value="favorites_first">Favorites First</option>
                    <option value="pending_first">Pending Review First</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-700">{sortedItems.length}</span>{" "}
                recipe{sortedItems.length === 1 ? "" : "s"}
              </div>

              {(qParam || favoritesOnlyParam || reviewStatusParam !== "all") && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-sm font-medium text-teal-700 transition hover:text-teal-800"
                >
                  Clear filters and show all
                </button>
              )}
            </div>
          </div>

          {loading && (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <CookbookCardSkeleton />
              <CookbookCardSkeleton />
              <CookbookCardSkeleton />
            </div>
          )}

          {!!error && !loading && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && sortedItems.length === 0 && (
            <div className="mt-14 rounded-[30px] border border-dashed border-slate-300 bg-white px-8 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <UtensilsCrossed className="h-7 w-7 text-slate-500" />
              </div>
              <div className="mt-5 text-2xl font-semibold text-slate-800">
                No recipes found
              </div>
              <p className="mt-2 text-sm text-slate-500">
                Try another search keyword or return to your full cookbook.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-6 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Back to full cookbook
              </button>
            </div>
          )}

          {!loading && sortedItems.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {sortedItems.map((item) => {
                const imageSrc = getSafeImageSrc(item.image_url);

                return (
                  <div
                    key={item.recipe_id}
                    onClick={() => {
                      void openRecipePopup(item);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        void openRecipePopup(item);
                      }
                    }}
                    className="group cursor-pointer overflow-hidden rounded-[28px] border border-slate-200 bg-white text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-48 w-full bg-slate-100">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-slate-100 to-amber-50 px-6 text-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 shadow-sm">
                            <UtensilsCrossed className="h-7 w-7 text-teal-600" />
                          </div>
                          <div className="mt-3 text-base font-semibold text-slate-700">
                            {getPlaceholderLabel(item.title)}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            Preview image not available
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/35 to-transparent" />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleToggleFavorite(item.recipe_id);
                        }}
                        disabled={favoriteLoadingId === item.recipe_id}
                        className={[
                          "absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-sm transition duration-200",
                          item.is_favorite
                            ? "scale-110 text-yellow-500 hover:text-yellow-600"
                            : "text-slate-500 hover:scale-105 hover:text-yellow-500",
                        ].join(" ")}
                        aria-label={
                          item.is_favorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                      >
                        <Heart
                          size={20}
                          className={item.is_favorite ? "fill-current" : ""}
                        />
                      </button>
                    </div>

                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusChip
                          reviewed={item.has_reviewed}
                          favorite={item.is_favorite}
                        />
                      </div>

                      <h2 className="mt-3 line-clamp-2 text-[20px] font-semibold leading-7 text-slate-900">
                        {item.title}
                      </h2>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {item.description?.trim()
                          ? item.description
                          : "Open this recipe to view full ingredients, instructions, and more details."}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock3 size={16} />
                          <span>
                            {formatMinutes(item.prep_time, item.cook_time)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Star size={16} />
                          <span>{Number(item.rating_avg || 0).toFixed(1)}</span>
                        </div>

                        <div className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {getDifficultyLabel(item.difficulty_level)}
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void openRecipePopup(item);
                          }}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Eye size={16} />
                          View Recipe
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToReview(item.recipe_id);
                          }}
                          className={[
                            "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                            item.has_reviewed
                              ? "border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
                              : "bg-teal-600 text-white hover:bg-teal-700",
                          ].join(" ")}
                        >
                          {item.has_reviewed ? "Update Review" : "Review Recipe"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <RecipeQuickViewModal
        open={Boolean(selectedRecipe)}
        item={selectedRecipe}
        details={selectedRecipeDetails}
        loading={detailsLoading}
        favoriteLoading={favoriteLoadingId === selectedRecipe?.recipe_id}
        onCloseAction={closeRecipePopup}
        onReviewAction={goToReview}
        onFavoriteToggleAction={(recipeId) => {
          void handleToggleFavorite(recipeId);
        }}
      />
    </>
  );
}