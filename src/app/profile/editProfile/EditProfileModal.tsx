"use client";
import { createClient } from "@/utils/supabase/client";
import React, { useState, useEffect } from 'react';

const CameraIcon = () => <span>📷</span>;
const UploadIcon = () => <span>📤</span>;
const ShieldCheckIcon = () => <span>🛡️</span>;
const ChevronDownIcon = () => <span>▼</span>;
const TagIcon = () => <span>🏷️</span>;
const GlobeIcon = () => <span>🌐</span>;

export default function EditProfileModal({ isOpen, onClose, profile: initialProfile, onSaveFunction, onSave }: any) {
  const supabase = createClient();
  
  // 1. States should be at the top level
  const [profile, setProfile] = useState(initialProfile || {});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false); 

  const cuisineOptions = ["Italian", "French", "Japanese", "Chinese", "Sri Lankan", "Indian"];

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  if (!isOpen) return null;

  const updateProfileField = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const updateSocialField = (field: string, value: string) => {
    setProfile({
      ...profile,
      social_links: { 
        ...(profile.social_links || {}), 
        [field]: value 
      }
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "recipechain");
    
    const res = await fetch("https://api.cloudinary.com/v1_1/dc2hvm5j2/image/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Cloudinary Upload Failed");
    return data.secure_url;
  };

  const handleSave = async () => {
    setIsUpdating(true); 
    try {
      let uploadedImageUrl = profile?.profile_photo; 

      if (selectedFile) {
        console.log("Starting Cloudinary upload for:", selectedFile.name);
        uploadedImageUrl = await uploadToCloudinary(selectedFile);
        console.log("Cloudinary upload successful. New URL:", uploadedImageUrl);
      }

      console.log("Starting Supabase update with photo URL:", uploadedImageUrl);
      
      const { error } = await supabase
        .from("sellers")
        .update({
          full_name: profile.full_name,
          display_name: profile.display_name,
          profile_photo: uploadedImageUrl, 
          bio: profile.bio,
          experience: profile.experience,
          cuisine: profile.cuisine,
          social_links: profile.social_links,
        })
        .eq("user_id", profile.user_id);

      if (error) {
        console.error("Supabase update error detail:", error);
        throw error;
      }

      console.log("Supabase update successful!");

      if (typeof onSave === "function") {
        onSave({ ...profile, profile_photo: uploadedImageUrl });
      } else {
        console.warn("SaveFunction not provided or out of scope");
      }

      setShowSuccessDialog(true); 

    } catch (error: any) {
      console.error("Complete Error updating profile:", error.message);
      alert("Failed to update profile. " + error.message);
    } finally {
      setIsUpdating(false); 
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[40px] bg-[#f4f7f7] shadow-2xl transition-all">
          
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-10 py-6 backdrop-blur-md">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit Profile</h1>
              <p className="text-sm text-slate-500">Manage your public chef information</p>
            </div>
            <button 
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="p-10">
            <div className="grid gap-8 xl:grid-cols-[320px_1fr]">
              
              <div className="space-y-6">
                <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
                  <h2 className="text-base font-semibold text-slate-900 mb-6">Profile Photo</h2>
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <img
                        src={
                          selectedFile
                            ? URL.createObjectURL(selectedFile)
                            : profile?.profile_photo ||
                              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                profile?.full_name || "Chef"
                              )}&background=0D9488&color=fff&size=128`
                        }
                        alt="Profile preview"
                        className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-xl bg-slate-100"
                      />
                      <label className="absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-teal-500 text-white shadow-lg transition hover:bg-teal-600 active:scale-95">
                        <CameraIcon />
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                      </label>
                    </div>
                    
                    <label className="mt-8 flex w-full cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm font-medium text-slate-500 transition hover:border-teal-300 hover:bg-teal-50/40 active:scale-[0.98]">
                      <span className="flex items-center gap-2 text-slate-600">
                        <UploadIcon /> {selectedFile ? "Change Selection" : "Upload New Photo"}
                      </span>
                      {selectedFile && (
                        <span className="text-xs text-teal-600 font-semibold truncate max-w-xs">
                          Selected: {selectedFile.name}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">PNG, JPG or WEBP up to 5MB</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />
                    </label>
                  </div>
                </section>
              </div>

              <div className="space-y-8">
                <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
                  <h2 className="text-base font-semibold text-slate-900 mb-6">Profile Information</h2>
                  <div className="grid gap-6">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Chef Display Name</label>
                      <input
                        type="text"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-teal-300 focus:ring-4 focus:ring-teal-100 outline-none transition"
                        value={profile.display_name || ''}
                        onChange={(e) => updateProfileField('display_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Chef Bio</label>
                      <textarea
                        rows={4}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-teal-300 focus:ring-4 focus:ring-teal-100 outline-none transition"
                        value={profile.bio || ''}
                        onChange={(e) => updateProfileField('bio', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Experience</label>
                      <textarea
                        rows={3}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-teal-300 focus:ring-4 focus:ring-teal-100 outline-none transition"
                        value={profile.experience || ''}
                        onChange={(e) => updateProfileField('experience', e.target.value)}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Primary Cuisine</label>
                        <div className="relative">
                          <select 
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-teal-300 focus:ring-4 focus:ring-teal-100 outline-none cursor-pointer"
                            value={profile.cuisine || ''}
                            onChange={(e) => updateProfileField('cuisine', e.target.value)}
                          >
                            <option value="">Select Cuisine</option>
                            {cuisineOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><ChevronDownIcon /></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
                  <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-base font-semibold text-slate-900">Social Links</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Optional</span>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Instagram */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Instagram</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">📸</span>
                        <input
                          type="text"
                          className="w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-3 text-sm focus:border-teal-300 focus:ring-4 focus:ring-teal-100 outline-none transition"
                          placeholder="@username"
                          value={profile?.social_links?.instagram || ''}
                          onChange={(e) => updateSocialField('instagram', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* YouTube */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">YouTube</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">📺</span>
                        <input
                          type="text"
                          className="w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-3 text-sm focus:border-teal-300 focus:ring-4 focus:ring-teal-100 outline-none transition"
                          placeholder="Channel link"
                          value={profile?.social_links?.youtube || ''}
                          onChange={(e) => updateSocialField('youtube', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Facebook */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Facebook</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">👤</span>
                        <input
                          type="text"
                          className="w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-3 text-sm focus:border-teal-300 focus:ring-4 focus:ring-teal-100 outline-none transition"
                          placeholder="Profile link"
                          value={profile?.social_links?.facebook || ''}
                          onChange={(e) => updateSocialField('facebook', e.target.value)}
                        />
                      </div>
                    </div>
                
                    {/* TikTok */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">TikTok</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🎵</span>
                        <input
                          type="text"
                          className="w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-3 text-sm focus:border-teal-300 focus:ring-4 focus:ring-teal-100 outline-none transition"
                          placeholder="@username"
                          value={profile?.social_links?.tiktok || ''}
                          onChange={(e) => updateSocialField('tiktok', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white/90 px-10 py-6 backdrop-blur-md">
            <button 
              onClick={onClose} 
              className="rounded-2xl px-8 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isUpdating}
              className="inline-flex items-center gap-2 rounded-2xl bg-teal-500 px-10 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-200 hover:bg-teal-600 transition-all active:scale-95 disabled:opacity-50"
            >
              <UploadIcon /> {isUpdating ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Success Confirmation Modal */}
      {showSuccessDialog && (
        <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[32px] bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-600 text-2xl">
              <ShieldCheckIcon />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Profile Saved!</h3>
            <p className="text-sm text-slate-500 mb-8">
              Your profile information has been successfully updated.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => {
                  setShowSuccessDialog(false);
                  onClose(); 
                }}
                className="w-full rounded-2xl bg-teal-500 py-3 text-sm font-semibold text-white shadow-lg hover:bg-teal-600 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}