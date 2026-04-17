"use client";

import { useEffect, useMemo, useState } from "react";
import type { BuyerProfile } from "@/types/buyer";

type Props = {
  open: boolean;
  profile: BuyerProfile | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: {
    displayName: string;
    bio: string;
    profilePhoto?: File | null;
  }) => Promise<void>;
};

export default function EditProfileModal({
  open,
  profile,
  isSaving,
  onClose,
  onSave,
}: Props) {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [error, setError] = useState("");

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

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const initials = useMemo(() => {
    const source = displayName || profile?.display_name || profile?.email || "U";
    return source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [displayName, profile]);

  if (!open || !profile) return null;

  const handleSubmit = async () => {
    const trimmedName = displayName.trim();
    const trimmedBio = bio.trim();

    if (trimmedName.length < 3) {
      setError("Display name must be at least 3 characters long");
      return;
    }

    if (trimmedBio.length > 500) {
      setError("Bio must be 500 characters or less");
      return;
    }

    setError("");
    await onSave({
      displayName: trimmedName,
      bio: trimmedBio,
      profilePhoto,
    });
  };

  const usernameValue = `@${(displayName || profile.display_name || profile.email || "buyer")
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_@.-]/g, "")}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-5 md:px-8">
          <h2 className="text-2xl font-semibold text-slate-800">Edit Profile</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-2xl leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="space-y-6 px-6 py-6 md:px-8">
          <div>
            <p className="mb-4 text-lg font-medium text-slate-700">Profile Picture</p>
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="h-24 w-24 rounded-full object-cover shadow-lg"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-500 text-3xl font-bold text-white shadow-lg">
                  {initials || "U"}
                </div>
              )}

              <label className="cursor-pointer rounded-2xl border border-slate-300 px-5 py-3 text-base text-slate-800 hover:bg-slate-50">
                Upload New Photo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setProfilePhoto(file);
                    if (file) {
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-lg font-medium text-slate-700">
              Display Name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-lg text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-500"
              placeholder="Enter display name"
            />
          </div>

          <div>
            <label className="mb-2 block text-lg font-medium text-slate-700">
              Username
            </label>
            <input
              value={usernameValue}
              disabled
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-5 py-4 text-lg text-slate-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-lg font-medium text-slate-700">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={5}
              className="w-full rounded-2xl border border-slate-300 px-5 py-4 text-base text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-500"
              placeholder="Write something about yourself"
            />
            <p className="mt-2 text-sm text-slate-500">{bio.length}/500</p>
          </div>

          {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-5 md:px-8">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-300 px-6 py-3 text-base text-slate-800 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="rounded-2xl bg-teal-600 px-6 py-3 text-base text-white shadow hover:bg-teal-700 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}