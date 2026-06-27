"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ChefHat, Check, MoreHorizontal } from "lucide-react";
import { followChef } from "@/services/api";
import { useNotifications } from "@/components/NotificationContext";

interface ChefCardProps {
  chef: {
    user_id: string;
    display_name: string;
    full_name: string;
    profile_photo: string | null;
    nationality: string | null;
    verify_badge_status: string;
    recipes: { count: number }[];
    followers_count: number;
  };
  currentBuyerId?: number;
}

const ChefDirectoryCard: React.FC<ChefCardProps> = ({ chef, currentBuyerId = 1 }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();
  
  const name = chef.display_name || chef.full_name || "Unknown Chef";
  const isVerified = chef.verify_badge_status === "verified";
  // The join returns an array for recipes, so we take the first element's count or 0
  const recipesCount = chef.recipes?.[0]?.count || 0;

  const handleFollowToggle = async () => {
    if (isLoading) return;

    if (!isFollowing) {
      setIsFollowing(true);
      setIsLoading(true);
      try {
        await followChef(chef.user_id, currentBuyerId);
        addNotification(`You started following ${name}.`, "success");
      } catch (error) {
        setIsFollowing(false);
        addNotification("Failed to follow chef. " + (error instanceof Error ? error.message : ""), "info");
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsFollowing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow relative flex flex-col">
      {/* Avatar */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-[3px] border-[#008080] bg-gray-100">
            {chef.profile_photo ? (
              <Image
                src={chef.profile_photo}
                alt={name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </div>
          {isVerified && (
            <div className="absolute bottom-0 right-0 translate-x-1 translate-y-1 bg-[#008080] rounded-full border-[3px] border-white w-8 h-8 flex items-center justify-center shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4" stroke="#008080" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="text-center mb-6 flex-1">
        <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1" title={name}>{name}</h3>
        
        <div className="flex items-center justify-center text-sm text-gray-500 mb-4 gap-1">
          <MapPin size={14} className="text-[#008080]" />
          <span className="line-clamp-1">{chef.nationality || "Unknown Location"}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-4 text-sm border-t border-b border-gray-50 py-3">
          <div className="flex items-center gap-1.5 text-gray-600 font-medium">
            <ChefHat size={16} className="text-[#008080]" />
            <span className="font-bold text-gray-900 mx-0.5">{recipesCount}</span>
            <span>Recipes</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <button
          onClick={handleFollowToggle}
          disabled={isLoading}
          className={`py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center ${
            isFollowing 
              ? "bg-[#e6f2f2] text-[#008080]" 
              : "bg-[#e6f2f2] text-[#008080] hover:bg-[#d5ebeb]"
          }`}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
        <Link 
          href={`/chefs/profile?id=${chef.user_id}`}
          className="py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default ChefDirectoryCard;
