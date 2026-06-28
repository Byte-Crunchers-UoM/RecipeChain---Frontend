'use client';

import React, { useEffect, useState } from 'react';
import RecipeCard from '@/components/RecipeCard';
import {
  Users,
  MoreVertical,
  TrendingUp,
  Loader2
} from 'lucide-react';
import Image from 'next/image';

const API_BASE_URL = 'http://localhost:4000/api';

const FollowedChefsPage = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [followedChefs, setFollowedChefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All Updates');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch recipes from followed chefs
        const recipesRes = await fetch(`${API_BASE_URL}/chefs/followed-recipes`);
        const recipesData = await recipesRes.json();
        if (recipesData.success) setRecipes(recipesData.recipes);

        // Fetch followed chefs list
        const chefsRes = await fetch(`${API_BASE_URL}/chefs/followed`);
        const chefsData = await chefsRes.json();
        if (chefsData.success) setFollowedChefs(chefsData.chefs);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filters = ['All Updates', 'New Recipes', 'Announcements'];

  return (
    <div className="p-8 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Main Content (Left) */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800 font-outfit mb-6">Followed Chefs</h1>

          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[20px] border border-slate-100 shadow-sm">
              <Loader2 className="animate-spin text-[#008080] mb-4" size={40} />
              <p className="text-slate-500 font-medium">Fetching updates from your chefs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
              {recipes.length > 0 ? (
                recipes.map((recipe, index) => (
                  <RecipeCard key={recipe.id || index} recipe={recipe} />
                ))
              ) : (
                <div className="col-span-full py-20 bg-white rounded-[20px] border border-slate-100 shadow-sm text-center">
                  <p className="text-slate-500">No updates yet. Follow more chefs to see their recipes!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-[400px] space-y-8">

          {/* Followed Chefs List */}
          <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#e6f2f2] rounded-full flex items-center justify-center text-[#008080]">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Your Followed Chefs</h3>
                  <p className="text-xs text-slate-400 font-medium">{followedChefs.length} chefs you follow</p>
                </div>
              </div>
            </div>

            <div className="space-y-5 mb-8">
              {followedChefs.length > 0 ? (
                followedChefs.map((chef, idx) => (
                  <div key={chef.id || idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12">
                        <Image
                          src={chef.avatar_url || '/chef1.png'}
                          alt={chef.name}
                          fill
                          className="rounded-full object-cover border-2 border-transparent group-hover:border-[#008080] transition-all"
                        />
                        {chef.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{chef.name}</h4>
                        <p className={`text-xs ${chef.online ? 'text-[#008080] font-semibold' : 'text-slate-400'}`}>
                          {chef.status || (chef.online ? 'Active now' : 'Offline')}
                        </p>
                      </div>
                    </div>
                    <button className="text-slate-300 hover:text-slate-600 transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No chefs followed yet.</p>
              )}
            </div>

            <button className="w-full py-3 bg-white border border-[#008080] text-[#008080] rounded-xl font-bold hover:bg-[#e6f2f2] transition-all text-sm">
              View All Chefs
            </button>
          </div>


        </div>
      </div>
    </div>
  );
};

export default FollowedChefsPage;
