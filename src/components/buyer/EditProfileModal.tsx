"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, Camera, User, Mail, FileText, Check } from "lucide-react";

import type { BuyerProfile } from "@/lib/types/buyer";

type Props = {
  open: boolean;
  profile: BuyerProfile | null;
  isSaving: boolean;
  onCloseAction: () => void;
  onSaveAction: (payload: {
    displayName: string;
    bio: string;
    profilePhoto?: File | null;
  }) => Promise<void>;
};

function getInitials(name?: string, email?: string) {
  const source = String(name || email || "U").trim();

  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function EditProfileModal({
  open,
  profile,
  isSaving,
  onCloseAction,
  onSaveAction,
}: Props) {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !profile) return;

    setDisplayName(profile.display_name || profile.email || "");
    setBio(profile.bio || "");
    setProfilePhoto(null);
    setPreviewUrl(profile.profile_picture || "");
    setError("");
  }, [open, profile]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseAction();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onCloseAction]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const initials = useMemo(() => {
    return getInitials(displayName, profile?.email);
  }, [displayName, profile?.email]);

  if (!open || !profile) return null;

  const handleSubmit = async () => {
    const trimmedName = displayName.trim();
    const trimmedBio = bio.trim();

    if (trimmedName.length < 3) {
      setError("Display name must be at least 3 characters long.");
      return;
    }

    if (trimmedBio.length > 500) {
      setError("Bio must be 500 characters or less.");
      return;
    }

    try {
      setError("");

      await onSaveAction({
        displayName: trimmedName,
        bio: trimmedBio,
        profilePhoto,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes.");
    }
  };

  const handleFileChange = (file?: File | null) => {
    if (!file) {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }

      setProfilePhoto(null);
      setPreviewUrl(profile.profile_picture || "");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or smaller.");
      return;
    }

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setError("");
    setProfilePhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onCloseAction}
      />

      <div
        className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Update your details
            </p>
          </div>

          <button
            type="button"
            onClick={onCloseAction}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close edit profile modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto px-6 py-6">
          <div className="flex justify-center">
            <div className="group relative">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="h-24 w-24 rounded-full border-4 border-slate-50 object-cover shadow-md"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-slate-50 bg-gradient-to-br from-teal-50 to-emerald-100 text-2xl font-bold text-teal-700 shadow-md">
                  {initials}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-teal-50 hover:text-teal-600 hover:ring-teal-200 group-hover:scale-105"
                title="Change Photo"
                aria-label="Change profile photo"
              >
                <Camera className="h-4 w-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) =>
                  handleFileChange(event.target.files?.[0] || null)
                }
              />
            </div>
          </div>

          {error ? (
            <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          ) : null}

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <User className="h-4 w-4 text-slate-400" />
                Display Name
              </label>

              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Enter your display name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Mail className="h-4 w-4 text-slate-400" />
                Email Address
              </label>

              <input
                value={profile.email}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500 opacity-70 outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FileText className="h-4 w-4 text-slate-400" />
                Bio
              </label>

              <div className="relative">
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={3}
                  placeholder="Tell everyone a bit about yourself..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 pb-8 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                />

                <div className="absolute bottom-3 right-3 text-xs font-medium text-slate-400">
                  {bio.length}/500
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={onCloseAction}
            disabled={isSaving}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200/50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="group relative flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 focus:ring-4 focus:ring-teal-500/20 disabled:bg-slate-300 disabled:shadow-none"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin text-white/70"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              <>
                <Check className="h-4 w-4 transition-transform group-hover:scale-110" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}