"use client";

import { useEffect, useMemo } from "react";
import {
  Clock3,
  Star,
  Heart,
  X,
  UtensilsCrossed,
  Sparkles,
  ChefHat,
  DollarSign,
  Users,
  BookOpen,
  MessageSquareText,
} from "lucide-react";
import type { CookbookItem, CookbookRecipeDetails } from "@/types/cookbook";

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

function normalizeIngredients(ingredients: unknown): string[] {
  if (!Array.isArray(ingredients)) return [];

  return ingredients
    .map((item) => {
      if (typeof item === "string") return item;

      if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        const name = String(obj.name || obj.ingredient || "").trim();
        const qty = String(obj.quantity || obj.amount || "").trim();
        const unit = String(obj.unit || "").trim();
        return [qty, unit, name].filter(Boolean).join(" ").trim();
      }

      return String(item);
    })
    .filter(Boolean);
}

function normalizeInstructions(instructions: unknown): string[] {
  if (!Array.isArray(instructions)) return [];

  return instructions
    .map((item) => {
      if (typeof item === "string") return item;

      if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        return String(obj.step || obj.instruction || obj.text || "").trim();
      }

      return String(item);
    })
    .filter(Boolean);
}

function statusChip(reviewed: boolean, favorite: boolean) {
  if (reviewed) {
    return {
      text: "Reviewed",
      className:
        "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    };
  }

  if (favorite) {
    return {
      text: "Favorite",
      className:
        "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200",
    };
  }

  return {
    text: "Not reviewed",
    className:
      "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  };
}

type RecipeQuickViewModalProps = {
  open: boolean;
  item: CookbookItem | null;
  details: CookbookRecipeDetails | null;
  loading: boolean;
  favoriteLoading: boolean;
  onCloseAction: () => void;
  onReviewAction: (recipeId: string) => void;
  onFavoriteToggleAction: (recipeId: string) => void;
};

export default function RecipeQuickViewModal({
  open,
  item,
  details,
  loading,
  favoriteLoading,
  onCloseAction,
  onReviewAction,
  onFavoriteToggleAction,
}: RecipeQuickViewModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseAction();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onCloseAction]);

  const detailSource = details || item;
  const imageSrc = getSafeImageSrc(detailSource?.image_url);

  const ingredients = useMemo(
    () =>
      normalizeIngredients(
        details && "ingredients" in details ? details.ingredients : []
      ),
    [details]
  );

  const instructions = useMemo(
    () =>
      normalizeInstructions(
        details && "instructions" in details ? details.instructions : []
      ),
    [details]
  );

  if (!open || !item || !detailSource) return null;

  const chip = statusChip(item.has_reviewed, item.is_favorite);

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/55 backdrop-blur-[2px]"
      onClick={onCloseAction}
    >
      <div className="flex min-h-full items-start justify-center px-3 py-3 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
        <div
          className="flex w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)]"
          style={{ maxHeight: "calc(100vh - 24px)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="shrink-0 border-b border-slate-200 bg-white">
            <div className="flex items-start justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${chip.className}`}
                  >
                    {chip.text}
                  </span>

                  <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
                    Cookbook
                  </span>

                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {getDifficultyLabel(detailSource.difficulty_level)}
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {detailSource.title}
                </h2>

                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">
                  {detailSource.description?.trim()
                    ? detailSource.description
                    : "Explore the full recipe details, ingredients, and instructions from your cookbook."}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-slate-700">
                    <Clock3 size={14} className="text-teal-600" />
                    <span className="font-medium">
                      {formatMinutes(detailSource.prep_time, detailSource.cook_time)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-slate-700">
                    <Users size={14} className="text-teal-600" />
                    <span className="font-medium">
                      {detailSource.servings || "—"} servings
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-slate-700">
                    <Star size={14} className="text-teal-600" />
                    <span className="font-medium">
                      {Number(detailSource.rating_avg || 0).toFixed(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-slate-700">
                    <DollarSign size={14} className="text-teal-600" />
                    <span className="font-medium">
                      {detailSource.price != null
                        ? `${detailSource.price} XRP`
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onCloseAction}
                className="shrink-0 rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                aria-label="Close recipe popup"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6 sm:py-6">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative h-56 w-full bg-slate-100 sm:h-72 lg:h-[400px]">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={detailSource.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-teal-50 via-slate-100 to-amber-50 px-8 text-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm">
                        <UtensilsCrossed className="h-10 w-10 text-teal-600" />
                      </div>

                      <div className="mt-5 text-2xl font-semibold text-slate-700">
                        {getPlaceholderLabel(detailSource.title)}
                      </div>

                      <div className="mt-2 text-sm text-slate-500">
                        Preview image not available
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-4 py-5 sm:px-6 sm:py-6">
              {loading ? (
                <div className="py-16 text-center text-slate-500">
                  Loading recipe details...
                </div>
              ) : (
                <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr]">
                  <div className="space-y-6">
                    <section className="rounded-3xl border border-teal-100 bg-teal-50/50 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            Ingredients
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            Everything you need for this recipe
                          </p>
                        </div>

                        <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-200">
                          {ingredients.length}/{ingredients.length || 0}
                        </div>
                      </div>

                      {ingredients.length > 0 ? (
                        <ul className="mt-5 space-y-3">
                          {ingredients.map((ingredient, index) => (
                            <li
                              key={`${ingredient}-${index}`}
                              className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200"
                            >
                              <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-teal-500" />
                              <span className="leading-6">{ingredient}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-4 text-sm text-slate-500">
                          Ingredient list is not available.
                        </p>
                      )}
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-5">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Quick Details
                      </h3>

                      <div className="mt-4 space-y-4 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <span className="inline-flex items-center gap-2 text-slate-500">
                            <Clock3 size={16} />
                            Total time
                          </span>
                          <span className="font-medium text-slate-800">
                            {formatMinutes(
                              detailSource.prep_time,
                              detailSource.cook_time
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <span className="inline-flex items-center gap-2 text-slate-500">
                            <Sparkles size={16} />
                            Difficulty
                          </span>
                          <span className="font-medium text-slate-800">
                            {getDifficultyLabel(detailSource.difficulty_level)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <span className="inline-flex items-center gap-2 text-slate-500">
                            <Users size={16} />
                            Servings
                          </span>
                          <span className="font-medium text-slate-800">
                            {detailSource.servings || "—"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <span className="inline-flex items-center gap-2 text-slate-500">
                            <Star size={16} />
                            Rating
                          </span>
                          <span className="font-medium text-slate-800">
                            {Number(detailSource.rating_avg || 0).toFixed(1)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <span className="inline-flex items-center gap-2 text-slate-500">
                            <DollarSign size={16} />
                            Price
                          </span>
                          <span className="font-medium text-slate-800">
                            {detailSource.price != null
                              ? `${detailSource.price} XRP`
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </section>

                    {details?.chef_note?.trim() ? (
                      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
                        <div className="flex items-center gap-2 text-amber-800">
                          <ChefHat size={18} />
                          <h3 className="text-base font-semibold">
                            Chef’s Note
                          </h3>
                        </div>

                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-amber-900/85">
                          {details.chef_note}
                        </p>
                      </section>
                    ) : null}
                  </div>

                  <div className="space-y-6">
                    <section>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-teal-600" />
                        <h3 className="text-2xl font-semibold text-slate-900">
                          Instructions
                        </h3>
                      </div>

                      {instructions.length > 0 ? (
                        <div className="mt-5 space-y-5">
                          {instructions.map((step, index) => (
                            <div
                              key={`${step}-${index}`}
                              className="grid grid-cols-[50px_1fr] gap-4"
                            >
                              <div className="flex justify-center">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-teal-300 bg-white text-sm font-semibold text-teal-700">
                                  {index + 1}
                                </div>
                              </div>

                              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <h4 className="text-base font-semibold text-slate-900">
                                  Step {index + 1}
                                </h4>
                                <p className="mt-2 text-sm leading-7 text-slate-600">
                                  {step}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-slate-500">
                          Cooking instructions are not available.
                        </p>
                      )}
                    </section>

                    <section className="rounded-3xl border border-slate-200 bg-white p-5">
                      <h3 className="text-base font-semibold text-slate-900">
                        Your Actions
                      </h3>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() => onFavoriteToggleAction(item.recipe_id)}
                          disabled={favoriteLoading}
                          className={[
                            "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition",
                            favoriteLoading ? "cursor-not-allowed opacity-70" : "",
                            item.is_favorite
                              ? "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200 hover:bg-yellow-100"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          <Heart
                            size={16}
                            className={item.is_favorite ? "fill-current text-yellow-500" : ""}
                          />
                          {favoriteLoading
                            ? "Updating..."
                            : item.is_favorite
                            ? "Remove Favorite"
                            : "Add to Favorites"}
                        </button>

                        <button
                          type="button"
                          onClick={() => onReviewAction(item.recipe_id)}
                          className={[
                            "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition",
                            item.has_reviewed
                              ? "border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100"
                              : "bg-teal-600 text-white hover:bg-teal-700",
                          ].join(" ")}
                        >
                          <MessageSquareText size={16} />
                          {item.has_reviewed ? "Edit Review" : "Review Recipe"}
                        </button>
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white">
            <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={onCloseAction}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}