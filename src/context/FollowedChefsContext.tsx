"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getChefRecipes } from "@/services/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface Chef {
  user_id: string | number;
  display_name?: string;
  full_name?: string;
  profile_photo?: string | null;
  verify_badge_status?: string;
  followers_count?: number;
  [key: string]: any;
}

export interface Recipe {
  recipe_id: string;
  title: string;
  chef_id?: string | number;
  [key: string]: any;
}

interface FollowedChefsContextType {
  followedChefs: Chef[];
  followedRecipes: Recipe[];
  isLoading: boolean;
  followChefLocally: (chef: Chef) => Promise<void>;
  unfollowChefLocally: (chefId: string | number) => void;
  isFollowingLocally: (chefId: string | number) => boolean;
}

const FollowedChefsContext = createContext<FollowedChefsContextType | undefined>(undefined);

export function FollowedChefsProvider({ children }: { children: ReactNode }) {
  const [followedChefs, setFollowedChefs] = useState<Chef[]>([]);
  const [followedRecipes, setFollowedRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);

        // First, check localStorage for persisted state
        const savedChefs = localStorage.getItem('followedChefs');
        const savedRecipes = localStorage.getItem('followedRecipes');
        
        if (savedChefs && savedRecipes) {
          try {
            const parsedChefs = JSON.parse(savedChefs);
            const parsedRecipes = JSON.parse(savedRecipes);
            if (Array.isArray(parsedChefs) && Array.isArray(parsedRecipes)) {
              if (isMounted) {
                setFollowedChefs(parsedChefs);
                setFollowedRecipes(parsedRecipes);
                setIsLoading(false);
              }
              // Still fetch in the background to get latest updates if needed, 
              // but we won't overwrite unless the API actually returns data.
            }
          } catch (e) {
            console.error("Error parsing localStorage data", e);
          }
        }
        // Fetch followed chefs list (if backend is active)
        const chefsRes = await fetch(`${API_BASE_URL}/chefs/followed`);
        const chefsData = await chefsRes.json();
        if (chefsData.success && isMounted && chefsData.chefs && chefsData.chefs.length > 0) {
          setFollowedChefs(chefsData.chefs);
        }

        // Fetch recipes from followed chefs
        const recipesRes = await fetch(`${API_BASE_URL}/chefs/followed-recipes`);
        const recipesData = await recipesRes.json();
        if (recipesData.success && isMounted && recipesData.recipes && recipesData.recipes.length > 0) {
          setFollowedRecipes(recipesData.recipes);
        }
      } catch (error) {
        console.error("Error fetching initial followed data:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchInitialData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync to localStorage whenever state changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('followedChefs', JSON.stringify(followedChefs));
      localStorage.setItem('followedRecipes', JSON.stringify(followedRecipes));
    }
  }, [followedChefs, followedRecipes, isLoading]);

  const followChefLocally = async (chef: Chef) => {
    // Add to top of the list
    setFollowedChefs((prev) => {
      if (prev.some((c) => String(c.user_id) === String(chef.user_id))) return prev;
      return [chef, ...prev];
    });

    // Try fetching their recipes
    try {
      const recipesData = await getChefRecipes(String(chef.user_id));
      if (recipesData && Array.isArray(recipesData)) {
        // Tag recipes with chef_id if not present
        const recipes = recipesData.map((r: any) => ({ ...r, chef_id: chef.user_id }));
        setFollowedRecipes((prev) => [...recipes, ...prev]);
      }
    } catch (error) {
      console.error("Error fetching recipes for newly followed chef", error);
    }
  };

  const unfollowChefLocally = (chefId: string | number) => {
    // Remove from chefs list
    setFollowedChefs((prev) => prev.filter((c) => String(c.user_id) !== String(chefId)));
    
    // Remove their recipes (only in frontend)
    setFollowedRecipes((prev) => prev.filter((r) => {
       // if recipe has chef_id, we can filter. 
       // If the backend returns `chef_id` inside recipe, use it.
       // Some backend might return it nested or as something else.
       // For safety, assuming `r.chef_id` exists (we inject it in followChefLocally, or hope backend provides it).
       if (r.chef_id) return String(r.chef_id) !== String(chefId);
       
       // Fallback: If we don't have chef_id, we might not be able to perfectly remove it, 
       // but we'll try removing based on chef_name if available
       const chefToRemove = followedChefs.find(c => String(c.user_id) === String(chefId));
       if (chefToRemove && r.chef_name) {
          const name1 = chefToRemove.display_name || chefToRemove.full_name;
          return r.chef_name !== name1;
       }
       return true; 
    }));
  };

  const isFollowingLocally = (chefId: string | number) => {
    return followedChefs.some((c) => String(c.user_id) === String(chefId));
  };

  return (
    <FollowedChefsContext.Provider value={{ followedChefs, followedRecipes, isLoading, followChefLocally, unfollowChefLocally, isFollowingLocally }}>
      {children}
    </FollowedChefsContext.Provider>
  );
}

export function useFollowedChefs() {
  const context = useContext(FollowedChefsContext);
  if (context === undefined) {
    throw new Error("useFollowedChefs must be used within a FollowedChefsProvider");
  }
  return context;
}
