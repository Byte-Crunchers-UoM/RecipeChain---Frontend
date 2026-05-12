'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  AlertTriangle,
  ArrowLeft, 
  Clock, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  UtensilsCrossed,
  Star,
  ChefHat,
  Tag
} from 'lucide-react';

const getRecipeStatus = (status: string, approval: string) => {
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

  if (a === 'published' || a === 'approved') {
    return { label: 'Active', classes: 'bg-[#0d9488] text-white' };
  }

  return { label: 'Draft', classes: 'bg-gray-400 text-white' };
};

export default function RecipeDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recipeTags, setRecipeTags] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecipeDetails() {
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*, tags(*)')
          .eq('recipe_id', id)
          .single();

        if (error) throw error;
        setRecipe(data);

        if (data && data.tag_id) {
          const { data: tagData, error: tagError } = await supabase
            .from('tags')
            .select('*')
            .eq('tag_id', data.tag_id)
            .maybeSingle();

          if (!tagError && tagData) {
            let extractedTags: string[] = [];

            // Helper function to process values
            const processValue = (val: any) => {
              if (!val || val === 'EMPTY') return;
              
              if (Array.isArray(val)) {
                extractedTags.push(...val.filter(Boolean));
              } else if (typeof val === 'string') {
                try {
                  const parsed = JSON.parse(val);
                  if (Array.isArray(parsed)) {
                    extractedTags.push(...parsed.filter(Boolean));
                  } else {
                    extractedTags.push(val);
                  }
                } catch {
                  extractedTags.push(val);
                }
              }
            };

            processValue(tagData.dietary_tags);
            processValue(tagData.goal);
            processValue(tagData.meal_type);
            processValue(tagData.occasion);
            processValue(tagData.cuisine);

            setRecipeTags(Array.from(new Set(extractedTags)));
          }
        }
      } catch (error: any) {
        console.error('Error fetching recipe:', error.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchRecipeDetails();
  }, [id]);

  useEffect(() => {
    if (!recipe || !id) return;

    const statusLabel = getRecipeStatus(recipe.status, recipe.approval_status).label;
    if (statusLabel !== 'Active' && statusLabel !== 'Deactivated') return;

    async function fetchFeedbacks() {
      setFeedbackLoading(true);
      setFeedbackError(null);

      try {
        const { data, error } = await supabase
          .from('feedbacks')
          .select(`
            *,
            buyers(display_name, profile_picture),
            feedback_images(image_url)
            
          `)
          .eq('recipe_id', id)
          
          .order('created_at', { ascending: false });
          console.log("Feedbacks Data:", data);

        if (error) throw error;
        setFeedbacks(data || []);
      } catch (err: any) {
        console.error('Error fetching feedbacks:', err.message || err);
        setFeedbackError(err.message || 'Unable to load customer reviews.');
      } finally {
        setFeedbackLoading(false);
      }
    }

    fetchFeedbacks();
  }, [id, recipe]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Fetching your recipe...</p>
      </div>
    </div>
  );

  if (!recipe) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Recipe not found!</h2>
        <button onClick={() => router.back()} className="mt-4 text-teal-600 font-semibold underline">Go Back</button>
      </div>
    </div>
  );

  const ingredientsList = Array.isArray(recipe.ingredients) 
    ? recipe.ingredients 
    : typeof recipe.ingredients === 'string' 
      ? JSON.parse(recipe.ingredients) 
      : [];

  const statusInfo = getRecipeStatus(recipe.status, recipe.approval_status);
  const isRejected = statusInfo.label === 'Rejected';
  const showFeedbackSection = statusInfo.label === 'Active' || statusInfo.label === 'Deactivated';

  return (
    <div className="min-h-screen bg-gray-50/50">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="group flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
          >
            <div className="p-2 group-hover:bg-teal-50 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-teal-600" />
            <span className="font-bold text-gray-900 tracking-tight">RecipeChain</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          {isRejected && recipe.rejection_reason && (
            <div className="bg-red-50 border-b border-red-200 px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-red-100 p-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-red-900">Recipe rejected by admin</p>
                  <p className="mt-1 text-sm text-red-700 leading-relaxed">{recipe.rejection_reason}</p>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            <div className="relative h-[450px] lg:h-[550px] min-h-[400px]">
              {recipe.image_url ? (
                <img 
                  src={recipe.image_url} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                  <UtensilsCrossed className="w-16 h-16 text-slate-300" />
                </div>
              )}
              <div className="absolute top-6 left-6">
                <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg backdrop-blur-sm ${statusInfo.classes}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>

            <div className="p-8 lg:p-14 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-md uppercase tracking-wider">
                    {recipe.difficulty_level || 'Chef Special'}
                  </span>
                </div>

                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] mb-6">
                  {recipe.title}
                </h1>

                <p className="text-gray-600 leading-relaxed text-lg mb-8">
                  {recipe.description}
                </p>
              </div>

              <div className="flex items-center justify-between py-6 border-y border-gray-100 my-4">
                <div className="flex flex-col items-center gap-1">
                  <Clock className="w-5 h-5 text-teal-500" />
                  <span className="text-sm font-bold text-slate-900">{Number(recipe.prep_time) || 0}m</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Prep Time</span>
                </div>
                <div className="h-8 w-[1px] bg-gray-100"></div>
                <div className="flex flex-col items-center gap-1">
                  <Clock className="w-5 h-5 text-teal-500" />
                  <span className="text-sm font-bold text-slate-900">{Number(recipe.cook_time) || 0}m</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Cook Time</span>
                </div>
                <div className="h-8 w-[1px] bg-gray-100"></div>
                <div className="flex flex-col items-center gap-1">
                  <Users className="w-5 h-5 text-teal-500" />
                  <span className="text-sm font-bold text-slate-900">{recipe.servings || 0}</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Servings</span>
                </div>
                <div className="h-8 w-[1px] bg-gray-100"></div>
                <div className="flex flex-col items-center gap-1">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-400 stroke-amber-400" />
                  <span className="text-sm font-bold text-slate-900">
                    {recipe.rating_avg ? Number(recipe.rating_avg).toFixed(1) : '0.0'}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Rating</span>
                </div>
              </div>


              <div className="flex justify-center w-full ">
                <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-sm border border-white/10 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 w-full max-w-sm">
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400/30 to-transparent"></div>
                  <div className="relative z-10 flex items-center justify-center text-center">
                    <div>
                      <p className="text-teal-300 text-[10px] font-black uppercase tracking-wider mb-2 drop-shadow-sm">
                        Ownership Price
                      </p>
                      <div className="flex items-baseline justify-left gap-2">
                        <span className="text-4xl font-black tracking-tight">{recipe.price}</span>
                        <span className="text-lg font-extrabold text-teal-300 tracking-wide">
                          XRP
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-teal-400/20 rounded-full blur-2xl"></div>
                  <div className="absolute -left-10 -top-10 w-24 h-24 bg-emerald-400/10 rounded-full blur-2xl"></div>
                </div>
              </div>
              </div>
              </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 border-t border-gray-100">
            <div className="p-8 lg:p-12 lg:border-r border-gray-100 bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-teal-600" />
                Ingredients
              </h3>
              <ul className="space-y-4">
                {ingredientsList.length > 0 ? ingredientsList.map((ing: any, index: number) => (
                  <li key={index} className="flex items-center gap-3 group">
                    <div className="w-2 h-2 rounded-full bg-teal-400 group-hover:scale-150 transition-transform"></div>
                    <span className="text-slate-600 font-medium">
                      {typeof ing === 'object' ? `${ing.quantity} ${ing.unit} - ${ing.name}` : ing}
                    </span>
                  </li>
                )) : (
                  <p className="text-gray-400 text-sm">No ingredients listed.</p>
                )}
              </ul>

              <div className="mt-8 border-t border-gray-200 pt-6">
                <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-teal-600" /> Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {recipeTags.length > 0 ? (
                    recipeTags.map((t: string, index: number) => (
                      <span key={index} className="px-2.5 py-1 bg-teal-50 border border-teal-100 text-[10px] font-bold text-teal-700 rounded-full">
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">No tags assigned.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 p-8 lg:p-12">
              <h3 className="text-xl font-black text-slate-900 mb-8">Preparation Method</h3>
              <div className="space-y-6">
                {Array.isArray(recipe.instructions) ? (
                  recipe.instructions.map((stepObj: any, index: number) => (
                    <div key={index} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex-none w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {stepObj.step || index + 1}
                      </div>
                      <p className="text-slate-600 leading-relaxed pt-1">
                        {typeof stepObj === 'object' ? stepObj.text : stepObj}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
                    {recipe.instructions || recipe.description || "Instructions coming soon..."}
                  </p>
                )}
              </div>

              {recipe.chef_note && (
                <div className="mt-12 p-6 bg-amber-50 rounded-2xl border border-amber-100 border-l-4 border-l-amber-400">
                  <p className="text-amber-900 text-sm italic leading-relaxed">
                    <span className="font-bold not-italic text-amber-950 uppercase text-[10px] tracking-widest block mb-2">Chef's Note</span>
                    {recipe.chef_note}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {showFeedbackSection && (
          <section className="mt-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Customer Feedback</h2>
                <p className="text-sm text-slate-500">Buyer reviews for this recipe.</p>
              </div>
            </div>

            {feedbackLoading ? (
              <div className="space-y-4">
                {[1, 2].map((s) => (
                  <div key={s} className="animate-pulse rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-slate-200" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-1/3 rounded-full bg-slate-200" />
                        <div className="h-3 w-1/4 rounded-full bg-slate-200" />
                      </div>
                    </div>
                    <div className="h-3 rounded-full bg-slate-200 mb-3" />
                    <div className="h-3 rounded-full bg-slate-200 mb-3" />
                    <div className="grid grid-cols-3 gap-3">
                      <div className="h-24 rounded-3xl bg-slate-200" />
                      <div className="h-24 rounded-3xl bg-slate-200" />
                      <div className="h-24 rounded-3xl bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : feedbackError ? (
              <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
                {feedbackError}
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
                No reviews yet.
              </div>
            ) : (
              <div className="space-y-6">
                {feedbacks.map((feedback: any) => (
                  <article key={feedback.feedback_id || feedback.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={feedback.buyers?.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(feedback.buyers?.display_name || 'Buyer')}&background=0D9488&color=fff&size=128`}
                          alt={feedback.buyers?.display_name || 'Buyer'}
                          className="h-14 w-14 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{feedback.buyers?.display_name || 'Anonymous Buyer'}</p>
                          <div className="mt-1 flex items-center gap-1 text-amber-500 text-sm">
                            <Star className="w-4 h-4" />
                            <span>{Number(feedback.rating ?? 0).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs uppercase tracking-[0.25em] text-slate-400">
                        {feedback.created_at ? new Date(feedback.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>

                    <p className="mt-6 text-sm leading-7 text-slate-600">{feedback.comment || 'No comment provided.'}</p>

                    {feedback.feedback_images?.length > 0 && (
                      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                        {feedback.feedback_images.map((image: any, index: number) => (
                          <img
                            key={index}
                            src={image.image_url}
                            alt={`feedback-${index}`}
                            className="h-28 w-60 rounded-xl object-cover border border-slate-200"
                          />
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}