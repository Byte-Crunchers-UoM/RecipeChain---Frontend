"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import DashboardLayout from '../../components/DashboardLayout';
import EditProfileModal from "./editProfile/EditProfileModal";

export default function ProfilePage() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!authLoading && authUser && typeof authUser.user_id === 'string') {
        try {
          const { data, error } = await supabase
            .from("sellers")
            .select("*")
            .eq("user_id", authUser.user_id)
            .single();

          if (data) setProfile(data);
        } catch (err) {
          console.error("Fetch error:", err);
        } finally {
          setLoading(false);
        }
      } else if (!authLoading && !authUser) {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [authUser, authLoading, supabase]);

  if (authLoading || loading) return <div className="p-10 text-center font-medium text-slate-500">Loading Chef Profile...</div>;
  if (!profile) return <div className="p-10 text-center">Profile not found.</div>;

  const social = profile.social_links || {};

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          
          {/* Header & Avatar Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-8">
            
            {/* Avatar Section */}
            <div className="relative w-32 h-32 flex-shrink-0">
              <div className={`w-full h-full rounded-full p-[3px] transition-all duration-500 ${
                profile.verify_badge_status === 'verified' 
                  ? 'bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-500 shadow-md' 
                  : 'bg-slate-100'
              }`}>
                <div className="w-full h-full rounded-full bg-white p-[2px]">
                  <img
                    src={profile.profile_photo || `https://ui-avatars.com/api/?name=${profile.full_name}&background=0D9488&color=fff&size=200`}
                    alt="Chef"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>

              {/* Premium Badge */}
              {profile.verify_badge_status === 'verified' && (
                <div className="absolute bottom-1 right-2">
                  <div className="relative flex items-center justify-center">
                    <div className="relative bg-blue-600 text-white p-1.5 rounded-full shadow-sm border-2 border-white">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Info and Bio Section */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2">
                  <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
                    {profile.display_name }
                  </h2>
                  {profile.verify_badge_status === 'verified' && (
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-medium border border-blue-100 self-center md:self-start">
                      Verified Chef
                    </span>
                  )}
                </div>
                <p className="text-teal-600 font-medium text-xs mt-0.5">@{profile.full_name || 'chef'}</p>
              </div>

              {/* Bio */}
              <div className="pt-2 border-t border-slate-50">
                <p className="text-slate-600 text-xs leading-relaxed italic max-w-2xl">
                  {profile.bio ? `${profile.bio}` : "No bio added yet. Click edit to add your culinary story."}
                </p>
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="inline-block px-5 py-1.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all font-medium text-xs shadow-sm active:scale-[0.98]"
              >
                Edit Profile
              </button>
            </div>
          </div>
                  
             {/* Personal Details Card - Inline View */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 className="text-md font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-teal-500 rounded-full"></span>
              Personal Details
            </h3>         

            <div className="space-y-3.5">
                <div className="flex flex-col md:flex-row md:items-center border-b border-slate-50 pb-3">
                <p className="text-[10px] font-normal text-slate-400 tracking-wider mb-0.5 md:mb-0 w-1/3">Nationality</p>
                <p className={`text-sm text-left font-normal ${profile.nationality ? 'text-slate-800' : 'text-slate-400'}`}>
                  {profile.nationality || "Not specified"}
                </p>
              </div>
           <div className="flex flex-col md:flex-row md:items-center pb-3 border-b border-slate-50">
                <p className="text-[10px] font-normal text-slate-400 tracking-wider mb-0.5 md:mb-0 w-1/3">Date of Birth</p>
                <p className={`text-sm text-left font-normal ${profile.date_of_birth ? 'text-slate-800' : 'text-slate-400'}`}>
                  {profile.date_of_birth || "Not specified"}
                </p>
              </div>
              <div className="flex flex-col md:flex-row md:items-center border-b border-slate-50 pb-3">
                <p className="text-[10px] font-normal text-slate-400 tracking-wider mb-0.5 md:mb-0 w-1/3">Phone No</p>
                <p className={`text-sm text-left font-normal ${profile.phone_no ? 'text-slate-800' : 'text-slate-400'}`}>
                  {profile.phone_no || "Not specified"}
                </p>
              </div>
              <div className="flex flex-col md:flex-row md:items-center border-b border-slate-50 pb-3">
                <p className="text-[10px] font-normal text-slate-400 tracking-wider mb-0.5 md:mb-0 w-1/3">NIC No</p>
                <p className={`text-sm text-left font-normal ${profile.nic_no ? 'text-slate-800' : 'text-slate-400'}`}>
                  {profile.nic_no || "Not specified"}
                </p>
              </div>
              <div className="flex flex-col md:flex-row md:items-center pt-1">
                <p className="text-[10px] font-normal text-slate-400 tracking-wider mb-0.5 md:mb-0 w-1/3">Address</p>
                <p className={`text-sm text-left leading-relaxed font-normal ${profile.address ? 'text-slate-800' : 'text-slate-400'}`}>
                  {profile.address || "Not specified"}
                </p>
              </div>
            </div>
          </div>
        

          {/* Professional Background - Inline View */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 className="text-md font-semibold text-slate-900 mb-6 flex items-center gap-2">
             <span className="w-1.5 h-5 bg-teal-500 rounded-full"></span>
              Professional Background
            </h3>
            <div className="space-y-3.5">          

              <div className="flex flex-col md:flex-row md:items-center pt-1">
                <p className="text-[10px] font-normal text-slate-400 tracking-wider mb-0.5 md:mb-0 w-1/3">Experience</p>
                <p className={`text-sm text-left leading-relaxed font-normal ${profile.experience ? 'text-slate-800' : 'text-slate-400'}`}>
                 {profile.experience || "Not specified"}
                </p>
              </div>
              <div className="flex flex-col md:flex-row md:items-center border-b border-slate-50 pb-3">
                <p className="text-[10px] font-normal text-slate-400 tracking-wider mb-0.5 md:mb-0 w-1/3">Main Cuisine</p>
                <p className={`text-sm text-left font-normal ${profile.cuisine ? 'text-slate-800' : 'text-slate-400'}`}>
                  {profile.cuisine || "Not specified"}
                </p>
              </div>
            </div>
            </div>

          {/* Digital Presence Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 className="text-md font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-teal-500 rounded-full"></span>
              Social Presence
            </h3>

            <div className="space-y-3.5">
              <div className="flex flex-col md:flex-row md:items-center border-b border-slate-50 pb-3">
                <p className="text-[10px] font-normal text-slate-400 tracking-wider mb-0.5 md:mb-0 w-1/3">Instagram</p>
                <p className={`text-sm text-left break-all font-normal ${social.instagram ? 'text-slate-800' : 'text-slate-400'}`}>
                  {social.instagram || "Not specified"}
                </p>
              </div>
              <div className="flex flex-col md:flex-row md:items-center border-b border-slate-50 pb-3">
                <p className="text-[10px] font-normal text-slate-400 tracking-wider mb-0.5 md:mb-0 w-1/3">Facebook</p>
                <p className={`text-sm text-left break-all font-normal ${social.facebook ? 'text-slate-800' : 'text-slate-400'}`}>
                  {social.facebook || "Not specified"}
                </p>
              </div>
              <div className="flex flex-col md:flex-row md:items-center border-b border-slate-50 pb-3">
                <p className="text-[10px] font-normal text-slate-400 tracking-wider mb-0.5 md:mb-0 w-1/3">YouTube</p>
                <p className={`text-sm text-left break-all font-normal ${social.youtube ? 'text-slate-800' : 'text-slate-400'}`}>
                  {social.youtube || "Not specified"}
               </p>
              </div>
              <div className="flex flex-col md:flex-row md:items-center pt-1">
                <p className="text-[10px] font-normal text-slate-400 tracking-wider mb-0.5 md:mb-0 w-1/3">TikTok</p>
                <p className={`text-sm text-left break-all font-normal ${social.tiktok ? 'text-slate-800' : 'text-slate-400'}`}>
                  {social.tiktok || "Not specified"}
                </p>
              </div>
            </div>
          </div>
      
          {/* Influence & Rating Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 className="text-md font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-teal-500 rounded-full"></span>
              Influence & Rating
            </h3>
            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <p className="text-3xl font-bold text-teal-600">
                  {profile.followers_count || 0}
                </p>
                <p className="text-[10px] text-slate-400 tracking-widest mt-1">
                  Total Followers
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold text-teal-600">
                  {profile.avg_rating !== null ? Number(profile.avg_rating).toFixed(1) : "N/A"}
                </p>
                <p className="text-[10px] text-slate-400 tracking-widest mt-1">
                  Average Rating
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    
      <EditProfileModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        profile={profile} 
        onSave={(updatedData: any) => setProfile(updatedData)} 
      />
    </DashboardLayout>
  );
}