'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext'; 
import DashboardLayout from '../../../../components/DashboardLayout';
import { AlertTriangle, Unlock, Star } from 'lucide-react';

interface Recipe {
  recipe_id: string;
  title: string;
  image_url: string;
  price: number;
  status: string;
  approval_status: string;
  rejection_reason?: string | null;
  unlocks_count: number;
  rating_avg: number;
  created_at: string;
}

const RecipeUnlockCount: React.FC<{ recipeId: string }> = ({ recipeId }) => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    async function fetchUnlockCount() {
      const { count: unlockCount, error } = await supabase
        .from('recipe_purchases')
        .select('*', { count: 'exact', head: true })
        .eq('recipe_id', recipeId);

      if (!error && unlockCount !== null) {
        setCount(unlockCount);
      }
    }
    fetchUnlockCount();
  }, [recipeId]);

  return (
    <div className="flex items-center gap-1">
      <Unlock className="w-3.5 h-3.5 text-teal-600" />
      <span>{count || 0} unlocks</span>
    </div>
  );
};

export const getRecipeStatus = (status: string, approval: string) => {
  const s = status?.toLowerCase();
  const a = approval?.toLowerCase();

  if (s === 'deactive') {
    return { label: 'Deactivated', classes: 'bg-red-500 text-white' };
  }

  if (a === 'rejected' || s === 'rejected') {
    return { label: 'Rejected', classes: 'bg-red-500 text-white' };
  }
  
  if (a === 'pending') {
    return { label: 'Pending', classes: 'bg-orange-500 text-white' };
  }

  if (a === 'published' || s === 'active') {
    return { label: 'Active', classes: 'bg-[#0d9488] text-white' };
  }

  if (s === 'draft' && a === 'draft') {
    return { label: 'Draft', classes: 'bg-gray-400 text-white' };
  }

  return { label: 'Draft', classes: 'bg-gray-400 text-white' };
};

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    Italian: 'bg-blue-100 text-blue-700',
    Vegan: 'bg-green-100 text-green-700',
    Seafood: 'bg-cyan-100 text-cyan-700',
    Dessert: 'bg-pink-100 text-pink-700',
  };
  return colors[category] || 'bg-gray-100 text-gray-700';
};

export default function RecipesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedTab, setSelectedTab] = useState('All Recipes');

  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [ActivateModalOpen, setActivateModalOpen] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [showRejectedToast, setShowRejectedToast] = useState(false);

  useEffect(() => {
    async function fetchMyRecipes() {
      if (authLoading || !isAuthenticated || !user) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('chef_id', user.user_id)
          .neq('status', 'delete')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRecipes(data || []);
      } catch (error: any) {
        console.error('Error fetching recipes:', error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMyRecipes();
  }, [user, isAuthenticated, authLoading]);

  useEffect(() => {
    if (loading) return;

    const hasShownToast = sessionStorage.getItem('hasShownRejectedToast');

    if (!hasShownToast) {
      const hasRejectedRecipes = recipes.some(
        (recipe) => getRecipeStatus(recipe.status, recipe.approval_status).label === 'Rejected'
      );

      if (hasRejectedRecipes) {
        setShowRejectedToast(true);
        sessionStorage.setItem('hasShownRejectedToast', 'true');

        const timer = window.setTimeout(() => setShowRejectedToast(false), 5000);
        return () => window.clearTimeout(timer);
      }
    }
  }, [loading, recipes]);

  const confirmDeactivate = async () => {
    if (!selectedRecipeId) return;

    try {
      const { error } = await supabase
        .from('recipes')
        .update({ status: 'deactive' })
        .eq('recipe_id', selectedRecipeId);

      if (error) throw error;

      setRecipes((prevRecipes) =>
        prevRecipes.map((r) =>
          r.recipe_id === selectedRecipeId ? { ...r, status: 'deactive' } : r
        )
      );
    } catch (error: any) {
      console.error('Error deactivating recipe:', error.message);
    } finally {
      setIsDeactivateModalOpen(false);
      setSelectedRecipeId(null);
    }
  };

  const confirmActivate = async () => {
    if (!selectedRecipeId) return;

    try {
      const { error } = await supabase
        .from('recipes')
        .update({ status: 'active' })
        .eq('recipe_id', selectedRecipeId);

      if (error) throw error;

      setRecipes((prevRecipes) =>
        prevRecipes.map((r) =>
          r.recipe_id === selectedRecipeId ? { ...r, status: 'published' } : r
        )
      );
    } catch (error: any) {
      console.error('Error activating recipe:', error.message);
    } finally {
      setActivateModalOpen(false);
      setSelectedRecipeId(null);
    }
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const statusInfo = getRecipeStatus(recipe.status, recipe.approval_status);
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (selectedTab !== 'All Recipes') {
      if (selectedTab === 'Deactivated') {
        matchesStatus = recipe.status?.toLowerCase() === 'deactive';
      } else if (selectedTab === 'Rejected') {
        matchesStatus = statusInfo.label === 'Rejected';
      } else {
        matchesStatus = statusInfo.label === selectedTab;
      }
    }

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: recipes.length,
    active: recipes.filter((recipe) => getRecipeStatus(recipe.status, recipe.approval_status).label === 'Active').length,
    pending: recipes.filter((recipe) => getRecipeStatus(recipe.status, recipe.approval_status).label === 'Pending').length,
    draft: recipes.filter((recipe) => getRecipeStatus(recipe.status, recipe.approval_status).label === 'Draft').length,
    deactivated: recipes.filter((recipe) => recipe.status?.toLowerCase() === 'deactive').length,
    rejected: recipes.filter((recipe) => getRecipeStatus(recipe.status, recipe.approval_status).label === 'Rejected').length,
  };

  if (authLoading || (loading && recipes.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafb]">
        <p className="animate-pulse font-roboto text-gray-500">Loading your recipes...</p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-[#f8fafb] p-4">
        
        <div className="bg-white rounded-lg border border-[#e5e7eb] p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Search for recipes ...."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg text-[14px] text-[#1a2632] focus:outline-none focus:border-[#0d9488]"
              />
              </div>
              <div>
            <Link href="/seller/recipes/add">
              <button className="w-full lg:w-auto bg-[#0d9488] text-white px-6 py-3 rounded-lg hover:opacity-90 font-medium text-[14px] font-roboto transition flex items-center justify-center gap-2 whitespace-nowrap">
                <span className="text-lg font-bold">+</span> Add New Recipe
              </button>
            </Link>          
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <div className="flex gap-2 rounded-3xl bg-slate-50 p-2">
              {[
                { label: 'All Recipes', key: 'all' },
                { label: 'Active', key: 'active' },
                { label: 'Pending', key: 'pending' },
                { label: 'Draft', key: 'draft' },
                { label: 'Deactivated', key: 'deactivated' },
                { label: 'Rejected', key: 'rejected' },
              ].map((tab) => {
                const isActive = selectedTab === tab.label;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedTab(tab.label)}
                    className={`min-w-[120px] flex-1 whitespace-nowrap rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${isActive ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
                  >
                    <span>{tab.label}</span>
                    <span className="ml-2 inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                      {statusCounts[tab.key as keyof typeof statusCounts]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe) => {
              const statusInfo = getRecipeStatus(recipe.status, recipe.approval_status);
              const isRejected = statusInfo.label === 'Rejected';

              return (
                <div key={recipe.recipe_id} className={`relative rounded-lg border overflow-hidden shadow-lg transition flex a-card flex-col ${isRejected ? 'bg-red-50/70 border-red-200' : 'bg-white border-[#e5e7eb]'}`}>
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {recipe.image_url ? (
                      <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className={`w-full h-full object-cover transition-opacity ${isRejected ? 'opacity-80' : 'opacity-100'}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                    )}
                    {isRejected && recipe.rejection_reason && (
                      <div className="absolute top-3 right-3 z-20">
                        <div className="group relative inline-flex items-center">
                          <AlertTriangle className="w-5 h-5 text-red-600 bg-white rounded-full p-1 shadow-sm" />
                          <div className="pointer-events-none absolute right-0 top-full mt-2 w-52 rounded-md bg-slate-900 text-white text-[12px] leading-snug px-3 py-2 opacity-0 invisible transition-all duration-200 group-hover:opacity-100 group-hover:visible">
                            {recipe.rejection_reason}
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedTab === 'All Recipes' && (
                      <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[12px] font-bold ${statusInfo.classes}`}>
                        {statusInfo.label}
                      </span>
                    )}
                    {isRejected && <div className="absolute inset-0 bg-red-100/50 pointer-events-none" />}
                  </div>

                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-[14px] font-bold text-[#1a2632] font-roboto mb-3 line-clamp-2 min-h-[40px]" title={recipe.title}>
                        {recipe.title}
                      </h3>

                      <div className="flex items-center justify-between text-[11px] text-[#64748b] font-roboto mb-3 border-t border-[#e5e7eb] pt-3 px-1 gap-2">
                        <p className="text-[10px] font-bold text-[#0d9488] bg-[#e0f2f1] px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                          {recipe.price} XRP
                        </p>
                        
                        <div className="flex items-center gap-3">
                          <RecipeUnlockCount recipeId={recipe.recipe_id} />
                          
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                            <span>{recipe.rating_avg || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {recipe.approval_status?.toLowerCase() === 'pending' ? (
                          <Link href={`/seller/recipes/${recipe.recipe_id}`} className="w-full">
                            <button className="w-full px-2 py-1.5 border border-[#0d9488] text-[#0d9488] rounded text-[11px] font-medium hover:bg-[#e0f2f1] transition">
                              View
                            </button>
                          </Link>
                        ) : isRejected ? (
                          <Link href={`/seller/recipes/${recipe.recipe_id}`} className="w-full">
                          <button className="w-full px-2 py-1.5 border border-[#0d9488] text-[#0d9488] rounded text-[11px] font-medium hover:bg-[#e0f2f1] transition">
                            View
                          </button>
                        </Link>
                      ) : recipe.status?.toLowerCase() === 'draft' && recipe.approval_status?.toLowerCase() === 'draft' ? (
                        <button 
                          onClick={() => router.push(`/seller/recipes/add?id=${recipe.recipe_id}`)}
                          className="w-full px-2 py-1.5 border border-amber-500 text-amber-600 rounded text-[11px] font-medium hover:bg-amber-50 transition"
                        >
                          Edit
                        </button>
                      ) : recipe.status?.toLowerCase() === 'deactive' ? (
                        <div className="flex gap-2">
                          <Link href={`/seller/recipes/${recipe.recipe_id}`} className="flex-1">
                            <button className="w-full px-2 py-1.5 border border-[#0d9488] text-[#0d9488] rounded text-[11px] font-medium hover:bg-[#e0f2f1] transition">
                              View
                            </button>
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedRecipeId(recipe.recipe_id);
                              setActivateModalOpen(true);
                            }}
                            className="flex-1 px-2 py-1.5 bg-emerald-600 text-white rounded text-[11px] font-medium hover:opacity-90 transition text-center"
                          >
                            Active
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Link href={`/seller/recipes/${recipe.recipe_id}`} className="flex-1">
                            <button className="w-full px-2 py-1.5 border border-[#0d9488] text-[#0d9488] rounded text-[11px] font-medium hover:bg-[#e0f2f1] transition">
                              View
                            </button>
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedRecipeId(recipe.recipe_id);
                              setIsDeactivateModalOpen(true);
                            }}
                            className="flex-1 px-2 py-1.5 bg-red-600 text-white rounded text-[11px] font-medium hover:opacity-90 transition text-center"
                          >
                            Deactivate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 font-roboto">No recipe found.</p>
            <Link href="/seller/recipes/add" className="text-[#0d9488] font-medium mt-2 inline-block hover:underline">
              Create new recipe
            </Link>
          </div>
        )}
      </div>

      {isDeactivateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Deactivate Recipe</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to deactivate this recipe?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeactivateModalOpen(false);
                  setSelectedRecipeId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeactivate}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {ActivateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Activate Recipe</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to activate this recipe?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setActivateModalOpen(false);
                  setSelectedRecipeId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmActivate}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}