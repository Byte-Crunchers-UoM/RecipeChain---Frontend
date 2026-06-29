'use client';

import React, { useMemo, useState } from 'react';
import RecipeCard from '@/components/RecipeCard';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, Search, Check, User, MoreHorizontal, Users } from 'lucide-react';
import { useFollowedChefs, Chef } from '@/context/FollowedChefsContext';

export default function FollowedChefsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  
  const { followedChefs, followedRecipes, isLoading, unfollowChefLocally } = useFollowedChefs();

  // Filter chefs based on search query
  const filteredChefs = useMemo(() => {
    if (!searchQuery.trim()) return followedChefs;
    const lowerQuery = searchQuery.toLowerCase();
    return followedChefs.filter(chef => {
      const name = (chef.display_name || chef.full_name || "").toLowerCase();
      return name.includes(lowerQuery);
    });
  }, [followedChefs, searchQuery]);

  // Sort and filter recipes
  const sortedRecipes = useMemo(() => {
    // Enrich recipes with chef name from followedChefs if missing
    let recipes = [...followedRecipes].map(recipe => {
      if (!recipe.chef_name && recipe.chef_id) {
        const chef = followedChefs.find(c => String(c.user_id) === String(recipe.chef_id));
        if (chef) {
          return {
            ...recipe,
            chef_name: chef.display_name || chef.full_name || "Unknown Chef"
          };
        }
      }
      return recipe;
    });

    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      recipes = recipes.filter(recipe => {
        const title = (recipe.title || "").toLowerCase();
        return title.includes(lowerQuery);
      });
    }

    return recipes.sort((a, b) => {
      if (a.title && b.title) {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [followedRecipes, searchQuery, followedChefs]);

  return (
    <div className="p-8 lg:p-10 max-w-[1400px] mx-auto w-full min-h-screen bg-slate-50">

      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
        <div>
          <h1 className="text-[28px] font-bold font-outfit text-slate-800">Followed Chefs</h1>
          <p className="text-slate-500 text-[14px] mt-1">Stay inspired by the chefs behind your favorite flavors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left Side: Uploaded Recipes */}
        <div className="lg:col-span-2">

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <Loader2 className="animate-spin text-[#008080] mb-4" size={40} />
              <p className="text-slate-500 font-medium">Loading recipes...</p>
            </div>
          ) : sortedRecipes.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
                <Search size={24} className="text-slate-300" />
              </div>
              <p className="font-medium text-slate-600">No recipes found yet</p>
              <p className="text-sm mt-1">Follow more chefs to discover their uploaded recipes here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {sortedRecipes.map((recipe, index) => (
                <RecipeCard key={`${recipe.recipe_id}-${index}`} recipe={recipe as any} />
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Followed Chefs List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-8">
            <div className="flex items-center gap-3 mb-1">
              <Users size={28} className="text-[#008080]" />
              <h2 className="text-[24px] font-medium font-outfit text-slate-800">Your Followed Chefs</h2>
            </div>
            <p className="text-[16px] text-slate-500 mb-6">
              {filteredChefs.length} {filteredChefs.length === 1 ? 'chef' : 'chefs'} you follow
            </p>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-slate-300" size={24} />
              </div>
            ) : filteredChefs.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <p className="text-sm">{searchQuery ? 'No chefs found matching your search.' : 'You are not following anyone yet.'}</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredChefs.map((chef: Chef) => {
                  const name = chef.display_name || chef.full_name || "Unknown Chef";
                  const isVerified = chef.verify_badge_status === "verified";

                  return (
                    <div key={chef.user_id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div 
                        className="flex items-center gap-3 cursor-pointer"
                        onDoubleClick={() => router.push(`/chefs/profile?id=${chef.user_id}`)}
                        title="Double-click to view profile"
                      >
                        <div className="relative">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-50 border-2 border-[#008080] flex items-center justify-center shrink-0">
                            {chef.profile_photo ? (
                              <Image
                                src={chef.profile_photo}
                                alt={name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <User className="text-slate-400" size={24} strokeWidth={1.5} />
                            )}
                          </div>
                          {isVerified && (
                            <div className="absolute -bottom-1 -right-1 bg-[#008080] rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm">
                              <Check size={10} strokeWidth={3} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800 text-[14px] leading-tight max-w-[120px] truncate" title={name}>{name}</h3>
                          {chef.followers_count !== undefined && (
                            <p className="text-[12px] text-slate-500 mt-0.5">{chef.followers_count} followers</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => unfollowChefLocally(chef.user_id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-500 rounded-full text-[12px] font-semibold transition-colors"
                        >
                          Unfollow
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
