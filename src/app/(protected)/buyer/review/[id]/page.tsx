"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock3,
  Loader2,
  Star,
  ChefHat,
  X,
  ImagePlus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  getCookbookRecipeForReview,
  saveCookbookRecipeReview,
} from "@/lib/api/cookbook";
import type { CookbookRecipeReviewData } from "@/types/cookbook";

const MAX_PHOTOS = 5;
const MAX_COMMENT_LENGTH = 500;

function formatMinutes(prep?: number | null, cook?: number | null) {
  const total = Number(prep || 0) + Number(cook || 0);
  if (!total) return "Time not available";
  return `${total} min`;
}

function getSafeImageSrc(value?: string | null) {
  const cleaned = String(value || "").trim();
  return cleaned.length > 0 ? cleaned : null;
}

function getDifficultyLabel(value?: string | null) {
  const safe = String(value || "").trim();
  return safe || "Not specified";
}

export default function BuyerRecipeReviewPage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = String(params?.id || "");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [recipe, setRecipe] = useState<CookbookRecipeReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const hasExistingReview = Boolean(recipe?.my_feedback);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setPageError("");
        setFormError("");

        const data = await getCookbookRecipeForReview(recipeId);
        setRecipe(data);
        setRating(Number(data?.my_feedback?.rating || 0));
        setComment(String(data?.my_feedback?.comment || ""));
      } catch (err) {
        setPageError(
          err instanceof Error ? err.message : "Failed to load review page"
        );
      } finally {
        setLoading(false);
      }
    };

    if (recipeId) {
      void load();
    }
  }, [recipeId]);

  useEffect(() => {
    const urls = selectedPhotos.map((file) => URL.createObjectURL(file));
    setPhotoPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedPhotos]);

  const imageSrc = useMemo(() => getSafeImageSrc(recipe?.image_url), [recipe]);

  const existingPhotoCount = recipe?.my_feedback?.images?.length || 0;
  const remainingSlots = Math.max(
    MAX_PHOTOS - existingPhotoCount - selectedPhotos.length,
    0
  );

  const visibleRating = hoverRating || rating;

  const canSubmit =
    rating >= 1 &&
    comment.trim().length > 0 &&
    comment.trim().length <= MAX_COMMENT_LENGTH &&
    !saving;

  const commentCounterColor =
    comment.length >= 470
      ? "text-amber-600"
      : comment.length >= 430
      ? "text-slate-500"
      : "text-slate-400";

  const reviewHelperText = hasExistingReview
    ? "Update your rating, comment, or photos below."
    : "Share what you loved, modifications you made, and tips for others.";

  const handlePhotoAdd = (files: FileList | File[] | null) => {
    if (!files) return;

    const incoming = Array.from(files);

    if (incoming.length === 0) return;

    if (remainingSlots <= 0) {
      setFormError(
        `You already reached the maximum of ${MAX_PHOTOS} review photos.`
      );
      return;
    }

    const validImages = incoming.filter((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type)
    );

    if (validImages.length !== incoming.length) {
      setFormError("Only JPG, PNG, and WEBP images are allowed.");
      return;
    }

    const limited = validImages.slice(0, remainingSlots);
    setSelectedPhotos((prev) => [...prev, ...limited]);
    setFormError("");
    setSuccessMessage("");
    
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handlePhotoChange = (files: FileList | null) => {
    handlePhotoAdd(files);
  };

  const removeSelectedPhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const clearForm = () => {
    setRating(Number(recipe?.my_feedback?.rating || 0));
    setHoverRating(0);
    setComment(String(recipe?.my_feedback?.comment || ""));
    setSelectedPhotos([]);
    setSuccessMessage("");
    setFormError("");
  };

  const handleSubmit = async () => {
    if (rating < 1) {
      setFormError("Please select a star rating.");
      return;
    }

    if (!comment.trim()) {
      setFormError("Please write a short review before submitting.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");
      setSuccessMessage("");

      await saveCookbookRecipeReview({
        recipeId,
        rating,
        comment: comment.trim(),
        photos: selectedPhotos,
      });

      router.replace("/buyer/cookbook");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save review");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 pb-20">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
          <span className="text-sm font-medium text-slate-600">Loading your cookbook recipe...</span>
        </div>
      </div>
    );
  }

  if (pageError && !recipe) {
    return (
      <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
        <h2 className="text-lg font-semibold text-red-800">Oops! Something went wrong</h2>
        <p className="mt-2 text-red-600">{pageError}</p>
        <button
          onClick={() => router.push("/buyer/cookbook")}
          className="mt-6 rounded-full bg-red-100 px-6 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-200"
        >
          Return to Cookbook
        </button>
      </div>
    );
  }

  const totalPhotos = existingPhotoCount + photoPreviewUrls.length;

  return (
    <div className="bg-slate-50 px-4 py-8 sm:px-6 md:py-12" style={{ minHeight: "calc(100vh - 76px)" }}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/buyer/cookbook")}
            className="group flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Cookbook
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          
          <div 
            className="relative flex w-full flex-col justify-end overflow-hidden bg-slate-100"
            style={{ minHeight: "240px" }}
          >
            <div className="absolute inset-0 z-0">
              {imageSrc ? (
                <>
                  <img
                    src={imageSrc}
                    alt={recipe?.title || "Recipe"}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80" />
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-200">
                  <ChefHat size={80} className="opacity-40" />
                </div>
              )}
            </div>

            <div className={`relative z-10 mt-auto w-full p-6 sm:p-8 ${imageSrc ? "text-white" : "text-slate-900"}`}>
              <div className="mb-3 flex items-center gap-2">
                {hasExistingReview ? (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${
                    imageSrc 
                      ? "bg-white/20 text-white border-white/30 backdrop-blur-md" 
                      : "bg-slate-200/50 text-slate-800 border-slate-300"
                  }`}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Editing Review
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border ${
                    imageSrc 
                      ? "bg-teal-500/80 text-white border-teal-400/50 backdrop-blur-md" 
                      : "bg-teal-100 text-teal-800 border-teal-200"
                  }`}>
                    <Star className={`h-3.5 w-3.5 ${imageSrc ? "fill-white/80" : "fill-teal-800"}`} />
                    New Review
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {recipe?.title}
              </h1>

              <div className={`mt-4 flex flex-wrap items-center gap-4 text-sm font-medium ${imageSrc ? "text-slate-200" : "text-slate-600"}`}>
                <div className="flex items-center gap-1.5">
                  <Clock3 size={16} className={imageSrc ? "text-slate-300" : "text-slate-500"} />
                  {formatMinutes(recipe?.prep_time, recipe?.cook_time)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  {Number(recipe?.rating_avg || 0).toFixed(1)} Rating
                </div>
                {recipe?.difficulty_level && (
                  <div className="flex items-center gap-1.5 capitalize">
                    <ChefHat size={16} className={imageSrc ? "text-slate-300" : "text-slate-500"} />
                    {getDifficultyLabel(recipe.difficulty_level)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-900">
                {hasExistingReview ? "Update your experience" : "How was the recipe?"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{reviewHelperText}</p>
            </div>

            {successMessage && (
              <div className="mb-8 flex items-start gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800 shadow-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}

            {formError && (
              <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <span className="font-medium">{formError}</span>
              </div>
            )}

            <div className="flex flex-col gap-8">
              <div>
                <label className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Overall Rating <span className="text-red-500">*</span>
                </label>

                <div className="mt-3 py-2">
                  <div className="flex items-center justify-start gap-1 sm:gap-2">
                    {[1, 2, 3, 4, 5].map((value) => {
                      const active = value <= visibleRating;

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setRating(value);
                            setFormError("");
                            setSuccessMessage("");
                          }}
                          onMouseEnter={() => setHoverRating(value)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="rounded-full p-1.5 transition-transform duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                          aria-label={`Rate ${value} stars`}
                        >
                          <Star
                            size={44}
                            color={active ? "#fbbf24" : "#cbd5e1"}
                            fill={active ? "#fbbf24" : "transparent"}
                            className="transition-all duration-200 drop-shadow-sm"
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 ml-2 text-sm font-medium transition-colors duration-200">
                    <span className={visibleRating > 0 ? "text-amber-600" : "text-slate-400"}>
                      {visibleRating === 0
                        ? "Tap a star to rate"
                        : visibleRating === 1
                        ? "1 - Not my favorite"
                        : visibleRating === 2
                        ? "2 - Needs improvement"
                        : visibleRating === 3
                        ? "3 - It was good"
                        : visibleRating === 4
                        ? "4 - Very good"
                        : "5 - Absolutely delicious!"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Written Review <span className="text-red-500">*</span>
                </label>

                <div className="mt-3">
                  <textarea
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      setFormError("");
                      setSuccessMessage("");
                    }}
                    maxLength={MAX_COMMENT_LENGTH}
                    placeholder="Did you make any changes? How did it turn out? Share your tips with others..."
                    className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/50 p-5 text-base leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-teal-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-400/10 transition-all duration-200 min-h-[160px]"
                    style={{ minHeight: "160px" }}
                  />
                  <div className={`mt-2 flex justify-end text-xs font-medium ${commentCounterColor}`}>
                    {comment.length} / {MAX_COMMENT_LENGTH}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex flex-row flex-wrap items-center justify-between gap-2">
                  <label className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Food Photos <span className="text-slate-400 normal-case tracking-normal font-normal">(Optional)</span>
                  </label>
                  <span className="text-xs font-medium text-slate-400">
                    {remainingSlots} slots left
                  </span>
                </div>

                {totalPhotos === 0 ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragActive(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragActive(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragActive(false);
                      handlePhotoAdd(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 transition-all duration-200 ${
                      isDragActive
                        ? "border-teal-400 bg-teal-50"
                        : "border-slate-200 bg-slate-50 hover:border-teal-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-teal-600 shadow-sm ring-1 ring-slate-100">
                      <ImagePlus size={28} />
                    </div>
                    <div className="text-base font-semibold text-slate-700">
                      Click to upload or drag and drop
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      Share up to {MAX_PHOTOS} photos of your dish
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                      JPG, PNG, WEBP (Max 5MB each)
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {recipe?.my_feedback?.images?.map((image) => (
                      <div
                        key={image.image_id}
                        className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                      >
                        <img
                          src={image.image_url}
                          alt="Review upload"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    ))}

                    {photoPreviewUrls.map((url, index) => (
                      <div
                        key={url}
                        className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                      >
                        <img
                          src={url}
                          alt={`Selected ${index + 1}`}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/20" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSelectedPhoto(index);
                          }}
                          className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-slate-700 opacity-0 shadow-sm transition-all duration-200 hover:bg-red-500 hover:text-white group-hover:opacity-100"
                          aria-label="Remove photo"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}

                    {remainingSlots > 0 && (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragActive(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setIsDragActive(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragActive(false);
                          handlePhotoAdd(e.dataTransfer.files);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200 ${
                          isDragActive
                            ? "border-teal-400 bg-teal-50 text-teal-700"
                            : "border-slate-200 bg-slate-50 text-slate-500 hover:border-teal-300 hover:bg-teal-50/50 hover:text-teal-600"
                        }`}
                      >
                        <ImagePlus size={24} className="mb-2" />
                        <span className="text-sm font-semibold">Add Photo</span>
                        <span className="mt-0.5 text-xs font-medium opacity-70">
                          {remainingSlots} left
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePhotoChange(e.target.files)}
                  disabled={remainingSlots <= 0}
                />
              </div>

              <div className="mt-10 flex flex-col-reverse items-center gap-4 border-t border-slate-100 pt-8 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={clearForm}
                  className="w-full rounded-2xl px-6 py-3.5 text-base font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 sm:w-auto"
                >
                  Clear Form
                </button>

                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                  className="w-full rounded-2xl bg-teal-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-teal-600/25 transition-all hover:-translate-y-0.5 hover:bg-teal-700 hover:shadow-teal-600/40 disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:min-w-48"
                >
                  {saving
                    ? "Saving Review..."
                    : hasExistingReview
                    ? "Update Review"
                    : "Post Review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}